import { useMemo, useRef, useState } from 'react';
import { ArrowLineUp } from '@phosphor-icons/react';
import type { Params, MergeLayer } from '../tools/ops';
import { mergeLayout } from '../tools/ops';
import type { PreviewSource } from './CropStage';

const MAX_W = 640;
const MAX_H = 520;
const MIN = 0.04;

type DragMode = 'move' | 'resize';

/**
 * Figma-like freeform compositor. Each uploaded image is a movable/resizable
 * layer on a shared canvas; the normalized layout is written back to params so
 * the merge op composites the same arrangement at full resolution.
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

  // Fit the canvas into the available box while keeping its aspect ratio.
  let dispW = Math.min(MAX_W, W);
  let scale = dispW / W;
  if (H * scale > MAX_H) { scale = MAX_H / H; dispW = W * scale; }
  const dispH = H * scale;

  const [selected, setSelected] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ mode: DragMode; index: number; sx: number; sy: number; orig: MergeLayer } | null>(null);
  const [dragging, setDragging] = useState(false);

  const write = (next: MergeLayer[]) => {
    setParam('canvasW', W);
    setParam('canvasH', H);
    setParam('layout', JSON.stringify(next));
  };

  const clampPos = (v: number, size: number) => {
    const a = Math.min(0, 1 - size), b = Math.max(0, 1 - size);
    return Math.max(a, Math.min(b, v));
  };

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
    const dnx = (e.clientX - d.sx) / dispW;
    const dny = (e.clientY - d.sy) / dispH;
    const next = layers.slice();
    if (d.mode === 'move') {
      next[d.index] = { ...d.orig, nx: clampPos(d.orig.nx + dnx, d.orig.nw), ny: clampPos(d.orig.ny + dny, d.orig.nh) };
    } else {
      // Uniform scale from the SE corner, preserving each image's aspect ratio.
      const factor = Math.max(MIN / Math.max(d.orig.nw, 0.0001), (d.orig.nw + dnx) / Math.max(d.orig.nw, 0.0001));
      next[d.index] = { ...d.orig, nw: d.orig.nw * factor, nh: d.orig.nh * factor };
    }
    write(next);
  };

  const end = () => { dragRef.current = null; setDragging(false); };

  const bringToFront = (index: number) => {
    // Keep array index aligned with the source list; raise stacking via z only.
    const maxZ = Math.max(...layers.map((l, i) => l.z ?? i));
    const next = layers.slice();
    next[index] = { ...next[index], z: maxZ + 1 };
    write(next);
    setSelected(index);
  };

  return (
    <div className="crop-wrap">
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
            style={{ left: L.nx * dispW, top: L.ny * dispH, width: L.nw * dispW, height: L.nh * dispH, backgroundImage: `url(${urls[i]})`, zIndex: (L.z ?? i) + 1 }}
            onPointerDown={start('move', i)}
            onDoubleClick={() => bringToFront(i)}
            title="Drag to move · double-click to bring to front"
          >
            <span className="merge-layer__idx">{i + 1}</span>
            {selected === i && <span className="merge-handle merge-handle--se" onPointerDown={start('resize', i)} />}
          </div>
        ))}
      </div>
      <div className="crop-dims">
        {layers.length} images · {W} × {H} px canvas · drag to move, corner to resize
        {selected >= 0 && (
          <button className="btn btn--ghost btn--sm btn--icon" style={{ marginLeft: 8 }} onClick={() => bringToFront(selected)}>
            <ArrowLineUp size={12} weight="bold" /> Bring to front
          </button>
        )}
      </div>
    </div>
  );
}
