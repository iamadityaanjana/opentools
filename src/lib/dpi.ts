// Rewrite ONLY the resolution/density metadata of an image without touching a
// single pixel. We operate directly on the original file bytes (never a
// re-encoded canvas) so DPI edits are lossless.
//
// JPEG: edit (or insert) the JFIF APP0 segment (units=1 dpi + X/Y density) and,
//       best-effort, the EXIF X/YResolution tags if an APP1 EXIF block exists.
// PNG:  insert/replace the `pHYs` chunk (pixels-per-metre) before IDAT and
//       recompute its CRC32.

const CRC_TABLE: number[] = (() => {
  const t: number[] = new Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes: Uint8Array, start: number, end: number): number {
  let crc = 0xffffffff;
  for (let i = start; i < end; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export type DpiFormat = 'jpeg' | 'png';

export function detectDpiFormat(bytes: Uint8Array): DpiFormat | null {
  if (bytes.length > 2 && bytes[0] === 0xff && bytes[1] === 0xd8) return 'jpeg';
  if (
    bytes.length > 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) return 'png';
  return null;
}

// ---- JPEG ----------------------------------------------------------------

// Best-effort rewrite of EXIF (TIFF) resolution tags inside an APP1 segment.
// Sets ResolutionUnit=2 (inch) and XResolution/YResolution = dpi/1. Mutates in
// place; silently returns if the structure isn't the expected shape.
function updateExifResolution(bytes: Uint8Array, app1Start: number, app1Len: number, dpi: number) {
  // app1Start points at 0xFF, +1 = 0xE1, +2..3 = length. Payload begins at +4.
  const p = app1Start + 4;
  // "Exif\0\0"
  if (bytes[p] !== 0x45 || bytes[p + 1] !== 0x78 || bytes[p + 2] !== 0x69 || bytes[p + 3] !== 0x66) return;
  const tiff = p + 6;
  const segEnd = app1Start + 2 + app1Len;
  const little = bytes[tiff] === 0x49 && bytes[tiff + 1] === 0x49;
  const rd16 = (o: number) => (little ? bytes[o] | (bytes[o + 1] << 8) : (bytes[o] << 8) | bytes[o + 1]);
  const rd32 = (o: number) =>
    (little
      ? bytes[o] | (bytes[o + 1] << 8) | (bytes[o + 2] << 16) | (bytes[o + 3] << 24)
      : (bytes[o] << 24) | (bytes[o + 1] << 16) | (bytes[o + 2] << 8) | bytes[o + 3]) >>> 0;
  const wr16 = (o: number, v: number) => {
    if (little) { bytes[o] = v & 0xff; bytes[o + 1] = (v >> 8) & 0xff; }
    else { bytes[o] = (v >> 8) & 0xff; bytes[o + 1] = v & 0xff; }
  };
  const wr32 = (o: number, v: number) => {
    if (little) { bytes[o] = v & 0xff; bytes[o + 1] = (v >> 8) & 0xff; bytes[o + 2] = (v >> 16) & 0xff; bytes[o + 3] = (v >> 24) & 0xff; }
    else { bytes[o] = (v >> 24) & 0xff; bytes[o + 1] = (v >> 16) & 0xff; bytes[o + 2] = (v >> 8) & 0xff; bytes[o + 3] = v & 0xff; }
  };

  const ifd0 = tiff + rd32(tiff + 4);
  if (ifd0 + 2 > segEnd) return;
  const count = rd16(ifd0);
  for (let i = 0; i < count; i++) {
    const entry = ifd0 + 2 + i * 12;
    if (entry + 12 > segEnd) break;
    const tag = rd16(entry);
    if (tag === 0x0128) {
      // ResolutionUnit (SHORT) — value packed in the entry's value field.
      wr16(entry + 8, 2);
    } else if (tag === 0x011a || tag === 0x011b) {
      // X/YResolution (RATIONAL) — value is an offset (from TIFF start) to 2 uint32.
      const valOff = tiff + rd32(entry + 8);
      if (valOff + 8 <= segEnd) { wr32(valOff, dpi); wr32(valOff + 4, 1); }
    }
  }
}

function setJpegDpi(bytes: Uint8Array, dpi: number): Uint8Array {
  const d = Math.max(1, Math.round(dpi));
  // Scan segments to find a JFIF APP0 and (optionally) an EXIF APP1.
  let i = 2; // skip SOI (FFD8)
  let jfifStart = -1;
  while (i + 4 <= bytes.length) {
    if (bytes[i] !== 0xff) break;
    const marker = bytes[i + 1];
    // Standalone markers without a length payload.
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) { i += 2; continue; }
    // Start of scan / image data — stop scanning headers.
    if (marker === 0xda) break;
    const len = (bytes[i + 2] << 8) | bytes[i + 3];
    if (len < 2) break;
    if (marker === 0xe0 &&
        bytes[i + 4] === 0x4a && bytes[i + 5] === 0x46 && bytes[i + 6] === 0x49 && bytes[i + 7] === 0x46 && bytes[i + 8] === 0x00) {
      jfifStart = i;
    } else if (marker === 0xe1) {
      updateExifResolution(bytes, i, len, d);
    }
    i += 2 + len;
  }

  if (jfifStart >= 0) {
    // units at payload+7 (FF E0 len len 'JFIF' 0 verMajor verMinor units ...)
    const base = jfifStart + 4 + 7;
    bytes[base] = 1; // units = dpi
    bytes[base + 1] = (d >> 8) & 0xff; bytes[base + 2] = d & 0xff; // Xdensity
    bytes[base + 3] = (d >> 8) & 0xff; bytes[base + 4] = d & 0xff; // Ydensity
    return bytes;
  }

  // No JFIF APP0 — insert a fresh one right after SOI.
  const app0 = new Uint8Array(18);
  app0[0] = 0xff; app0[1] = 0xe0;
  app0[2] = 0x00; app0[3] = 0x10; // length = 16
  app0[4] = 0x4a; app0[5] = 0x46; app0[6] = 0x49; app0[7] = 0x46; app0[8] = 0x00; // "JFIF\0"
  app0[9] = 0x01; app0[10] = 0x01; // version 1.1
  app0[11] = 0x01; // units = dpi
  app0[12] = (d >> 8) & 0xff; app0[13] = d & 0xff; // Xdensity
  app0[14] = (d >> 8) & 0xff; app0[15] = d & 0xff; // Ydensity
  app0[16] = 0x00; app0[17] = 0x00; // no thumbnail
  const out = new Uint8Array(bytes.length + app0.length);
  out.set(bytes.subarray(0, 2), 0);
  out.set(app0, 2);
  out.set(bytes.subarray(2), 2 + app0.length);
  return out;
}

// ---- PNG -----------------------------------------------------------------

function setPngDpi(bytes: Uint8Array, dpi: number): Uint8Array {
  const ppm = Math.max(1, Math.round(dpi / 0.0254));
  const phys = new Uint8Array(9);
  phys[0] = (ppm >>> 24) & 0xff; phys[1] = (ppm >>> 16) & 0xff; phys[2] = (ppm >>> 8) & 0xff; phys[3] = ppm & 0xff;
  phys[4] = phys[0]; phys[5] = phys[1]; phys[6] = phys[2]; phys[7] = phys[3];
  phys[8] = 1; // unit = metre

  const chunk = new Uint8Array(12 + 9);
  const dv = new DataView(chunk.buffer);
  dv.setUint32(0, 9); // data length
  chunk[4] = 0x70; chunk[5] = 0x48; chunk[6] = 0x59; chunk[7] = 0x73; // 'pHYs'
  chunk.set(phys, 8);
  dv.setUint32(17, crc32(chunk, 4, 17)); // CRC over type + data

  // Walk chunks to drop an existing pHYs and find the IDAT insertion point.
  const parts: Uint8Array[] = [bytes.subarray(0, 8)];
  let inserted = false;
  let i = 8;
  while (i + 8 <= bytes.length) {
    const len = (bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3];
    const type = String.fromCharCode(bytes[i + 4], bytes[i + 5], bytes[i + 6], bytes[i + 7]);
    const total = 12 + (len >>> 0);
    if (type === 'pHYs') { i += total; continue; } // remove old resolution
    if (!inserted && (type === 'IDAT' || type === 'IEND')) {
      parts.push(chunk);
      inserted = true;
    }
    parts.push(bytes.subarray(i, i + total));
    i += total;
  }
  if (!inserted) parts.push(chunk);

  let size = 0;
  for (const p of parts) size += p.length;
  const out = new Uint8Array(size);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
}

/** Rewrite the DPI metadata of a JPEG or PNG file, leaving pixels untouched. */
export function setImageDpi(bytes: Uint8Array, dpi: number): { bytes: Uint8Array; format: DpiFormat } {
  const format = detectDpiFormat(bytes);
  if (format === 'jpeg') return { bytes: setJpegDpi(bytes, dpi), format };
  if (format === 'png') return { bytes: setPngDpi(bytes, dpi), format };
  throw new Error('Change DPI supports JPEG and PNG files only.');
}
