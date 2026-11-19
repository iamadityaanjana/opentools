// New ops for the metadata and batch-convert fixes. Not yet registered in OPS:
// to wire them in, import { exifOps } from './exifOps' in ops.ts and spread it
// into OPS, then point catalog.ts 'remove-exif-metadata' at 'stripExif' and
// 'batch-convert' at 'batchConvert'.
import type { ImageOp, Params, OpResult } from './ops';
import { stripJpegMetadata } from '../lib/stripMetadata';

const FORMAT_OPTS = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
  { value: 'avif', label: 'AVIF' },
];

function baseName(name: string): string {
  return name.replace(/\.[^.]+$/, '') || 'image';
}

export const exifOps: Record<string, ImageOp> = {
  // Strip EXIF/GPS/XMP/comments. JPEG input is handled losslessly by copying
  // segments (pixels untouched). Other formats are decoded and re-encoded via
  // canvas, which carries no metadata. Output is PNG unless input is WebP.
  stripExif: {
    controls: [],
    runFile: async (file: File, _p: Params): Promise<OpResult> => {
      const buf = new Uint8Array(await file.arrayBuffer());
      const base = baseName(file.name);
      if (buf[0] === 0xff && buf[1] === 0xd8) {
        return {
          blob: new Blob([stripJpegMetadata(buf) as BlobPart], { type: 'image/jpeg' }),
          filename: `${base}-no-exif.jpg`,
        };
      }
      const [{ decodeToImageData }, { encodeImageData }, { detectFormat }] = await Promise.all([
        import('../lib/decode'),
        import('../lib/encode'),
        import('../formats/registry'),
      ]);
      const fmt = detectFormat(file);
      const target = fmt && fmt.id === 'webp' ? 'webp' : 'png';
      const { imageData, width, height } = await decodeToImageData(file);
      const blob = await encodeImageData({ imageData, width, height }, target, { quality: 0.92 });
      return { blob, filename: `${base}-no-exif.${target}` };
    },
  },

  // Batch convert with an explicit target format. Default PNG (not "keep
  // original", which previously re-encoded to the same format and did nothing).
  batchConvert: {
    controls: [
      { key: 'format', label: 'Output format', type: 'select', def: 'png', options: FORMAT_OPTS },
    ],
    runFile: async (file: File, p: Params): Promise<OpResult> => {
      const target = String(p.format || 'png');
      const [{ decodeToImageData }, { encodeImageData }] = await Promise.all([
        import('../lib/decode'),
        import('../lib/encode'),
      ]);
      const { imageData, width, height } = await decodeToImageData(file);
      const blob = await encodeImageData({ imageData, width, height }, target, { quality: 0.92 });
      const ext = target === 'jpeg' ? 'jpg' : target;
      return { blob, filename: `${baseName(file.name)}.${ext}` };
    },
  },
};
