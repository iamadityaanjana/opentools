'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowsOutCardinal, CheckSquare, Square } from '@phosphor-icons/react';
import { DotsThinking } from './Thinking';
import type { Params } from '../tools/ops';

interface Thumbnail {
  originalPage: number;
  url: string;
}

function selectedFromRange(value: string, total: number): Set<number> {
  if (!value.trim()) return new Set(Array.from({ length: total }, (_, index) => index + 1));
  const selected = new Set<number>();
  for (const token of value.split(',')) {
    const part = token.trim();
    const match = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (match) {
      for (let page = Number(match[1]); page <= Number(match[2]); page++) {
        if (page >= 1 && page <= total) selected.add(page);
      }
    } else {
      const page = Number(part);
      if (Number.isInteger(page) && page >= 1 && page <= total) selected.add(page);
    }
  }
  return selected;
}

function thumbnailUrl(imageData: ImageData, width: number, height: number): string {
  const source = document.createElement('canvas');
  source.width = width;
  source.height = height;
  source.getContext('2d')!.putImageData(imageData, 0, 0);
  const scale = Math.min(1, 150 / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d')!;
  context.imageSmoothingQuality = 'high';
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.72);
}

export function PdfPageEditor({
  file,
  op,
  params,
  setParam,
}: {
  file: File;
  op: string;
  params: Params;
  setParam: (key: string, value: string | number | boolean) => void;
}) {
  const [pages, setPages] = useState<Thumbnail[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const dragFrom = useRef(-1);
  const isReorder = op === 'reorderPdfPages';
  const isSelectable = ['deletePdfPages', 'extractPdfPages', 'rotatePdfPages'].includes(op);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setError('');
    setPages([]);
    void import('../lib/pdf').then(async ({ renderPdfPages }) => {
      const rendered = await renderPdfPages(file, { dpi: 36, range: '' });
      if (cancelled) return;
      const next = rendered.map((page) => ({
        originalPage: page.index + 1,
        url: thumbnailUrl(page.imageData, page.width, page.height),
      }));
      setPages(next);
    }).catch((reason) => {
      if (!cancelled) setError(reason instanceof Error ? reason.message : 'Could not render PDF pages.');
    }).finally(() => {
      if (!cancelled) setBusy(false);
    });
    return () => { cancelled = true; };
  }, [file]);

  useEffect(() => {
    if (!pages.length) return;
    if (isReorder) {
      const natural = pages.map((page) => page.originalPage).join(',');
      const current = String(params.order ?? '');
      if (current.split(',').length !== pages.length) setParam('order', natural);
    } else if (isSelectable) {
      setSelected(selectedFromRange(String(params.range ?? ''), pages.length));
    }
  }, [pages, isReorder, isSelectable, params.order, params.range, setParam]);

  const selectionLabel = useMemo(() => {
    if (!isSelectable) return '';
    const action = op === 'deletePdfPages' ? 'marked for deletion' : op === 'extractPdfPages' ? 'selected for extraction' : 'selected for rotation';
    return `${selected.size} page${selected.size === 1 ? '' : 's'} ${action}`;
  }, [isSelectable, op, selected.size]);

  const updateSelection = (next: Set<number>) => {
    setSelected(next);
    setParam('range', [...next].sort((a, b) => a - b).join(','));
  };

  const toggle = (page: number) => {
    if (!isSelectable) return;
    const next = new Set(selected);
    if (next.has(page)) next.delete(page); else next.add(page);
    updateSelection(next);
  };

  const reorder = (to: number) => {
    const from = dragFrom.current;
    if (from < 0 || from === to) return;
    setPages((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      setParam('order', next.map((page) => page.originalPage).join(','));
      return next;
    });
    dragFrom.current = -1;
  };

  return (
    <section className="pdf-pages" aria-label="PDF page visualizer">
      <div className="pdf-pages__head">
        <div>
          <strong>{isReorder ? 'Drag pages into the right order' : isSelectable ? 'Choose pages visually' : 'Page preview'}</strong>
          <span>{isReorder ? 'The exported PDF follows this order.' : selectionLabel || `${pages.length} pages`}</span>
        </div>
        {isSelectable && pages.length > 0 && (
          <div className="pdf-pages__actions">
            <button className="btn btn--sm" type="button" onClick={() => updateSelection(new Set(pages.map((page) => page.originalPage)))}>
              Select all
            </button>
            <button className="btn btn--sm btn--ghost" type="button" onClick={() => updateSelection(new Set())}>
              Clear
            </button>
          </div>
        )}
      </div>

      {busy ? (
        <div className="pdf-pages__state"><DotsThinking label="Rendering page thumbnails" /></div>
      ) : error ? (
        <div className="controls__error">{error}</div>
      ) : (
        <div className="pdf-pages__grid">
          {pages.map((page, index) => {
            const active = selected.has(page.originalPage);
            return (
              <button
                className={`pdf-page ${active ? 'is-selected' : ''} ${isReorder ? 'is-draggable' : ''}`}
                draggable={isReorder}
                key={page.originalPage}
                onClick={() => toggle(page.originalPage)}
                onDragStart={() => { dragFrom.current = index; }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => reorder(index)}
                type="button"
              >
                <span className="pdf-page__canvas">
                  <img src={page.url} alt={`Page ${page.originalPage}`} />
                  {isSelectable && (
                    <span className="pdf-page__check">
                      {active ? <CheckSquare size={17} weight="fill" /> : <Square size={17} />}
                    </span>
                  )}
                  {isReorder && <ArrowsOutCardinal className="pdf-page__drag" size={17} weight="bold" />}
                </span>
                <span className="pdf-page__label">
                  {isReorder ? `${index + 1}. Page ${page.originalPage}` : `Page ${page.originalPage}`}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
