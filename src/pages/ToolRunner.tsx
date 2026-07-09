import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  UploadSimple, DownloadSimple, Lightning, Trash, X, ArrowLeft, Copy, Check, ImageBroken, DotsSixVertical,
} from '@phosphor-icons/react';
import { TopNav } from '../components/TopNav';
import { CropStage, type PreviewSource } from '../components/CropStage';
import { TOOL_BY_ID, CATEGORY_BY_ID, GROUP_HOME, GROUP_LABEL } from '../tools/catalog';
import { OPS, type Control, type Params, type OpResult } from '../tools/ops';
import { FORMAT_BY_ID } from '../formats/registry';
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

// Tools that produce no visual output → no live preview.
const NO_PREVIEW = new Set(['compress', 'passthrough', 'convertJpeg', 'base64', 'datauri', 'colorPalette', 'colorCount']);
const PREVIEW_MAX = 900;

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
        <select className="select" value={String(value)} onChange={(e) => onChange(e.target.value)}>
          {ctrl.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
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

export default function ToolRunner() {
  const { toolId } = useParams();
  const tool = toolId ? TOOL_BY_ID.get(toolId) : undefined;
  const op = tool?.op ? OPS[tool.op] : undefined;

  const [params, setParams] = useState<Params>(() => {
    const p: Params = {};
    op?.controls.forEach((c) => { p[c.key] = c.def; });
    return p;
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [combined, setCombined] = useState<OpResult & { url?: string; blob?: Blob; filename?: string; status?: JobStatus; error?: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ---- Preview state ----
  const [previewSrc, setPreviewSrc] = useState<PreviewSource | null>(null);
  const [previewSrcs, setPreviewSrcs] = useState<PreviewSource[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const cacheRef = useRef<Map<string, PreviewSource>>(new Map());
  const initedRef = useRef<string>('');
  const reorderFrom = useRef<number>(-1);

  const isCombine = tool?.mode === 'combine';
  const isCrop = tool?.op === 'crop';
  const isPdf = tool?.op === 'imagesToPdf';
  const previewable = !!tool?.op && !NO_PREVIEW.has(tool.op);

  const outFormat = useMemo(() => {
    if (!op) return 'png';
    if (op.outputFormat) return op.outputFormat;
    if (params.format) return String(params.format);
    return 'png';
  }, [op, params.format]);

  const setP = useCallback((k: string, v: string | number | boolean) => setParams((prev) => ({ ...prev, [k]: v })), []);
  const patchP = useCallback((patch: Partial<Params>) => setParams((prev) => ({ ...prev, ...patch } as Params)), []);

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
    setJobs((prev) => [...newJobs, ...prev]);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }, [addFiles]);

  const quality = (Number(params.quality ?? 90)) / 100;

  // ---- Build preview sources when files/order change ----
  useEffect(() => {
    if (!previewable) return;
    let cancelled = false;
    (async () => {
      try {
        if (isCombine) {
          const srcs = await Promise.all(jobs.map((j) => getPreviewSource(j.file)));
          if (!cancelled) setPreviewSrcs(srcs);
        } else if (jobs.length > 0) {
          const src = await getPreviewSource(jobs[jobs.length - 1].file);
          if (!cancelled) setPreviewSrc(src);
        } else {
          setPreviewSrc(null);
          setPreviewUrl(null);
        }
      } catch { /* preview is best-effort */ }
    })();
    return () => { cancelled = true; };
  }, [jobs, isCombine, previewable, getPreviewSource]);

  // ---- Auto-init dimension params from the loaded image ----
  useEffect(() => {
    if (!previewSrc || !tool) return;
    const key = `${tool.op}:${previewSrc.fullW}x${previewSrc.fullH}`;
    if (initedRef.current === key) return;
    initedRef.current = key;
    if (isCrop) {
      patchP({ x: Math.round(previewSrc.fullW * 0.1), y: Math.round(previewSrc.fullH * 0.1), w: Math.round(previewSrc.fullW * 0.8), h: Math.round(previewSrc.fullH * 0.8) });
    } else if (tool.op === 'resize' || tool.op === 'canvas-size') {
      patchP({ width: previewSrc.fullW, height: previewSrc.fullH });
    }
  }, [previewSrc, tool, isCrop, patchP]);

  // ---- Live result preview (debounced) ----
  useEffect(() => {
    if (!previewable || isCrop) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        if (isCombine) {
          if (isPdf || previewSrcs.length === 0 || !op?.runCombine) return;
          setPreviewBusy(true);
          const res = await op.runCombine(previewSrcs.map((s) => s.canvas), params);
          if (!cancelled && res.canvas) setPreviewUrl(res.canvas.toDataURL('image/png'));
        } else {
          if (!previewSrc || !op?.run) return;
          setPreviewBusy(true);
          const res = await op.run(previewSrc.canvas, params);
          if (!cancelled && res.canvas) setPreviewUrl(res.canvas.toDataURL('image/png'));
        }
      } catch { /* ignore */ } finally {
        if (!cancelled) setPreviewBusy(false);
      }
    }, 120);
    return () => { cancelled = true; clearTimeout(t); };
  }, [params, previewSrc, previewSrcs, previewable, isCrop, isCombine, isPdf, op]);

  const runEach = useCallback(async () => {
    if (!op?.run) return;
    for (const job of jobs.filter((j) => j.status === 'pending' || j.status === 'failed')) {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: 'working', error: undefined } : j)));
      try {
        const canvas = await fileToCanvas(job.file);
        const res = await op.run(canvas, params);
        const base = job.file.name.replace(/\.[^.]+$/, '') || 'image';
        if (res.text !== undefined) {
          const blob = new Blob([res.text], { type: 'text/plain' });
          setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: 'success', result: { blob, url: URL.createObjectURL(blob), filename: `${base}.txt` }, error: res.text } : j)));
        } else if (res.swatches) {
          setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: 'success', error: res.swatches!.join('  ') } : j)));
        } else if (res.canvas) {
          const blob = await canvasToBlob(res.canvas, outFormat, quality);
          const ext = FORMAT_BY_ID.get(outFormat)?.ext ?? 'png';
          setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: 'success', result: { blob, url: URL.createObjectURL(blob), filename: `${base}.${ext}` } } : j)));
        }
      } catch (e) {
        setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: 'failed', error: e instanceof Error ? e.message : String(e) } : j)));
      }
      await sleep(10);
    }
  }, [op, jobs, params, outFormat, quality]);

  const runCombine = useCallback(async () => {
    if (!op?.runCombine || jobs.length === 0) return;
    setCombined({ status: 'working' });
    try {
      const canvases = await Promise.all(jobs.map((j) => fileToCanvas(j.file)));
      const res = await op.runCombine(canvases, params);
      if (res.blob) {
        setCombined({ status: 'success', blob: res.blob, url: URL.createObjectURL(res.blob), filename: `${tool!.id}.${isPdf ? 'pdf' : 'png'}` });
      } else if (res.canvas) {
        const blob = await canvasToBlob(res.canvas, outFormat, quality);
        const ext = FORMAT_BY_ID.get(outFormat)?.ext ?? 'png';
        setCombined({ status: 'success', blob, url: URL.createObjectURL(blob), filename: `${tool!.id}.${ext}` });
      }
    } catch (e) {
      setCombined({ status: 'failed', error: e instanceof Error ? e.message : String(e) });
    }
  }, [op, jobs, params, outFormat, quality, tool, isPdf]);

  const convert = isCombine ? runCombine : runEach;

  const downloadAll = useCallback(async () => {
    for (const j of jobs) {
      if (!j.result) continue;
      const a = document.createElement('a'); a.href = j.result.url; a.download = j.result.filename; document.body.appendChild(a); a.click(); a.remove(); await sleep(150);
    }
  }, [jobs]);

  const clearAll = useCallback(() => {
    jobs.forEach((j) => { URL.revokeObjectURL(j.previewUrl); if (j.result) URL.revokeObjectURL(j.result.url); });
    setJobs([]); setCombined(null); setPreviewUrl(null); setPreviewSrc(null); setPreviewSrcs([]); initedRef.current = '';
  }, [jobs]);

  const reorder = useCallback((to: number) => {
    const from = reorderFrom.current;
    if (from < 0 || from === to) return;
    setJobs((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
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
  const isSwatchTool = tool.op === 'colorPalette';
  const pendingCount = jobs.filter((j) => j.status === 'pending').length;
  const isWorking = jobs.some((j) => j.status === 'working') || combined?.status === 'working';
  const hasFiles = jobs.length > 0;

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

      <div className={`editor ${previewable && hasFiles ? 'editor--split' : ''}`}>
        <div className="panel editor__side">
          {op.controls.length > 0 && (
            <div className="converter__controls converter__controls--stack">
              {op.controls.map((c) => (
                <ControlField key={c.key} ctrl={c} value={params[c.key]} onChange={(v) => setP(c.key, v)} />
              ))}
            </div>
          )}
          <div className="controls__actions controls__actions--full">
            <button className="btn btn--dark btn--icon" onClick={convert} disabled={!hasFiles || isWorking || (!isCombine && pendingCount === 0)}>
              <Lightning size={16} weight="fill" /> {isWorking ? 'Working…' : isCombine ? 'Generate' : `Convert${pendingCount ? ` ${pendingCount}` : ''}`}
            </button>
            {!isCombine && jobs.filter((j) => j.result).length > 1 && (
              <button className="btn btn--icon" onClick={downloadAll} disabled={isWorking}><DownloadSimple size={15} weight="bold" /> All</button>
            )}
            {hasFiles && <button className="btn btn--ghost btn--icon" onClick={clearAll} disabled={isWorking}><Trash size={15} /> Clear</button>}
          </div>

          <div
            className={`dropzone ${dragging ? 'dropzone--active' : ''} ${hasFiles ? 'dropzone--compact' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            role="button" tabIndex={0}
          >
            <input ref={inputRef} type="file" multiple accept="image/*,.heic,.heif,.tif,.tiff,.avif,.svg,.ico,.jp2" hidden onChange={(e) => e.target.files && addFiles(e.target.files)} />
            <div className="dropzone__inner">
              <UploadSimple size={hasFiles ? 22 : 34} weight="light" className="dropzone__icon" />
              <p className="dropzone__title">{hasFiles ? 'Add more' : <>Drop image{isCombine ? 's' : '(s)'} here <span className="muted">or click to browse</span></>}</p>
              {!hasFiles && <p className="dropzone__hint">{isCombine ? 'All images combine into one output.' : 'Preview updates live; conversion runs at full resolution.'}</p>}
            </div>
          </div>
        </div>

        {previewable && hasFiles && (
          <div className="editor__preview">
            <div className="preview-head">
              <span className="preview-head__label">Live preview {previewBusy && <span className="preview-dot" />}</span>
              <span className="preview-head__note">reduced-res preview · full quality on convert</span>
            </div>

            {isCrop && previewSrc ? (
              <CropStage src={previewSrc} params={params} setParam={patchP} />
            ) : isCombine ? (
              <div className="combine-editor">
                <div className="reorder" onDragOver={(e) => e.preventDefault()}>
                  {jobs.map((j, i) => (
                    <div
                      key={j.id}
                      className="reorder__item"
                      draggable
                      onDragStart={() => { reorderFrom.current = i; }}
                      onDrop={() => reorder(i)}
                      title="Drag to reorder"
                    >
                      <DotsSixVertical size={14} className="reorder__grip" />
                      <img className="reorder__thumb" src={j.previewUrl} alt="" />
                      <span className="reorder__idx">{i + 1}</span>
                      <button className="job__remove" onClick={() => setJobs((prev) => prev.filter((x) => x.id !== j.id))} aria-label="Remove"><X size={12} /></button>
                    </div>
                  ))}
                </div>
                {isPdf ? (
                  <p className="dropzone__hint">Drag thumbnails to set page order, then Generate the PDF.</p>
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
      </div>

      {isCombine && combined && (
        <div className="combine-result">
          <StatusBadge status={combined.status ?? 'pending'} />
          {combined.error && <span className="job__error">{combined.error}</span>}
          {combined.url && (
            <div className="job__result">
              {combined.filename?.endsWith('.pdf') ? null : <img className="thumb thumb--lg" src={combined.url} alt="" />}
              <span className="job__size job__size--out">{combined.blob && formatBytes(combined.blob.size)}</span>
              <a className="btn btn--dark btn--icon" href={combined.url} download={combined.filename}><DownloadSimple size={15} weight="bold" /> Download</a>
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
                  {isTextTool && job.status === 'success' && job.error && <CopyBox text={job.error} />}
                  {job.error && job.status === 'failed' && <div className="job__error">{job.error}</div>}
                </div>
                <div className="job__side">
                  <StatusBadge status={job.status} />
                  <div className="job__side-actions">
                    {job.result && !isTextTool && (
                      <a className="btn btn--dark btn--icon btn--sm" href={job.result.url} download={job.result.filename}><DownloadSimple size={14} weight="bold" /> Download</a>
                    )}
                    {job.status !== 'working' && <button className="job__remove" onClick={() => setJobs((prev) => prev.filter((x) => x.id !== job.id))} aria-label="Remove"><X size={14} /></button>}
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
