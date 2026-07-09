import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eyedropper, UploadSimple, Copy, Check, Trash, ArrowLeft, ShieldCheck,
} from '@phosphor-icons/react';
import { TopNav } from '../components/TopNav';
import { decodeToImageData } from '../lib/decode';
import {
  type RGB,
  rgbToHex,
  rgbToHsl,
  rgbToString,
  hslToString,
  contrastText,
} from '../lib/color';

const MAX_W = 760;
const LOUPE = 132; // loupe box size in px
const LOUPE_ZOOM = 8; // magnification factor

interface Swatch {
  id: number;
  rgb: RGB;
  hex: string;
}

interface EyeDropperCtor {
  new (): { open(): Promise<{ sRGBHex: string }> };
}

function CopyChip({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="copychip"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
      title={`Copy ${label}`}
    >
      <span className="copychip__label">{label}</span>
      <span className="copychip__value">{value}</span>
      <span className="copychip__icon">{done ? <Check size={13} weight="bold" /> : <Copy size={13} />}</span>
    </button>
  );
}

let swatchSeq = 0;

export default function ColorPickerPage() {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hover, setHover] = useState<RGB | null>(null);
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [loupe, setLoupe] = useState<{ x: number; y: number } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLCanvasElement>(null); // shown, scaled-to-fit
  const loupeRef = useRef<HTMLCanvasElement>(null); // magnifier
  const fullRef = useRef<HTMLCanvasElement | null>(null); // full-res sampling source
  const scaleRef = useRef(1); // fullRes -> display scale
  const rafRef = useRef(0);

  const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

  const drawImage = useCallback((full: HTMLCanvasElement) => {
    fullRef.current = full;
    const scale = Math.min(1, MAX_W / full.width);
    scaleRef.current = scale;
    const display = displayRef.current!;
    display.width = Math.max(1, Math.round(full.width * scale));
    display.height = Math.max(1, Math.round(full.height * scale));
    const ctx = display.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(full, 0, 0, display.width, display.height);
  }, []);

  const loadFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const { imageData } = await decodeToImageData(file);
      const full = document.createElement('canvas');
      full.width = imageData.width;
      full.height = imageData.height;
      full.getContext('2d', { willReadFrequently: true })!.putImageData(imageData, 0, 0);
      drawImage(full);
      setImgLoaded(true);
      setHover(null);
      setLoupe(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load this image.');
    } finally {
      setLoading(false);
    }
  }, [drawImage]);

  // Sample a pixel from the full-res source given display-space coordinates.
  const sampleAt = useCallback((dispX: number, dispY: number): RGB | null => {
    const full = fullRef.current;
    if (!full) return null;
    const scale = scaleRef.current;
    const fx = Math.floor(dispX / scale);
    const fy = Math.floor(dispY / scale);
    if (fx < 0 || fy < 0 || fx >= full.width || fy >= full.height) return null;
    const ctx = full.getContext('2d', { willReadFrequently: true })!;
    const d = ctx.getImageData(fx, fy, 1, 1).data;
    return { r: d[0], g: d[1], b: d[2] };
  }, []);

  const paintLoupe = useCallback((dispX: number, dispY: number) => {
    const full = fullRef.current;
    const lc = loupeRef.current;
    if (!full || !lc) return;
    const scale = scaleRef.current;
    const fx = dispX / scale;
    const fy = dispY / scale;
    const lctx = lc.getContext('2d')!;
    const srcSize = LOUPE / LOUPE_ZOOM;
    lctx.imageSmoothingEnabled = false;
    lctx.clearRect(0, 0, LOUPE, LOUPE);
    lctx.drawImage(
      full,
      fx - srcSize / 2,
      fy - srcSize / 2,
      srcSize,
      srcSize,
      0,
      0,
      LOUPE,
      LOUPE,
    );
    // Center crosshair marking the sampled pixel.
    lctx.strokeStyle = 'rgba(255,255,255,0.9)';
    lctx.lineWidth = 1;
    lctx.strokeRect(LOUPE / 2 - LOUPE_ZOOM / 2, LOUPE / 2 - LOUPE_ZOOM / 2, LOUPE_ZOOM, LOUPE_ZOOM);
    lctx.strokeStyle = 'rgba(0,0,0,0.6)';
    lctx.strokeRect(LOUPE / 2 - LOUPE_ZOOM / 2 - 1, LOUPE / 2 - LOUPE_ZOOM / 2 - 1, LOUPE_ZOOM + 2, LOUPE_ZOOM + 2);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = displayRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rgb = sampleAt(x, y);
      if (rgb) {
        setHover(rgb);
        setLoupe({ x, y });
        paintLoupe(x, y);
      }
    });
  }, [sampleAt, paintLoupe]);

  const onPointerLeave = useCallback(() => {
    setLoupe(null);
  }, []);

  const addSwatch = useCallback((rgb: RGB) => {
    const hex = rgbToHex(rgb);
    setSwatches((prev) => {
      if (prev[0]?.hex === hex) return prev; // avoid immediate dupes
      return [{ id: swatchSeq++, rgb, hex }, ...prev].slice(0, 24);
    });
  }, []);

  const onClickCanvas = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = displayRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const rgb = sampleAt(e.clientX - rect.left, e.clientY - rect.top);
    if (rgb) addSwatch(rgb);
  }, [sampleAt, addSwatch]);

  const useEyeDropper = useCallback(async () => {
    const Ctor = (window as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper;
    if (!Ctor) return;
    try {
      const res = await new Ctor().open();
      const hex = res.sRGBHex;
      const n = parseInt(hex.replace('#', ''), 16);
      addSwatch({ r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 });
    } catch {
      /* user cancelled */
    }
  }, [addSwatch]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const current = hover;
  const currentHex = current ? rgbToHex(current) : '—';
  const currentHsl = current ? rgbToHsl(current) : null;

  return (
    <div className="page page--wide">
      <TopNav />

      <nav className="crumbs crumbs--sub">
        <Link className="crumbs__link" to="/convert">Image tools</Link>
        <span className="crumbs__sep">/</span>
        <span className="crumbs__link">Color Tools</span>
        <span className="crumbs__sep">/</span>
        <span className="crumbs__current">Color Picker</span>
      </nav>

      <div className="tool-hero">
        <div className="tool-hero__icon"><Eyedropper size={26} weight="fill" /></div>
        <div>
          <h1 className="tool-title">Color Picker</h1>
          <p className="tool-desc">Load an image, hover to preview and click to sample any pixel. Runs fully on-device.</p>
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
          {!imgLoaded && <p className="dropzone__hint">{loading ? 'Decoding…' : 'Hover to preview a pixel, click to save the swatch.'}</p>}
        </div>
      </div>

      {error && <div className="job__error" style={{ marginTop: 12 }}>{error}</div>}

      {imgLoaded && (
        <div className="picker">
          <div className="picker__stage-wrap">
            <div className="picker__stage">
              <canvas
                ref={displayRef}
                className="picker__canvas"
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                onPointerDown={onClickCanvas}
              />
              {loupe && (
                <div
                  className="picker__loupe"
                  style={{
                    left: loupe.x,
                    top: loupe.y,
                    width: LOUPE,
                    height: LOUPE,
                  }}
                >
                  <canvas ref={loupeRef} width={LOUPE} height={LOUPE} className="picker__loupe-canvas" />
                </div>
              )}
            </div>
          </div>

          <aside className="picker__side">
            <div
              className="picker__readout"
              style={{ background: current ? currentHex : 'var(--card)', color: current ? contrastText(current) : 'var(--muted)' }}
            >
              <span className="picker__readout-hex">{currentHex}</span>
              <span className="picker__readout-sub">
                {current ? `${rgbToString(current)} · ${hslToString(currentHsl!)}` : 'Hover over the image'}
              </span>
            </div>

            {current && (
              <div className="picker__copies">
                <CopyChip label="HEX" value={currentHex} />
                <CopyChip label="RGB" value={rgbToString(current)} />
                <CopyChip label="HSL" value={hslToString(currentHsl!)} />
              </div>
            )}

            {hasEyeDropper && (
              <button className="btn btn--icon" onClick={useEyeDropper}>
                <Eyedropper size={15} weight="bold" /> Pick anywhere on screen
              </button>
            )}

            <div className="picker__history-head">
              <span>Picked swatches {swatches.length > 0 && <span className="muted">({swatches.length})</span>}</span>
              {swatches.length > 0 && (
                <button className="btn btn--ghost btn--icon btn--sm" onClick={() => setSwatches([])}>
                  <Trash size={13} /> Clear
                </button>
              )}
            </div>

            {swatches.length === 0 ? (
              <p className="picker__empty">Click the image to collect colors here.</p>
            ) : (
              <div className="swatches">
                {swatches.map((s) => (
                  <button
                    key={s.id}
                    className="swatch"
                    style={{ background: s.hex, color: contrastText(s.rgb) }}
                    title={`Copy ${s.hex}`}
                    onClick={() => navigator.clipboard.writeText(s.hex)}
                  >
                    {s.hex}
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}

      <div className="colorconv__foot">
        <Link className="btn btn--pill btn--icon" to="/tools/rgb-hex-converter"><ArrowLeft size={15} weight="bold" /> RGB ↔ HEX Converter</Link>
      </div>

      <footer className="footer"><span>Part of toolbox · your files never leave this device.</span></footer>
    </div>
  );
}
