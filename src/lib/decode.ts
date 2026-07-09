// Decode any supported input file into raw RGBA pixels (ImageData).
// Heavy/special decoders are dynamically imported so they never touch the
// initial bundle — they load only when a matching file is actually converted.

import { detectFormat } from '../formats/registry';

export interface DecodedImage {
  imageData: ImageData;
  width: number;
  height: number;
}

function imageDataFromDrawable(
  source: CanvasImageSource,
  width: number,
  height: number,
): DecodedImage {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context unavailable in this browser.');
  ctx.drawImage(source, 0, 0, width, height);
  return { imageData: ctx.getImageData(0, 0, width, height), width, height };
}

/** Fast path: let the browser decode, then read pixels off a canvas. */
async function decodeViaBrowser(file: File): Promise<DecodedImage> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const out = imageDataFromDrawable(bitmap, bitmap.width, bitmap.height);
    bitmap.close();
    return out;
  } catch {
    // Fallback for formats createImageBitmap rejects (e.g. some SVG/ICO).
    return decodeViaImgElement(file);
  }
}

function decodeViaImgElement(file: File, fallbackSize = 1024): Promise<DecodedImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || fallbackSize;
      const h = img.naturalHeight || fallbackSize;
      URL.revokeObjectURL(url);
      try {
        resolve(imageDataFromDrawable(img, w, h));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('The browser could not decode this file.'));
    };
    img.src = url;
  });
}

async function decodeTiff(file: File): Promise<DecodedImage> {
  const UTIF = (await import('utif2')).default;
  const buf = await file.arrayBuffer();
  const ifds = UTIF.decode(buf);
  if (!ifds.length) throw new Error('No image found in TIFF.');
  UTIF.decodeImage(buf, ifds[0]);
  const rgba = UTIF.toRGBA8(ifds[0]);
  const width = ifds[0].width;
  const height = ifds[0].height;
  const clamped = new Uint8ClampedArray(width * height * 4);
  clamped.set(rgba);
  const imageData = new ImageData(clamped, width, height);
  return { imageData, width, height };
}

async function decodeHeic(file: File): Promise<DecodedImage> {
  const { heicTo } = await import('heic-to');
  const pngBlob = await heicTo({ blob: file, type: 'image/png' });
  return decodeViaBrowser(new File([pngBlob], 'tmp.png', { type: 'image/png' }));
}

async function decodeAvif(file: File): Promise<DecodedImage> {
  // Prefer the browser (fast). Fall back to the WASM codec if unsupported.
  try {
    return await decodeViaBrowser(file);
  } catch {
    const decode = (await import('@jsquash/avif')).decode;
    const imageData = await decode(await file.arrayBuffer());
    if (!imageData) throw new Error('AVIF could not be decoded.');
    return { imageData, width: imageData.width, height: imageData.height };
  }
}

export async function decodeToImageData(file: File): Promise<DecodedImage> {
  const fmt = detectFormat(file);

  if (fmt && !fmt.canDecode) {
    throw new Error(
      `${fmt.label} can't be decoded in the browser${fmt.note ? ` — ${fmt.note}` : '.'}`,
    );
  }

  switch (fmt?.id) {
    case 'tiff':
      return decodeTiff(file);
    case 'heic':
      return decodeHeic(file);
    case 'avif':
      return decodeAvif(file);
    case 'svg':
      return decodeViaImgElement(file);
    default:
      return decodeViaBrowser(file);
  }
}
