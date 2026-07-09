import { useMemo } from 'react';
import type { Params } from '../tools/ops';
import { splitRects } from '../tools/ops';
import type { PreviewSource } from './CropStage';

const MAX_W = 560;

/** Read-only preview: overlays the exact cut lines that split-image will use. */
export function SplitStage({ src, params }: { src: PreviewSource; params: Params }) {
  const dataUrl = useMemo(() => src.canvas.toDataURL('image/png'), [src.canvas]);
  const dispW = Math.min(MAX_W, src.fullW);
  const scale = dispW / src.fullW;
  const dispH = src.fullH * scale;

  const rects = useMemo(() => splitRects(src.fullW, src.fullH, params), [src.fullW, src.fullH, params]);

  return (
    <div className="crop-wrap">
      <div
        className="crop-stage"
        style={{ width: dispW, height: dispH, backgroundImage: `url(${dataUrl})`, position: 'relative' }}
      >
        {rects.map((r) => (
          <div
            key={`${r.row}-${r.col}`}
            style={{
              position: 'absolute',
              left: r.x * scale,
              top: r.y * scale,
              width: r.w * scale,
              height: r.h * scale,
              boxSizing: 'border-box',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.35)',
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>
      <div className="crop-dims">
        {rects.length} tile{rects.length === 1 ? '' : 's'}
        {rects.length > 0 && ` · ~${Math.round(rects[0].w)} × ${Math.round(rects[0].h)} px each`}
      </div>
    </div>
  );
}
