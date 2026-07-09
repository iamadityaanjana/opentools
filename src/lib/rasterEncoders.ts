// Small, dependency-free encoders for formats the Canvas API can't emit.
// Each takes RGBA ImageData and returns a Blob.

export function encodeBMP(img: ImageData): Blob {
  const { width, height, data } = img;
  // 24-bit BGR, bottom-up, rows padded to 4 bytes.
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;
  const buf = new ArrayBuffer(fileSize);
  const dv = new DataView(buf);

  dv.setUint16(0, 0x424d, false); // 'BM'
  dv.setUint32(2, fileSize, true);
  dv.setUint32(10, 54, true); // pixel data offset
  dv.setUint32(14, 40, true); // DIB header size
  dv.setInt32(18, width, true);
  dv.setInt32(22, height, true); // positive = bottom-up
  dv.setUint16(26, 1, true); // planes
  dv.setUint16(28, 24, true); // bpp
  dv.setUint32(34, pixelArraySize, true);
  dv.setInt32(38, 2835, true); // 72 DPI
  dv.setInt32(42, 2835, true);

  let offset = 54;
  for (let y = height - 1; y >= 0; y--) {
    let rowStart = offset;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      dv.setUint8(rowStart++, data[i + 2]); // B
      dv.setUint8(rowStart++, data[i + 1]); // G
      dv.setUint8(rowStart++, data[i]); // R
    }
    offset += rowSize;
  }
  return new Blob([buf], { type: 'image/bmp' });
}

export function encodeTGA(img: ImageData): Blob {
  const { width, height, data } = img;
  const header = new Uint8Array(18);
  header[2] = 2; // uncompressed true-color
  header[12] = width & 0xff;
  header[13] = (width >> 8) & 0xff;
  header[14] = height & 0xff;
  header[15] = (height >> 8) & 0xff;
  header[16] = 32; // bpp
  header[17] = 0x28; // top-left origin, 8-bit alpha

  const body = new Uint8Array(width * height * 4);
  let p = 0;
  for (let i = 0; i < data.length; i += 4) {
    body[p++] = data[i + 2]; // B
    body[p++] = data[i + 1]; // G
    body[p++] = data[i]; // R
    body[p++] = data[i + 3]; // A
  }
  return new Blob([header, body], { type: 'image/x-tga' });
}

export function encodePPM(img: ImageData): Blob {
  const { width, height, data } = img;
  const header = new TextEncoder().encode(`P6\n${width} ${height}\n255\n`);
  const body = new Uint8Array(width * height * 3);
  let p = 0;
  for (let i = 0; i < data.length; i += 4) {
    body[p++] = data[i];
    body[p++] = data[i + 1];
    body[p++] = data[i + 2];
  }
  return new Blob([header, body], { type: 'image/x-portable-pixmap' });
}

export function encodePGM(img: ImageData): Blob {
  const { width, height, data } = img;
  const header = new TextEncoder().encode(`P5\n${width} ${height}\n255\n`);
  const body = new Uint8Array(width * height);
  let p = 0;
  for (let i = 0; i < data.length; i += 4) {
    // Rec. 601 luma
    body[p++] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  return new Blob([header, body], { type: 'image/x-portable-graymap' });
}

export function encodePBM(img: ImageData): Blob {
  const { width, height, data } = img;
  const header = new TextEncoder().encode(`P4\n${width} ${height}\n`);
  const rowBytes = Math.ceil(width / 8);
  const body = new Uint8Array(rowBytes * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (luma < 128) {
        // 1 = black in PBM
        body[y * rowBytes + (x >> 3)] |= 0x80 >> (x & 7);
      }
    }
  }
  return new Blob([header, body], { type: 'image/x-portable-bitmap' });
}

/** ICO wrapping a single PNG image (works on Windows Vista+ and all browsers). */
export function encodeICO(pngBytes: Uint8Array, width: number, height: number): Blob {
  const header = new ArrayBuffer(6 + 16);
  const dv = new DataView(header);
  dv.setUint16(0, 0, true); // reserved
  dv.setUint16(2, 1, true); // type: icon
  dv.setUint16(4, 1, true); // image count
  dv.setUint8(6, width >= 256 ? 0 : width);
  dv.setUint8(7, height >= 256 ? 0 : height);
  dv.setUint8(8, 0); // palette
  dv.setUint8(9, 0); // reserved
  dv.setUint16(10, 1, true); // color planes
  dv.setUint16(12, 32, true); // bpp
  dv.setUint32(14, pngBytes.length, true);
  dv.setUint32(18, 6 + 16, true); // offset to PNG
  return new Blob([header, pngBytes as BlobPart], { type: 'image/x-icon' });
}
