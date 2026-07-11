import { useMemo } from 'react';
import type { CSSProperties } from 'react';

/** Decorative plus/cross grid from the design inspiration. */
export function PlusGrid({ cols = 16, rows = 8 }: { cols?: number; rows?: number }) {
  const cells = useMemo(() => {
    return Array.from({ length: cols * rows }, (_, index) => {
      // Deterministic variation keeps server and client markup identical.
      const r = ((index * 9301 + cols * 49297 + rows * 233) % 233280) / 233280;
      const opacity = r > 0.85 ? 1 : r > 0.6 ? 0.55 : r > 0.4 ? 0.3 : 0.14;
      const weight = r > 0.85 ? 700 : 400;
      // Diagonal distance from the bottom-right corner drives the wave order,
      // so the pulse enters from bottom-right and sweeps toward top-left.
      const col = index % cols;
      const row = Math.floor(index / cols);
      const distance = (cols - 1 - col) + (rows - 1 - row);
      return { opacity, weight, delay: distance * 0.09 };
    });
  }, [cols, rows]);

  return (
    <div className="plusgrid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }} aria-hidden>
      {cells.map((c, i) => (
        <span
          key={i}
          style={{ opacity: c.opacity, fontWeight: c.weight, '--pd': `${c.delay}s` } as CSSProperties}
        >
          +
        </span>
      ))}
    </div>
  );
}
