import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eraser, UploadSimple, DownloadSimple, Trash, ShieldCheck,
  ArrowUUpLeft, ArrowUUpRight, PaintBrush, Stamp, Sparkle, X,
} from '@phosphor-icons/react';
import { TopNav } from '../components/TopNav';
import { decodeToImageData } from '../lib/decode';
import { contentAwareFill, medianFill } from '../lib/inpaint';

const MAX_W = 820; // max on-screen width of the editor stage
const UNDO_LIMIT = 20;

type ToolMode = 'mask' | 'clone';
type FillMode = 'diffusion' | 'median';
type ExportFmt = 'png' | 'jpeg';

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode image.'))), type, quality);
  });
}

export default function WatermarkRemoverPage() {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const [baseName, setBaseName] = useState('cleaned');
  const [exportFmt, setExportFmt] = useState<ExportFmt>('png');
  const [toolMode, setToolMode] = useState<ToolMode>('mask');
  const [fillMode, setFillMode] = useState<FillMode>('diffusion');
  const [brush, setBrush] = useState(28); // brush diameter in display px
  const [hasMask, setHasMask] = useState(false);
  const [cloneSource, setCloneSource] = useState<{ x: number; y: number } | null>(null); // full-res
  const [undoLen, setUndoLen] = useState(0);
  const [redoLen, setRedoLen] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLCanvasElement>(null); // shown, scaled view of the working image
  const overlayRef = useRef<HTMLCanvasElement>(null); // mask overlay + clone marker (display px)
  const fullRef = useRef<HTMLCanvasElement | null>(null); // full-res working image (mutated in place)
  const maskRef = useRef<HTMLCanvasElement | null>(null); // full-res mask (red where painted)
  const scaleRef = useRef(1); // fullRes -> display scale (<= 1)

  // Undo/redo stacks hold full-res image snapshots (ImageData).
  const undoRef = useRef<ImageData[]>([]);
  const redoRef = useRef<ImageData[]>([]);

  // Stroke state (kept in refs so pointer handlers stay stable).
  const stroke = useRef<{
    active: boolean;
    mode: ToolMode;
    last: { x: number; y: number } | null; // full-res
    // clone-specific
    srcSnapshot: ImageData | null;
    workBuf: ImageData | null;
    delta: { dx: number; dy: number } | null;
    dirty: boolean;
  }>({ active: false, mode: 'mask', last: null, srcSnapshot: null, workBuf: null, delta: null, dirty: false });

  const syncStacks = useCallback(() => {
    setUndoLen(undoRef.current.length);
    setRedoLen(redoRef.current.length);
  }, []);

  const refreshDisplay = useCallback(() => {
    const full = fullRef.current;
    const disp = displayRef.current;
    if (!full || !disp) return;
    const ctx = disp.getContext('2d')!;
    ctx.clearRect(0, 0, disp.width, disp.height);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(full, 0, 0, disp.width, disp.height);
  }, []);

  const refreshOverlay = useCallback(() => {
    const mask = maskRef.current;
    const overlay = overlayRef.current;
    if (!mask || !overlay) return;
    const ctx = overlay.getContext('2d')!;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 0.5;
    ctx.drawImage(mask, 0, 0, overlay.width, overlay.height);
    ctx.globalAlpha = 1;
    // Clone source marker.
    if (cloneSource) {
      const s = scaleRef.current;
      const cx = cloneSource.x * s;
      const cy = cloneSource.y * s;
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy);
      ctx.lineTo(cx + 10, cy);
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx, cy + 10);
      ctx.stroke();
    }
  }, [cloneSource]);

  useEffect(() => { refreshOverlay(); }, [refreshOverlay]);

  const setupCanvases = useCallback((full: HTMLCanvasElement) => {
    fullRef.current = full;
    const scale = Math.min(1, MAX_W / full.width);
    scaleRef.current = scale;
    const dispW = Math.max(1, Math.round(full.width * scale));
    const dispH = Math.max(1, Math.round(full.height * scale));

    const disp = displayRef.current!;
    disp.width = dispW;
    disp.height = dispH;
    const overlay = overlayRef.current!;
    overlay.width = dispW;
    overlay.height = dispH;

    const mask = document.createElement('canvas');
    mask.width = full.width;
    mask.height = full.height;
    maskRef.current = mask;

    undoRef.current = [];
    redoRef.current = [];
    syncStacks();
    setHasMask(false);
    setCloneSource(null);
    refreshDisplay();
    refreshOverlay();
  }, [refreshDisplay, refreshOverlay, syncStacks]);

  const loadFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setNote(null);
    try {
      const { imageData } = await decodeToImageData(file);
      const full = document.createElement('canvas');
      full.width = imageData.width;
      full.height = imageData.height;
      full.getContext('2d', { willReadFrequently: true })!.putImageData(imageData, 0, 0);
      setBaseName((file.name.replace(/\.[^.]+$/, '') || 'image') + '-cleaned');
      setupCanvases(full);
      setImgLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load this image.');
    } finally {
      setLoading(false);
    }
  }, [setupCanvases]);

  const pushUndo = useCallback(() => {
    const full = fullRef.current;
    if (!full) return;
    const ctx = full.getContext('2d', { willReadFrequently: true })!;
    undoRef.current.push(ctx.getImageData(0, 0, full.width, full.height));
    if (undoRef.current.length > UNDO_LIMIT) undoRef.current.shift();
    redoRef.current = [];
    syncStacks();
  }, [syncStacks]);

  const undo = useCallback(() => {
    const full = fullRef.current;
    if (!full || undoRef.current.length === 0) return;
    const ctx = full.getContext('2d', { willReadFrequently: true })!;
    redoRef.current.push(ctx.getImageData(0, 0, full.width, full.height));
    const prev = undoRef.current.pop()!;
    ctx.putImageData(prev, 0, 0);
    refreshDisplay();
    syncStacks();
  }, [refreshDisplay, syncStacks]);

  const redo = useCallback(() => {
    const full = fullRef.current;
    if (!full || redoRef.current.length === 0) return;
    const ctx = full.getContext('2d', { willReadFrequently: true })!;
    undoRef.current.push(ctx.getImageData(0, 0, full.width, full.height));
    const next = redoRef.current.pop()!;
    ctx.putImageData(next, 0, 0);
    refreshDisplay();
    syncStacks();
  }, [refreshDisplay, syncStacks]);

  // Keyboard shortcuts for undo/redo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  // Map a pointer event to full-res coordinates.
  const toFull = useCallback((e: { clientX: number; clientY: number }) => {
    const overlay = overlayRef.current!;
    const rect = overlay.getBoundingClientRect();
    const full = fullRef.current!;
    const x = ((e.clientX - rect.left) / rect.width) * full.width;
    const y = ((e.clientY - rect.top) / rect.height) * full.height;
    return { x, y };
  }, []);

  const fullBrushRadius = useCallback(() => {
    return Math.max(1, (brush / 2) / scaleRef.current);
  }, [brush]);

  // ---- Mask painting ----
  const paintMaskSeg = useCallback((from: { x: number; y: number }, to: { x: number; y: number }) => {
    const mask = maskRef.current;
    if (!mask) return;
    const ctx = mask.getContext('2d')!;
    ctx.strokeStyle = '#ff3b30';
    ctx.fillStyle = '#ff3b30';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = fullBrushRadius() * 2;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(to.x, to.y, fullBrushRadius(), 0, Math.PI * 2);
    ctx.fill();
    setHasMask(true);
  }, [fullBrushRadius]);

  // ---- Clone stamping (operates on the in-flight work buffer) ----
  const stampClone = useCallback((from: { x: number; y: number }, to: { x: number; y: number }) => {
    const st = stroke.current;
    const full = fullRef.current;
    if (!st.workBuf || !st.srcSnapshot || !st.delta || !full) return;
    const W = full.width;
    const H = full.height;
    const r = fullBrushRadius();
    const work = st.workBuf.data;
    const src = st.srcSnapshot.data;
    const { dx: ddx, dy: ddy } = st.delta;

    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(dist / (r * 0.4)));
    for (let s = 0; s <= steps; s++) {
      const cx = from.x + ((to.x - from.x) * s) / steps;
      const cy = from.y + ((to.y - from.y) * s) / steps;
      const x0 = Math.max(0, Math.floor(cx - r));
      const x1 = Math.min(W - 1, Math.ceil(cx + r));
      const y0 = Math.max(0, Math.floor(cy - r));
      const y1 = Math.min(H - 1, Math.ceil(cy + r));
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const d = Math.hypot(x - cx, y - cy);
          if (d > r) continue;
          // Feathered edge for heal-like blending (hard core, soft rim).
          const t = d / r;
          const a = t < 0.6 ? 1 : Math.max(0, 1 - (t - 0.6) / 0.4);
          const sx = Math.round(x - ddx);
          const sy = Math.round(y - ddy);
          if (sx < 0 || sy < 0 || sx >= W || sy >= H) continue;
          const ti = (y * W + x) * 4;
          const si = (sy * W + sx) * 4;
          for (let c = 0; c < 3; c++) {
            work[ti + c] = Math.round(src[si + c] * a + work[ti + c] * (1 - a));
          }
        }
      }
    }
    st.dirty = true;
    full.getContext('2d', { willReadFrequently: true })!.putImageData(st.workBuf, 0, 0);
    refreshDisplay();
  }, [fullBrushRadius, refreshDisplay]);

  // ---- Pointer handlers ----
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!imgLoaded || busy) return;
    const p = toFull(e);
    // Alt/Option + click sets the clone source anchor.
    if (toolMode === 'clone' && e.altKey) {
      setCloneSource({ x: Math.round(p.x), y: Math.round(p.y) });
      setNote(null);
      return;
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (toolMode === 'mask') {
      // Mask painting isn't destructive to the image (fills push undo), so no snapshot here.
      stroke.current = { active: true, mode: 'mask', last: p, srcSnapshot: null, workBuf: null, delta: null, dirty: true };
      paintMaskSeg(p, p);
      refreshOverlay();
      return;
    }

    // clone mode
    if (!cloneSource) {
      setNote('Alt/Option-click to set a clone source first, then paint to copy from it.');
      return;
    }
    const full = fullRef.current!;
    const fctx = full.getContext('2d', { willReadFrequently: true })!;
    const snapshot = fctx.getImageData(0, 0, full.width, full.height);
    // Separate buffers: one fixed source, one mutable work copy.
    const workBuf = new ImageData(new Uint8ClampedArray(snapshot.data), snapshot.width, snapshot.height);
    const srcSnapshot = new ImageData(new Uint8ClampedArray(snapshot.data), snapshot.width, snapshot.height);
    pushUndo();
    stroke.current = {
      active: true,
      mode: 'clone',
      last: p,
      srcSnapshot,
      workBuf,
      delta: { dx: p.x - cloneSource.x, dy: p.y - cloneSource.y },
      dirty: false,
    };
    stampClone(p, p);
  }, [imgLoaded, busy, toolMode, cloneSource, toFull, pushUndo, paintMaskSeg, refreshOverlay, stampClone, syncStacks]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const st = stroke.current;
    if (!st.active || !st.last) return;
    const p = toFull(e);
    if (st.mode === 'mask') {
      paintMaskSeg(st.last, p);
      refreshOverlay();
    } else {
      stampClone(st.last, p);
    }
    st.last = p;
  }, [toFull, paintMaskSeg, refreshOverlay, stampClone]);

  const endStroke = useCallback(() => {
    const st = stroke.current;
    if (!st.active) return;
    if (st.mode === 'clone' && !st.dirty) {
      // Nothing painted — discard the undo snapshot we pushed on down.
      undoRef.current.pop();
      syncStacks();
    }
    st.active = false;
    st.last = null;
    st.srcSnapshot = null;
    st.workBuf = null;
    st.delta = null;
  }, [syncStacks]);

  const clearMask = useCallback(() => {
    const mask = maskRef.current;
    if (!mask) return;
    mask.getContext('2d')!.clearRect(0, 0, mask.width, mask.height);
    setHasMask(false);
    refreshOverlay();
  }, [refreshOverlay]);

  // Read the mask alpha into a Uint8Array (1 = masked).
  const readMask = useCallback((): { data: Uint8Array; count: number } | null => {
    const mask = maskRef.current;
    if (!mask) return null;
    const md = mask.getContext('2d')!.getImageData(0, 0, mask.width, mask.height).data;
    const out = new Uint8Array(mask.width * mask.height);
    let count = 0;
    for (let i = 0; i < out.length; i++) {
      if (md[i * 4 + 3] > 10) { out[i] = 1; count++; }
    }
    return { data: out, count };
  }, []);

  const applyFill = useCallback(async () => {
    const full = fullRef.current;
    if (!full || busy) return;
    const m = readMask();
    if (!m || m.count === 0) {
      setNote('Paint over the watermark first, then apply a fill.');
      return;
    }
    setBusy(true);
    setNote(null);
    // Let the busy state paint before the heavy sync work.
    await new Promise((r) => setTimeout(r, 0));
    try {
      pushUndo();
      const fctx = full.getContext('2d', { willReadFrequently: true })!;
      const img = fctx.getImageData(0, 0, full.width, full.height);
      if (fillMode === 'diffusion') contentAwareFill(img, m.data);
      else medianFill(img, m.data);
      fctx.putImageData(img, 0, 0);
      refreshDisplay();
      clearMask();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fill failed.');
    } finally {
      setBusy(false);
    }
  }, [busy, readMask, pushUndo, fillMode, refreshDisplay, clearMask]);

  const exportImage = useCallback(async () => {
    const full = fullRef.current;
    if (!full) return;
    const type = exportFmt === 'png' ? 'image/png' : 'image/jpeg';
    const blob = await canvasToBlob(full, type, exportFmt === 'jpeg' ? 0.95 : undefined);
    triggerDownload(blob, `${baseName || 'cleaned'}.${exportFmt === 'png' ? 'png' : 'jpg'}`);
  }, [exportFmt, baseName]);

  const reset = useCallback(() => {
    setImgLoaded(false);
    setHasMask(false);
    setCloneSource(null);
    setError(null);
    setNote(null);
    fullRef.current = null;
    maskRef.current = null;
    undoRef.current = [];
    redoRef.current = [];
    syncStacks();
  }, [syncStacks]);

  return (
    <div className="page page--wide">
      <TopNav />

      <nav className="crumbs crumbs--sub">
        <Link className="crumbs__link" to="/convert">Image tools</Link>
        <span className="crumbs__sep">/</span>
        <span className="crumbs__link">Basic Editing</span>
        <span className="crumbs__sep">/</span>
        <span className="crumbs__current">Remove Watermark (manual)</span>
      </nav>

      <div className="tool-hero">
        <div className="tool-hero__icon"><Eraser size={26} weight="fill" /></div>
        <div>
          <h1 className="tool-title">Remove Watermark (manual)</h1>
          <p className="tool-desc">Paint over a watermark and fill it in with a clone brush or content-aware inpaint. Full-resolution export, 100% on-device.</p>
        </div>
        <span className="privacy-pill"><ShieldCheck size={15} weight="fill" /> 100% on-device</span>
      </div>

      <div
        className={`dropzone ${dragging ? 'dropzone--active' : ''} ${imgLoaded ? 'dropzone--compact' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif,.tif,.tiff,.avif,.svg,.ico,.jp2"
          hidden
          onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
        />
        <div className="dropzone__inner">
          <UploadSimple size={imgLoaded ? 22 : 34} weight="light" className="dropzone__icon" />
          <p className="dropzone__title">
            {imgLoaded ? 'Load a different image' : <>Drop an image here <span className="muted">or click to browse</span></>}
          </p>
          {!imgLoaded && <p className="dropzone__hint">{loading ? 'Decoding…' : 'Paint over the watermark, then fill or clone it away.'}</p>}
        </div>
      </div>

      {error && <div className="job__error" style={{ marginTop: 12 }}>{error}</div>}

      {imgLoaded && (
        <div className="wm">
          <div className="picker__stage-wrap">
            <div className="picker__stage wm__stage">
              <canvas ref={displayRef} className="picker__canvas wm__base" />
              <canvas
                ref={overlayRef}
                className="picker__canvas wm__overlay"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endStroke}
                onPointerLeave={endStroke}
                onPointerCancel={endStroke}
              />
            </div>
          </div>

          <aside className="picker__side wm__side">
            <div className="wm__group">
              <span className="field__label">Tool</span>
              <div className="seg">
                <button className={`seg__btn ${toolMode === 'mask' ? 'is-active' : ''}`} onClick={() => setToolMode('mask')}>
                  <PaintBrush size={14} weight="bold" /> Mask
                </button>
                <button className={`seg__btn ${toolMode === 'clone' ? 'is-active' : ''}`} onClick={() => setToolMode('clone')}>
                  <Stamp size={14} weight="bold" /> Clone
                </button>
              </div>
              {toolMode === 'clone' && (
                <p className="wm__hint">
                  Alt/Option-click to set the {cloneSource ? <b>source ✓</b> : 'source'}, then paint to copy nearby pixels over the watermark.
                </p>
              )}
              {toolMode === 'mask' && (
                <p className="wm__hint">Paint over the watermark, then pick a fill below.</p>
              )}
            </div>

            <label className="field">
              <span className="field__label">Brush size · {brush}px</span>
              <input className="range" type="range" min={4} max={120} step={1} value={brush} onChange={(e) => setBrush(Number(e.target.value))} />
            </label>

            <div className="wm__group">
              <span className="field__label">Content-aware fill</span>
              <div className="seg">
                <button className={`seg__btn ${fillMode === 'diffusion' ? 'is-active' : ''}`} onClick={() => setFillMode('diffusion')}>
                  Diffusion
                </button>
                <button className={`seg__btn ${fillMode === 'median' ? 'is-active' : ''}`} onClick={() => setFillMode('median')}>
                  Median
                </button>
              </div>
              <button className="btn btn--dark btn--icon" onClick={applyFill} disabled={!hasMask || busy}>
                <Sparkle size={15} weight="fill" /> {busy ? 'Filling…' : 'Fill masked area'}
              </button>
              <button className="btn btn--ghost btn--icon btn--sm" onClick={clearMask} disabled={!hasMask || busy}>
                <X size={13} /> Clear mask
              </button>
            </div>

            <div className="wm__group">
              <span className="field__label">History</span>
              <div className="wm__row">
                <button className="btn btn--icon btn--sm" onClick={undo} disabled={undoLen === 0 || busy}>
                  <ArrowUUpLeft size={14} weight="bold" /> Undo
                </button>
                <button className="btn btn--icon btn--sm" onClick={redo} disabled={redoLen === 0 || busy}>
                  <ArrowUUpRight size={14} weight="bold" /> Redo
                </button>
              </div>
            </div>

            <div className="wm__group">
              <span className="field__label">Export (full resolution)</span>
              <div className="wm__row">
                <input className="select" type="text" value={baseName} onChange={(e) => setBaseName(e.target.value)} placeholder="cleaned" />
                <select className="select select--sm" value={exportFmt} onChange={(e) => setExportFmt(e.target.value as ExportFmt)}>
                  <option value="png">PNG</option>
                  <option value="jpeg">JPG</option>
                </select>
              </div>
              <button className="btn btn--dark btn--icon" onClick={exportImage} disabled={busy}>
                <DownloadSimple size={16} weight="bold" /> Download image
              </button>
              <button className="btn btn--ghost btn--icon btn--sm" onClick={reset} disabled={busy}>
                <Trash size={13} /> Start over
              </button>
            </div>
          </aside>
        </div>
      )}

      {note && <div className="dropzone__hint" style={{ marginTop: 12 }}>{note}</div>}

      <footer className="footer"><span>Part of toolbox · your files never leave this device.</span></footer>
    </div>
  );
}
