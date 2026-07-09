// Minimal static GIF89a encoder: median-cut palette + LZW compression.
// Alpha is flattened onto white (GIF only supports 1-bit transparency).

interface Box {
  pixels: number[]; // indices into the flat RGB list (stride 3)
  rmin: number; rmax: number;
  gmin: number; gmax: number;
  bmin: number; bmax: number;
}

function makeBox(rgb: Uint8Array, pixels: number[]): Box {
  let rmin = 255, rmax = 0, gmin = 255, gmax = 0, bmin = 255, bmax = 0;
  for (const p of pixels) {
    const r = rgb[p], g = rgb[p + 1], b = rgb[p + 2];
    if (r < rmin) rmin = r; if (r > rmax) rmax = r;
    if (g < gmin) gmin = g; if (g > gmax) gmax = g;
    if (b < bmin) bmin = b; if (b > bmax) bmax = b;
  }
  return { pixels, rmin, rmax, gmin, gmax, bmin, bmax };
}

function medianCut(rgb: Uint8Array, maxColors: number): number[][] {
  const all: number[] = [];
  for (let i = 0; i < rgb.length; i += 3) all.push(i);
  let boxes: Box[] = [makeBox(rgb, all)];

  while (boxes.length < maxColors) {
    // Split the box with the largest channel range.
    let target = -1, targetRange = -1;
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      if (b.pixels.length < 2) continue;
      const range = Math.max(b.rmax - b.rmin, b.gmax - b.gmin, b.bmax - b.bmin);
      if (range > targetRange) { targetRange = range; target = i; }
    }
    if (target === -1) break;

    const box = boxes[target];
    const rRange = box.rmax - box.rmin;
    const gRange = box.gmax - box.gmin;
    const bRange = box.bmax - box.bmin;
    const channel = rRange >= gRange && rRange >= bRange ? 0 : gRange >= bRange ? 1 : 2;
    box.pixels.sort((a, b) => rgb[a + channel] - rgb[b + channel]);
    const mid = box.pixels.length >> 1;
    const left = box.pixels.slice(0, mid);
    const right = box.pixels.slice(mid);
    boxes.splice(target, 1, makeBox(rgb, left), makeBox(rgb, right));
  }

  return boxes.map((box) => {
    let r = 0, g = 0, b = 0;
    for (const p of box.pixels) { r += rgb[p]; g += rgb[p + 1]; b += rgb[p + 2]; }
    const n = box.pixels.length || 1;
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
  });
}

function nearest(palette: number[][], r: number, g: number, b: number): number {
  let best = 0, bestDist = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const dr = r - palette[i][0], dg = g - palette[i][1], db = b - palette[i][2];
    const d = dr * dr + dg * dg + db * db;
    if (d < bestDist) { bestDist = d; best = i; }
  }
  return best;
}

class ByteWriter {
  bytes: number[] = [];
  writeByte(b: number) { this.bytes.push(b & 0xff); }
  writeBytes(arr: number[] | Uint8Array) { for (const b of arr) this.bytes.push(b & 0xff); }
  writeString(s: string) { for (let i = 0; i < s.length; i++) this.bytes.push(s.charCodeAt(i)); }
  writeShort(v: number) { this.bytes.push(v & 0xff, (v >> 8) & 0xff); }
}

// LZW compression producing GIF sub-blocks.
function lzwEncode(minCodeSize: number, indices: Uint8Array): number[] {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let dict = new Map<string, number>();
  let next = eoiCode + 1;

  const out: number[] = [];
  let cur = 0, curBits = 0;
  const emit = (code: number) => {
    cur |= code << curBits;
    curBits += codeSize;
    while (curBits >= 8) { out.push(cur & 0xff); cur >>= 8; curBits -= 8; }
  };
  const resetDict = () => {
    dict = new Map();
    for (let i = 0; i < clearCode; i++) dict.set(String(i), i);
    codeSize = minCodeSize + 1;
    next = eoiCode + 1;
  };

  resetDict();
  emit(clearCode);
  let w = String(indices[0]);
  for (let i = 1; i < indices.length; i++) {
    const c = indices[i];
    const wc = w + ',' + c;
    if (dict.has(wc)) {
      w = wc;
    } else {
      emit(dict.get(w)!);
      dict.set(wc, next++);
      if (next > (1 << codeSize) && codeSize < 12) codeSize++;
      if (next > 4095) { emit(clearCode); resetDict(); }
      w = String(c);
    }
  }
  emit(dict.get(w)!);
  emit(eoiCode);
  if (curBits > 0) out.push(cur & 0xff);
  return out;
}

export function encodeGIF(img: ImageData): Blob {
  const { width, height, data } = img;

  // Flatten RGBA -> RGB over white.
  const rgb = new Uint8Array(width * height * 3);
  for (let i = 0, p = 0; i < data.length; i += 4, p += 3) {
    const a = data[i + 3] / 255;
    rgb[p] = Math.round(data[i] * a + 255 * (1 - a));
    rgb[p + 1] = Math.round(data[i + 1] * a + 255 * (1 - a));
    rgb[p + 2] = Math.round(data[i + 2] * a + 255 * (1 - a));
  }

  const palette = medianCut(rgb, 256);

  // Map to palette indices with a small cache.
  const indices = new Uint8Array(width * height);
  const cache = new Map<number, number>();
  for (let i = 0, pi = 0; i < rgb.length; i += 3, pi++) {
    const key = (rgb[i] << 16) | (rgb[i + 1] << 8) | rgb[i + 2];
    let idx = cache.get(key);
    if (idx === undefined) { idx = nearest(palette, rgb[i], rgb[i + 1], rgb[i + 2]); cache.set(key, idx); }
    indices[pi] = idx;
  }

  // Palette must be a power of two for the color table.
  let tableSizeBits = 1;
  while (1 << tableSizeBits < palette.length) tableSizeBits++;
  const tableSize = 1 << tableSizeBits;

  const w = new ByteWriter();
  w.writeString('GIF89a');
  w.writeShort(width);
  w.writeShort(height);
  w.writeByte(0xf0 | (tableSizeBits - 1)); // global color table, 8-bit color res
  w.writeByte(0); // background index
  w.writeByte(0); // aspect ratio

  for (let i = 0; i < tableSize; i++) {
    const c = palette[i] ?? [0, 0, 0];
    w.writeByte(c[0]); w.writeByte(c[1]); w.writeByte(c[2]);
  }

  // Image descriptor
  w.writeByte(0x2c);
  w.writeShort(0); w.writeShort(0);
  w.writeShort(width); w.writeShort(height);
  w.writeByte(0);

  const minCodeSize = Math.max(2, tableSizeBits);
  w.writeByte(minCodeSize);
  const lzw = lzwEncode(minCodeSize, indices);
  for (let i = 0; i < lzw.length; i += 255) {
    const chunk = lzw.slice(i, i + 255);
    w.writeByte(chunk.length);
    w.writeBytes(chunk);
  }
  w.writeByte(0); // block terminator
  w.writeByte(0x3b); // trailer

  return new Blob([new Uint8Array(w.bytes)], { type: 'image/gif' });
}
