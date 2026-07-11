'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Trash } from '@phosphor-icons/react';
import { DotsThinking } from './Thinking';
import type { RedactBox } from '../lib/pdfSecurity';

interface PageThumb {
  index: number; // 0-based
  url: string;
  aspect: number; // width / height
}

interface DrawState {
  page: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function thumbnailUrl(imageData: ImageData, width: number, height: number): string {
  const source = document.createElement('canvas');
  source.width = width;
  source.height = height;
  source.getContext('2d')!.putImageData(imageData, 0, 0);
  const scale = Math.min(1, 900 / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.75);
}

export function RedactEditor({
  file,
  boxes,
  setBoxes,
}: {
  file: File;
  boxes: RedactBox[];
  setBoxes: (boxes: RedactBox[]) => void;
}) {
  const [pages, setPages] = useState<PageThumb[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [draw, setDraw] = useState<DrawState | null>(null);
  const surfaces = useRef(new Map<number, HTMLDivElement>());

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setError('');
    setPages([]);
    void import('../lib/pdf').then(async ({ renderPdfPages }) => {
      const rendered = await renderPdfPages(file, { dpi: 96, range: '' });
      if (cancelled) return;
      setPages(rendered.map((page) => ({
        index: page.index,
        url: thumbnailUrl(page.imageData, page.width, page.height),
        aspect: page.width / page.height,
      })));
    }).catch((reason) => {
      if (!cancelled) setError(reason instanceof Error ? reason.message : 'Could not render PDF pages.');
    }).finally(() => {
      if (!cancelled) setBusy(false);
    });
    return () => { cancelled = true; };
  }, [file]);

  const pointFor = useCallback((page: number, clientX: number, clientY: number) => {
    const el = surfaces.current.get(page);
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x: clamp01((clientX - rect.left) / rect.width),
      y: clamp01((clientY - rect.top) / rect.height),
    };
  }, []);

  const onPointerDown = (page: number) => (event: React.PointerEvent) => {
    event.preventDefault();
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    const { x, y } = pointFor(page, event.clientX, event.clientY);
    setDraw({ page, x0: x, y0: y, x1: x, y1: y });
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!draw) return;
    const { x, y } = pointFor(draw.page, event.clientX, event.clientY);
    setDraw({ ...draw, x1: x, y1: y });
  };

  const onPointerUp = () => {
    if (!draw) return;
    const x = Math.min(draw.x0, draw.x1);
    const y = Math.min(draw.y0, draw.y1);
    const w = Math.abs(draw.x1 - draw.x0);
    const h = Math.abs(draw.y1 - draw.y0);
    setDraw(null);
    // Ignore accidental clicks / tiny drags.
    if (w > 0.01 && h > 0.01) setBoxes([...boxes, { page: draw.page, x, y, w, h }]);
  };

  const removeBox = (target: RedactBox) => {
    setBoxes(boxes.filter((box) => box !== target));
  };

  const clearPage = (page: number) => setBoxes(boxes.filter((box) => box.page !== page));

  return (
    <section className="redact" aria-label="PDF redaction editor">
      <div className="redact__head">
        <div>
          <strong>Draw boxes over anything you want to hide</strong>
          <span>{boxes.length} area{boxes.length === 1 ? '' : 's'} marked · redacted pixels are permanently removed on export</span>
        </div>
        {boxes.length > 0 && (
          <button className="btn btn--sm btn--ghost" type="button" onClick={() => setBoxes([])}>Clear all</button>
        )}
      </div>

      {busy ? (
        <div className="redact__state"><DotsThinking label="Rendering pages" /></div>
      ) : error ? (
        <div className="controls__error">{error}</div>
      ) : (
        <div className="redact__pages">
          {pages.map((page) => {
            const pageBoxes = boxes.filter((box) => box.page === page.index);
            const live = draw && draw.page === page.index ? draw : null;
            return (
              <div className="redact__page" key={page.index}>
                <div className="redact__page-bar">
                  <span>Page {page.index + 1}</span>
                  {pageBoxes.length > 0 && (
                    <button className="linklike" type="button" onClick={() => clearPage(page.index)}>Clear page</button>
                  )}
                </div>
                <div
                  className="redact__surface"
                  ref={(el) => { if (el) surfaces.current.set(page.index, el); else surfaces.current.delete(page.index); }}
                  style={{ aspectRatio: String(page.aspect) }}
                  onPointerDown={onPointerDown(page.index)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                >
                  <img src={page.url} alt={`Page ${page.index + 1}`} draggable={false} />
                  {pageBoxes.map((box, i) => (
                    <span
                      key={i}
                      className="redact__box"
                      style={{ left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.w * 100}%`, height: `${box.h * 100}%` }}
                    >
                      <button
                        className="redact__box-remove"
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); removeBox(box); }}
                        aria-label="Remove box"
                      >
                        <Trash size={12} weight="bold" />
                      </button>
                    </span>
                  ))}
                  {live && (
                    <span
                      className="redact__box redact__box--live"
                      style={{
                        left: `${Math.min(live.x0, live.x1) * 100}%`,
                        top: `${Math.min(live.y0, live.y1) * 100}%`,
                        width: `${Math.abs(live.x1 - live.x0) * 100}%`,
                        height: `${Math.abs(live.y1 - live.y0) * 100}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
