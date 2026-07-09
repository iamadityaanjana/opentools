// Detect and slice the MP4/MOV video embedded inside a "motion photo"
// (Google Camera "MicroVideo"/"MotionPhoto", Samsung motion photo). These are
// ordinary JPEGs that carry a full MP4 appended after the still image. We find
// the video two ways, in order of reliability:
//   1. The XMP `GCamera:MicroVideoOffset` (v1) — bytes-from-EOF where the MP4
//      starts — or the `Container`/`Item` length fields (v2/MotionPhoto).
//   2. A raw byte scan for the ISO-BMFF `ftyp` box signature, which every MP4
//      begins with (`....ftyp`), as a dependency-free fallback.
// Everything runs on the raw bytes in the browser — no network, no libs.

export interface EmbeddedVideo {
  blob: Blob;
  /** Byte offset in the source file where the MP4 begins. */
  offset: number;
  /** How the video was located, for UI/debugging. */
  via: 'xmp-microvideo' | 'xmp-container' | 'ftyp-scan';
}

const decoder = new TextDecoder('latin1');

/** Copy a byte range into a fresh Blob (avoids SharedArrayBuffer typing). */
function sliceToBlob(bytes: Uint8Array, from: number): Blob {
  const copy = bytes.slice(from);
  return new Blob([copy.buffer as ArrayBuffer]);
}

/** Find the first index of an ASCII needle within bytes, starting at `from`. */
function indexOfAscii(bytes: Uint8Array, needle: string, from = 0): number {
  const n = needle.length;
  const last = bytes.length - n;
  for (let i = from; i <= last; i++) {
    let ok = true;
    for (let j = 0; j < n; j++) {
      if (bytes[i + j] !== needle.charCodeAt(j)) {
        ok = false;
        break;
      }
    }
    if (ok) return i;
  }
  return -1;
}

/**
 * Pull a numeric attribute out of the XMP packet (which is embedded ASCII/UTF-8
 * XML). Handles both `Name="123"` and `<Name>123</Name>` styles, ignoring the
 * XML namespace prefix so `GCamera:MicroVideoOffset` matches `MicroVideoOffset`.
 */
function readXmpNumber(xmp: string, name: string): number | null {
  const attr = new RegExp(`${name}\\s*=\\s*"(-?\\d+)"`).exec(xmp);
  if (attr) return Number(attr[1]);
  const el = new RegExp(`<[^>]*${name}[^>]*>\\s*(-?\\d+)\\s*<`).exec(xmp);
  if (el) return Number(el[1]);
  return null;
}

/** Extract the XMP XML packet as a string, if present. */
function extractXmp(bytes: Uint8Array): string | null {
  const start = indexOfAscii(bytes, '<x:xmpmeta');
  if (start === -1) return null;
  const endTag = '</x:xmpmeta>';
  const end = indexOfAscii(bytes, endTag, start);
  if (end === -1) return null;
  return decoder.decode(bytes.subarray(start, end + endTag.length));
}

/** Locate the start of an MP4 by finding its `ftyp` box (`size(4) 'ftyp'`). */
function scanForFtyp(bytes: Uint8Array, from = 0): number {
  let at = from;
  while (at !== -1) {
    const idx = indexOfAscii(bytes, 'ftyp', at);
    if (idx < 4) {
      if (idx === -1) return -1;
      at = idx + 4;
      continue;
    }
    // The box size (big-endian u32) precedes the 'ftyp' fourcc; sanity-check it
    // points somewhere inside the file to avoid matching stray "ftyp" text.
    const boxStart = idx - 4;
    const size =
      (bytes[boxStart] << 24) |
      (bytes[boxStart + 1] << 16) |
      (bytes[boxStart + 2] << 8) |
      bytes[boxStart + 3];
    if (size >= 8 && boxStart + size <= bytes.length + 1) return boxStart;
    at = idx + 4;
  }
  return -1;
}

/**
 * Try to extract an embedded motion-photo video from an already-read byte array.
 * Returns null when the file is a plain still with no paired video.
 */
export function extractEmbeddedVideoFromBytes(bytes: Uint8Array): EmbeddedVideo | null {
  const xmp = extractXmp(bytes);

  // v1 Google "MicroVideo": offset counted backwards from end of file.
  if (xmp) {
    const microOffset = readXmpNumber(xmp, 'MicroVideoOffset');
    if (microOffset && microOffset > 0 && microOffset <= bytes.length) {
      const start = bytes.length - microOffset;
      const ftyp = scanForFtyp(bytes, Math.max(0, start - 8));
      const at = ftyp !== -1 && Math.abs(ftyp - start) < 64 ? ftyp : start;
      return { blob: sliceToBlob(bytes, at), offset: at, via: 'xmp-microvideo' };
    }

    // v2 "MotionPhoto": Container:Directory lists items; the video Item has a
    // Length. The primary still is first, the MP4 is appended last, so the
    // video begins at (fileLength - videoLength).
    const len = readXmpNumber(xmp, 'Length') ?? readXmpNumber(xmp, 'Item:Length');
    if (len && len > 0 && len < bytes.length) {
      const start = bytes.length - len;
      const ftyp = scanForFtyp(bytes, Math.max(0, start - 8));
      const at = ftyp !== -1 && Math.abs(ftyp - start) < 64 ? ftyp : start;
      return { blob: sliceToBlob(bytes, at), offset: at, via: 'xmp-container' };
    }
  }

  // Dependency-free fallback: scan for the MP4 `ftyp` box. Skip the very start
  // in case the container itself is an MP4-ish box; motion photos are JPEGs
  // (start with 0xFFD8) with the MP4 appended later.
  const ftyp = scanForFtyp(bytes, 2);
  if (ftyp > 0) {
    return { blob: sliceToBlob(bytes, ftyp), offset: ftyp, via: 'ftyp-scan' };
  }
  return null;
}

/** Read a File and extract its embedded motion-photo video, if any. */
export async function extractEmbeddedVideo(file: File): Promise<EmbeddedVideo | null> {
  const buf = new Uint8Array(await file.arrayBuffer());
  return extractEmbeddedVideoFromBytes(buf);
}
