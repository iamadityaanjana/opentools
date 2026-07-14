'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lightning, Trash, UploadSimple } from '@phosphor-icons/react';
import { TOOL_BY_ID, CATEGORY_BY_ID, GROUP_HOME, GROUP_LABEL } from '../tools/catalog';
import { TopNav } from '../components/TopNav';
import { SiteFooter } from '../components/SiteFooter';
import { getToolPageContent } from '../content/tool-page-content';
import { getFFmpeg, onFFmpegProgress, isFFmpegLoaded } from '../lib/ffmpeg';
import { VIDEO_OPS } from '../lib/videoOps';
import type { VideoControl } from '../lib/videoOps';

type Status = 'idle' | 'loading' | 'processing' | 'done' | 'error';

interface VideoResult {
  blob: Blob;
  filename: string;
  mimeType: string;
  url: string;
}

function Control({
  ctrl, value, onChange,
}: {
  ctrl: VideoControl;
  value: string | number | boolean;
  onChange: (v: string | number | boolean) => void;
}) {
  if (ctrl.type === 'select') {
    return (
      <label className="field">
        <span className="field__label">{ctrl.label}</span>
        <select className="select" value={String(value)} onChange={(e) => onChange(e.target.value)}>
          {ctrl.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {ctrl.hint && <span className="field__hint">{ctrl.hint}</span>}
      </label>
    );
  }
  if (ctrl.type === 'number') {
    return (
      <label className="field">
        <span className="field__label">{ctrl.label}</span>
        <input className="select" type="number" value={Number(value)}
          min={ctrl.min} max={ctrl.max} step={ctrl.step ?? 1}
          onChange={(e) => onChange(e.target.valueAsNumber)} />
        {ctrl.hint && <span className="field__hint">{ctrl.hint}</span>}
      </label>
    );
  }
  if (ctrl.type === 'range') {
    return (
      <label className="field">
        <span className="field__label">{ctrl.label} — {value}{ctrl.suffix ?? ''}</span>
        <input type="range" value={Number(value)} min={ctrl.min} max={ctrl.max} step={ctrl.step ?? 1}
          onChange={(e) => onChange(e.target.valueAsNumber)} />
      </label>
    );
  }
  return null;
}

export default function VideoToolPage({ toolId }: { toolId: string }) {
  const op = VIDEO_OPS[toolId];
  const tool = TOOL_BY_ID.get(toolId);
  const cat = tool ? CATEGORY_BY_ID.get(tool.categoryId) : undefined;
  const pageContent = tool ? getToolPageContent(tool) : null;
  const Icon = cat?.icon;

  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [params, setParams] = useState<Record<string, string | number | boolean>>(
    () => Object.fromEntries(op?.controls.map((c) => [c.key, c.def]) ?? []),
  );
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [result, setResult] = useState<VideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const prevUrls = useRef<string[]>([]);

  const acceptFile = useCallback((f: File) => {
    prevUrls.current.forEach(URL.revokeObjectURL);
    prevUrls.current = [];
    const url = URL.createObjectURL(f);
    prevUrls.current.push(url);
    setFile(f);
    setVideoUrl(url);
    setResult(null);
    setError(null);
    setStatus('idle');
    setProgress(0);
  }, []);

  const clearFile = useCallback(() => {
    prevUrls.current.forEach(URL.revokeObjectURL);
    prevUrls.current = [];
    setFile(null);
    setVideoUrl(null);
    setResult(null);
    setError(null);
    setStatus('idle');
    setProgress(0);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.type.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/i.test(f.name))) acceptFile(f);
  }, [acceptFile]);

  const handleProcess = async () => {
    if (!file || !op) return;
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      if (!isFFmpegLoaded()) {
        setStatus('loading');
        setProgressLabel('Downloading video engine…');
        const unsub = onFFmpegProgress((p, l) => { setProgress(p); setProgressLabel(l); });
        try {
          await getFFmpeg();
        } finally {
          unsub();
        }
      }

      setStatus('processing');
      setProgress(0);
      setProgressLabel('Processing…');

      const ffmpeg = await getFFmpeg();
      const progressHandler = ({ progress: p }: { progress: number }) => {
        setProgress(Math.min(Math.round(p * 100), 99));
      };

      try {
        ffmpeg.on('progress', progressHandler);
        const res = await op.run(ffmpeg, file, params);
        setProgress(100);
        const url = URL.createObjectURL(res.blob);
        prevUrls.current.push(url);
        setResult({ ...res, url });
        setStatus('done');
      } finally {
        ffmpeg.off('progress', progressHandler);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus('error');
    }
  };

  useEffect(() => () => { prevUrls.current.forEach(URL.revokeObjectURL); }, []);

  if (!op || !tool || !cat || !Icon) {
    return <div className="page page--tool"><p>Unknown tool: {toolId}</p></div>;
  }

  const isAudio = result?.mimeType.startsWith('audio/');
  const isGif = result?.mimeType === 'image/gif';
  const isBusy = status === 'loading' || status === 'processing';
  const hasFile = !!file;

  return (
    <div className="page page--tool">
      <TopNav />
      <main>
        <div className="tool-workspace">
          <nav className="crumbs crumbs--sub">
            <Link className="crumbs__link" href={GROUP_HOME.video}>{GROUP_LABEL.video}</Link>
            <span className="crumbs__sep">/</span>
            <Link className="crumbs__link" href={`${GROUP_HOME.video}#category-${cat.id}`}>{cat.label}</Link>
            <span className="crumbs__sep">/</span>
            <span className="crumbs__current">{tool.name}</span>
          </nav>

          <div className="tool-hero">
            <div className="tool-hero__icon"><Icon size={26} weight="fill" /></div>
            <div>
              <h1 className="tool-title">{tool.name}</h1>
              <p className="tool-desc">{pageContent?.description ?? tool.blurb ?? op.description}</p>
            </div>
            <Link className="btn btn--pill btn--icon" href={GROUP_HOME.video}>
              <ArrowLeft size={15} weight="bold" /> {GROUP_LABEL.video}
            </Link>
          </div>

          <div
            className={`dropzone ${dragging ? 'dropzone--active' : ''} ${hasFile ? 'dropzone--compact' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
          >
            <input
              ref={inputRef}
              type="file"
              accept="video/*,.mp4,.webm,.mov,.avi,.mkv"
              hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) acceptFile(f); e.target.value = ''; }}
            />
            <div className="dropzone__inner">
              <UploadSimple size={hasFile ? 22 : 34} weight="light" className="dropzone__icon" />
              <p className="dropzone__title">
                {hasFile
                  ? 'Change video'
                  : <>Drop a video here <span className="muted">or click to browse</span></>}
              </p>
              {!hasFile && (
                <p className="dropzone__hint">MP4, WebM, MOV, AVI — processed locally and never uploaded.</p>
              )}
            </div>
          </div>

          {hasFile && (
            <div className="editor2">
              <div className="editor2__body editor2__body--split">
                <div className="editor2__main">
                  <div className="editor__preview">
                    <div className="preview-head">
                      <span className="preview-head__label">Preview</span>
                      <span className="preview-head__note">{file.name}</span>
                    </div>
                    <video src={videoUrl ?? undefined} controls className="video-preview" preload="metadata" />
                  </div>

                  {status === 'done' && result && (
                    <div className="video-result">
                      <div className="video-result__header">
                        <span className="badge badge--success">Done</span>
                        <span className="video-result__name">{result.filename}</span>
                      </div>
                      {isGif && <img src={result.url} alt="Output GIF" className="video-result__gif" />}
                      {isAudio && <audio controls src={result.url} className="video-result__audio" />}
                      {!isGif && !isAudio && <video src={result.url} controls className="video-preview" />}
                      <button type="button" className="btn btn--dark" onClick={() => {
                        const a = document.createElement('a');
                        a.href = result.url;
                        a.download = result.filename;
                        a.click();
                      }}>
                        Download {result.filename}
                      </button>
                    </div>
                  )}
                </div>

                <div className="editor2__aside">
                  <h2 className="editor2__title">Settings</h2>
                  {op.estimatedTime && <p className="video-timing-hint">{op.estimatedTime}</p>}

                  {op.controls.length > 0 && (
                    <div className="editor2__controls">
                      {op.controls.map((ctrl) => (
                        <Control
                          key={ctrl.key}
                          ctrl={ctrl}
                          value={params[ctrl.key] ?? ctrl.def}
                          onChange={(v) => setParams((p) => ({ ...p, [ctrl.key]: v }))}
                        />
                      ))}
                    </div>
                  )}

                  {isBusy && (
                    <div className="vload" style={{ marginBottom: '12px' }}>
                      <div className="vload__bar-wrap">
                        <div className="vload__bar" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="vload__label">{progressLabel}{isBusy ? ` · ${progress}%` : ''}</p>
                    </div>
                  )}

                  {status === 'error' && error && <p className="video-error">{error}</p>}

                  <div className="controls__actions controls__actions--full">
                    <button type="button" className="btn btn--dark btn--icon" disabled={isBusy} onClick={handleProcess}>
                      <Lightning size={16} weight="fill" />
                      {isBusy ? progressLabel || 'Processing…' : op.label}
                    </button>
                    <button type="button" className="btn btn--ghost btn--icon" onClick={clearFile} disabled={isBusy}>
                      <Trash size={15} /> Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
