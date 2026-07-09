import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  UploadSimple, DownloadSimple, Lightning, Trash, X, ArrowLeft, Copy, Check, ImageBroken, DotsSixVertical,
  ArrowClockwise, ArrowCounterClockwise, FlipHorizontal, FlipVertical,
} from '@phosphor-icons/react';
import { usePostHog } from '@posthog/react';
import { TopNav } from '../components/TopNav';
import { CropStage, type PreviewSource } from '../components/CropStage';
import { SplitEditor } from '../components/SplitEditor';
import { MergeCanvas } from '../components/MergeCanvas';
import { CollageEditor } from '../components/CollageEditor';
import { OverlayStage } from '../components/OverlayStage';
import { Dropdown } from '../components/Dropdown';
import { TOOL_BY_ID, CATEGORY_BY_ID, GROUP_HOME, GROUP_LABEL } from '../tools/catalog';
import { OPS, type Control, type Params, type OpResult } from '../tools/ops';
import { FORMAT_BY_ID, detectFormat } from '../formats/registry';
import { decodeToImageData } from '../lib/decode';
import { encodeImageData } from '../lib/encode';
import { formatBytes } from '../lib/convert';
import { StatusBadge, type JobStatus } from '../components/StatusBadge';
import { DotsThinking } from '../components/Thinking';

interface Job {
  id: string;
  file: File;
  previewUrl: string;
  status: JobStatus;
  result?: { url: string; blob: Blob; filename: string };
  error?: string;
}

const NO_PREVIEW = new Set(['compress', 'passthrough', 'convertJpeg', 'base64', 'datauri', 'colorPalette', 'colorCount', 'pdfToImages', 'extractImagesFromPdf', 'viewExif', 'changeDpi']);
const PREVIEW_MAX = 900;
const ENCODABLE = new Set(['jpeg', 'png', 'webp', 'avif']);

// Resolve a job's output format id, honouring "Keep original" (auto) by
// detecting the uploaded file's format and falling back to JPEG when the
// source can't be re-encoded (e.g. HEIC/TIFF/GIF).
function resolveFormat(fmt: string, file: File): string {
  if (fmt !== 'auto') return fmt;
  const det = detectFormat(file);
  return det && ENCODABLE.has(det.id) ? det.id : 'jpeg';
}

// Human action verb per op — some tools process/read rather than "convert".
const VERB: Record<string, string> = {
  compress: 'Compress', reduce: 'Compress', resize: 'Resize', crop: 'Crop', rotate: 'Rotate', flip: 'Flip',
  'canvas-size': 'Apply', text: 'Apply', watermark: 'Apply', passthrough: 'Process', viewExif: 'Read metadata',
  changeDpi: 'Set DPI', base64: 'Generate', datauri: 'Generate', colorPalette: 'Extract', colorCount: 'Count',
  gifToImages: 'Extract', gifResizer: 'Resize', gifOptimizer: 'Optimize', splitImage: 'Split',
};

let idSeq = 0;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  const { imageData } = await decodeToImageData(file);
  const c = document.createElement('canvas');
  c.width = imageData.width; c.height = imageData.height;
  c.getContext('2d')!.putImageData(imageData, 0, 0);
  return c;
}

async function canvasToBlob(canvas: HTMLCanvasElement, formatId: string, quality: number): Promise<Blob> {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return encodeImageData({ imageData, width: canvas.width, height: canvas.height }, formatId, { quality });
}

function ControlField({ ctrl, value, onChange }: { ctrl: Control; value: unknown; onChange: (v: string | number | boolean) => void }) {
  if (ctrl.type === 'range') {
    return (
      <label className="field">
        <span className="field__label">{ctrl.label} · {String(value)}{ctrl.suffix ?? ''}</span>
        <input className="range" type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={Number(value)} onChange={(e) => onChange(Number(e.target.value))} />
      </label>
    );
  }
  if (ctrl.type === 'number') {
    return (
      <label className="field">
        <span className="field__label">{ctrl.label}</span>
        <input className="select" type="number" min={ctrl.min} max={ctrl.max} value={Number(value)} onChange={(e) => onChange(Number(e.target.value))} />
      </label>
    );
  }
  if (ctrl.type === 'select') {
    return (
      <label className="field">
        <span className="field__label">{ctrl.label}</span>
        <Dropdown value={String(value)} options={ctrl.options} onChange={(v) => onChange(v)} ariaLabel={ctrl.label} />
      </label>
    );
  }
  if (ctrl.type === 'color') {
    return (
      <label className="field">
        <span className="field__label">{ctrl.label}</span>
        <input className="color-input" type="color" value={String(value)} onChange={(e) => onChange(e.target.value)} />
      </label>
    );
  }
  if (ctrl.type === 'checkbox') {
    return (
      <label className="field field--check">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        <span className="field__label">{ctrl.label}</span>
      </label>
    );
  }
  return (
    <label className="field field--grow">
      <span className="field__label">{ctrl.label}</span>
      <input className="select" type="text" value={String(value)} placeholder={ctrl.placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function CopyBox({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="copybox">
      <textarea readOnly value={text} className="copybox__area" />
      <button className="btn btn--dark btn--icon btn--sm" onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}>
        {done ? <Check size={14} weight="bold" /> : <Copy size={14} />} {done ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

interface ExifPayloadView {
  rows: { label: string; value: string }[];
  gps?: { lat: number; lon: number };
  raw: Record<string, unknown>;
  empty: boolean;
}

function ExifResult({ json }: { json: string }) {
  const [done, setDone] = useState(false);
  let data: ExifPayloadView | null = null;
  try { data = JSON.parse(json) as ExifPayloadView; } catch { data = null; }
  if (!data) return <div className="job__error">Could not read metadata.</div>;
  if (data.empty || data.rows.length === 0) {
    return <div className="exif-empty">No EXIF / metadata found in this image.</div>;
  }
  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data!.raw, null, 2));
    setDone(true); setTimeout(() => setDone(false), 1500);
  };
  return (
    <div className="exif">
      <table className="exif__table">
        <tbody>
          {data.rows.map((r, i) => (
            <tr key={i}>
              <th>{r.label}</th>
              <td>{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="exif__actions">
        {data.gps && (
          <a className="btn btn--icon btn--sm" href={`https://www.google.com/maps?q=${data.gps.lat},${data.gps.lon}`} target="_blank" rel="noopener noreferrer">
            View location on map
          </a>
        )}
        <button className="btn btn--dark btn--icon btn--sm" onClick={copyJson}>
          {done ? <Check size={14} weight="bold" /> : <Copy size={14} />} {done ? 'Copied' : 'Copy as JSON'}
        </button>
      </div>
    </div>
  );
}

export default function ToolRunner() {
  const posthog = usePostHog();
  const { toolId } = useParams();
  const tool = toolId ? TOOL_BY_ID.get(toolId) : undefined;
  const op = tool?.op ? OPS[tool.op] : undefined;

  const defaults = useMemo<Params>(() => {
    const p: Params = {};
    op?.controls.forEach((c) => { p[c.key] = c.def; });
    return p;
  }, [op]);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [paramsById, setParamsById] = useState<Record<string, Params>>({});
  const [comboParams, setComboParams] = useState<Params>(defaults);
  const [combined, setCombined] = useState<OpResult & { url?: string; blob?: Blob; filename?: string; status?: JobStatus; error?: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [previewSrc, setPreviewSrc] = useState<PreviewSource | null>(null);
  const [previewSrcs, setPreviewSrcs] = useState<PreviewSource[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [gifFrames, setGifFrames] = useState<{ url: string; delayMs: number }[]>([]);
  const [gifBusy, setGifBusy] = useState(false);
  const cacheRef = useRef<Map<string, PreviewSource>>(new Map());
  const initedRef = useRef<Set<string>>(new Set());
  const reorderFrom = useRef<number>(-1);

  const isCombine = tool?.mode === 'combine';
  const isCrop = tool?.op === 'crop';
  const isSplit = tool?.op === 'splitImage';
  const isZip = tool?.op === 'zipImages';
  const isMerge = tool?.op === 'merge';
  const isCollage = tool?.op === 'collage';
  const isRotate = tool?.op === 'rotate';
  const isFlip = tool?.op === 'flip';
  const isText = tool?.op === 'text';
  const isWatermark = tool?.op === 'watermark';
  const isPdf = tool?.op === 'imagesToPdf';
  const isGif = tool?.op === 'gifToImages';
  // Tools that take a raw GIF file and show a decoded frame strip instead of a live canvas preview.
  const isGifInput = isGif || tool?.op === 'gifResizer' || tool?.op === 'gifOptimizer';
  // Combine tool that produces an animated GIF (export is animated; no cheap live canvas).
  const isGifCombine = tool?.op === 'imagesToGif';
  // Tools that take a raw PDF file (rendered pages / extracted images -> ZIP).
  const isPdfInput = tool?.op === 'pdfToImages' || tool?.op === 'extractImagesFromPdf';
  const previewable = !!tool?.op && !NO_PREVIEW.has(tool.op) && !isGifInput;

  // When switching to a different tool, drop everything from the previous one.
  useEffect(() => {
    setJobs((prev) => {
      prev.forEach((j) => { URL.revokeObjectURL(j.previewUrl); if (j.result) URL.revokeObjectURL(j.result.url); });
      return [];
    });
    setActiveId('');
    setParamsById({});
    setComboParams(defaults);
    setCombined(null);
    setPreviewUrl(null);
    setPreviewSrc(null);
    setPreviewSrcs([]);
    setGifFrames([]);
    cacheRef.current.clear();
    initedRef.current.clear();
  }, [toolId, defaults]);

  // Reflect the current tool in the browser tab title.
  useEffect(() => {
    if (tool) {
      document.title = `${tool.name} · toolbox`;
      posthog?.capture('tool_opened', {
        tool_id: tool.id,
        tool_name: tool.name,
        tool_category: tool.categoryId,
      });
    }
    return () => { document.title = 'toolbox'; };
  }, [tool]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeJob = useMemo(() => jobs.find((j) => j.id === activeId) ?? jobs[0], [jobs, activeId]);
  const activeParams = isCombine ? comboParams : (activeJob ? paramsById[activeJob.id] ?? defaults : defaults);

  const outFormat = useMemo(() => {
    if (!op) return 'png';
    if (op.outputFormat) return op.outputFormat;
    if (activeParams.format) return String(activeParams.format);
    return 'png';
  }, [op, activeParams.format]);

  const getPreviewSource = useCallback(async (file: File): Promise<PreviewSource> => {
    const key = `${file.name}:${file.size}:${file.lastModified}`;
    const cached = cacheRef.current.get(key);
    if (cached) return cached;
    const full = await fileToCanvas(file);
    const s = Math.min(1, PREVIEW_MAX / Math.max(full.width, full.height));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(full.width * s));
    c.height = Math.max(1, Math.round(full.height * s));
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(full, 0, 0, c.width, c.height);
    const src: PreviewSource = { canvas: c, fullW: full.width, fullH: full.height };
    cacheRef.current.set(key, src);
    return src;
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const newJobs: Job[] = arr.map((file) => ({ id: `j-${idSeq++}`, file, previewUrl: URL.createObjectURL(file), status: 'pending' as JobStatus }));
    setParamsById((prev) => {
      const next = { ...prev };
      newJobs.forEach((j) => { next[j.id] = { ...defaults }; });
      return next;
    });
    setJobs((prev) => [...newJobs, ...prev]);
    setActiveId((cur) => cur || newJobs[0]?.id || '');
  }, [defaults]);

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }, [addFiles]);

  // keep activeId valid
  useEffect(() => {
    if (jobs.length && !jobs.some((j) => j.id === activeId)) setActiveId(jobs[0].id);
  }, [jobs, activeId]);

  // build active preview source (each) / all preview sources (combine)
  useEffect(() => {
    if (!previewable) return;
    let cancelled = false;
    (async () => {
      try {
        if (isCombine) {
          const srcs = await Promise.all(jobs.map((j) => getPreviewSource(j.file)));
          if (!cancelled) setPreviewSrcs(srcs);
        } else if (activeJob) {
          const src = await getPreviewSource(activeJob.file);
          if (!cancelled) setPreviewSrc(src);
        } else {
          setPreviewSrc(null); setPreviewUrl(null);
        }
      } catch { /* best-effort */ }
    })();
    return () => { cancelled = true; };
  }, [jobs, activeJob, isCombine, previewable, getPreviewSource]);

  // auto-init dimension params for the active image (once per job)
  useEffect(() => {
    if (isCombine || !previewSrc || !tool || !activeJob) return;
    if (initedRef.current.has(activeJob.id)) return;
    initedRef.current.add(activeJob.id);
    if (isCrop) {
      setParamsById((prev) => ({ ...prev, [activeJob.id]: { ...(prev[activeJob.id] ?? defaults), x: Math.round(previewSrc.fullW * 0.1), y: Math.round(previewSrc.fullH * 0.1), w: Math.round(previewSrc.fullW * 0.8), h: Math.round(previewSrc.fullH * 0.8) } }));
    } else if (tool.op === 'resize' || tool.op === 'canvas-size') {
      setParamsById((prev) => ({ ...prev, [activeJob.id]: { ...(prev[activeJob.id] ?? defaults), width: previewSrc.fullW, height: previewSrc.fullH } }));
    } else if (isText || isWatermark) {
      setParamsById((prev) => ({ ...prev, [activeJob.id]: { ...(prev[activeJob.id] ?? defaults), nx: 0.5, ny: 0.5 } }));
    } else if (isSplit) {
      setParamsById((prev) => ({ ...prev, [activeJob.id]: { ...(prev[activeJob.id] ?? defaults), xs: '[0.5]', ys: '[0.5]' } }));
    }
  }, [previewSrc, tool, activeJob, isCombine, isCrop, isText, isWatermark, isSplit, defaults]);

  // live preview (debounced)
  useEffect(() => {
    if (!previewable || isCrop || isSplit) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        if (isCombine) {
          if (isPdf || isGifCombine || isMerge || isCollage || previewSrcs.length === 0 || !op?.runCombine) return;
          setPreviewBusy(true);
          const res = await op.runCombine(previewSrcs.map((s) => s.canvas), comboParams);
          if (!cancelled && res.canvas) setPreviewUrl(res.canvas.toDataURL('image/png'));
        } else {
          if (!previewSrc || !op?.run) return;
          setPreviewBusy(true);
          const res = await op.run(previewSrc.canvas, activeParams);
          if (!cancelled && res.canvas) setPreviewUrl(res.canvas.toDataURL('image/png'));
        }
      } catch { /* ignore */ } finally {
        if (!cancelled) setPreviewBusy(false);
      }
    }, 120);
    return () => { cancelled = true; clearTimeout(t); };
  }, [activeParams, comboParams, previewSrc, previewSrcs, previewable, isCrop, isSplit, isCombine, isPdf, isGifCombine, isMerge, isCollage, op]);

  // GIF frame-strip preview: decode the active GIF into small thumbnails.
  useEffect(() => {
    if (!isGifInput || !activeJob) { setGifFrames([]); return; }
    let cancelled = false;
    const jobFile = activeJob.file;
    setGifBusy(true);
    setGifFrames([]);
    (async () => {
      try {
        const { decodeGifFrames } = await import('../lib/gif');
        const frames = await decodeGifFrames(jobFile);
        if (cancelled) return;
        const THUMB = 72;
        const thumbs = frames.map((f) => {
          const s = Math.min(1, THUMB / Math.max(f.width, f.height));
          const c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(f.width * s));
          c.height = Math.max(1, Math.round(f.height * s));
          const cx = c.getContext('2d')!;
          const full = document.createElement('canvas');
          full.width = f.width; full.height = f.height;
          full.getContext('2d')!.putImageData(f.imageData, 0, 0);
          cx.imageSmoothingQuality = 'high';
          cx.drawImage(full, 0, 0, c.width, c.height);
          return { url: c.toDataURL('image/png'), delayMs: f.delayMs };
        });
        if (!cancelled) setGifFrames(thumbs);
      } catch {
        if (!cancelled) setGifFrames([]);
      } finally {
        if (!cancelled) setGifBusy(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isGifInput, activeJob]);

  // ---- param setters ----
  const setParam = useCallback((key: string, val: string | number | boolean) => {
    if (isCombine) { setComboParams((p) => ({ ...p, [key]: val })); return; }
    if (!activeJob) return;
    if (tool?.op === 'resize' && key === 'unit') {
      const patch: Params = val === 'percent'
        ? { unit: 'percent', width: 100, height: 100, keepAspect: true }
        : { unit: 'px', width: previewSrc?.fullW ?? 800, height: previewSrc?.fullH ?? 600, keepAspect: true };
      setParamsById((prev) => ({ ...prev, [activeJob.id]: { ...(prev[activeJob.id] ?? defaults), ...patch } }));
      return;
    }
    setParamsById((prev) => ({ ...prev, [activeJob.id]: { ...(prev[activeJob.id] ?? defaults), [key]: val } }));
  }, [isCombine, activeJob, tool, previewSrc, defaults]);

  const patchCrop = useCallback((patch: Partial<Params>) => {
    if (!activeJob) return;
    setParamsById((prev) => ({ ...prev, [activeJob.id]: { ...(prev[activeJob.id] ?? defaults), ...patch } as Params }));
  }, [activeJob, defaults]);

  const rotateStep = useCallback((dir: 1 | -1) => {
    const order = [90, 180, 270];
    let idx = order.indexOf(Number(activeParams.angle ?? 90));
    if (idx < 0) idx = 0;
    idx = (idx + dir + order.length) % order.length;
    setParam('angle', String(order[idx]));
  }, [activeParams.angle, setParam]);

  const quality = (Number(activeParams.quality ?? 90)) / 100;

  const runEach = useCallback(async () => {
    if (!op?.run && !op?.runFile) return;
    for (const job of jobs.filter((j) => j.status === 'pending' || j.status === 'failed')) {
      const jp = paramsById[job.id] ?? defaults;
      const fmt = op.outputFormat || resolveFormat(jp.format ? String(jp.format) : 'png', job.file);
      const q = (Number(jp.quality ?? 90)) / 100;
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: 'working', error: undefined } : j)));
      // Special file-input ops (e.g. GIF -> frames ZIP) work off the raw File.
      if (op.runFile) {
        try {
          const res = await op.runFile(job.file, jp);
          const base = job.file.name.replace(/\.[^.]+$/, '') || 'gif';
          if (res.text !== undefined) {
            // Text-producing file op (e.g. EXIF read) — no download, shown inline.
            setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: 'success', error: res.text } : j)));
          } else if (res.blob) {
            const blob = res.blob;
            const filename = res.filename ?? `${base}-frames.zip`;
            setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: 'success', result: { blob, url: URL.createObjectURL(blob), filename } } : j)));
          }
        } catch (e) {
          setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: 'failed', error: e instanceof Error ? e.message : String(e) } : j)));
          posthog?.captureException(e instanceof Error ? e : new Error(String(e)), { tool_id: toolId });
        }
        await sleep(10);
        continue;
      }
      if (!op.run) continue;
      try {
        const canvas = await fileToCanvas(job.file);
        const res = await op.run(canvas, jp);
        const base = job.file.name.replace(/\.[^.]+$/, '') || 'image';
        if (res.text !== undefined) {
          const blob = new Blob([res.text], { type: 'text/plain' });
          setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: 'success', result: { blob, url: URL.createObjectURL(blob), filename: `${base}.txt` }, error: res.text } : j)));
        } else if (res.swatches) {
          setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: 'success', error: res.swatches!.join('  ') } : j)));
        } else if (res.canvas) {
          const blob = await canvasToBlob(res.canvas, fmt, q);
          const ext = FORMAT_BY_ID.get(fmt)?.ext ?? 'png';
          setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: 'success', result: { blob, url: URL.createObjectURL(blob), filename: `${base}.${ext}` } } : j)));
        }
      } catch (e) {
        setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: 'failed', error: e instanceof Error ? e.message : String(e) } : j)));
        posthog?.captureException(e instanceof Error ? e : new Error(String(e)), { tool_id: toolId });
      }
      await sleep(10);
    }
  }, [op, jobs, paramsById, defaults, posthog, toolId]);

  const runCombine = useCallback(async () => {
    if ((!op?.runCombine && !op?.runCombineFiles) || jobs.length === 0) return;
    setCombined({ status: 'working' });
    try {
      // File-input combine ops (e.g. zip-multiple-images) work off raw Files so
      // original bytes can be preserved without re-encoding.
      const res = op.runCombineFiles
        ? await op.runCombineFiles(jobs.map((j) => j.file), comboParams)
        : await op.runCombine!(await Promise.all(jobs.map((j) => fileToCanvas(j.file))), comboParams);
      if (res.blob) {
        const filename = res.filename ?? `${tool!.id}.${isPdf ? 'pdf' : 'png'}`;
        setCombined({ status: 'success', blob: res.blob, url: URL.createObjectURL(res.blob), filename });
      } else if (res.canvas) {
        const fmt = outFormat === 'auto' ? 'png' : outFormat;
        const blob = await canvasToBlob(res.canvas, fmt, quality);
        const ext = FORMAT_BY_ID.get(fmt)?.ext ?? 'png';
        setCombined({ status: 'success', blob, url: URL.createObjectURL(blob), filename: `${tool!.id}.${ext}` });
      }
    } catch (e) {
      setCombined({ status: 'failed', error: e instanceof Error ? e.message : String(e) });
      posthog?.captureException(e instanceof Error ? e : new Error(String(e)), { tool_id: toolId });
    }
  }, [op, jobs, comboParams, outFormat, quality, tool, isPdf, posthog, toolId]);

  const convert = isCombine ? runCombine : runEach;

  const handleConvert = useCallback(() => {
    posthog?.capture('tool_run', {
      tool_id: toolId,
      tool_name: tool?.name,
      file_count: jobs.length,
      is_combine_mode: isCombine,
    });
    convert();
  }, [posthog, toolId, tool, jobs.length, isCombine, convert]);

  const downloadAll = useCallback(async () => {
    for (const j of jobs) {
      if (!j.result) continue;
      const a = document.createElement('a'); a.href = j.result.url; a.download = j.result.filename; document.body.appendChild(a); a.click(); a.remove(); await sleep(150);
    }
  }, [jobs]);

  const removeJob = useCallback((id: string) => {
    setJobs((prev) => {
      const j = prev.find((x) => x.id === id);
      if (j) { URL.revokeObjectURL(j.previewUrl); if (j.result) URL.revokeObjectURL(j.result.url); }
      return prev.filter((x) => x.id !== id);
    });
    initedRef.current.delete(id);
  }, []);

  const clearAll = useCallback(() => {
    jobs.forEach((j) => { URL.revokeObjectURL(j.previewUrl); if (j.result) URL.revokeObjectURL(j.result.url); });
    setJobs([]); setCombined(null); setPreviewUrl(null); setPreviewSrc(null); setPreviewSrcs([]); initedRef.current.clear();
  }, [jobs]);

  const reorder = useCallback((to: number) => {
    const from = reorderFrom.current;
    if (from < 0 || from === to) return;
    setJobs((prev) => { const next = [...prev]; const [m] = next.splice(from, 1); next.splice(to, 0, m); return next; });
    reorderFrom.current = -1;
  }, []);

  if (!tool || !op) {
    return (
      <div className="page page--wide">
        <TopNav />
        <p className="tools-empty">Tool not found. <Link to="/image">Back to image tools</Link>.</p>
      </div>
    );
  }

  const cat = CATEGORY_BY_ID.get(tool.categoryId)!;
  const Icon = cat.icon;
  const isTextTool = ['base64', 'datauri', 'colorCount'].includes(tool.op!);
  const isExif = tool.op === 'viewExif';
  const isSwatchTool = tool.op === 'colorPalette';
  const pendingCount = jobs.filter((j) => j.status === 'pending').length;
  const isWorking = jobs.some((j) => j.status === 'working') || combined?.status === 'working';
  const hasFiles = jobs.length > 0;
  const verb = VERB[tool.op!] ?? 'Convert';
  const useOverlay = (isText || (isWatermark && String(activeParams.style) === 'single')) && !!previewSrc;

  const controlsBlock = op.controls.length > 0 && (
    <div className="converter__controls converter__controls--stack">
      {op.controls.map((c) => (
        <ControlField key={c.key} ctrl={c} value={activeParams[c.key]} onChange={(v) => setParam(c.key, v)} />
      ))}
    </div>
  );

  const actionsBlock = (
    <div className="controls__actions controls__actions--full">
      <button className="btn btn--dark btn--icon" onClick={handleConvert} disabled={!hasFiles || isWorking || (!isCombine && pendingCount === 0)}>
        <Lightning size={16} weight="fill" /> {isWorking ? 'Working…' : isCombine ? 'Generate' : `${verb}${pendingCount ? ` ${pendingCount}` : ''}`}
      </button>
      {!isCombine && jobs.filter((j) => j.result).length > 1 && (
        <button className="btn btn--icon" onClick={downloadAll} disabled={isWorking}><DownloadSimple size={15} weight="bold" /> All</button>
      )}
      {hasFiles && <button className="btn btn--ghost btn--icon" onClick={clearAll} disabled={isWorking}><Trash size={15} /> Clear</button>}
    </div>
  );

  return (
    <div className="page page--wide">
      <TopNav />

      <nav className="crumbs crumbs--sub">
        <Link className="crumbs__link" to={GROUP_HOME[cat.group]}>{GROUP_LABEL[cat.group]}</Link>
        <span className="crumbs__sep">/</span>
        <span className="crumbs__link">{cat.label}</span>
        <span className="crumbs__sep">/</span>
        <span className="crumbs__current">{tool.name}</span>
      </nav>

      <div className="tool-hero">
        <div className="tool-hero__icon"><Icon size={26} weight="fill" /></div>
        <div>
          <h1 className="tool-title">{tool.name}</h1>
          <p className="tool-desc">{tool.blurb ?? `${isCombine ? 'Combine your images' : 'Apply this tool to one or many images'} — runs fully on-device.`}</p>
        </div>
        <Link className="btn btn--pill btn--icon" to={GROUP_HOME[cat.group]}><ArrowLeft size={15} weight="bold" /> {GROUP_LABEL[cat.group]}</Link>
      </div>

      {/* Upload box */}
      <div
        className={`dropzone ${dragging ? 'dropzone--active' : ''} ${hasFiles ? 'dropzone--compact' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button" tabIndex={0}
      >
        <input ref={inputRef} type="file" multiple accept={isPdfInput ? 'application/pdf,.pdf' : 'image/*,.heic,.heif,.tif,.tiff,.avif,.svg,.ico,.jp2'} hidden onChange={(e) => e.target.files && addFiles(e.target.files)} />
        <div className="dropzone__inner">
          <UploadSimple size={hasFiles ? 22 : 34} weight="light" className="dropzone__icon" />
          <p className="dropzone__title">{hasFiles ? (isPdfInput ? 'Add more PDFs' : 'Add more images') : isPdfInput ? <>Drop a PDF here <span className="muted">or click to browse</span></> : <>Drop image{isCombine ? 's' : '(s)'} here <span className="muted">or click to browse</span></>}</p>
          {!hasFiles && <p className="dropzone__hint">{isPdfInput ? 'Runs fully on-device — your PDF never leaves this browser.' : isCombine ? 'All images combine into one output.' : 'Editor & live preview appear below once you add an image.'}</p>}
        </div>
      </div>

      {/* Editor appears only once there's an image */}
      {hasFiles && (
        <div className="editor2">
          {/* image selector (each-mode, >1) */}
          {!isCombine && jobs.length > 1 && (
            <div className="imgselect">
              {jobs.map((j) => (
                <button
                  key={j.id}
                  className={`imgselect__item ${j.id === activeJob?.id ? 'is-active' : ''}`}
                  onClick={() => setActiveId(j.id)}
                  title={j.file.name}
                >
                  <img src={j.previewUrl} alt="" />
                  <span className="imgselect__x" onClick={(e) => { e.stopPropagation(); removeJob(j.id); }}><X size={11} /></span>
                </button>
              ))}
            </div>
          )}

          <div className={`editor2__body ${previewable || isGifInput ? 'editor2__body--split' : ''}`}>
            {/* GIF frame-strip preview */}
            {isGifInput && (
              <div className="editor__preview">
                <div className="preview-head">
                  <span className="preview-head__label">Frames {gifBusy && <span className="preview-dot" />}</span>
                  <span className="preview-head__note">{gifFrames.length ? `${gifFrames.length} frame${gifFrames.length === 1 ? '' : 's'} · ${isGif ? 'exported as ZIP' : 'timing & loop preserved'}` : 'decoding…'}</span>
                </div>
                {gifBusy && gifFrames.length === 0 ? (
                  <div className="preview-empty">Decoding frames…</div>
                ) : gifFrames.length ? (
                  <div className="gif-strip">
                    {gifFrames.map((f, i) => (
                      <div className="gif-strip__cell" key={i}>
                        <img src={f.url} alt={`Frame ${i + 1}`} />
                        <span className="gif-strip__label">{i + 1}{f.delayMs ? ` · ${f.delayMs}ms` : ''}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="preview-empty">Couldn’t read frames from this file.</div>
                )}
              </div>
            )}
            {/* Preview / stage */}
            {previewable && (
              <div className="editor__preview">
                <div className="preview-head">
                  <span className="preview-head__label">Live preview {previewBusy && <span className="preview-dot" />}</span>
                  <span className="preview-head__note">reduced-res preview · full quality on convert</span>
                </div>
                {(isRotate || isFlip) && (
                  <div className="preview-tools">
                    {isRotate && (
                      <>
                        <button className="ptool" onClick={() => rotateStep(-1)} title="Rotate 90° left"><ArrowCounterClockwise size={16} weight="bold" /></button>
                        <button className="ptool" onClick={() => rotateStep(1)} title="Rotate 90° right"><ArrowClockwise size={16} weight="bold" /></button>
                        <span className="ptool__val">{String(activeParams.angle ?? 90)}°</span>
                      </>
                    )}
                    {isFlip && (
                      <>
                        <button className={`ptool ${activeParams.axis === 'h' ? 'is-active' : ''}`} onClick={() => setParam('axis', 'h')} title="Flip horizontal"><FlipHorizontal size={16} weight="bold" /></button>
                        <button className={`ptool ${activeParams.axis === 'v' ? 'is-active' : ''}`} onClick={() => setParam('axis', 'v')} title="Flip vertical"><FlipVertical size={16} weight="bold" /></button>
                      </>
                    )}
                  </div>
                )}
                {isCrop && previewSrc ? (
                  <CropStage src={previewSrc} params={activeParams} setParam={patchCrop} />
                ) : useOverlay && previewSrc ? (
                  <OverlayStage src={previewSrc} params={activeParams} setParam={patchCrop} />
                ) : isSplit && previewSrc ? (
                  <SplitEditor src={previewSrc} params={activeParams} setParam={setParam} />
                ) : isMerge ? (
                  <div className="combine-editor">
                    {previewSrcs.length > 0 && <MergeCanvas srcs={previewSrcs} params={comboParams} setParam={setParam} />}
                    <div className="reorder" onDragOver={(e) => e.preventDefault()}>
                      {jobs.map((j, i) => (
                        <div key={j.id} className="reorder__item" draggable onDragStart={() => { reorderFrom.current = i; }} onDrop={() => reorder(i)} title="Drag to reorder">
                          <DotsSixVertical size={14} className="reorder__grip" />
                          <img className="reorder__thumb" src={j.previewUrl} alt="" />
                          <span className="reorder__idx">{i + 1}</span>
                          <button className="job__remove" onClick={() => removeJob(j.id)} aria-label="Remove"><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                    <p className="dropzone__hint">Set canvas size &amp; columns in the controls, then drag to move and drag a corner to resize.</p>
                  </div>
                ) : isCollage ? (
                  <div className="combine-editor">
                    {previewSrcs.length > 0 && <CollageEditor srcs={previewSrcs} params={comboParams} setParam={setParam} />}
                    <div className="reorder" onDragOver={(e) => e.preventDefault()}>
                      {jobs.map((j, i) => (
                        <div key={j.id} className="reorder__item" draggable onDragStart={() => { reorderFrom.current = i; }} onDrop={() => reorder(i)} title="Drag to reorder">
                          <DotsSixVertical size={14} className="reorder__grip" />
                          <img className="reorder__thumb" src={j.previewUrl} alt="" />
                          <span className="reorder__idx">{i + 1}</span>
                          <button className="job__remove" onClick={() => removeJob(j.id)} aria-label="Remove"><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : isCombine ? (
                  <div className="combine-editor">
                    <div className="reorder" onDragOver={(e) => e.preventDefault()}>
                      {jobs.map((j, i) => (
                        <div key={j.id} className="reorder__item" draggable onDragStart={() => { reorderFrom.current = i; }} onDrop={() => reorder(i)} title="Drag to reorder">
                          <DotsSixVertical size={14} className="reorder__grip" />
                          <img className="reorder__thumb" src={j.previewUrl} alt="" />
                          <span className="reorder__idx">{i + 1}</span>
                          <button className="job__remove" onClick={() => removeJob(j.id)} aria-label="Remove"><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                    {isPdf ? (
                      <p className="dropzone__hint">Drag thumbnails to set page order, then Generate the PDF.</p>
                    ) : isGifCombine ? (
                      <p className="dropzone__hint">Drag thumbnails to set frame order, then Generate. The export is an animated GIF.</p>
                    ) : isZip ? (
                      <p className="dropzone__hint">Drag to reorder, then Generate a single ZIP. Original bytes are kept unless you enable re-encoding.</p>
                    ) : previewUrl ? (
                      <img className="preview-img" src={previewUrl} alt="preview" />
                    ) : null}
                  </div>
                ) : previewUrl ? (
                  <img className="preview-img" src={previewUrl} alt="preview" />
                ) : (
                  <div className="preview-empty">Rendering…</div>
                )}
              </div>
            )}

            {/* Controls (below the upload box) */}
            <div className="editor2__controls">
              {!isCombine && jobs.length > 1 && activeJob && (
                <div className="editor2__active">Editing: <strong>{activeJob.file.name}</strong></div>
              )}
              {controlsBlock}
              {actionsBlock}
            </div>
          </div>
        </div>
      )}

      {isCombine && combined && (
        <div className="combine-result">
          <StatusBadge status={combined.status ?? 'pending'} />
          {combined.error && <span className="job__error">{combined.error}</span>}
          {combined.url && (
            <div className="job__result">
              {combined.filename && /\.(png|jpe?g|webp|avif|gif|bmp)$/i.test(combined.filename) ? <img className="thumb thumb--lg" src={combined.url} alt="" /> : null}
              <span className="job__size job__size--out">{combined.blob && formatBytes(combined.blob.size)}</span>
              <a className="btn btn--dark btn--icon" href={combined.url} download={combined.filename} onClick={() => posthog?.capture('tool_output_downloaded', { tool_id: toolId, tool_name: tool?.name, download_type: 'combine' })}><DownloadSimple size={15} weight="bold" /> Download</a>
            </div>
          )}
        </div>
      )}

      {!isCombine && (
        <ul className="joblist">
          <AnimatePresence initial={false}>
            {jobs.map((job) => (
              <motion.li key={job.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="job">
                <JobThumb job={job} />
                <div className="job__main">
                  <div className="job__name" title={job.file.name}>{job.file.name}</div>
                  <div className="job__meta"><span className="chip">{formatBytes(job.file.size)}</span></div>
                  {job.status === 'working' && <div className="job__working"><DotsThinking label={tool.name} /></div>}
                  {isSwatchTool && job.error && job.status === 'success' && (
                    <div className="swatches">{job.error.split('  ').map((hex, i) => <span key={i} className="swatch" style={{ background: hex }} title={hex}>{hex}</span>)}</div>
                  )}
                  {isExif && job.status === 'success' && job.error && <ExifResult json={job.error} />}
                  {isTextTool && job.status === 'success' && job.error && <CopyBox text={job.error} />}
                  {job.error && job.status === 'failed' && <div className="job__error">{job.error}</div>}
                </div>
                <div className="job__side">
                  <StatusBadge status={job.status} />
                  <div className="job__side-actions">
                    {job.result && !isTextTool && (
                      <a className="btn btn--dark btn--icon btn--sm" href={job.result.url} download={job.result.filename} onClick={() => posthog?.capture('tool_output_downloaded', { tool_id: toolId, tool_name: tool?.name, download_type: 'single' })}><DownloadSimple size={14} weight="bold" /> Download</a>
                    )}
                    {job.status !== 'working' && <button className="job__remove" onClick={() => removeJob(job.id)} aria-label="Remove"><X size={14} /></button>}
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <footer className="footer"><span>Part of toolbox · your files never leave this device.</span></footer>
    </div>
  );
}

function JobThumb({ job }: { job: Job }) {
  const [broken, setBroken] = useState(false);
  const src = job.result?.url && job.result.filename.match(/\.(png|jpe?g|webp|avif|gif|bmp)$/i) ? job.result.url : job.previewUrl;
  if (broken) return <div className="thumb thumb--fallback"><ImageBroken size={20} /></div>;
  return <img className="thumb" src={src} alt="" loading="lazy" onError={() => setBroken(true)} />;
}
