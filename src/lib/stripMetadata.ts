// Lossless metadata stripping for JPEG. Scan data and quantisation/Huffman
// tables are copied byte-for-byte; only metadata APP segments (EXIF, XMP, IPTC,
// Photoshop) and COM comment segments are dropped. APP0 (JFIF), APP2 (ICC colour
// profile) and APP14 (Adobe colour transform) are kept so colour is unchanged.
// Bytes after the final end-of-image marker (appended thumbnails, motion-photo
// video) are dropped too.

function isMetadataMarker(m: number): boolean {
  if (m === 0xfe) return true; // COM
  return m >= 0xe1 && m <= 0xef && m !== 0xe2 && m !== 0xee;
}

export function stripJpegMetadata(input: Uint8Array): Uint8Array {
  if (input.length < 4 || input[0] !== 0xff || input[1] !== 0xd8) {
    throw new Error('Not a JPEG file.');
  }
  const parts: Uint8Array[] = [input.subarray(0, 2)];
  let i = 2;
  while (i < input.length) {
    if (input[i] !== 0xff) throw new Error('Corrupt JPEG: expected a marker.');
    let j = i;
    while (j < input.length && input[j] === 0xff) j++; // skip fill bytes
    if (j >= input.length) break;
    const marker = input[j];

    if (marker === 0xd9) { // EOI: keep it, drop anything after
      parts.push(input.subarray(i, j + 1));
      break;
    }
    if (marker === 0xda) { // SOS: keep header and entropy data up to the EOI
      if (j + 2 >= input.length) throw new Error('Corrupt JPEG: truncated scan header.');
      const headerLen = (input[j + 1] << 8) | input[j + 2];
      const dataStart = j + 1 + headerLen;
      let eoi = -1;
      for (let m = dataStart; m + 1 < input.length; m++) {
        // Entropy-coded data never contains FF D9 (0xFF bytes are stuffed as FF 00).
        if (input[m] === 0xff && input[m + 1] === 0xd9) { eoi = m; break; }
      }
      if (eoi < 0) throw new Error('Corrupt JPEG: missing end-of-image marker.');
      parts.push(input.subarray(i, eoi + 2));
      break;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { // markers with no length
      parts.push(input.subarray(i, j + 1));
      i = j + 1;
      continue;
    }
    if (j + 2 >= input.length) throw new Error('Corrupt JPEG: truncated segment.');
    const segLen = (input[j + 1] << 8) | input[j + 2];
    const segEnd = j + 1 + segLen; // length field starts at j+1 and includes itself
    if (segLen < 2 || segEnd > input.length) throw new Error('Corrupt JPEG: bad segment length.');
    if (!isMetadataMarker(marker)) parts.push(input.subarray(i, segEnd));
    i = segEnd;
  }

  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
}
