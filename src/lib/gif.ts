// Shared, reusable animated-GIF decoder.
//
// Decodes an animated GIF into fully-composited RGBA frames, honouring each
// frame's disposal method and patch offsets so every returned frame is a
// complete, ready-to-paint image of the whole logical screen (no ghosting,
// no partial-patch artifacts). `gifuct-js` is lazy-loaded on first use so its
// bytes never touch the initial bundle.
//
// This module is intentionally UI-agnostic and side-effect free so other tools
// (e.g. the GIF encoder / optimizer) can reuse the exact same decode logic.
//
// Public API:
//   decodeGif(input)       -> DecodedGif   (frames + logical dimensions)
//   decodeGifFrames(input) -> GifFrame[]   (convenience: just the frames)

export interface GifFrame {
  /** Full-canvas composited RGBA pixels for this frame. */
  imageData: ImageData;
  /** Frame display duration in milliseconds. */
  delayMs: number;
  /** 0-based position of this frame in the animation. */
  index: number;
  width: number;
  height: number;
}

export interface DecodedGif {
  frames: GifFrame[];
  /** Logical screen width (all frames share these dimensions). */
  width: number;
  height: number;
  /**
   * Netscape loop count: 0 = loop forever, n = play n extra times. Defaults to
   * 0 (loop forever) when the GIF has no NETSCAPE2.0 application extension,
   * which matches how virtually every animated GIF behaves in practice.
   */
  loopCount: number;
}

type GifInput = File | Blob | ArrayBuffer | Uint8Array;

async function toArrayBuffer(input: GifInput): Promise<ArrayBuffer> {
  if (input instanceof ArrayBuffer) return input;
  if (input instanceof Uint8Array) {
    return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength) as ArrayBuffer;
  }
  return input.arrayBuffer();
}

// Scan the raw bytes for the NETSCAPE2.0 application extension and read its
// 16-bit little-endian loop count. Returns 0 (loop forever) when absent.
function readLoopCount(bytes: Uint8Array): number {
  const sig = [0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30]; // "NETSCAPE2.0"
  for (let i = 0; i + sig.length + 4 < bytes.length; i++) {
    let match = true;
    for (let j = 0; j < sig.length; j++) { if (bytes[i + j] !== sig[j]) { match = false; break; } }
    if (!match) continue;
    const k = i + sig.length;
    // Expect sub-block: 0x03 (size) 0x01 (id) loopLo loopHi
    if (bytes[k] === 0x03 && bytes[k + 1] === 0x01) return bytes[k + 2] | (bytes[k + 3] << 8);
  }
  return 0;
}

/**
 * Decode an animated (or single-frame) GIF into fully-composited frames.
 * Disposal handling:
 *   0/1 → leave the frame in place (accumulate)
 *   2   → restore the frame's region to background (transparent)
 *   3   → restore the canvas to its state before this frame
 */
export async function decodeGif(input: GifInput): Promise<DecodedGif> {
  const { parseGIF, decompressFrames } = await import('gifuct-js');
  const buffer = await toArrayBuffer(input);
  const gif = parseGIF(buffer);
  const parsed = decompressFrames(gif, true);
  const loopCount = readLoopCount(new Uint8Array(buffer));

  const width = gif.lsd.width;
  const height = gif.lsd.height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context unavailable in this browser.');

  // Scratch canvas used to alpha-composite each patch over the accumulated frame.
  const patchCanvas = document.createElement('canvas');
  const patchCtx = patchCanvas.getContext('2d');
  if (!patchCtx) throw new Error('Canvas 2D context unavailable in this browser.');

  const frames: GifFrame[] = [];

  parsed.forEach((frame, index) => {
    const { dims, disposalType, delay, patch } = frame;

    // Snapshot before drawing when we may need to restore to previous state.
    const restore = disposalType === 3 ? ctx.getImageData(0, 0, width, height) : null;

    // Paint the patch onto the scratch canvas, then composite it (respecting
    // transparency) over whatever is already on the main canvas.
    patchCanvas.width = dims.width;
    patchCanvas.height = dims.height;
    patchCtx.putImageData(new ImageData(new Uint8ClampedArray(patch), dims.width, dims.height), 0, 0);
    ctx.drawImage(patchCanvas, dims.left, dims.top);

    frames.push({
      imageData: ctx.getImageData(0, 0, width, height),
      delayMs: delay || 0,
      index,
      width,
      height,
    });

    // Apply disposal so the NEXT frame starts from the correct base.
    if (disposalType === 2) {
      ctx.clearRect(dims.left, dims.top, dims.width, dims.height);
    } else if (disposalType === 3 && restore) {
      ctx.putImageData(restore, 0, 0);
    }
  });

  return { frames, width, height, loopCount };
}

/** Convenience wrapper returning just the composited frames. */
export async function decodeGifFrames(input: GifInput): Promise<GifFrame[]> {
  return (await decodeGif(input)).frames;
}
