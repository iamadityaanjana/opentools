// Generic image-operation engine. Every canvas-based tool is expressed as an
// operation here; the ToolRunner renders controls from `controls` and applies
// `run` (per file) or `runCombine` (all files -> one output).

export type Control =
  | { key: string; label: string; type: 'range'; min: number; max: number; step: number; def: number; suffix?: string }
  | { key: string; label: string; type: 'number'; min?: number; max?: number; def: number }
  | { key: string; label: string; type: 'select'; options: { value: string; label: string }[]; def: string }
  | { key: string; label: string; type: 'color'; def: string }
  | { key: string; label: string; type: 'text'; def: string; placeholder?: string }
  | { key: string; label: string; type: 'checkbox'; def: boolean };

export type Params = Record<string, string | number | boolean>;

export interface OpResult {
  canvas?: HTMLCanvasElement;
  text?: string;
  blob?: Blob;
  swatches?: string[];
  /** Preferred download filename (used by blob-producing ops). */
  filename?: string;
}

export interface ImageOp {
  controls: Control[];
  /** Default output format id (see encode registry). Omit to keep PNG. */
  outputFormat?: string;
  /** 'each' = per file (default). 'combine' = all files -> single output. */
  mode?: 'each' | 'combine';
  run?: (src: HTMLCanvasElement, p: Params) => OpResult | Promise<OpResult>;
  runCombine?: (srcs: HTMLCanvasElement[], p: Params) => OpResult | Promise<OpResult>;
  /**
   * Special input op that needs the raw uploaded File (not a rasterized
   * canvas) — e.g. animated GIFs where all frames must be decoded. Returns a
   * ready-to-download blob (typically a ZIP).
   */
  runFile?: (file: File, p: Params) => OpResult | Promise<OpResult>;
  /**
   * Combine op that needs the raw uploaded Files (not rasterized canvases) —
   * e.g. zipping images where original bytes should be preserved when no
   * re-encode is requested. Returns a ready-to-download blob (typically a ZIP).
   */
  runCombineFiles?: (files: File[], p: Params) => OpResult | Promise<OpResult>;
}

export interface TileRect {
  x: number;
  y: number;
  w: number;
  h: number;
  row: number; // 1-based
  col: number; // 1-based
}

/**
 * Compute the tile rectangles for splitting a W×H image, either by an even
 * rows×cols grid (remainder pixels distributed across cells) or by a fixed
 * tile width/height (the trailing row/column keeps the smaller remainder).
 * Shared by the split-image op and its live grid-line overlay so the preview
 * always matches the exported tiles exactly.
 */
/** Parse a JSON-encoded array of positive integers, falling back when empty/invalid. */
export function parseIntList(v: unknown, fallback: () => number[]): number[] {
  if (typeof v === 'string' && v) {
    try {
      const arr = JSON.parse(v);
      if (Array.isArray(arr)) {
        const nums = arr.map((n) => Math.max(1, Math.round(Number(n)))).filter((n) => Number.isFinite(n));
        if (nums.length) return nums;
      }
    } catch { /* fall through */ }
  }
  return fallback();
}

/** Parse a JSON-encoded array of numbers stored in a param (0..1 fractions). */
export function parseFractions(v: unknown): number[] {
  if (typeof v !== 'string' || !v) return [];
  try {
    const arr = JSON.parse(v);
    if (!Array.isArray(arr)) return [];
    return arr.map(Number).filter((n) => Number.isFinite(n) && n > 0 && n < 1).sort((a, b) => a - b);
  } catch { return []; }
}

export function splitRects(W: number, H: number, p: Params): TileRect[] {
  const rects: TileRect[] = [];
  // Guide mode: user-placed vertical (xs) / horizontal (ys) cut lines.
  if (String(p.by) === 'guides' || p.xs != null || p.ys != null) {
    const xs = parseFractions(p.xs).map((x) => Math.round(x * W));
    const ys = parseFractions(p.ys).map((y) => Math.round(y * H));
    const xb = Array.from(new Set([0, ...xs, W])).sort((a, b) => a - b);
    const yb = Array.from(new Set([0, ...ys, H])).sort((a, b) => a - b);
    for (let r = 0; r < yb.length - 1; r++) {
      for (let c = 0; c < xb.length - 1; c++) {
        const x = xb[c], y = yb[r];
        const w = xb[c + 1] - x, h = yb[r + 1] - y;
        if (w > 0 && h > 0) rects.push({ x, y, w, h, row: r + 1, col: c + 1 });
      }
    }
    return rects;
  }
  if (String(p.by) === 'size') {
    const tw = Math.max(1, Math.round(Number(p.tileW) || 1));
    const th = Math.max(1, Math.round(Number(p.tileH) || 1));
    const cols = Math.max(1, Math.ceil(W / tw));
    const rows = Math.max(1, Math.ceil(H / th));
    for (let r = 0; r < rows; r++) {
      const y = r * th;
      const h = Math.min(th, H - y);
      for (let c = 0; c < cols; c++) {
        const x = c * tw;
        const w = Math.min(tw, W - x);
        if (w > 0 && h > 0) rects.push({ x, y, w, h, row: r + 1, col: c + 1 });
      }
    }
    return rects;
  }
  const cols = Math.max(1, Math.round(Number(p.cols) || 1));
  const rows = Math.max(1, Math.round(Number(p.rows) || 1));
  for (let r = 0; r < rows; r++) {
    const y0 = Math.floor((r * H) / rows);
    const y1 = Math.floor(((r + 1) * H) / rows);
    for (let c = 0; c < cols; c++) {
      const x0 = Math.floor((c * W) / cols);
      const x1 = Math.floor(((c + 1) * W) / cols);
      const w = x1 - x0;
      const h = y1 - y0;
      if (w > 0 && h > 0) rects.push({ x: x0, y: y0, w, h, row: r + 1, col: c + 1 });
    }
  }
  return rects;
}

// ---- merge (freeform) layout ----
// Layers are stored in canvas-pixel space so resizing the canvas never distorts
// images — they keep their pixel size/position relative to the canvas origin.
export interface MergeLayer { x: number; y: number; w: number; h: number; z?: number; }
export interface MergeLayoutResult { W: number; H: number; layers: MergeLayer[]; }

export const MERGE_DEFAULT_W = 1200;
export const MERGE_DEFAULT_H = 900;

function mergeCanvasDims(p: Params): { W: number; H: number } {
  return {
    W: Math.max(50, Math.round(Number(p.canvasW) || MERGE_DEFAULT_W)),
    H: Math.max(50, Math.round(Number(p.canvasH) || MERGE_DEFAULT_H)),
  };
}

/** Arrange images into a `cols`-wide grid, each image fit (contain) into its cell. */
export function gridMergeLayout(sizes: { w: number; h: number }[], cols: number, W: number, H: number): MergeLayer[] {
  const n = sizes.length;
  if (n === 0) return [];
  const c = Math.max(1, Math.min(cols, n));
  const rows = Math.ceil(n / c);
  const cellW = W / c, cellH = H / rows;
  const pad = Math.min(cellW, cellH) * 0.04;
  return sizes.map((s, i) => {
    const col = i % c, row = Math.floor(i / c);
    const iw = s.w || 1, ih = s.h || 1;
    const availW = cellW - pad * 2, availH = cellH - pad * 2;
    const scale = Math.min(availW / iw, availH / ih);
    const w = iw * scale, h = ih * scale;
    return { x: col * cellW + (cellW - w) / 2, y: row * cellH + (cellH - h) / 2, w, h, z: i };
  });
}

/** Resolve the merge layout from params, falling back to a grid arrangement. */
export function mergeLayout(p: Params, sizes: { w: number; h: number }[]): MergeLayoutResult {
  const { W, H } = mergeCanvasDims(p);
  if (typeof p.layout === 'string' && p.layout) {
    try {
      const parsed = JSON.parse(p.layout);
      if (Array.isArray(parsed) && parsed.length === sizes.length) {
        return { W, H, layers: parsed as MergeLayer[] };
      }
    } catch { /* fall through to grid */ }
  }
  return { W, H, layers: gridMergeLayout(sizes, Math.round(Number(p.cols) || 2), W, H) };
}

// ---- collage (justified / mosaic) layout ----
export interface CollageRect { i: number; x: number; y: number; w: number; h: number; }

/** Default per-row image counts: fill rows `per` images wide. */
export function defaultRowCounts(n: number, per = 3): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i += per) out.push(Math.min(per, n - i));
  return out.length ? out : [Math.max(1, n)];
}

/** Partition image indices into rows following `rowCounts`; extras spill to a final row. */
export function collageRows(n: number, rowCounts: number[]): number[][] {
  const rows: number[][] = [];
  let idx = 0;
  for (const c of rowCounts) {
    if (idx >= n) break;
    const take = Math.max(1, Math.min(Math.round(c) || 1, n - idx));
    rows.push(Array.from({ length: take }, (_, k) => idx + k));
    idx += take;
  }
  if (idx < n) rows.push(Array.from({ length: n - idx }, (_, k) => idx + k));
  return rows;
}

/** Justified gallery: each row spans the full width; row height derives from aspects. */
export function collageLayout(sizes: { w: number; h: number }[], rowCounts: number[], canvasW: number, gap: number): { W: number; H: number; rects: CollageRect[] } {
  const rows = collageRows(sizes.length, rowCounts);
  const rects: CollageRect[] = [];
  let y = 0;
  for (const row of rows) {
    const k = row.length;
    const sumA = row.reduce((a, i) => a + (sizes[i].w || 1) / (sizes[i].h || 1), 0) || 1;
    const avail = Math.max(1, canvasW - gap * (k - 1));
    const H = avail / sumA;
    let x = 0;
    for (const i of row) {
      const a = (sizes[i].w || 1) / (sizes[i].h || 1);
      const w = a * H;
      rects.push({ i, x, y, w, h: H });
      x += w + gap;
    }
    y += H + gap;
  }
  return { W: canvasW, H: Math.max(1, y - gap), rects };
}

// ---- helpers ----
function make(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return [c, c.getContext('2d')!];
}
function clone(src: HTMLCanvasElement): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const [c, ctx] = make(src.width, src.height);
  ctx.drawImage(src, 0, 0);
  return [c, ctx];
}
function pixels(src: HTMLCanvasElement, fn: (d: Uint8ClampedArray) => void): OpResult {
  const [c, ctx] = clone(src);
  const img = ctx.getImageData(0, 0, c.width, c.height);
  fn(img.data);
  ctx.putImageData(img, 0, 0);
  return { canvas: c };
}
// Draw a source canvas onto a target of size (W,H) honouring a fit mode.
function drawFit(ctx: CanvasRenderingContext2D, src: HTMLCanvasElement, W: number, H: number, fit: string) {
  ctx.imageSmoothingQuality = 'high';
  if (fit === 'stretch') { ctx.drawImage(src, 0, 0, W, H); return; }
  const scale = fit === 'cover' ? Math.max(W / src.width, H / src.height) : Math.min(W / src.width, H / src.height);
  const dw = src.width * scale, dh = src.height * scale;
  ctx.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh);
}

// Resize an ImageData to (W,H) via a canvas, returning the resized ImageData.
function scaleImageData(img: ImageData, sw: number, sh: number, W: number, H: number): ImageData {
  const [srcC, srcCtx] = make(sw, sh);
  srcCtx.putImageData(img, 0, 0);
  const [, dstCtx] = make(W, H);
  dstCtx.imageSmoothingQuality = 'high';
  dstCtx.drawImage(srcC, 0, 0, W, H);
  return dstCtx.getImageData(0, 0, W, H);
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// median-cut palette (small, reused for color tools)
function palette(src: HTMLCanvasElement, count: number): string[] {
  const [c, ctx] = make(Math.min(src.width, 120), Math.min(src.height, 120));
  ctx.drawImage(src, 0, 0, c.width, c.height);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  let boxes = [[...Array(c.width * c.height).keys()].map((i) => i * 4)];
  const range = (px: number[], ch: number) => {
    let lo = 255, hi = 0;
    for (const p of px) { lo = Math.min(lo, d[p + ch]); hi = Math.max(hi, d[p + ch]); }
    return hi - lo;
  };
  while (boxes.length < count) {
    let bi = -1, br = -1, bc = 0;
    boxes.forEach((px, i) => {
      if (px.length < 2) return;
      for (let ch = 0; ch < 3; ch++) { const r = range(px, ch); if (r > br) { br = r; bi = i; bc = ch; } }
    });
    if (bi < 0) break;
    const px = boxes[bi].sort((a, b) => d[a + bc] - d[b + bc]);
    const mid = px.length >> 1;
    boxes.splice(bi, 1, px.slice(0, mid), px.slice(mid));
  }
  return boxes.map((px) => {
    let r = 0, g = 0, b = 0;
    for (const p of px) { r += d[p]; g += d[p + 1]; b += d[p + 2]; }
    const n = px.length || 1;
    const hex = (v: number) => Math.round(v / n).toString(16).padStart(2, '0');
    return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
  });
}

const FORMAT_OPTS = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
  { value: 'avif', label: 'AVIF' },
];

// Same list, prefixed with "Keep original" so tools can auto-detect the input
// format and only re-encode to something else when the user explicitly asks.
const FORMAT_OPTS_AUTO = [{ value: 'auto', label: 'Keep original format' }, ...FORMAT_OPTS];

// Font choices for the text/watermark overlays.
const FONT_OPTS = [
  { value: 'Instrument Sans', label: 'Instrument Sans' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Times New Roman", serif', label: 'Times New Roman' },
  { value: '"Courier New", monospace', label: 'Courier' },
  { value: 'Impact, sans-serif', label: 'Impact' },
];

const STYLE_OPTS = [
  { value: 'bold', label: 'Bold' },
  { value: 'normal', label: 'Regular' },
  { value: 'italic', label: 'Italic' },
  { value: 'bolditalic', label: 'Bold Italic' },
];

/** Build a canvas `font` string from style + size + family params. */
export function fontString(style: string, size: number, family: string): string {
  const italic = style === 'italic' || style === 'bolditalic' ? 'italic ' : '';
  const weight = style === 'bold' || style === 'bolditalic' ? 'bold ' : '';
  return `${italic}${weight}${size}px ${family || 'Instrument Sans'}`;
}

export const OPS: Record<string, ImageOp> = {
  // ---- Resize & crop / geometry ----
  resize: {
    controls: [
      { key: 'unit', label: 'Resize by', type: 'select', def: 'px', options: [
        { value: 'px', label: 'Pixels' }, { value: 'percent', label: 'Percentage' },
      ] },
      { key: 'width', label: 'Width', type: 'number', min: 1, def: 800 },
      { key: 'height', label: 'Height', type: 'number', min: 1, def: 600 },
      { key: 'keepAspect', label: 'Keep aspect ratio', type: 'checkbox', def: true },
    ],
    run: (src, p) => {
      let w: number, h: number;
      if (p.unit === 'percent') {
        if (p.keepAspect) { const s = Number(p.width) / 100; w = src.width * s; h = src.height * s; }
        else { w = (src.width * Number(p.width)) / 100; h = (src.height * Number(p.height)) / 100; }
      } else {
        w = Number(p.width); h = Number(p.height);
        if (p.keepAspect) { const s = Math.min(w / src.width, h / src.height); w = src.width * s; h = src.height * s; }
      }
      const [c, ctx] = make(w, h);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(src, 0, 0, c.width, c.height);
      return { canvas: c };
    },
  },
  crop: {
    controls: [
      { key: 'x', label: 'Left (px)', type: 'number', min: 0, def: 0 },
      { key: 'y', label: 'Top (px)', type: 'number', min: 0, def: 0 },
      { key: 'w', label: 'Width (px)', type: 'number', min: 1, def: 400 },
      { key: 'h', label: 'Height (px)', type: 'number', min: 1, def: 400 },
    ],
    run: (src, p) => {
      const x = Number(p.x), y = Number(p.y);
      const w = Math.min(Number(p.w), src.width - x), h = Math.min(Number(p.h), src.height - y);
      const [c, ctx] = make(w, h);
      ctx.drawImage(src, x, y, w, h, 0, 0, w, h);
      return { canvas: c };
    },
  },
  rotate: {
    controls: [
      { key: 'angle', label: 'Angle', type: 'select', def: '90', options: [
        { value: '90', label: '90° CW' }, { value: '180', label: '180°' }, { value: '270', label: '90° CCW' },
      ] },
    ],
    run: (src, p) => {
      const a = Number(p.angle);
      const swap = a === 90 || a === 270;
      const [c, ctx] = make(swap ? src.height : src.width, swap ? src.width : src.height);
      ctx.translate(c.width / 2, c.height / 2);
      ctx.rotate((a * Math.PI) / 180);
      ctx.drawImage(src, -src.width / 2, -src.height / 2);
      return { canvas: c };
    },
  },
  flip: {
    controls: [
      { key: 'axis', label: 'Direction', type: 'select', def: 'h', options: [
        { value: 'h', label: 'Horizontal (mirror)' }, { value: 'v', label: 'Vertical' },
      ] },
    ],
    run: (src, p) => {
      const [c, ctx] = make(src.width, src.height);
      if (p.axis === 'h') { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
      else { ctx.translate(0, c.height); ctx.scale(1, -1); }
      ctx.drawImage(src, 0, 0);
      return { canvas: c };
    },
  },
  'canvas-size': {
    controls: [
      { key: 'width', label: 'Canvas width', type: 'number', min: 1, def: 1000 },
      { key: 'height', label: 'Canvas height', type: 'number', min: 1, def: 1000 },
      { key: 'bg', label: 'Background', type: 'color', def: '#ffffff' },
    ],
    run: (src, p) => {
      const [c, ctx] = make(Number(p.width), Number(p.height));
      ctx.fillStyle = String(p.bg); ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(src, (c.width - src.width) / 2, (c.height - src.height) / 2);
      return { canvas: c };
    },
  },

  // ---- Adjustments / filters ----
  grayscale: { controls: [], run: (src) => pixels(src, (d) => {
    for (let i = 0; i < d.length; i += 4) { const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; d[i] = d[i + 1] = d[i + 2] = l; }
  }) },
  invert: { controls: [], run: (src) => pixels(src, (d) => {
    for (let i = 0; i < d.length; i += 4) { d[i] = 255 - d[i]; d[i + 1] = 255 - d[i + 1]; d[i + 2] = 255 - d[i + 2]; }
  }) },
  brightness: {
    controls: [{ key: 'v', label: 'Brightness', type: 'range', min: -100, max: 100, step: 1, def: 0 }],
    run: (src, p) => pixels(src, (d) => { const v = Number(p.v) * 2.55; for (let i = 0; i < d.length; i += 4) { d[i] += v; d[i + 1] += v; d[i + 2] += v; } }),
  },
  contrast: {
    controls: [{ key: 'v', label: 'Contrast', type: 'range', min: -100, max: 100, step: 1, def: 0 }],
    run: (src, p) => pixels(src, (d) => {
      const c = Number(p.v); const f = (259 * (c + 255)) / (255 * (259 - c));
      for (let i = 0; i < d.length; i += 4) { d[i] = f * (d[i] - 128) + 128; d[i + 1] = f * (d[i + 1] - 128) + 128; d[i + 2] = f * (d[i + 2] - 128) + 128; }
    }),
  },
  saturation: {
    controls: [{ key: 'v', label: 'Saturation', type: 'range', min: -100, max: 100, step: 1, def: 0 }],
    run: (src, p) => pixels(src, (d) => {
      const s = 1 + Number(p.v) / 100;
      for (let i = 0; i < d.length; i += 4) { const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; d[i] = l + (d[i] - l) * s; d[i + 1] = l + (d[i + 1] - l) * s; d[i + 2] = l + (d[i + 2] - l) * s; }
    }),
  },
  blur: {
    controls: [{ key: 'r', label: 'Radius', type: 'range', min: 0, max: 40, step: 1, def: 4, suffix: 'px' }],
    run: (src, p) => { const [c, ctx] = make(src.width, src.height); ctx.filter = `blur(${Number(p.r)}px)`; ctx.drawImage(src, 0, 0); return { canvas: c }; },
  },
  sharpen: {
    controls: [{ key: 'amount', label: 'Amount', type: 'range', min: 0, max: 100, step: 5, def: 40 }],
    run: (src, p) => {
      const a = Number(p.amount) / 100; const [c, ctx] = clone(src);
      const img = ctx.getImageData(0, 0, c.width, c.height); const out = ctx.createImageData(img);
      const w = c.width, h = c.height, s = img.data, o = out.data;
      const k = [0, -a, 0, -a, 1 + 4 * a, -a, 0, -a, 0];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        for (let ch = 0; ch < 3; ch++) {
          let sum = 0, ki = 0;
          for (let ky = -1; ky <= 1; ky++) for (let kx = -1; kx <= 1; kx++) {
            const px = Math.min(w - 1, Math.max(0, x + kx)), py = Math.min(h - 1, Math.max(0, y + ky));
            sum += s[(py * w + px) * 4 + ch] * k[ki++];
          }
          o[(y * w + x) * 4 + ch] = sum;
        }
        o[(y * w + x) * 4 + 3] = s[(y * w + x) * 4 + 3];
      }
      ctx.putImageData(out, 0, 0); return { canvas: c };
    },
  },
  pixelate: {
    controls: [{ key: 'size', label: 'Block size', type: 'range', min: 2, max: 60, step: 1, def: 12, suffix: 'px' }],
    run: (src, p) => {
      const b = Number(p.size); const [c, ctx] = make(src.width, src.height);
      const sw = Math.max(1, Math.round(src.width / b)), sh = Math.max(1, Math.round(src.height / b));
      const [tmp, tctx] = make(sw, sh); tctx.drawImage(src, 0, 0, sw, sh);
      ctx.imageSmoothingEnabled = false; ctx.drawImage(tmp, 0, 0, sw, sh, 0, 0, c.width, c.height);
      return { canvas: c };
    },
  },

  // ---- Framing ----
  border: {
    outputFormat: 'png',
    controls: [
      { key: 'size', label: 'Border width', type: 'range', min: 0, max: 120, step: 1, def: 20, suffix: 'px' },
      { key: 'color', label: 'Color', type: 'color', def: '#ffffff' },
      { key: 'outerRadius', label: 'Outer corner radius', type: 'range', min: 0, max: 400, step: 2, def: 0, suffix: 'px' },
      { key: 'imageRadius', label: 'Image corner radius', type: 'range', min: 0, max: 400, step: 2, def: 0, suffix: 'px' },
    ],
    run: (src, p) => {
      const b = Math.max(0, Number(p.size) || 0);
      const outer = Math.max(0, Number(p.outerRadius) || 0);
      const inner = Math.max(0, Number(p.imageRadius) || 0);
      const [c, ctx] = make(src.width + b * 2, src.height + b * 2);
      if (outer > 0) { roundRectPath(ctx, 0, 0, c.width, c.height, outer); ctx.clip(); }
      ctx.fillStyle = String(p.color); ctx.fillRect(0, 0, c.width, c.height);
      ctx.save();
      if (inner > 0) { roundRectPath(ctx, b, b, src.width, src.height, inner); ctx.clip(); }
      ctx.drawImage(src, b, b);
      ctx.restore();
      return { canvas: c };
    },
  },
  'round-corners': {
    controls: [{ key: 'radius', label: 'Corner radius', type: 'range', min: 0, max: 200, step: 2, def: 40, suffix: 'px' }],
    outputFormat: 'png',
    run: (src, p) => {
      const [c, ctx] = make(src.width, src.height);
      roundRectPath(ctx, 0, 0, c.width, c.height, Number(p.radius)); ctx.clip(); ctx.drawImage(src, 0, 0);
      return { canvas: c };
    },
  },
  bgcolor: {
    controls: [{ key: 'color', label: 'Background color', type: 'color', def: '#ffffff' }],
    run: (src, p) => {
      const [c, ctx] = make(src.width, src.height); ctx.fillStyle = String(p.color); ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(src, 0, 0);
      return { canvas: c };
    },
  },
  transparency: {
    controls: [
      { key: 'color', label: 'Color to make transparent', type: 'color', def: '#ffffff' },
      { key: 'tol', label: 'Tolerance', type: 'range', min: 0, max: 150, step: 5, def: 30 },
    ],
    outputFormat: 'png',
    run: (src, p) => {
      const hex = String(p.color); const tr = parseInt(hex.slice(1, 3), 16), tg = parseInt(hex.slice(3, 5), 16), tb = parseInt(hex.slice(5, 7), 16);
      const tol = Number(p.tol);
      return pixels(src, (d) => { for (let i = 0; i < d.length; i += 4) { if (Math.abs(d[i] - tr) < tol && Math.abs(d[i + 1] - tg) < tol && Math.abs(d[i + 2] - tb) < tol) d[i + 3] = 0; } });
    },
  },

  // ---- Text / watermark ----
  text: {
    controls: [
      { key: 'text', label: 'Text', type: 'text', def: 'Your text', placeholder: 'Type your text' },
      { key: 'font', label: 'Font', type: 'select', def: 'Instrument Sans', options: FONT_OPTS },
      { key: 'style', label: 'Style', type: 'select', def: 'bold', options: STYLE_OPTS },
      { key: 'size', label: 'Font size', type: 'range', min: 8, max: 400, step: 2, def: 64, suffix: 'px' },
      { key: 'color', label: 'Color', type: 'color', def: '#ffffff' },
      { key: 'outline', label: 'Add outline', type: 'checkbox', def: true },
    ],
    run: (src, p) => {
      const [c, ctx] = clone(src);
      const t = String(p.text ?? '').trim();
      if (!t) return { canvas: c };
      const fs = Number(p.size);
      ctx.font = fontString(String(p.style ?? 'bold'), fs, String(p.font ?? 'Instrument Sans'));
      ctx.fillStyle = String(p.color); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      // nx / ny are fractional positions (0..1) set by the draggable overlay.
      const x = (p.nx != null ? Number(p.nx) : 0.5) * c.width;
      const y = (p.ny != null ? Number(p.ny) : 0.5) * c.height;
      if (p.outline) { ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = Math.max(1, fs / 14); ctx.strokeText(t, x, y); }
      ctx.fillText(t, x, y);
      return { canvas: c };
    },
  },
  watermark: {
    controls: [
      { key: 'text', label: 'Watermark text', type: 'text', def: '© opentools', placeholder: 'Watermark text' },
      { key: 'style', label: 'Style', type: 'select', def: 'tile', options: [
        { value: 'tile', label: 'Tiled (diagonal)' }, { value: 'single', label: 'Single (drag to place)' },
      ] },
      { key: 'font', label: 'Font', type: 'select', def: 'Instrument Sans', options: FONT_OPTS },
      { key: 'color', label: 'Color', type: 'color', def: '#ffffff' },
      { key: 'opacity', label: 'Opacity', type: 'range', min: 5, max: 100, step: 5, def: 35, suffix: '%' },
      { key: 'size', label: 'Font size', type: 'range', min: 8, max: 300, step: 2, def: 32, suffix: 'px' },
    ],
    run: (src, p) => {
      const [c, ctx] = clone(src);
      const t = String(p.text ?? '').trim();
      if (!t) return { canvas: c };
      const fs = Number(p.size);
      ctx.globalAlpha = Number(p.opacity) / 100;
      ctx.fillStyle = String(p.color);
      ctx.font = fontString('bold', fs, String(p.font ?? 'Instrument Sans'));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (p.style === 'single') {
        const x = (p.nx != null ? Number(p.nx) : 0.5) * c.width;
        const y = (p.ny != null ? Number(p.ny) : 0.5) * c.height;
        ctx.fillText(t, x, y);
      } else {
        ctx.translate(c.width / 2, c.height / 2); ctx.rotate(-Math.PI / 6);
        const step = fs * 6;
        for (let y = -c.height; y < c.height; y += step) for (let x = -c.width; x < c.width; x += step * 1.4) ctx.fillText(t, x, y);
      }
      return { canvas: c };
    },
  },

  // ---- Compression / conversion (output-driven) ----
  compress: {
    controls: [
      { key: 'format', label: 'Output format', type: 'select', def: 'auto', options: FORMAT_OPTS_AUTO },
      { key: 'quality', label: 'Quality', type: 'range', min: 10, max: 100, step: 5, def: 75, suffix: '%' },
    ],
    run: (src) => ({ canvas: clone(src)[0] }),
  },
  reduce: {
    controls: [
      { key: 'maxWidth', label: 'Max width (px)', type: 'number', min: 100, def: 1600 },
      { key: 'quality', label: 'Quality', type: 'range', min: 10, max: 100, step: 5, def: 70, suffix: '%' },
    ],
    outputFormat: 'jpeg',
    run: (src, p) => {
      const mw = Number(p.maxWidth); const s = Math.min(1, mw / src.width);
      const [c, ctx] = make(src.width * s, src.height * s); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(src, 0, 0, c.width, c.height);
      return { canvas: c };
    },
  },

  // ---- Presets ----
  favicon: {
    controls: [{ key: 'size', label: 'Size', type: 'select', def: '32', options: [
      { value: '16', label: '16×16' }, { value: '32', label: '32×32' }, { value: '48', label: '48×48' }, { value: '64', label: '64×64' },
    ] }],
    outputFormat: 'ico',
    run: (src, p) => { const n = Number(p.size); const [c, ctx] = make(n, n); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(src, 0, 0, n, n); return { canvas: c }; },
  },
  thumbnail: {
    controls: [{ key: 'size', label: 'Max size (px)', type: 'number', min: 32, def: 300 }],
    run: (src, p) => { const m = Number(p.size); const s = Math.min(1, m / Math.max(src.width, src.height)); const [c, ctx] = make(src.width * s, src.height * s); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(src, 0, 0, c.width, c.height); return { canvas: c }; },
  },
  social: {
    controls: [{ key: 'preset', label: 'Platform', type: 'select', def: '1080x1080', options: [
      { value: '1080x1080', label: 'Instagram Square 1080×1080' },
      { value: '1080x1920', label: 'Story / Reel 1080×1920' },
      { value: '1200x630', label: 'OG / Facebook 1200×630' },
      { value: '1500x500', label: 'Twitter Header 1500×500' },
      { value: '1280x720', label: 'YouTube 1280×720' },
    ] }, { key: 'bg', label: 'Background', type: 'color', def: '#ffffff' }],
    run: (src, p) => {
      const [tw, th] = String(p.preset).split('x').map(Number); const [c, ctx] = make(tw, th);
      ctx.fillStyle = String(p.bg); ctx.fillRect(0, 0, tw, th);
      const s = Math.min(tw / src.width, th / src.height); const w = src.width * s, h = src.height * s;
      ctx.imageSmoothingQuality = 'high'; ctx.drawImage(src, (tw - w) / 2, (th - h) / 2, w, h);
      return { canvas: c };
    },
  },

  // ---- Passthrough (re-encode strips metadata like EXIF) ----
  passthrough: { controls: [{ key: 'format', label: 'Output format', type: 'select', def: 'auto', options: FORMAT_OPTS_AUTO }], run: (src) => ({ canvas: clone(src)[0] }) },
  convertJpeg: { controls: [{ key: 'quality', label: 'Quality', type: 'range', min: 10, max: 100, step: 5, def: 90, suffix: '%' }], outputFormat: 'jpeg', run: (src) => ({ canvas: clone(src)[0] }) },

  // ---- Text output ----
  base64: { controls: [], run: (src) => ({ text: src.toDataURL('image/png').split(',')[1] }) },
  datauri: { controls: [], run: (src) => ({ text: src.toDataURL('image/png') }) },

  // ---- Color analysis ----
  colorPalette: {
    controls: [{ key: 'count', label: 'Colors', type: 'range', min: 3, max: 12, step: 1, def: 6 }],
    run: (src, p) => ({ swatches: palette(src, Number(p.count)) }),
  },
  colorCount: {
    controls: [],
    run: (src) => {
      const [c, ctx] = clone(src); const d = ctx.getImageData(0, 0, c.width, c.height).data; const set = new Set<number>();
      for (let i = 0; i < d.length; i += 4) set.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
      return { text: `${set.size.toLocaleString()} unique colors in ${c.width}×${c.height} (${(c.width * c.height).toLocaleString()} pixels).` };
    },
  },

  // ---- Combine (many -> one) ----
  merge: {
    mode: 'combine',
    // Freeform compositor on a user-sized canvas. The MergeCanvas editor writes a
    // pixel-space `layout` ({x,y,w,h,z}); without one, images arrange into a grid.
    controls: [
      { key: 'canvasW', label: 'Canvas width (px)', type: 'number', min: 50, def: MERGE_DEFAULT_W },
      { key: 'canvasH', label: 'Canvas height (px)', type: 'number', min: 50, def: MERGE_DEFAULT_H },
      { key: 'cols', label: 'Grid columns', type: 'range', min: 1, max: 6, step: 1, def: 2 },
      { key: 'bg', label: 'Background', type: 'color', def: '#ffffff' },
    ],
    runCombine: (srcs, p) => {
      const layout = mergeLayout(p, srcs.map((s) => ({ w: s.width, h: s.height })));
      const [c, ctx] = make(layout.W, layout.H);
      ctx.fillStyle = String(p.bg); ctx.fillRect(0, 0, c.width, c.height);
      ctx.imageSmoothingQuality = 'high';
      // Draw from lowest to highest z so stacking matches the editor.
      const order = srcs.map((_, i) => i).sort((a, b) => (layout.layers[a]?.z ?? a) - (layout.layers[b]?.z ?? b));
      for (const i of order) {
        const L = layout.layers[i];
        if (!L) continue;
        ctx.drawImage(srcs[i], L.x, L.y, L.w, L.h);
      }
      return { canvas: c };
    },
  },
  collage: {
    mode: 'combine',
    // Justified mosaic: rows span the full width, each row can hold a different
    // number of images (edited via the CollageEditor's per-row steppers).
    controls: [
      { key: 'canvasW', label: 'Width (px)', type: 'number', min: 200, def: 1200 },
      { key: 'gap', label: 'Gap', type: 'range', min: 0, max: 40, step: 2, def: 8, suffix: 'px' },
      { key: 'bg', label: 'Background', type: 'color', def: '#ffffff' },
    ],
    runCombine: (srcs, p) => {
      const sizes = srcs.map((s) => ({ w: s.width, h: s.height }));
      const counts = parseIntList(p.rowCounts, () => defaultRowCounts(srcs.length));
      const gap = Math.max(0, Math.round(Number(p.gap) || 0));
      const W = Math.max(200, Math.round(Number(p.canvasW) || 1200));
      const { H, rects } = collageLayout(sizes, counts, W, gap);
      const [c, ctx] = make(W, Math.round(H));
      ctx.fillStyle = String(p.bg); ctx.fillRect(0, 0, c.width, c.height);
      ctx.imageSmoothingQuality = 'high';
      rects.forEach((r) => ctx.drawImage(srcs[r.i], r.x, r.y, r.w, r.h));
      return { canvas: c };
    },
  },
  imagesToPdf: {
    mode: 'combine',
    controls: [{ key: 'fit', label: 'Page', type: 'select', def: 'image', options: [
      { value: 'image', label: 'Fit to each image' }, { value: 'a4', label: 'A4 portrait' },
    ] }],
    runCombine: async (srcs, p) => {
      const { jsPDF } = await import('jspdf');
      const a4 = p.fit === 'a4';
      const first = srcs[0];
      const pdf = a4
        ? new jsPDF({ unit: 'pt', format: 'a4' })
        : new jsPDF({ orientation: first.width >= first.height ? 'l' : 'p', unit: 'px', format: [first.width, first.height] });
      srcs.forEach((s, idx) => {
        if (idx > 0) {
          if (a4) pdf.addPage();
          else pdf.addPage([s.width, s.height], s.width >= s.height ? 'l' : 'p');
        }
        const dataUrl = s.toDataURL('image/jpeg', 0.92);
        if (a4) {
          const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
          const sc = Math.min(pw / s.width, ph / s.height); const w = s.width * sc, h = s.height * sc;
          pdf.addImage(dataUrl, 'JPEG', (pw - w) / 2, (ph - h) / 2, w, h);
        } else {
          pdf.addImage(dataUrl, 'JPEG', 0, 0, s.width, s.height);
        }
      });
      return { blob: pdf.output('blob') };
    },
  },

  // ---- PDF (special file input: render/extract -> ZIP) ----
  // Render each PDF page to a raster image at a chosen DPI/format.
  pdfToImages: {
    controls: [
      { key: 'format', label: 'Page format', type: 'select', def: 'png', options: [
        { value: 'png', label: 'PNG' }, { value: 'jpeg', label: 'JPEG' }, { value: 'webp', label: 'WebP' },
      ] },
      { key: 'quality', label: 'Quality (JPEG/WebP)', type: 'range', min: 10, max: 100, step: 5, def: 90, suffix: '%' },
      { key: 'dpi', label: 'Resolution', type: 'range', min: 72, max: 300, step: 6, def: 150, suffix: ' DPI' },
      { key: 'range', label: 'Page range (blank = all)', type: 'text', def: '', placeholder: 'e.g. 1-3, 5' },
    ],
    runFile: async (file, p) => {
      const [{ renderPdfPages }, { encodeImageData }, JSZip] = await Promise.all([
        import('../lib/pdf'),
        import('../lib/encode'),
        import('jszip').then((m) => m.default),
      ]);
      const fmt = String(p.format || 'png');
      const ext = fmt === 'jpeg' ? 'jpg' : fmt;
      const q = Number(p.quality ?? 90) / 100;
      const pages = await renderPdfPages(file, { dpi: Number(p.dpi ?? 150), range: String(p.range ?? '') });
      if (pages.length === 0) throw new Error('No pages could be rendered from this PDF.');
      const base = file.name.replace(/\.[^.]+$/, '') || 'pdf';
      const pad = Math.max(3, String(Math.max(...pages.map((pg) => pg.index + 1))).length);

      if (pages.length === 1) {
        const pg = pages[0];
        const blob = await encodeImageData({ imageData: pg.imageData, width: pg.width, height: pg.height }, fmt, { quality: q });
        return { blob, filename: `${base}-page-${String(pg.index + 1).padStart(pad, '0')}.${ext}` };
      }

      const zip = new JSZip();
      for (const pg of pages) {
        const blob = await encodeImageData({ imageData: pg.imageData, width: pg.width, height: pg.height }, fmt, { quality: q });
        zip.file(`${base}-page-${String(pg.index + 1).padStart(pad, '0')}.${ext}`, blob);
      }
      return { blob: await zip.generateAsync({ type: 'blob' }), filename: `${base}-pages.zip` };
    },
  },

  // Pull the embedded raster image XObjects out of a PDF (not page renders).
  extractImagesFromPdf: {
    controls: [
      { key: 'format', label: 'Image format', type: 'select', def: 'png', options: [
        { value: 'png', label: 'PNG' }, { value: 'jpeg', label: 'JPEG' }, { value: 'webp', label: 'WebP' },
      ] },
      { key: 'quality', label: 'Quality (JPEG/WebP)', type: 'range', min: 10, max: 100, step: 5, def: 90, suffix: '%' },
    ],
    runFile: async (file, p) => {
      const [{ extractPdfImages }, { encodeImageData }, JSZip] = await Promise.all([
        import('../lib/pdf'),
        import('../lib/encode'),
        import('jszip').then((m) => m.default),
      ]);
      const images = await extractPdfImages(file);
      if (images.length === 0) throw new Error('No embedded images found in this PDF.');
      const fmt = String(p.format || 'png');
      const ext = fmt === 'jpeg' ? 'jpg' : fmt;
      const q = Number(p.quality ?? 90) / 100;
      const base = file.name.replace(/\.[^.]+$/, '') || 'pdf';
      const pad = Math.max(3, String(images.length).length);
      const zip = new JSZip();
      for (let i = 0; i < images.length; i++) {
        const im = images[i];
        const blob = await encodeImageData({ imageData: im.imageData, width: im.width, height: im.height }, fmt, { quality: q });
        zip.file(`${base}-image-${String(i + 1).padStart(pad, '0')}.${ext}`, blob);
      }
      return { blob: await zip.generateAsync({ type: 'blob' }), filename: `${base}-images.zip` };
    },
  },

  // ---- GIF (special file input: decode all frames -> ZIP) ----
  gifToImages: {
    controls: [
      { key: 'format', label: 'Frame format', type: 'select', def: 'png', options: [
        { value: 'png', label: 'PNG' }, { value: 'jpeg', label: 'JPEG' }, { value: 'webp', label: 'WebP' },
      ] },
      { key: 'quality', label: 'Quality (JPEG/WebP)', type: 'range', min: 10, max: 100, step: 5, def: 90, suffix: '%' },
      { key: 'timing', label: 'Include frame timing in filenames', type: 'checkbox', def: false },
    ],
    runFile: async (file, p) => {
      const [{ decodeGifFrames }, { encodeImageData }, JSZip] = await Promise.all([
        import('../lib/gif'),
        import('../lib/encode'),
        import('jszip').then((m) => m.default),
      ]);
      const frames = await decodeGifFrames(file);
      if (frames.length === 0) throw new Error('No frames found in this GIF.');
      const fmt = String(p.format || 'png');
      const ext = fmt === 'jpeg' ? 'jpg' : fmt;
      const q = Number(p.quality ?? 90) / 100;
      const withTiming = Boolean(p.timing);
      const pad = Math.max(3, String(frames.length).length);
      const zip = new JSZip();
      for (const f of frames) {
        const blob = await encodeImageData(
          { imageData: f.imageData, width: f.width, height: f.height },
          fmt,
          { quality: q },
        );
        const num = String(f.index + 1).padStart(pad, '0');
        const name = withTiming ? `frame-${num}-${f.delayMs}ms.${ext}` : `frame-${num}.${ext}`;
        zip.file(name, blob);
      }
      return { blob: await zip.generateAsync({ type: 'blob' }) };
    },
  },

  // ---- GIF creation & transforms (animated output) ----
  // Many still images -> one animated GIF.
  imagesToGif: {
    mode: 'combine',
    outputFormat: 'gif',
    controls: [
      { key: 'delay', label: 'Frame delay', type: 'range', min: 20, max: 2000, step: 20, def: 150, suffix: 'ms' },
      { key: 'loop', label: 'Loop count (0 = forever)', type: 'number', min: 0, def: 0 },
      { key: 'fit', label: 'Frame fit', type: 'select', def: 'contain', options: [
        { value: 'contain', label: 'Contain (letterbox)' },
        { value: 'cover', label: 'Cover (crop)' },
        { value: 'stretch', label: 'Stretch' },
      ] },
      { key: 'width', label: 'Width (0 = first image)', type: 'number', min: 0, def: 0 },
      { key: 'height', label: 'Height (0 = first image)', type: 'number', min: 0, def: 0 },
      { key: 'bg', label: 'Background', type: 'color', def: '#ffffff' },
      { key: 'dither', label: 'Dithering', type: 'checkbox', def: false },
    ],
    runCombine: async (srcs, p) => {
      const { encodeAnimatedGIF } = await import('../lib/gifEncoder');
      let W = Math.round(Number(p.width) || 0);
      let H = Math.round(Number(p.height) || 0);
      if (W <= 0 || H <= 0) { W = srcs[0].width; H = srcs[0].height; }
      const fit = String(p.fit || 'contain');
      const delay = Number(p.delay ?? 150);
      const frames = srcs.map((s) => {
        const [, ctx] = make(W, H);
        if (fit === 'contain') { ctx.fillStyle = String(p.bg); ctx.fillRect(0, 0, W, H); }
        drawFit(ctx, s, W, H, fit);
        const img = ctx.getImageData(0, 0, W, H);
        return { data: img.data, width: W, height: H, delayMs: delay };
      });
      const blob = encodeAnimatedGIF(frames, {
        loop: Number(p.loop) || 0,
        dither: Boolean(p.dither),
        transparent: fit === 'contain' ? false : true,
        maxColors: 256,
      });
      return { blob, filename: 'animated.gif' };
    },
  },

  // Decode a GIF, resize every frame, re-encode (timing + loop preserved).
  gifResizer: {
    outputFormat: 'gif',
    controls: [
      { key: 'unit', label: 'Resize by', type: 'select', def: 'px', options: [
        { value: 'px', label: 'Pixels' }, { value: 'percent', label: 'Percentage' },
      ] },
      { key: 'width', label: 'Width', type: 'number', min: 1, def: 480 },
      { key: 'height', label: 'Height', type: 'number', min: 1, def: 480 },
      { key: 'keepAspect', label: 'Keep aspect ratio', type: 'checkbox', def: true },
      { key: 'dither', label: 'Dithering', type: 'checkbox', def: false },
    ],
    runFile: async (file, p) => {
      const [{ decodeGif }, { encodeAnimatedGIF }] = await Promise.all([
        import('../lib/gif'),
        import('../lib/gifEncoder'),
      ]);
      const { frames, width, height, loopCount } = await decodeGif(file);
      if (frames.length === 0) throw new Error('No frames found in this GIF.');

      let W: number, H: number;
      if (p.unit === 'percent') {
        if (p.keepAspect) { const s = Number(p.width) / 100; W = width * s; H = height * s; }
        else { W = (width * Number(p.width)) / 100; H = (height * Number(p.height)) / 100; }
      } else {
        W = Number(p.width); H = Number(p.height);
        if (p.keepAspect) { const s = Math.min(W / width, H / height); W = width * s; H = height * s; }
      }
      W = Math.max(1, Math.round(W)); H = Math.max(1, Math.round(H));

      const out = frames.map((f) => {
        const scaled = scaleImageData(f.imageData, f.width, f.height, W, H);
        return { data: scaled.data, width: W, height: H, delayMs: f.delayMs };
      });
      const blob = encodeAnimatedGIF(out, { loop: loopCount, dither: Boolean(p.dither), transparent: true });
      const base = file.name.replace(/\.[^.]+$/, '') || 'gif';
      return { blob, filename: `${base}-${W}x${H}.gif` };
    },
  },

  // Shrink a GIF's file size: palette reduction, optional downscale, frame drop.
  gifOptimizer: {
    outputFormat: 'gif',
    controls: [
      { key: 'colors', label: 'Max colors', type: 'range', min: 2, max: 256, step: 2, def: 128 },
      { key: 'scale', label: 'Scale', type: 'range', min: 20, max: 100, step: 5, def: 100, suffix: '%' },
      { key: 'drop', label: 'Frame reduction', type: 'select', def: '1', options: [
        { value: '1', label: 'Keep all frames' },
        { value: '2', label: 'Drop every 2nd frame' },
        { value: '3', label: 'Keep every 3rd frame' },
      ] },
      { key: 'dither', label: 'Dithering', type: 'checkbox', def: false },
    ],
    runFile: async (file, p) => {
      const [{ decodeGif }, { encodeAnimatedGIF }] = await Promise.all([
        import('../lib/gif'),
        import('../lib/gifEncoder'),
      ]);
      const { frames, width, height, loopCount } = await decodeGif(file);
      if (frames.length === 0) throw new Error('No frames found in this GIF.');

      // Drop frames but fold their delays into the kept frame so total runtime
      // (and thus perceived speed) is preserved.
      const keepEvery = Math.max(1, Number(p.drop) || 1);
      const kept: { imageData: ImageData; width: number; height: number; delayMs: number }[] = [];
      let carry = 0;
      frames.forEach((f, i) => {
        if (i % keepEvery === 0) { kept.push({ ...f, delayMs: f.delayMs + carry }); carry = 0; }
        else carry += f.delayMs;
      });
      if (carry > 0 && kept.length) kept[kept.length - 1].delayMs += carry;

      const scale = Math.max(0.05, Math.min(1, Number(p.scale) / 100));
      const W = Math.max(1, Math.round(width * scale));
      const H = Math.max(1, Math.round(height * scale));

      const out = kept.map((f) => {
        if (scale === 1) return { data: f.imageData.data, width: W, height: H, delayMs: f.delayMs };
        const scaled = scaleImageData(f.imageData, f.width, f.height, W, H);
        return { data: scaled.data, width: W, height: H, delayMs: f.delayMs };
      });
      const blob = encodeAnimatedGIF(out, {
        loop: loopCount,
        maxColors: Number(p.colors) || 128,
        dither: Boolean(p.dither),
        transparent: true,
      });
      const base = file.name.replace(/\.[^.]+$/, '') || 'gif';
      return { blob, filename: `${base}-optimized.gif` };
    },
  },

  // ---- Organization: split one image into a grid of tiles -> ZIP ----
  splitImage: {
    controls: [
      { key: 'format', label: 'Tile format', type: 'select', def: 'png', options: [
        { value: 'png', label: 'PNG' }, { value: 'jpeg', label: 'JPEG' }, { value: 'webp', label: 'WebP' },
      ] },
      { key: 'quality', label: 'Quality (JPEG/WebP)', type: 'range', min: 10, max: 100, step: 5, def: 90, suffix: '%' },
    ],
    // Uses the raw File so tiles are cut at full resolution and named after the
    // source image; the interactive SplitEditor previews the same rects.
    runFile: async (file, p) => {
      const [{ decodeToImageData }, { encodeImageData }, JSZip] = await Promise.all([
        import('../lib/decode'),
        import('../lib/encode'),
        import('jszip').then((m) => m.default),
      ]);
      const { imageData } = await decodeToImageData(file);
      const W = imageData.width, H = imageData.height;
      const [srcC, srcCtx] = make(W, H);
      srcCtx.putImageData(imageData, 0, 0);

      const rects = splitRects(W, H, p);
      if (rects.length === 0) throw new Error('No tiles to produce with these settings.');
      const fmt = String(p.format || 'png');
      const ext = fmt === 'jpeg' ? 'jpg' : fmt;
      const q = Number(p.quality ?? 90) / 100;
      const base = file.name.replace(/\.[^.]+$/, '') || 'image';
      const rowPad = Math.max(2, String(Math.max(...rects.map((r) => r.row))).length);
      const colPad = Math.max(2, String(Math.max(...rects.map((r) => r.col))).length);

      // Single tile: hand back the bare image (no need to zip one file).
      if (rects.length === 1) {
        const r = rects[0];
        const [, tctx] = make(r.w, r.h);
        tctx.drawImage(srcC, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
        const td = tctx.getImageData(0, 0, r.w, r.h);
        const blob = await encodeImageData({ imageData: td, width: r.w, height: r.h }, fmt, { quality: q });
        return { blob, filename: `${base}_r${String(r.row).padStart(rowPad, '0')}_c${String(r.col).padStart(colPad, '0')}.${ext}` };
      }

      const zip = new JSZip();
      // Encode tiles sequentially to keep peak memory bounded on large images.
      for (const r of rects) {
        const [, tctx] = make(r.w, r.h);
        tctx.drawImage(srcC, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
        const td = tctx.getImageData(0, 0, r.w, r.h);
        const blob = await encodeImageData({ imageData: td, width: r.w, height: r.h }, fmt, { quality: q });
        zip.file(`${base}_r${String(r.row).padStart(rowPad, '0')}_c${String(r.col).padStart(colPad, '0')}.${ext}`, blob);
      }
      return { blob: await zip.generateAsync({ type: 'blob' }), filename: `${base}-tiles.zip` };
    },
  },

  // ---- Metadata: read EXIF/IPTC/XMP from the ORIGINAL bytes (read-only) ----
  viewExif: {
    controls: [],
    // Needs the raw File — re-encoding a canvas would strip all metadata.
    runFile: async (file) => {
      const { parseExif } = await import('../lib/exif');
      const payload = await parseExif(file);
      // The ToolRunner has a dedicated EXIF renderer that parses this JSON.
      return { text: JSON.stringify(payload) };
    },
  },

  // ---- Metadata: set DPI without resampling (pure byte edit) ----
  changeDpi: {
    controls: [
      { key: 'dpi', label: 'DPI (dots per inch)', type: 'number', min: 1, max: 6000, def: 300 },
    ],
    // Operates on the ORIGINAL file bytes so pixels are never recompressed.
    runFile: async (file, p) => {
      const { setImageDpi } = await import('../lib/dpi');
      const buf = new Uint8Array(await file.arrayBuffer());
      const dpi = Math.max(1, Math.round(Number(p.dpi) || 72));
      const { bytes, format } = setImageDpi(buf, dpi);
      const mime = format === 'png' ? 'image/png' : 'image/jpeg';
      const blob = new Blob([bytes as BlobPart], { type: mime });
      const base = file.name.replace(/\.[^.]+$/, '') || 'image';
      const ext = format === 'png' ? 'png' : 'jpg';
      return { blob, filename: `${base}-${dpi}dpi.${ext}` };
    },
  },

  // ---- Organization: package many images into a single ZIP ----
  zipImages: {
    mode: 'combine',
    controls: [
      { key: 'reencode', label: 'Re-encode images', type: 'checkbox', def: false },
      { key: 'format', label: 'Format (when re-encoding)', type: 'select', def: 'jpeg', options: FORMAT_OPTS },
      { key: 'quality', label: 'Quality (when re-encoding)', type: 'range', min: 10, max: 100, step: 5, def: 85, suffix: '%' },
    ],
    runCombineFiles: async (files, p) => {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const used = new Map<string, number>();
      // Ensure unique entry names even if two uploads share a filename.
      const unique = (name: string) => {
        const n = used.get(name) ?? 0;
        used.set(name, n + 1);
        if (n === 0) return name;
        const dot = name.lastIndexOf('.');
        return dot > 0 ? `${name.slice(0, dot)}-${n}${name.slice(dot)}` : `${name}-${n}`;
      };

      if (p.reencode) {
        const [{ decodeToImageData }, { encodeImageData }] = await Promise.all([
          import('../lib/decode'),
          import('../lib/encode'),
        ]);
        const fmt = String(p.format || 'jpeg');
        const ext = fmt === 'jpeg' ? 'jpg' : fmt;
        const q = Number(p.quality ?? 85) / 100;
        // Decode + encode one at a time so we never hold every bitmap at once.
        for (const f of files) {
          const { imageData, width, height } = await decodeToImageData(f);
          const blob = await encodeImageData({ imageData, width, height }, fmt, { quality: q });
          const base = f.name.replace(/\.[^.]+$/, '') || 'image';
          zip.file(unique(`${base}.${ext}`), blob);
        }
      } else {
        // Fast path: preserve original bytes by streaming each File into the ZIP.
        for (const f of files) zip.file(unique(f.name || 'image'), f);
      }
      return { blob: await zip.generateAsync({ type: 'blob' }), filename: 'images.zip' };
    },
  },
};
