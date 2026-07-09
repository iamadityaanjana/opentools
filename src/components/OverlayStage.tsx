import { useCallback, useMemo, useRef, useState } from 'react';
import type { Params } from '../tools/ops';
import { fontString } from '../tools/ops';
import type { PreviewSource } from './CropStage';

const MAX_W = 560;

/**
 * Photo-editor style text placement: shows the image with the text/watermark
 * rendered on top and lets the user drag it anywhere. Position is stored as
 * fractional `nx`/`ny` (0..1) so it maps cleanly to the full-resolution export.
 */
export function OverlayStage({
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

  const nx = params.nx != null ? Number(params.nx) : 0.5;
  const ny = params.ny != null ? Number(params.ny) : 0.5;
  const text = String(params.text ?? '').trim() || 'Your text';
  const size = Number(params.size ?? 48) * scale;
  const color = String(params.color ?? '#ffffff');
  const opacity = params.opacity != null ? Number(params.opacity) / 100 : 1;
  const font = fontString(String(params.style ?? 'bold'), size, String(params.font ?? 'Instrument Sans'));

  const [active, setActive] = useState(false);
  const drag = useRef(false);

  const move = useCallback((clientX: number, clientY: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    setParam({ nx: Number(x.toFixed(4)), ny: Number(y.toFixed(4)) });
  }, [setParam]);

  const onPointerMove = useCallback((e: PointerEvent) => { if (drag.current) move(e.clientX, e.clientY); }, [move]);
  const stop = useCallback(() => {
    drag.current = false; setActive(false);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', stop);
  }, [onPointerMove]);

  const onDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    drag.current = true; setActive(true);
    move(e.clientX, e.clientY);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stop);
  }, [move, onPointerMove, stop]);

  return (
    <div className="crop-wrap">
      <div
        ref={wrapRef}
        className={`overlay-stage ${active ? 'is-dragging' : ''}`}
        style={{ width: dispW, height: dispH, backgroundImage: `url(${dataUrl})` }}
        onPointerDown={onDown}
      >
        <div
          className="overlay-text"
          style={{
            left: `${nx * 100}%`,
            top: `${ny * 100}%`,
            font,
            color,
            opacity,
          }}
        >
          {text}
        </div>
      </div>
      <div className="crop-dims">Drag the text to position it anywhere.</div>
    </div>
  );
}
