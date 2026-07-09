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
}

type GifInput = File | Blob | ArrayBuffer | Uint8Array;

async function toArrayBuffer(input: GifInput): Promise<ArrayBuffer> {
  if (input instanceof ArrayBuffer) return input;
  if (input instanceof Uint8Array) {
    return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength) as ArrayBuffer;
  }
  return input.arrayBuffer();
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

  return { frames, width, height };
}

/** Convenience wrapper returning just the composited frames. */
export async function decodeGifFrames(input: GifInput): Promise<GifFrame[]> {
  return (await decodeGif(input)).frames;
}
