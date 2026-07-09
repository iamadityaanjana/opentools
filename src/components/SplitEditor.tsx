import { useMemo, useRef, useState } from 'react';
import { Plus, X } from '@phosphor-icons/react';
import type { Params } from '../tools/ops';
import { splitRects, parseFractions } from '../tools/ops';
import type { PreviewSource } from './CropStage';

const MAX_W = 560;
const EPS = 0.02;

type Axis = 'x' | 'y';

/**
 * Interactive split editor: drag guide lines to move them, double-click a line
 * (or its dot) to remove it, and use the buttons to add new vertical/horizontal
 * cuts. Positions are stored as 0..1 fractions in params.xs / params.ys.
 */
export function SplitEditor({
  src, params, setParam,
}: {
  src: PreviewSource;
  params: Params;
  setParam: (key: string, value: string | number | boolean) => void;
}) {
  const dataUrl = useMemo(() => src.canvas.toDataURL('image/png'), [src.canvas]);
  const dispW = Math.min(MAX_W, src.fullW);
  const scale = dispW / src.fullW;
  const dispH = src.fullH * scale;

  const xs = parseFractions(params.xs);
  const ys = parseFractions(params.ys);
  const rects = useMemo(() => splitRects(src.fullW, src.fullH, params), [src.fullW, src.fullH, params]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ axis: Axis; index: number } | null>(null);
  const [active, setActive] = useState(false);

  const commit = (axis: Axis, next: number[]) => {
    setParam(axis === 'x' ? 'xs' : 'ys', JSON.stringify(next));
  };

  const addLine = (axis: Axis) => {
    const arr = axis === 'x' ? xs : ys;
    // Drop the new line into the middle of the widest existing gap.
    const bounds = [0, ...arr, 1];
    let best = 0.5, span = -1;
    for (let i = 0; i < bounds.length - 1; i++) {
      const gap = bounds[i + 1] - bounds[i];
      if (gap > span) { span = gap; best = (bounds[i] + bounds[i + 1]) / 2; }
    }
    commit(axis, [...arr, best].sort((a, b) => a - b));
  };

  const removeLine = (axis: Axis, index: number) => {
    const arr = (axis === 'x' ? xs : ys).slice();
    arr.splice(index, 1);
    commit(axis, arr);
  };

  const onMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    const wrap = wrapRef.current;
    if (!d || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const arr = (d.axis === 'x' ? xs : ys).slice();
    const raw = d.axis === 'x'
      ? (e.clientX - rect.left) / rect.width
      : (e.clientY - rect.top) / rect.height;
    const lo = (arr[d.index - 1] ?? 0) + EPS;
    const hi = (arr[d.index + 1] ?? 1) - EPS;
    arr[d.index] = Math.max(lo, Math.min(hi, raw));
    commit(d.axis, arr);
  };

  const start = (axis: Axis, index: number) => (e: React.PointerEvent) => {
    e.stopPropagation();
    dragRef.current = { axis, index };
    setActive(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const end = () => { dragRef.current = null; setActive(false); };

  return (
    <div className="crop-wrap">
      <div className="split-toolbar">
        <button className="btn btn--ghost btn--sm btn--icon" onClick={() => addLine('x')}>
          <Plus size={13} weight="bold" /> Vertical line
        </button>
        <button className="btn btn--ghost btn--sm btn--icon" onClick={() => addLine('y')}>
          <Plus size={13} weight="bold" /> Horizontal line
        </button>
      </div>

      <div
        ref={wrapRef}
        className={`split-stage ${active ? 'is-dragging' : ''}`}
        style={{ width: dispW, height: dispH, backgroundImage: `url(${dataUrl})` }}
        onPointerMove={onMove}
        onPointerUp={end}
        onPointerLeave={end}
      >
        {rects.map((r) => (
          <div
            key={`${r.row}-${r.col}`}
            className="split-cell"
            style={{ left: r.x * scale, top: r.y * scale, width: r.w * scale, height: r.h * scale }}
          />
        ))}

        {xs.map((f, i) => (
          <div
            key={`x-${i}`}
            className="split-guide split-guide--v"
            style={{ left: f * dispW }}
            onPointerDown={start('x', i)}
            onDoubleClick={() => removeLine('x', i)}
            title="Drag to move · double-click to remove"
          >
            <button className="split-guide__del" onPointerDown={(e) => e.stopPropagation()} onClick={() => removeLine('x', i)} aria-label="Remove line"><X size={10} weight="bold" /></button>
          </div>
        ))}
        {ys.map((f, i) => (
          <div
            key={`y-${i}`}
            className="split-guide split-guide--h"
            style={{ top: f * dispH }}
            onPointerDown={start('y', i)}
            onDoubleClick={() => removeLine('y', i)}
            title="Drag to move · double-click to remove"
          >
            <button className="split-guide__del" onPointerDown={(e) => e.stopPropagation()} onClick={() => removeLine('y', i)} aria-label="Remove line"><X size={10} weight="bold" /></button>
          </div>
        ))}
      </div>

      <div className="crop-dims">
        {rects.length} tile{rects.length === 1 ? '' : 's'} · drag lines to adjust, double-click to remove
      </div>
    </div>
  );
}
