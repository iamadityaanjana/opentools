// Client-side PDF helpers built on pdf.js. This module is only ever pulled in
// via a dynamic import() from the PDF ops, so pdfjs-dist (and its worker) stay
// out of the main bundle. The worker is bundled by Vite through the `?url`
// import below — no CDN, fully offline.

import * as pdfjs from 'pdfjs-dist';
// Vite emits this as a hashed asset URL and only fetches it when this module
// loads. Keeps the ~1MB worker off the landing page.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export interface RenderedPage {
  index: number; // 0-based page index
  imageData: ImageData;
  width: number;
  height: number;
}

export interface ExtractedImage {
  imageData: ImageData;
  width: number;
  height: number;
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context unavailable in this browser.');
  return [c, ctx];
}

async function loadDocument(file: File) {
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data });
  const doc = await loadingTask.promise;
  return { doc, loadingTask };
}

/**
 * Parse a page-range string like "1-3, 5, 8-" into 0-based page indices,
 * clamped to [0, total). Empty/invalid input means "all pages".
 */
export function parsePageRange(range: string, total: number): number[] {
  const trimmed = (range || '').trim();
  if (!trimmed) return Array.from({ length: total }, (_, i) => i);
  const out = new Set<number>();
  for (const part of trimmed.split(',')) {
    const seg = part.trim();
    if (!seg) continue;
    const m = seg.match(/^(\d+)?\s*-\s*(\d+)?$/);
    if (m) {
      const start = m[1] ? parseInt(m[1], 10) : 1;
      const end = m[2] ? parseInt(m[2], 10) : total;
      for (let p = start; p <= end; p++) if (p >= 1 && p <= total) out.add(p - 1);
    } else {
      const p = parseInt(seg, 10);
      if (!Number.isNaN(p) && p >= 1 && p <= total) out.add(p - 1);
    }
  }
  return [...out].sort((a, b) => a - b);
}

/** Render selected PDF pages to raster ImageData at the given DPI. */
export async function renderPdfPages(
  file: File,
  opts: { dpi: number; range: string },
  onPage?: (rendered: RenderedPage) => void | Promise<void>,
): Promise<RenderedPage[]> {
  const { doc, loadingTask } = await loadDocument(file);
  try {
    const indices = parsePageRange(opts.range, doc.numPages);
    if (indices.length === 0) throw new Error('No pages selected for that range.');
    const scale = Math.max(0.1, opts.dpi / 72);
    const pages: RenderedPage[] = [];
    for (const idx of indices) {
      const page = await doc.getPage(idx + 1);
      const viewport = page.getViewport({ scale });
      const [canvas, ctx] = makeCanvas(viewport.width, viewport.height);
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const rendered: RenderedPage = { index: idx, imageData, width: canvas.width, height: canvas.height };
      pages.push(rendered);
      if (onPage) await onPage(rendered);
      page.cleanup();
    }
    return pages;
  } finally {
    await loadingTask.destroy();
  }
}

// Resolve an image XObject that pdf.js has (or will) place on the page store.
function getPageObject(page: pdfjs.PDFPageProxy, name: string): Promise<unknown> {
  return new Promise((resolve) => {
    try {
      if (page.objs.has(name)) { resolve(page.objs.get(name)); return; }
      page.objs.get(name, (obj: unknown) => resolve(obj));
    } catch {
      resolve(null);
    }
  });
}

// pdf.js image objects come in a few shapes across builds: an ImageBitmap under
// `.bitmap`, or raw bytes under `.data` tagged with an `ImageKind`. Normalise
// both into RGBA ImageData.
function imageObjToImageData(obj: unknown): ExtractedImage | null {
  if (!obj || typeof obj !== 'object') return null;
  const img = obj as { width?: number; height?: number; kind?: number; data?: Uint8Array | Uint8ClampedArray; bitmap?: CanvasImageSource };
  const width = img.width ?? 0;
  const height = img.height ?? 0;
  if (!width || !height) return null;

  if (img.bitmap) {
    const [, ctx] = makeCanvas(width, height);
    ctx.drawImage(img.bitmap, 0, 0, width, height);
    return { imageData: ctx.getImageData(0, 0, width, height), width, height };
  }

  if (!img.data) return null;
  const src = img.data;
  const rgba = new Uint8ClampedArray(width * height * 4);
  const { RGB_24BPP, RGBA_32BPP } = pdfjs.ImageKind;

  if (img.kind === RGBA_32BPP) {
    rgba.set(src.subarray(0, rgba.length));
  } else if (img.kind === RGB_24BPP) {
    for (let i = 0, j = 0; i < src.length; i += 3, j += 4) {
      rgba[j] = src[i];
      rgba[j + 1] = src[i + 1];
      rgba[j + 2] = src[i + 2];
      rgba[j + 3] = 255;
    }
  } else {
    // GRAYSCALE_1BPP: 1-bit packed rows (MSB first), padded to whole bytes.
    const rowBytes = (width + 7) >> 3;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const byte = src[y * rowBytes + (x >> 3)] ?? 0;
        const bit = (byte >> (7 - (x & 7))) & 1;
        const v = bit ? 255 : 0;
        const j = (y * width + x) * 4;
        rgba[j] = rgba[j + 1] = rgba[j + 2] = v;
        rgba[j + 3] = 255;
      }
    }
  }
  return { imageData: new ImageData(rgba, width, height), width, height };
}

/** Extract the embedded raster image XObjects from a PDF (deduplicated). */
export async function extractPdfImages(file: File): Promise<ExtractedImage[]> {
  const { doc, loadingTask } = await loadDocument(file);
  const OPS = pdfjs.OPS;
  const imageOps = new Set<number>([
    OPS.paintImageXObject,
    OPS.paintImageXObjectRepeat,
  ].filter((v) => typeof v === 'number'));

  try {
    const seen = new Set<string>();
    const out: ExtractedImage[] = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const opList = await page.getOperatorList();
      for (let i = 0; i < opList.fnArray.length; i++) {
        if (!imageOps.has(opList.fnArray[i])) continue;
        const name = opList.argsArray[i]?.[0];
        if (typeof name !== 'string' || seen.has(name)) continue;
        seen.add(name);
        const obj = await getPageObject(page, name);
        const extracted = imageObjToImageData(obj);
        if (extracted) out.push(extracted);
      }
      page.cleanup();
    }
    return out;
  } finally {
    await loadingTask.destroy();
  }
}
