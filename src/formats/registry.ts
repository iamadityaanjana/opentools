// Central capability matrix for every image format.
// Being honest here is the whole point: `canDecode` / `canEncode` reflect what
// is *actually* achievable 100% client-side. Unsupported formats are still
// listed (so the UI shows the full landscape) but are clearly marked.

export type FormatCategory =
  | 'raster'
  | 'modern'
  | 'raw'
  | 'vector'
  | 'animated'
  | 'special';

export interface FormatDef {
  id: string;
  label: string;
  /** Primary file extension, no dot. */
  ext: string;
  /** Alternate extensions that map to this format. */
  aliases?: string[];
  mime: string;
  category: FormatCategory;
  canDecode: boolean;
  canEncode: boolean;
  /** Short honest note about limitations. */
  note?: string;
}

export const FORMATS: FormatDef[] = [
  // ---- Standard raster ----
  { id: 'jpeg', label: 'JPEG', ext: 'jpg', aliases: ['jpeg', 'jpe'], mime: 'image/jpeg', category: 'raster', canDecode: true, canEncode: true, note: 'Lossy. Great for photos.' },
  { id: 'png', label: 'PNG', ext: 'png', mime: 'image/png', category: 'raster', canDecode: true, canEncode: true, note: 'Lossless, alpha.' },
  { id: 'gif', label: 'GIF', ext: 'gif', mime: 'image/gif', category: 'raster', canDecode: true, canEncode: true, note: 'Output is a single static frame (256 colors).' },
  { id: 'bmp', label: 'BMP', ext: 'bmp', mime: 'image/bmp', category: 'raster', canDecode: true, canEncode: true, note: 'Uncompressed, large files.' },
  { id: 'tiff', label: 'TIFF', ext: 'tif', aliases: ['tiff'], mime: 'image/tiff', category: 'raster', canDecode: true, canEncode: true, note: 'High quality, print.' },

  // ---- Modern raster ----
  { id: 'webp', label: 'WebP', ext: 'webp', mime: 'image/webp', category: 'modern', canDecode: true, canEncode: true, note: 'Smaller than JPEG/PNG.' },
  { id: 'avif', label: 'AVIF', ext: 'avif', mime: 'image/avif', category: 'modern', canDecode: true, canEncode: true, note: 'Next-gen compression (WASM).' },
  { id: 'heic', label: 'HEIC / HEIF', ext: 'heic', aliases: ['heif'], mime: 'image/heic', category: 'modern', canDecode: true, canEncode: false, note: 'Decode only. Encoding is patent-encumbered.' },
  { id: 'jp2', label: 'JPEG 2000', ext: 'jp2', aliases: ['jpeg2000', 'j2k'], mime: 'image/jp2', category: 'modern', canDecode: true, canEncode: false, note: 'Decode depends on browser (Safari).' },

  // ---- Vector ----
  { id: 'svg', label: 'SVG', ext: 'svg', mime: 'image/svg+xml', category: 'vector', canDecode: true, canEncode: true, note: 'In: rasterized. Out: raster embedded in SVG (not true vector).' },
  { id: 'pdf', label: 'PDF', ext: 'pdf', mime: 'application/pdf', category: 'vector', canDecode: false, canEncode: true, note: 'Output embeds the raster image into a PDF page.' },
  { id: 'eps', label: 'EPS', ext: 'eps', mime: 'application/postscript', category: 'vector', canDecode: false, canEncode: false, note: 'PostScript — not feasible in-browser.' },
  { id: 'ai', label: 'AI (Illustrator)', ext: 'ai', mime: 'application/postscript', category: 'vector', canDecode: false, canEncode: false, note: 'Proprietary PostScript — not feasible.' },

  // ---- Special / niche ----
  { id: 'ico', label: 'ICO', ext: 'ico', mime: 'image/x-icon', category: 'special', canDecode: true, canEncode: true, note: 'Favicons / Windows icons (PNG-in-ICO).' },
  { id: 'icns', label: 'ICNS', ext: 'icns', mime: 'image/icns', category: 'special', canDecode: false, canEncode: false, note: 'macOS icons — out of scope for v1.' },
  { id: 'tga', label: 'TGA', ext: 'tga', mime: 'image/x-tga', category: 'special', canDecode: false, canEncode: true, note: 'Targa, used in games/3D.' },
  { id: 'ppm', label: 'PPM', ext: 'ppm', mime: 'image/x-portable-pixmap', category: 'special', canDecode: false, canEncode: true, note: 'Netpbm color (P6).' },
  { id: 'pgm', label: 'PGM', ext: 'pgm', mime: 'image/x-portable-graymap', category: 'special', canDecode: false, canEncode: true, note: 'Netpbm grayscale (P5).' },
  { id: 'pbm', label: 'PBM', ext: 'pbm', mime: 'image/x-portable-bitmap', category: 'special', canDecode: false, canEncode: true, note: 'Netpbm 1-bit (P4).' },
  { id: 'psd', label: 'PSD', ext: 'psd', mime: 'image/vnd.adobe.photoshop', category: 'special', canDecode: false, canEncode: false, note: 'Photoshop project — out of scope.' },
  { id: 'xcf', label: 'XCF', ext: 'xcf', mime: 'image/x-xcf', category: 'special', canDecode: false, canEncode: false, note: 'GIMP project — out of scope.' },
  { id: 'exr', label: 'EXR', ext: 'exr', mime: 'image/x-exr', category: 'special', canDecode: false, canEncode: false, note: 'HDR/VFX float — out of scope.' },
  { id: 'hdr', label: 'HDR', ext: 'hdr', mime: 'image/vnd.radiance', category: 'special', canDecode: false, canEncode: false, note: 'Radiance HDR — out of scope.' },

  // ---- RAW (decode is heavy & camera-specific; encode impossible) ----
  { id: 'cr2', label: 'CR2 (Canon)', ext: 'cr2', mime: 'image/x-canon-cr2', category: 'raw', canDecode: false, canEncode: false, note: 'Camera RAW — needs LibRaw, out of scope.' },
  { id: 'cr3', label: 'CR3 (Canon)', ext: 'cr3', mime: 'image/x-canon-cr3', category: 'raw', canDecode: false, canEncode: false, note: 'Camera RAW — out of scope.' },
  { id: 'nef', label: 'NEF (Nikon)', ext: 'nef', mime: 'image/x-nikon-nef', category: 'raw', canDecode: false, canEncode: false, note: 'Camera RAW — out of scope.' },
  { id: 'arw', label: 'ARW (Sony)', ext: 'arw', mime: 'image/x-sony-arw', category: 'raw', canDecode: false, canEncode: false, note: 'Camera RAW — out of scope.' },
  { id: 'dng', label: 'DNG (Adobe)', ext: 'dng', mime: 'image/x-adobe-dng', category: 'raw', canDecode: false, canEncode: false, note: 'Camera RAW — out of scope.' },
];

export const FORMAT_BY_ID = new Map(FORMATS.map((f) => [f.id, f]));

const EXT_INDEX = new Map<string, FormatDef>();
for (const f of FORMATS) {
  EXT_INDEX.set(f.ext.toLowerCase(), f);
  for (const a of f.aliases ?? []) EXT_INDEX.set(a.toLowerCase(), f);
}

export function detectFormat(file: File): FormatDef | undefined {
  const nameExt = file.name.split('.').pop()?.toLowerCase();
  if (nameExt && EXT_INDEX.has(nameExt)) return EXT_INDEX.get(nameExt);
  // Fall back to MIME.
  const byMime = FORMATS.find((f) => f.mime === file.type && file.type);
  return byMime;
}

export const ENCODE_TARGETS = FORMATS.filter((f) => f.canEncode);
export const CATEGORY_LABELS: Record<FormatCategory, string> = {
  raster: 'Standard raster',
  modern: 'Modern',
  raw: 'Camera RAW',
  vector: 'Vector',
  animated: 'Animated',
  special: 'Special / niche',
};
