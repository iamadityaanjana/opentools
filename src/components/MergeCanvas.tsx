import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLineUp, GridFour } from '@phosphor-icons/react';
import type { Params, MergeLayer } from '../tools/ops';
import { mergeLayout, gridMergeLayout } from '../tools/ops';
import type { PreviewSource } from './CropStage';

const MAX_W = 640;
const MAX_H = 520;
const MIN_PX = 20;

type DragMode = 'move' | 'resize';

/**
 * Figma-like freeform compositor on a user-sized canvas. Images are movable /
 * resizable layers stored in canvas-pixel space, so resizing the canvas never
 * distorts them. Changing the grid columns re-arranges everything into a grid.
 */
export function MergeCanvas({
  srcs, params, setParam,
}: {
  srcs: PreviewSource[];
  params: Params;
  setParam: (key: string, value: string | number | boolean) => void;
}) {
  const sizes = useMemo(() => srcs.map((s) => ({ w: s.fullW, h: s.fullH })), [srcs]);
  const urls = useMemo(() => srcs.map((s) => s.canvas.toDataURL('image/png')), [srcs]);
  const { W, H, layers } = mergeLayout(params, sizes);
  const cols = Math.max(1, Math.round(Number(params.cols) || 2));

  // Auto-arrange into a grid on first mount and whenever image count / columns
  // change. Manual drags are preserved otherwise (layout param stays put).
  const regridRef = useRef('');
  useEffect(() => {
    const key = `${srcs.length}:${cols}`;
    if (regridRef.current === key && typeof params.layout === 'string' && params.layout) return;
    regridRef.current = key;
    setParam('layout', JSON.stringify(gridMergeLayout(sizes, cols, W, H)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcs.length, cols]);

  let dispW = Math.min(MAX_W, W);
  let scale = dispW / W;
  if (H * scale > MAX_H) { scale = MAX_H / H; dispW = W * scale; }
  const dispH = H * scale;

  const [selected, setSelected] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ mode: DragMode; index: number; sx: number; sy: number; orig: MergeLayer } | null>(null);
  const [dragging, setDragging] = useState(false);

  const clamp = (v: number, a: number, b: number) => Math.max(Math.min(a, b), Math.min(Math.max(a, b), v));

  const start = (mode: DragMode, index: number) => (e: React.PointerEvent) => {
    e.stopPropagation();
    setSelected(index);
    dragRef.current = { mode, index, sx: e.clientX, sy: e.clientY, orig: { ...layers[index] } };
    setDragging(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = (e.clientX - d.sx) / scale;
    const dy = (e.clientY - d.sy) / scale;
    const next = layers.slice();
    if (d.mode === 'move') {
      next[d.index] = { ...d.orig, x: clamp(d.orig.x + dx, 0, W - d.orig.w), y: clamp(d.orig.y + dy, 0, H - d.orig.h) };
    } else {
      const factor = Math.max(MIN_PX / Math.max(d.orig.w, 1), (d.orig.w + dx) / Math.max(d.orig.w, 1));
      next[d.index] = { ...d.orig, w: d.orig.w * factor, h: d.orig.h * factor };
    }
    setParam('layout', JSON.stringify(next));
  };

  const end = () => { dragRef.current = null; setDragging(false); };

  const bringToFront = (index: number) => {
    const maxZ = Math.max(...layers.map((l, i) => l.z ?? i));
    const next = layers.slice();
    next[index] = { ...next[index], z: maxZ + 1 };
    setParam('layout', JSON.stringify(next));
    setSelected(index);
  };

  const arrangeGrid = () => {
    regridRef.current = `${srcs.length}:${cols}`;
    setParam('layout', JSON.stringify(gridMergeLayout(sizes, cols, W, H)));
  };

  return (
    <div className="crop-wrap">
      <div className="split-toolbar">
        <button className="btn btn--ghost btn--sm btn--icon" onClick={arrangeGrid}>
          <GridFour size={13} weight="bold" /> Arrange in {cols}-col grid
        </button>
        {selected >= 0 && (
          <button className="btn btn--ghost btn--sm btn--icon" onClick={() => bringToFront(selected)}>
            <ArrowLineUp size={13} weight="bold" /> Bring to front
          </button>
        )}
      </div>

      <div
        ref={wrapRef}
        className={`merge-stage ${dragging ? 'is-dragging' : ''}`}
        style={{ width: dispW, height: dispH, background: String(params.bg ?? '#ffffff') }}
        onPointerMove={onMove}
        onPointerUp={end}
        onPointerLeave={end}
        onPointerDown={() => setSelected(-1)}
      >
        {layers.map((L, i) => (
          <div
            key={i}
            className={`merge-layer ${selected === i ? 'is-selected' : ''}`}
            style={{ left: L.x * scale, top: L.y * scale, width: L.w * scale, height: L.h * scale, backgroundImage: `url(${urls[i]})`, zIndex: (L.z ?? i) + 1 }}
            onPointerDown={start('move', i)}
            onDoubleClick={() => bringToFront(i)}
            title="Drag to move · drag corner to resize · double-click to bring to front"
          >
            <span className="merge-layer__idx">{i + 1}</span>
            {selected === i && <span className="merge-handle merge-handle--se" onPointerDown={start('resize', i)} />}
          </div>
        ))}
      </div>
      <div className="crop-dims">
        {layers.length} images · {W} × {H} px canvas · drag to move, corner to resize
      </div>
    </div>
  );
}
