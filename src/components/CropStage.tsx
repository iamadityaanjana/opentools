import { useCallback, useMemo, useRef, useState } from 'react';
import type { Params } from '../tools/ops';

export interface PreviewSource {
  canvas: HTMLCanvasElement;
  fullW: number;
  fullH: number;
}

type Handle = 'move' | 'nw' | 'ne' | 'sw' | 'se';

const MAX_W = 560;
const MIN = 16; // min crop size in full-res px

/** Photo-editor style crop: draggable/resizable box over the image. */
export function CropStage({
  src,
  params,
  setParam,
}: {
  src: PreviewSource;
  params: Params;
  setParam: (patch: Partial<Params>) => void;
}) {
  const dataUrl = useMemo(() => src.canvas.toDataURL('image/png'), [src.canvas]);
  const dispW = Math.min(MAX_W, src.fullW);
  const scale = dispW / src.fullW;
  const dispH = src.fullH * scale;
  const wrapRef = useRef<HTMLDivElement>(null);

  const x = Number(params.x) || 0;
  const y = Number(params.y) || 0;
  const w = Number(params.w) || src.fullW;
  const h = Number(params.h) || src.fullH;

  const drag = useRef<{ handle: Handle; sx: number; sy: number; box: { x: number; y: number; w: number; h: number } } | null>(null);
  const [active, setActive] = useState(false);

  const onMove = useCallback(
    (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = (e.clientX - d.sx) / scale;
      const dy = (e.clientY - d.sy) / scale;
      let { x: nx, y: ny, w: nw, h: nh } = d.box;
      if (d.handle === 'move') {
        nx = d.box.x + dx;
        ny = d.box.y + dy;
      } else {
        if (d.handle.includes('w')) { nx = d.box.x + dx; nw = d.box.w - dx; }
        if (d.handle.includes('e')) { nw = d.box.w + dx; }
        if (d.handle.includes('n')) { ny = d.box.y + dy; nh = d.box.h - dy; }
        if (d.handle.includes('s')) { nh = d.box.h + dy; }
      }
      nw = Math.max(MIN, nw);
      nh = Math.max(MIN, nh);
      nx = Math.max(0, Math.min(nx, src.fullW - nw));
      ny = Math.max(0, Math.min(ny, src.fullH - nh));
      nw = Math.min(nw, src.fullW - nx);
      nh = Math.min(nh, src.fullH - ny);
      setParam({ x: Math.round(nx), y: Math.round(ny), w: Math.round(nw), h: Math.round(nh) });
    },
    [scale, src.fullW, src.fullH, setParam],
  );

  const stop = useCallback(() => {
    drag.current = null;
    setActive(false);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', stop);
  }, [onMove]);

  const start = useCallback(
    (handle: Handle) => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      drag.current = { handle, sx: e.clientX, sy: e.clientY, box: { x, y, w, h } };
      setActive(true);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', stop);
    },
    [x, y, w, h, onMove, stop],
  );

  const boxStyle = { left: x * scale, top: y * scale, width: w * scale, height: h * scale };

  return (
    <div className="crop-wrap">
      <div
        ref={wrapRef}
        className={`crop-stage ${active ? 'is-dragging' : ''}`}
        style={{ width: dispW, height: dispH, backgroundImage: `url(${dataUrl})` }}
      >
        {/* Dimming overlay is clipped to the stage; kept separate from the box so
            the resize handles can sit outside the box without being clipped. */}
        <div className="crop-mask">
          <div className="crop-shadow" style={boxStyle} />
        </div>
        <div
          className="crop-box"
          style={boxStyle}
          onPointerDown={start('move')}
        >
          <span className="crop-handle crop-handle--nw" onPointerDown={start('nw')} />
          <span className="crop-handle crop-handle--ne" onPointerDown={start('ne')} />
          <span className="crop-handle crop-handle--sw" onPointerDown={start('sw')} />
          <span className="crop-handle crop-handle--se" onPointerDown={start('se')} />
        </div>
      </div>
      <div className="crop-dims">
        {Math.round(w)} × {Math.round(h)} px · from ({Math.round(x)}, {Math.round(y)})
      </div>
    </div>
  );
}
