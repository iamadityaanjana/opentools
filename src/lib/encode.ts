// Encode raw RGBA pixels into a target format. Every non-trivial codec is
// dynamically imported so its bytes/WASM load only when that format is chosen.

import type { DecodedImage } from './decode';
import { FORMAT_BY_ID } from '../formats/registry';

export interface EncodeOptions {
  /** 0..1 quality for lossy formats. */
  quality?: number;
}

function imageDataToCanvas(img: ImageData): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(img, 0, 0);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error(`Browser refused to encode ${mime}.`))),
      mime,
      quality,
    );
  });
}

async function toPngBytes(img: ImageData): Promise<Uint8Array> {
  const blob = await canvasToBlob(imageDataToCanvas(img), 'image/png');
  return new Uint8Array(await blob.arrayBuffer());
}

export async function encodeImageData(
  src: DecodedImage,
  targetId: string,
  opts: EncodeOptions = {},
): Promise<Blob> {
  const fmt = FORMAT_BY_ID.get(targetId);
  if (!fmt || !fmt.canEncode) throw new Error(`Cannot encode to ${targetId} in the browser.`);
  const { imageData } = src;
  const quality = opts.quality ?? 0.9;

  switch (targetId) {
    case 'png':
      return canvasToBlob(imageDataToCanvas(imageData), 'image/png');
    case 'jpeg':
      return canvasToBlob(imageDataToCanvas(imageData), 'image/jpeg', quality);
    case 'webp':
      return canvasToBlob(imageDataToCanvas(imageData), 'image/webp', quality);

    case 'avif': {
      const encode = (await import('@jsquash/avif')).encode;
      const buf = await encode(imageData, { quality: Math.round(quality * 100) });
      return new Blob([buf], { type: 'image/avif' });
    }

    case 'tiff': {
      const UTIF = (await import('utif2')).default;
      const rgba = new Uint8Array(imageData.data);
      const buf = UTIF.encodeImage(rgba, imageData.width, imageData.height);
      return new Blob([buf], { type: 'image/tiff' });
    }

    case 'pdf': {
      const { jsPDF } = await import('jspdf');
      const canvas = imageDataToCanvas(imageData);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      const orientation = imageData.width >= imageData.height ? 'l' : 'p';
      const pdf = new jsPDF({ orientation, unit: 'px', format: [imageData.width, imageData.height] });
      pdf.addImage(dataUrl, 'JPEG', 0, 0, imageData.width, imageData.height);
      return pdf.output('blob');
    }

    case 'svg': {
      const canvas = imageDataToCanvas(imageData);
      const dataUrl = canvas.toDataURL('image/png');
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${imageData.width}" height="${imageData.height}" ` +
        `viewBox="0 0 ${imageData.width} ${imageData.height}">` +
        `<image width="${imageData.width}" height="${imageData.height}" href="${dataUrl}"/></svg>`;
      return new Blob([svg], { type: 'image/svg+xml' });
    }

    case 'ico': {
      const enc = await import('./rasterEncoders');
      // ICO images should be <= 256px on each side.
      const scaled = downscaleTo(imageData, 256);
      const png = await toPngBytes(scaled);
      return enc.encodeICO(png, scaled.width, scaled.height);
    }

    case 'bmp':
      return (await import('./rasterEncoders')).encodeBMP(imageData);
    case 'tga':
      return (await import('./rasterEncoders')).encodeTGA(imageData);
    case 'ppm':
      return (await import('./rasterEncoders')).encodePPM(imageData);
    case 'pgm':
      return (await import('./rasterEncoders')).encodePGM(imageData);
    case 'pbm':
      return (await import('./rasterEncoders')).encodePBM(imageData);

    case 'gif':
      return (await import('./gifEncoder')).encodeGIF(imageData);

    default:
      throw new Error(`No encoder wired for ${targetId}.`);
  }
}

function downscaleTo(img: ImageData, max: number): ImageData {
  if (img.width <= max && img.height <= max) return img;
  const scale = Math.min(max / img.width, max / img.height);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const src = imageDataToCanvas(img);
  const dst = document.createElement('canvas');
  dst.width = w;
  dst.height = h;
  const ctx = dst.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}
