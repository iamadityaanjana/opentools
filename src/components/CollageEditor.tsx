import { useMemo } from 'react';
import { Plus, Minus, X, Rows } from '@phosphor-icons/react';
import type { Params } from '../tools/ops';
import { collageRows, collageLayout, parseIntList, defaultRowCounts } from '../tools/ops';
import type { PreviewSource } from './CropStage';

const MAX_W = 600;

/**
 * Justified/mosaic collage builder. Rows span the full width and each row can
 * hold a different number of images (adjust with the per-row steppers). Row
 * heights are derived from the images' aspect ratios, like the reference layout.
 */
export function CollageEditor({
  srcs, params, setParam,
}: {
  srcs: PreviewSource[];
  params: Params;
  setParam: (key: string, value: string | number | boolean) => void;
}) {
  const n = srcs.length;
  const sizes = useMemo(() => srcs.map((s) => ({ w: s.fullW, h: s.fullH })), [srcs]);
  const urls = useMemo(() => srcs.map((s) => s.canvas.toDataURL('image/png')), [srcs]);

  const counts = parseIntList(params.rowCounts, () => defaultRowCounts(n));
  const rows = collageRows(n, counts);
  // Normalized counts (what's actually rendered) so the steppers stay in sync.
  const actual = rows.map((r) => r.length);

  const canvasW = Math.max(200, Math.round(Number(params.canvasW) || 1200));
  const gap = Math.max(0, Math.round(Number(params.gap) || 0));

  const dispW = Math.min(MAX_W, canvasW);
  const s = dispW / canvasW;
  const { H, rects } = collageLayout(sizes, counts, dispW, gap * s);

  const commit = (next: number[]) => setParam('rowCounts', JSON.stringify(next));

  const inc = (r: number) => { const c = actual.slice(); c[r] += 1; commit(c); };
  const dec = (r: number) => { const c = actual.slice(); c[r] = Math.max(1, c[r] - 1); commit(c); };
  const removeRow = (r: number) => { const c = actual.slice(); c.splice(r, 1); commit(c.length ? c : [n]); };
  const addRow = () => {
    const c = actual.slice();
    // Free one image from the last multi-image row so the new row has content.
    for (let i = c.length - 1; i >= 0; i--) { if (c[i] > 1) { c[i] -= 1; break; } }
    c.push(1);
    commit(c);
  };

  return (
    <div className="crop-wrap">
      <div
        className="collage-stage"
        style={{ width: dispW, height: Math.round(H), background: String(params.bg ?? '#ffffff') }}
      >
        {rects.map((r) => (
          <div
            key={r.i}
            className="collage-cell"
            style={{ left: r.x, top: r.y, width: r.w, height: r.h, backgroundImage: `url(${urls[r.i]})` }}
          >
            <span className="collage-cell__idx">{r.i + 1}</span>
          </div>
        ))}
      </div>

      <div className="collage-rows">
        {rows.map((row, r) => (
          <div className="collage-rowctrl" key={r}>
            <span className="collage-rowctrl__label">Row {r + 1} · {row.length} image{row.length === 1 ? '' : 's'}</span>
            <div className="collage-rowctrl__steppers">
              <button className="btn btn--ghost btn--sm btn--icon" onClick={() => dec(r)} disabled={row.length <= 1} aria-label="Fewer"><Minus size={12} weight="bold" /></button>
              <button className="btn btn--ghost btn--sm btn--icon" onClick={() => inc(r)} aria-label="More"><Plus size={12} weight="bold" /></button>
              <button className="btn btn--ghost btn--sm btn--icon" onClick={() => removeRow(r)} disabled={rows.length <= 1} aria-label="Remove row"><X size={12} weight="bold" /></button>
            </div>
          </div>
        ))}
        <button className="btn btn--ghost btn--sm btn--icon" onClick={addRow}><Rows size={13} weight="bold" /> Add row</button>
      </div>
      <div className="crop-dims">Reorder images in the strip above to change which cells they land in.</div>
    </div>
  );
}
