// Read-only EXIF/IPTC/XMP inspection. exifr is lazy-loaded by the caller so it
// never bloats the initial bundle. We parse the ORIGINAL file bytes (not a
// re-encoded canvas) so no metadata is lost.

export interface ExifRow {
  label: string;
  value: string;
}

export interface ExifPayload {
  rows: ExifRow[];
  gps?: { lat: number; lon: number };
  /** Full parsed metadata, used for "copy as JSON". */
  raw: Record<string, unknown>;
  empty: boolean;
  dimensions?: { width: number; height: number };
}

function fmt(v: unknown): string {
  if (v == null) return '';
  if (v instanceof Date) return v.toISOString().replace('T', ' ').replace(/\.\d+Z?$/, '');
  if (Array.isArray(v)) return v.map(fmt).filter(Boolean).join(', ');
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(Math.round(v * 1000) / 1000);
  if (typeof v === 'object') {
    try { return JSON.stringify(v); } catch { return String(v); }
  }
  return String(v).trim();
}

// Curated, human-friendly rows pulled from the flat exifr result.
const FIELD_MAP: { key: string; label: string; suffix?: string; transform?: (v: unknown) => string }[] = [
  { key: 'Make', label: 'Camera make' },
  { key: 'Model', label: 'Camera model' },
  { key: 'LensModel', label: 'Lens' },
  { key: 'LensMake', label: 'Lens make' },
  { key: 'FNumber', label: 'Aperture', transform: (v) => `f/${fmt(v)}` },
  { key: 'ExposureTime', label: 'Shutter speed', transform: (v) => {
    const n = Number(v);
    return n && n < 1 ? `1/${Math.round(1 / n)} s` : `${fmt(v)} s`;
  } },
  { key: 'ISO', label: 'ISO' },
  { key: 'FocalLength', label: 'Focal length', transform: (v) => `${fmt(v)} mm` },
  { key: 'FocalLengthIn35mmFormat', label: 'Focal length (35mm)', transform: (v) => `${fmt(v)} mm` },
  { key: 'ExposureCompensation', label: 'Exposure compensation', transform: (v) => `${fmt(v)} EV` },
  { key: 'Flash', label: 'Flash' },
  { key: 'WhiteBalance', label: 'White balance' },
  { key: 'MeteringMode', label: 'Metering mode' },
  { key: 'Orientation', label: 'Orientation' },
  { key: 'ColorSpace', label: 'Color space' },
  { key: 'Software', label: 'Software' },
  { key: 'Artist', label: 'Artist' },
  { key: 'Copyright', label: 'Copyright' },
  { key: 'DateTimeOriginal', label: 'Taken' },
  { key: 'CreateDate', label: 'Created' },
  { key: 'ModifyDate', label: 'Modified' },
];

async function imageDimensions(file: File): Promise<{ width: number; height: number } | undefined> {
  try {
    const bmp = await createImageBitmap(file);
    const dims = { width: bmp.width, height: bmp.height };
    bmp.close?.();
    return dims;
  } catch {
    return undefined;
  }
}

export async function parseExif(file: File): Promise<ExifPayload> {
  const exifr = (await import('exifr')).default as {
    parse: (input: Blob | ArrayBuffer, opts?: unknown) => Promise<Record<string, unknown> | undefined>;
    gps?: (input: Blob | ArrayBuffer) => Promise<{ latitude: number; longitude: number } | undefined>;
  };

  let raw: Record<string, unknown> = {};
  try {
    raw = (await exifr.parse(file, {
      tiff: true, exif: true, gps: true, iptc: true, xmp: true, icc: false, jfif: true,
      mergeOutput: true,
    })) ?? {};
  } catch {
    raw = {};
  }

  const rows: ExifRow[] = [];
  const seen = new Set<string>();
  for (const f of FIELD_MAP) {
    const v = raw[f.key];
    if (v == null || v === '') continue;
    const value = f.transform ? f.transform(v) : fmt(v);
    if (!value) continue;
    rows.push({ label: f.label, value });
    seen.add(f.key);
  }

  let gps: { lat: number; lon: number } | undefined;
  const lat = raw.latitude ?? raw.GPSLatitude;
  const lon = raw.longitude ?? raw.GPSLongitude;
  if (typeof lat === 'number' && typeof lon === 'number') {
    gps = { lat, lon };
    rows.push({ label: 'GPS coordinates', value: `${lat.toFixed(6)}, ${lon.toFixed(6)}` });
  }

  const dimensions = await imageDimensions(file);
  if (dimensions) {
    rows.unshift({ label: 'Dimensions', value: `${dimensions.width} × ${dimensions.height} px` });
  } else {
    const w = raw.ExifImageWidth ?? raw.ImageWidth ?? raw.PixelXDimension;
    const h = raw.ExifImageHeight ?? raw.ImageHeight ?? raw.PixelYDimension;
    if (w != null && h != null) rows.unshift({ label: 'Dimensions', value: `${fmt(w)} × ${fmt(h)} px` });
  }

  // Backfill any remaining scalar metadata not already surfaced, so nothing is hidden.
  for (const [key, v] of Object.entries(raw)) {
    if (seen.has(key)) continue;
    if (key === 'latitude' || key === 'longitude') continue;
    const value = fmt(v);
    if (!value || value.length > 120) continue;
    if (rows.some((r) => r.label === key)) continue;
    rows.push({ label: key, value });
  }

  const empty = Object.keys(raw).length === 0;
  return { rows, gps, raw, empty, dimensions };
}
