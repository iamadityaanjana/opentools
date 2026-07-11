'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DotsThinking } from './Thinking';
import type { Params } from '../tools/ops';

interface Base {
  img: ImageData;
  dpi: number;
}

/**
 * Renders page 1 of the PDF once, then re-draws the watermark on a canvas
 * whenever the controls change. The placement mirrors `watermarkPdfText`
 * (centered, rotation-aware) so the preview matches the exported file.
 */
export function PdfWatermarkPreview({ file, params }: { file: File; params: Params }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseRef = useRef<Base | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  const draw = useCallback(() => {
    const base = baseRef.current;
    const canvas = canvasRef.current;
    if (!base || !canvas) return;
    canvas.width = base.img.width;
    canvas.height = base.img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(base.img, 0, 0);

    const text = String(params.text ?? '').trim();
    if (!text) return;
    const fontPx = (Number(params.fontSize) || 52) * (base.dpi / 72);
    const rotation = Number(params.rotation) || 0;

    ctx.save();
    ctx.globalAlpha = Math.max(0.05, Math.min(1, (Number(params.opacity) || 25) / 100));
    ctx.fillStyle = String(params.color ?? '#777777');
    ctx.font = `${fontPx}px Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(canvas.width / 2, canvas.height / 2);
    // Canvas y grows downward, so negate the (counter-clockwise) PDF angle.
    ctx.rotate((-rotation * Math.PI) / 180);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }, [params.text, params.fontSize, params.color, params.opacity, params.rotation]);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setError('');
    baseRef.current = null;
    void import('../lib/pdf').then(async ({ renderPdfPages }) => {
      const dpi = 110;
      const pages = await renderPdfPages(file, { dpi, range: '1' });
      if (cancelled || !pages.length) return;
      baseRef.current = { img: pages[0].imageData, dpi };
      draw();
    }).catch((reason) => {
      if (!cancelled) setError(reason instanceof Error ? reason.message : 'Could not render preview.');
    }).finally(() => {
      if (!cancelled) setBusy(false);
    });
    return () => { cancelled = true; };
  }, [file]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { draw(); }, [draw]);

  return (
    <section className="pdf-preview" aria-label="Watermark preview">
      <div className="pdf-preview__head">
        <strong>Live preview · page 1</strong>
        <span>The whole document gets the same watermark on export.</span>
      </div>
      {busy ? (
        <div className="pdf-preview__state"><DotsThinking label="Rendering preview" /></div>
      ) : error ? (
        <div className="controls__error">{error}</div>
      ) : (
        <div className="pdf-preview__stage"><canvas ref={canvasRef} /></div>
      )}
    </section>
  );
}
