import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowsHorizontal, Stack, Images, UploadSimple, ArrowLeft, ShieldCheck, Warning, X,
} from '@phosphor-icons/react';
import { TopNav } from '../components/TopNav';
import { decodeToImageData } from '../lib/decode';

const MAX_W = 760;
// Cap the working resolution so diff/scale stay fast even for huge uploads.
const WORK_CAP = 1600;
const DEFAULT_THRESHOLD = 16;

type Mode = 'slider' | 'onion' | 'diff';
type Slot = 'A' | 'B';

interface Loaded {
  imageData: ImageData;
  width: number;
  height: number;
  name: string;
}

interface DiffState {
  canvas: HTMLCanvasElement; // heatmap at common size
  mags: Uint8Array; // per-pixel max-channel abs difference
  mse: number;
  psnr: number; // Infinity when identical
  n: number;
}

// Heatmap ramp: unchanged pixels are near-black; hotter = more different.
const RAMP: Array<[number, number, number, number]> = [
  [0.0, 12, 14, 30],
  [0.12, 34, 66, 178],
  [0.32, 0, 176, 188],
  [0.52, 70, 200, 74],
  [0.74, 244, 214, 48],
  [1.0, 232, 46, 44],
];

function rampColor(t: number): [number, number, number] {
  const x = t < 0 ? 0 : t > 1 ? 1 : t;
  for (let i = 1; i < RAMP.length; i++) {
    const [p1, r1, g1, b1] = RAMP[i];
    if (x <= p1) {
      const [p0, r0, g0, b0] = RAMP[i - 1];
      const f = p1 === p0 ? 0 : (x - p0) / (p1 - p0);
      return [
        Math.round(r0 + (r1 - r0) * f),
        Math.round(g0 + (g1 - g0) * f),
        Math.round(b0 + (b1 - b0) * f),
      ];
    }
  }
  const last = RAMP[RAMP.length - 1];
  return [last[1], last[2], last[3]];
}

function canvasFromImageData(data: ImageData): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = data.width;
  c.height = data.height;
  c.getContext('2d')!.putImageData(data, 0, 0);
  return c;
}

/** Scale an ImageData to the target dimensions via an intermediate canvas. */
function scaleImageData(data: ImageData, w: number, h: number): ImageData {
  if (data.width === w && data.height === h) return data;
  const src = canvasFromImageData(data);
  const dst = document.createElement('canvas');
  dst.width = w;
  dst.height = h;
  const ctx = dst.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

function computeDiff(a: ImageData, b: ImageData): DiffState {
  const w = a.width;
  const h = a.height;
  const n = w * h;
  const da = a.data;
  const db = b.data;
  const mags = new Uint8Array(n);
  const out = new Uint8ClampedArray(n * 4);
  let sumSq = 0;
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const dr = Math.abs(da[o] - db[o]);
    const dg = Math.abs(da[o + 1] - db[o + 1]);
    const dbb = Math.abs(da[o + 2] - db[o + 2]);
    sumSq += dr * dr + dg * dg + dbb * dbb;
    const mag = dr > dg ? (dr > dbb ? dr : dbb) : dg > dbb ? dg : dbb;
    mags[i] = mag;
    const [cr, cg, cb] = rampColor(mag / 255);
    out[o] = cr;
    out[o + 1] = cg;
    out[o + 2] = cb;
    out[o + 3] = 255;
  }
  const mse = sumSq / (n * 3);
  const psnr = mse === 0 ? Infinity : 10 * Math.log10((255 * 255) / mse);
  const canvas = canvasFromImageData(new ImageData(out, w, h));
  return { canvas, mags, mse, psnr, n };
}

function Dropslot({
  slot, loaded, dragging, onFiles, onSetDrag, onClear,
}: {
  slot: Slot;
  loaded: Loaded | null;
  dragging: boolean;
  onFiles: (slot: Slot, files: FileList | File[]) => void;
  onSetDrag: (slot: Slot | null) => void;
  onClear: (slot: Slot) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="cmp-slot">
      <div className="cmp-slot__label">Image {slot}{slot === 'A' ? ' · before' : ' · after'}</div>
      <div
        className={`dropzone dropzone--compact ${dragging ? 'dropzone--active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); onSetDrag(slot); }}
        onDragLeave={() => onSetDrag(null)}
        onDrop={(e) => { e.preventDefault(); onSetDrag(null); if (e.dataTransfer.files.length) onFiles(slot, e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.heic,.heif,.tif,.tiff,.avif,.svg,.ico,.jp2"
          hidden
          onChange={(e) => e.target.files?.length && onFiles(slot, e.target.files)}
        />
        <div className="dropzone__inner">
          <UploadSimple size={22} weight="light" className="dropzone__icon" />
          <p className="dropzone__title">
            {loaded ? <span className="cmp-slot__name" title={loaded.name}>{loaded.name}</span> : <>Drop image {slot} <span className="muted">or browse</span></>}
          </p>
          {loaded ? <p className="dropzone__hint">{loaded.width} × {loaded.height} px</p> : <p className="dropzone__hint">Tip: select two images to fill both</p>}
        </div>
      </div>
      {loaded && (
        <button className="btn btn--ghost btn--icon btn--sm cmp-slot__clear" onClick={(e) => { e.stopPropagation(); onClear(slot); }}>
          <X size={13} /> Remove
        </button>
      )}
    </div>
  );
}

export default function ImageComparatorPage() {
  const [imgA, setImgA] = useState<Loaded | null>(null);
  const [imgB, setImgB] = useState<Loaded | null>(null);
  const [dragSlot, setDragSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>('slider');
  const [sliderPos, setSliderPos] = useState(0.5); // 0..1
  const [opacity, setOpacity] = useState(0.5); // onion-skin
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);

  const displayRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasARef = useRef<HTMLCanvasElement | null>(null); // A at common size
  const canvasBRef = useRef<HTMLCanvasElement | null>(null); // B at common size
  const diffRef = useRef<DiffState | null>(null);
  const commonRef = useRef<{ w: number; h: number } | null>(null);
  const rafRef = useRef(0);
  const dragRef = useRef(false);

  const both = imgA && imgB;
  const mismatch = both && (imgA.width !== imgB.width || imgA.height !== imgB.height);

  const decodeOne = useCallback(async (file: File): Promise<Loaded> => {
    const { imageData, width, height } = await decodeToImageData(file);
    return { imageData, width, height, name: file.name };
  }, []);

  // Load one or two files. Selecting two at once fills A and B together;
  // otherwise the file lands in the given slot.
  const loadFiles = useCallback(async (slot: Slot, files: FileList | File[]) => {
    const list = Array.from(files).slice(0, 2);
    if (list.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      if (list.length >= 2) {
        const [a, b] = await Promise.all([decodeOne(list[0]), decodeOne(list[1])]);
        setImgA(a); setImgB(b);
      } else {
        const one = await decodeOne(list[0]);
        if (slot === 'A') setImgA(one); else setImgB(one);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load this image.');
    } finally {
      setLoading(false);
    }
  }, [decodeOne]);

  const clearSlot = useCallback((slot: Slot) => {
    if (slot === 'A') setImgA(null); else setImgB(null);
  }, []);

  // Prepare common-size canvases + diff whenever both images change.
  useEffect(() => {
    if (!imgA || !imgB) {
      canvasARef.current = null;
      canvasBRef.current = null;
      diffRef.current = null;
      commonRef.current = null;
      return;
    }
    // Common size = the larger of the two in each dimension, then capped to a
    // working resolution so scaling + diff stay responsive on big images.
    let w = Math.max(imgA.width, imgB.width);
    let h = Math.max(imgA.height, imgB.height);
    const shrink = Math.min(1, WORK_CAP / Math.max(w, h));
    w = Math.max(1, Math.round(w * shrink));
    h = Math.max(1, Math.round(h * shrink));
    commonRef.current = { w, h };
    const a = scaleImageData(imgA.imageData, w, h);
    const b = scaleImageData(imgB.imageData, w, h);
    canvasARef.current = canvasFromImageData(a);
    canvasBRef.current = canvasFromImageData(b);
    diffRef.current = computeDiff(a, b);
    // Trigger a re-render so metrics/preview update.
    setSliderPos((p) => p);
  }, [imgA, imgB]);

  const render = useCallback(() => {
    const disp = displayRef.current;
    const common = commonRef.current;
    if (!disp || !common || !canvasARef.current || !canvasBRef.current) return;
    const scale = Math.min(1, MAX_W / common.w);
    const dw = Math.max(1, Math.round(common.w * scale));
    const dh = Math.max(1, Math.round(common.h * scale));
    if (disp.width !== dw) disp.width = dw;
    if (disp.height !== dh) disp.height = dh;
    const ctx = disp.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, dw, dh);

    if (mode === 'slider') {
      ctx.drawImage(canvasBRef.current, 0, 0, dw, dh);
      const clipX = Math.round(sliderPos * dw);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, clipX, dh);
      ctx.clip();
      ctx.drawImage(canvasARef.current, 0, 0, dw, dh);
      ctx.restore();
    } else if (mode === 'onion') {
      ctx.globalAlpha = 1;
      ctx.drawImage(canvasARef.current, 0, 0, dw, dh);
      ctx.globalAlpha = opacity;
      ctx.drawImage(canvasBRef.current, 0, 0, dw, dh);
      ctx.globalAlpha = 1;
    } else if (mode === 'diff' && diffRef.current) {
      ctx.drawImage(diffRef.current.canvas, 0, 0, dw, dh);
    }
  }, [mode, sliderPos, opacity]);

  useEffect(() => { render(); }, [render, imgA, imgB]);

  const moveSlider = useCallback((clientX: number) => {
    const disp = displayRef.current;
    if (!disp) return;
    const rect = disp.getBoundingClientRect();
    const p = (clientX - rect.left) / rect.width;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setSliderPos(Math.max(0, Math.min(1, p)));
    });
  }, []);

  const onStagePointerDown = useCallback((e: React.PointerEvent) => {
    if (mode !== 'slider') return;
    dragRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    moveSlider(e.clientX);
  }, [mode, moveSlider]);

  const onStagePointerMove = useCallback((e: React.PointerEvent) => {
    if (mode !== 'slider' || !dragRef.current) return;
    moveSlider(e.clientX);
  }, [mode, moveSlider]);

  const onStagePointerUp = useCallback(() => { dragRef.current = false; }, []);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const diff = diffRef.current;
  let changedPct = 0;
  if (diff) {
    let c = 0;
    for (let i = 0; i < diff.mags.length; i++) if (diff.mags[i] > threshold) c++;
    changedPct = (c / diff.n) * 100;
  }
  const psnrLabel = diff ? (diff.psnr === Infinity ? '∞ (identical)' : `${diff.psnr.toFixed(2)} dB`) : '—';

  return (
    <div className="page page--wide">
      <TopNav />

      <nav className="crumbs crumbs--sub">
        <Link className="crumbs__link" to="/convert">Image tools</Link>
        <span className="crumbs__sep">/</span>
        <span className="crumbs__link">Miscellaneous</span>
        <span className="crumbs__sep">/</span>
        <span className="crumbs__current">Image Comparator</span>
      </nav>

      <div className="tool-hero">
        <div className="tool-hero__icon"><ArrowsHorizontal size={26} weight="fill" /></div>
        <div>
          <h1 className="tool-title">Image Comparator</h1>
          <p className="tool-desc">Compare two images with a before/after slider, an onion-skin blend, and a pixel-difference heatmap. Runs fully on-device.</p>
        </div>
        <span className="privacy-pill"><ShieldCheck size={15} weight="fill" /> 100% on-device</span>
      </div>

      <div className="cmp-slots">
        <Dropslot slot="A" loaded={imgA} dragging={dragSlot === 'A'} onFiles={loadFiles} onSetDrag={setDragSlot} onClear={clearSlot} />
        <Dropslot slot="B" loaded={imgB} dragging={dragSlot === 'B'} onFiles={loadFiles} onSetDrag={setDragSlot} onClear={clearSlot} />
      </div>

      {error && <div className="job__error" style={{ marginTop: 12 }}>{error}</div>}
      {loading && <p className="dropzone__hint" style={{ marginTop: 10 }}>Decoding…</p>}

      {both && (
        <>
          {mismatch && (
            <div className="cmp-warn">
              <Warning size={16} weight="fill" />
              <span>
                Images differ in size ({imgA.width}×{imgA.height} vs {imgB.width}×{imgB.height}). Both were scaled to a common {commonRef.current?.w}×{commonRef.current?.h} canvas for comparison.
              </span>
            </div>
          )}

          <div className="picker">
            <div className="picker__stage-wrap">
              <div
                ref={stageRef}
                className={`picker__stage cmp-stage ${mode === 'slider' ? 'cmp-stage--slider' : ''}`}
                onPointerDown={onStagePointerDown}
                onPointerMove={onStagePointerMove}
                onPointerUp={onStagePointerUp}
              >
                <canvas ref={displayRef} className="picker__canvas cmp-canvas" />
                {mode === 'slider' && (
                  <div className="cmp-divider" style={{ left: `${sliderPos * 100}%` }}>
                    <span className="cmp-divider__handle"><ArrowsHorizontal size={15} weight="bold" /></span>
                  </div>
                )}
                {mode === 'slider' && (
                  <>
                    <span className="cmp-tag cmp-tag--a">A</span>
                    <span className="cmp-tag cmp-tag--b">B</span>
                  </>
                )}
              </div>
            </div>

            <aside className="picker__side">
              <div className="seg">
                <button className={`seg__btn ${mode === 'slider' ? 'is-active' : ''}`} onClick={() => setMode('slider')}>
                  <ArrowsHorizontal size={15} weight="bold" /> Slider
                </button>
                <button className={`seg__btn ${mode === 'onion' ? 'is-active' : ''}`} onClick={() => setMode('onion')}>
                  <Stack size={15} weight="bold" /> Onion
                </button>
                <button className={`seg__btn ${mode === 'diff' ? 'is-active' : ''}`} onClick={() => setMode('diff')}>
                  <Images size={15} weight="bold" /> Diff
                </button>
              </div>

              {mode === 'slider' && (
                <div className="cmp-ctrl">
                  <label className="cmp-ctrl__label">Split position <span className="muted">{Math.round(sliderPos * 100)}%</span></label>
                  <input type="range" min={0} max={100} value={Math.round(sliderPos * 100)} onChange={(e) => setSliderPos(Number(e.target.value) / 100)} />
                  <p className="wm__hint">Drag directly on the image, or use the slider. Left = A, right = B.</p>
                </div>
              )}

              {mode === 'onion' && (
                <div className="cmp-ctrl">
                  <label className="cmp-ctrl__label">B opacity <span className="muted">{Math.round(opacity * 100)}%</span></label>
                  <input type="range" min={0} max={100} value={Math.round(opacity * 100)} onChange={(e) => setOpacity(Number(e.target.value) / 100)} />
                  <p className="wm__hint">Blends image B over image A to spot subtle shifts.</p>
                </div>
              )}

              {mode === 'diff' && (
                <div className="cmp-ctrl">
                  <label className="cmp-ctrl__label">Change threshold <span className="muted">{threshold}</span></label>
                  <input type="range" min={0} max={128} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
                  <p className="wm__hint">A pixel counts as “changed” when its largest channel difference exceeds this value (0–255).</p>
                  <div className="cmp-ramp">
                    <span className="cmp-ramp__bar" />
                    <div className="cmp-ramp__scale"><span>same</span><span>different</span></div>
                  </div>
                </div>
              )}

              <div className="cmp-metrics">
                <div className="cmp-metric">
                  <span className="cmp-metric__value">{changedPct.toFixed(2)}%</span>
                  <span className="cmp-metric__label">Changed pixels</span>
                </div>
                <div className="cmp-metric">
                  <span className="cmp-metric__value">{diff ? diff.mse.toFixed(2) : '—'}</span>
                  <span className="cmp-metric__label">MSE</span>
                </div>
                <div className="cmp-metric">
                  <span className="cmp-metric__value">{psnrLabel}</span>
                  <span className="cmp-metric__label">PSNR</span>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}

      <div className="colorconv__foot">
        <Link className="btn btn--pill btn--icon" to="/convert"><ArrowLeft size={15} weight="bold" /> All image tools</Link>
      </div>

      <footer className="footer"><span>Part of toolbox · your files never leave this device.</span></footer>
    </div>
  );
}
