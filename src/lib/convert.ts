// Orchestrates a single conversion. The decode/encode modules (and their
// codecs) are imported on demand so they stay out of the initial page load.

import type { EncodeOptions } from './encode';

export interface ConversionResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  filename: string;
}

export async function convertFile(
  file: File,
  targetId: string,
  opts: EncodeOptions = {},
): Promise<ConversionResult> {
  const { decodeToImageData } = await import('./decode');
  const { encodeImageData } = await import('./encode');
  const { FORMAT_BY_ID } = await import('../formats/registry');

  const decoded = await decodeToImageData(file);
  const blob = await encodeImageData(decoded, targetId, opts);
  const fmt = FORMAT_BY_ID.get(targetId)!;
  const base = file.name.replace(/\.[^.]+$/, '') || 'image';

  return {
    blob,
    url: URL.createObjectURL(blob),
    width: decoded.width,
    height: decoded.height,
    filename: `${base}.${fmt.ext}`,
  };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
