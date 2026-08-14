'use client';

import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  DownloadSimple, Plus, TextT, Trash, UploadSimple,
} from '@phosphor-icons/react';
import { DotsThinking } from '../Thinking';
import { PDF_FONT_OPTIONS, cssFontForFamily } from '../../lib/pdfEditor/fonts';
import type {
  PdfPageMeta, PdfTextAnnotation, PdfTextDefaults,
} from '../../lib/pdfEditor/types';
import { DEFAULT_TEXT_STYLE } from '../../lib/pdfEditor/types';
import { clamp01, uid } from '../../lib/pdfEditor/utils';

const PREVIEW_DPI = 110;
const COLOR_PRESETS = ['#000000', '#ffffff', '#1d4ed8', '#dc2626', '#16a34a', '#9333ea'];

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
  return canvas.toDataURL('image/jpeg', 0.78);
}

interface PdfTextStudioProps {
  file: File;
  onRequestNewFile?: () => void;
}

export function PdfTextStudio({ file, onRequestNewFile }: PdfTextStudioProps) {
  const [pages, setPages] = useState<PdfPageMeta[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [annotations, setAnnotations] = useState<PdfTextAnnotation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [defaults, setDefaults] = useState<PdfTextDefaults>(DEFAULT_TEXT_STYLE);
  const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
  const [exportError, setExportError] = useState('');
  const surfaceRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [surfaceWidth, setSurfaceWidth] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setError('');
    setPages([]);
    setAnnotations([]);
    setSelectedId(null);
    setCurrentPage(0);

    void import('../../lib/pdf').then(async ({ renderPdfPages }) => {
      const rendered = await renderPdfPages(file, { dpi: PREVIEW_DPI, range: '' });
      if (cancelled) return;
      const next = rendered.map((page) => {
        const widthPt = page.width * (72 / PREVIEW_DPI);
        const heightPt = page.height * (72 / PREVIEW_DPI);
        return {
          index: page.index,
          widthPt,
          heightPt,
          previewUrl: thumbnailUrl(page.imageData, page.width, page.height),
          aspect: page.width / page.height,
        };
      });
      setPages(next);
    }).catch((reason) => {
      if (!cancelled) setError(reason instanceof Error ? reason.message : 'Could not open this PDF.');
    }).finally(() => {
      if (!cancelled) setBusy(false);
    });

    return () => { cancelled = true; };
  }, [file]);

  const page = pages.find((item) => item.index === currentPage) ?? pages[0] ?? null;
  const pageAnnotations = useMemo(
    () => annotations.filter((item) => item.pageIndex === currentPage),
    [annotations, currentPage],
  );
  const selected = annotations.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    const el = surfaceRef.current;
    if (!el || busy) return;
    const update = () => setSurfaceWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [currentPage, busy, pages.length]);

  const pointFor = useCallback((clientX: number, clientY: number) => {
    const el = surfaceRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x: clamp01((clientX - rect.left) / rect.width),
      y: clamp01((clientY - rect.top) / rect.height),
    };
  }, []);

  const addAnnotation = useCallback((x: number, y: number) => {
    const next: PdfTextAnnotation = {
      id: uid('text'),
      pageIndex: currentPage,
      text: 'New text',
      x,
      y,
      fontSize: defaults.fontSize,
      fontFamily: defaults.fontFamily,
      color: defaults.color,
      coverBackground: defaults.coverBackground,
    };
    setAnnotations((prev) => [...prev, next]);
    setSelectedId(next.id);
  }, [currentPage, defaults]);

  const updateAnnotation = useCallback((id: string, patch: Partial<PdfTextAnnotation>) => {
    setAnnotations((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const removeAnnotation = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((item) => item.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const onSurfaceClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('.pdf-editor__text')) return;
    const { x, y } = pointFor(event.clientX, event.clientY);
    addAnnotation(x, y);
  };

  const onTextPointerDown = (id: string) => (event: React.PointerEvent) => {
    event.stopPropagation();
    setSelectedId(id);
    const item = annotations.find((ann) => ann.id === id);
    if (!item) return;
    const { x, y } = pointFor(event.clientX, event.clientY);
    dragRef.current = { id, startX: x, startY: y, origX: item.x, origY: item.y };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const onTextPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const { x, y } = pointFor(event.clientX, event.clientY);
    updateAnnotation(drag.id, {
      x: clamp01(drag.origX + (x - drag.startX)),
      y: clamp01(drag.origY + (y - drag.startY)),
    });
  };

  const onTextPointerUp = () => {
    dragRef.current = null;
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!selectedId) return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        removeAnnotation(selectedId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [removeAnnotation, selectedId]);

  const handleExport = async () => {
    setExportStatus('processing');
    setExportError('');
    try {
      const { applyPdfTextAnnotations, bytesToPdfBlob } = await import('../../lib/pdfEdit');
      const bytes = await applyPdfTextAnnotations(file, annotations);
      const base = file.name.replace(/\.[^.]+$/, '') || 'document';
      const url = URL.createObjectURL(bytesToPdfBlob(bytes));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${base}-edited.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
      setExportStatus('done');
      window.setTimeout(() => setExportStatus('idle'), 2500);
    } catch (reason) {
      setExportStatus('error');
      setExportError(reason instanceof Error ? reason.message : 'Export failed.');
    }
  };

  const displayScale = page && surfaceWidth > 0 ? surfaceWidth / page.widthPt : 1;

  if (busy) {
    return (
      <div className="pdf-editor-studio pdf-editor-studio--loading">
        <DotsThinking label="Opening PDF" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdf-editor-studio">
        <div className="controls__error">{error}</div>
        {onRequestNewFile && (
          <button type="button" className="btn btn--pill" onClick={onRequestNewFile}>
            <UploadSimple size={15} /> Choose another PDF
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="pdf-editor-studio">
      <header className="pdf-editor-studio__toolbar">
        <div className="pdf-editor-studio__toolbar-left">
          <span className="pdf-editor-studio__file" title={file.name}>{file.name}</span>
          <span className="pdf-editor-studio__meta muted">
            {pages.length} page{pages.length === 1 ? '' : 's'} · {annotations.length} text box{annotations.length === 1 ? '' : 'es'}
          </span>
        </div>
        <div className="pdf-editor-studio__toolbar-right">
          {onRequestNewFile && (
            <button type="button" className="btn btn--sm btn--ghost" onClick={onRequestNewFile}>
              <UploadSimple size={15} /> New PDF
            </button>
          )}
          <button
            type="button"
            className="btn btn--sm btn--dark"
            onClick={() => void handleExport()}
            disabled={exportStatus === 'processing'}
          >
            <DownloadSimple size={15} weight="bold" />
            {exportStatus === 'processing' ? 'Exporting…' : exportStatus === 'done' ? 'Downloaded' : 'Download PDF'}
          </button>
        </div>
      </header>

      {exportError && <div className="controls__error pdf-editor-studio__export-error">{exportError}</div>}

      <div className="pdf-editor-studio__body">
        <aside className="pdf-editor-studio__pages" aria-label="Pages">
          <p className="pdf-editor-studio__aside-title">Pages</p>
          <div className="pdf-editor-studio__page-list">
            {pages.map((item) => {
              const count = annotations.filter((ann) => ann.pageIndex === item.index).length;
              return (
                <button
                  key={item.index}
                  type="button"
                  className={`pdf-editor-studio__page-thumb${currentPage === item.index ? ' is-active' : ''}`}
                  onClick={() => { setCurrentPage(item.index); setSelectedId(null); }}
                >
                  <img src={item.previewUrl} alt={`Page ${item.index + 1}`} draggable={false} />
                  <span>Page {item.index + 1}{count > 0 ? ` · ${count}` : ''}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="pdf-editor-studio__canvas-wrap" aria-label="Page editor">
          <div className="pdf-editor-studio__canvas-head">
            <strong>Page {currentPage + 1}</strong>
            <span>Click anywhere to add text · drag to reposition</span>
          </div>
          {page && (
            <div
              ref={surfaceRef}
              className="pdf-editor-studio__surface"
              style={{ aspectRatio: String(page.aspect) }}
              onClick={onSurfaceClick}
            >
              <img src={page.previewUrl} alt="" draggable={false} />
              {pageAnnotations.map((ann) => {
                const font = cssFontForFamily(ann.fontFamily);
                return (
                  <span
                    key={ann.id}
                    className={`pdf-editor__text${selectedId === ann.id ? ' is-selected' : ''}`}
                    style={{
                      left: `${ann.x * 100}%`,
                      top: `${ann.y * 100}%`,
                      color: ann.color,
                      fontSize: `${ann.fontSize * displayScale}px`,
                      fontFamily: font.fontFamily,
                      fontWeight: font.fontWeight,
                      fontStyle: font.fontStyle,
                      background: ann.coverBackground ? '#fff' : undefined,
                    }}
                    onPointerDown={onTextPointerDown(ann.id)}
                    onPointerMove={onTextPointerMove}
                    onPointerUp={onTextPointerUp}
                  >
                    {ann.text || ' '}
                  </span>
                );
              })}
            </div>
          )}
        </section>

        <aside className="pdf-editor-studio__panel" aria-label="Text properties">
          <p className="pdf-editor-studio__aside-title">
            <TextT size={16} weight="fill" /> Text
          </p>

          {selected ? (
            <div className="pdf-editor-studio__form">
              <label className="field">
                <span className="field__label">Content</span>
                <textarea
                  className="field__input"
                  rows={3}
                  value={selected.text}
                  onChange={(e) => updateAnnotation(selected.id, { text: e.target.value })}
                />
              </label>

              <label className="field">
                <span className="field__label">Font</span>
                <select
                  className="field__input"
                  value={selected.fontFamily}
                  onChange={(e) => updateAnnotation(selected.id, { fontFamily: e.target.value as PdfTextAnnotation['fontFamily'] })}
                >
                  {PDF_FONT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field__label">Size ({selected.fontSize} pt)</span>
                <input
                  className="field__input"
                  type="range"
                  min={6}
                  max={96}
                  step={1}
                  value={selected.fontSize}
                  onChange={(e) => updateAnnotation(selected.id, { fontSize: Number(e.target.value) })}
                />
              </label>

              <label className="field">
                <span className="field__label">Color</span>
                <div className="pdf-editor-studio__colors">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`pdf-editor-studio__swatch${selected.color === color ? ' is-active' : ''}`}
                      style={{ background: color }}
                      onClick={() => updateAnnotation(selected.id, { color })}
                      aria-label={`Color ${color}`}
                    />
                  ))}
                  <input
                    type="color"
                    className="pdf-editor-studio__color-input"
                    value={selected.color}
                    onChange={(e) => updateAnnotation(selected.id, { color: e.target.value })}
                    aria-label="Custom color"
                  />
                </div>
              </label>

              <label className="field field--row">
                <input
                  type="checkbox"
                  checked={selected.coverBackground}
                  onChange={(e) => updateAnnotation(selected.id, { coverBackground: e.target.checked })}
                />
                <span>White background (cover existing text)</span>
              </label>

              <button type="button" className="btn btn--sm btn--ghost pdf-editor-studio__delete" onClick={() => removeAnnotation(selected.id)}>
                <Trash size={14} /> Remove text box
              </button>
            </div>
          ) : (
            <div className="pdf-editor-studio__form">
              <p className="pdf-editor-studio__hint">
                Select a text box on the page, or click the page to place a new one.
              </p>

              <p className="pdf-editor-studio__subhead">Defaults for new text</p>

              <label className="field">
                <span className="field__label">Font</span>
                <select
                  className="field__input"
                  value={defaults.fontFamily}
                  onChange={(e) => setDefaults((prev) => ({ ...prev, fontFamily: e.target.value as PdfTextDefaults['fontFamily'] }))}
                >
                  {PDF_FONT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field__label">Size ({defaults.fontSize} pt)</span>
                <input
                  className="field__input"
                  type="range"
                  min={6}
                  max={96}
                  step={1}
                  value={defaults.fontSize}
                  onChange={(e) => setDefaults((prev) => ({ ...prev, fontSize: Number(e.target.value) }))}
                />
              </label>

              <label className="field">
                <span className="field__label">Color</span>
                <div className="pdf-editor-studio__colors">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`pdf-editor-studio__swatch${defaults.color === color ? ' is-active' : ''}`}
                      style={{ background: color }}
                      onClick={() => setDefaults((prev) => ({ ...prev, color }))}
                      aria-label={`Color ${color}`}
                    />
                  ))}
                  <input
                    type="color"
                    className="pdf-editor-studio__color-input"
                    value={defaults.color}
                    onChange={(e) => setDefaults((prev) => ({ ...prev, color: e.target.value }))}
                    aria-label="Custom color"
                  />
                </div>
              </label>

              <label className="field field--row">
                <input
                  type="checkbox"
                  checked={defaults.coverBackground}
                  onChange={(e) => setDefaults((prev) => ({ ...prev, coverBackground: e.target.checked }))}
                />
                <span>White background on new text</span>
              </label>

              <button
                type="button"
                className="btn btn--sm"
                onClick={() => addAnnotation(0.1, 0.1)}
              >
                <Plus size={14} /> Add text box
              </button>
            </div>
          )}

          <p className="pdf-editor-studio__footnote muted">
            Your original PDF structure is preserved — vectors, images, and fonts stay intact.
            New text is added as a layer on export.
          </p>
        </aside>
      </div>
    </div>
  );
}
