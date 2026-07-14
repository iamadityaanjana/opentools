'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Info, UploadSimple } from '@phosphor-icons/react';
import { TopNav } from '../components/TopNav';
import { SiteFooter } from '../components/SiteFooter';
import { VideoStudio } from '../components/video-editor/VideoStudio';
import { TOOL_BY_ID, CATEGORY_BY_ID, GROUP_HOME, GROUP_LABEL } from '../tools/catalog';
import { getToolPageContent } from '../content/tool-page-content';

const PERF_ACK_KEY = 'video-editor-perf-ack';

export default function VideoEditorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [perfAcked, setPerfAcked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(PERF_ACK_KEY) === '1') setPerfAcked(true);
    } catch { /* private browsing */ }
  }, []);

  const acknowledgePerf = () => {
    setPerfAcked(true);
    try { sessionStorage.setItem(PERF_ACK_KEY, '1'); } catch { /* ignore */ }
  };

  const tool = TOOL_BY_ID.get('video-editor');
  const cat = tool ? CATEGORY_BY_ID.get(tool.categoryId) : undefined;
  const pageContent = tool ? getToolPageContent(tool) : null;
  const Icon = cat?.icon;

  const acceptFile = useCallback((f: File) => {
    if (!perfAcked) return;
    setFile(f);
  }, [perfAcked]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!perfAcked) return;
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('video/')) acceptFile(f);
  };

  return (
    <div className={`page page--tool${file ? ' page--video-editor-active' : ''}`}>
      <TopNav />
      <main className={file ? 'video-editor-main' : undefined}>
        {file ? (
          <div className="video-editor-active">
            <div className="video-editor-active__bar">
              <nav className="crumbs crumbs--sub crumbs--compact">
                <Link className="crumbs__link" href={GROUP_HOME.video}>{GROUP_LABEL.video}</Link>
                <span className="crumbs__sep">/</span>
                <span className="crumbs__current">Video Editor</span>
              </nav>
              <Link className="btn btn--sm btn--pill btn--icon" href={GROUP_HOME.video}>
                <ArrowLeft size={14} weight="bold" /> Back
              </Link>
            </div>
            <VideoStudio
              key={file.name + file.size}
              initialFile={file}
              onRequestNewFile={() => { setFile(null); }}
            />
          </div>
        ) : (
          <div className="tool-workspace">
            <nav className="crumbs crumbs--sub">
              <Link className="crumbs__link" href={GROUP_HOME.video}>{GROUP_LABEL.video}</Link>
              <span className="crumbs__sep">/</span>
              <span className="crumbs__current">Video Editor</span>
            </nav>

            <div className="tool-hero">
              {Icon && <div className="tool-hero__icon"><Icon size={26} weight="fill" /></div>}
              <div>
                <h1 className="tool-title">{tool?.name ?? 'Video Editor'}</h1>
                <p className="tool-desc">
                  {pageContent?.description ?? 'Cut, layer, add text and image overlays — export locally with FFmpeg.'}
                </p>
              </div>
              <Link className="btn btn--pill btn--icon" href={GROUP_HOME.video}>
                <ArrowLeft size={15} weight="bold" /> {GROUP_LABEL.video}
              </Link>
            </div>

            {!perfAcked && (
              <div className="video-editor-notice" role="note">
                <div className="video-editor-notice__icon" aria-hidden>
                  <Info size={22} weight="fill" />
                </div>
                <div className="video-editor-notice__body">
                  <p className="video-editor-notice__title">Browser-based editor — short clips work best</p>
                  <p className="video-editor-notice__text">
                    Everything runs locally in your browser. For smooth editing and export, use{' '}
                    <strong>short videos</strong> (ideally under 10-20 seconds) with{' '}
                    <strong>minimal edits</strong> — a quick trim, one or two layers, light overlays.
                    Longer footage, heavy multi-track timelines, or high-resolution exports can lag,
                    freeze, or fail when memory fills up. Nothing is uploaded; your device does the work.
                  </p>
                  <button type="button" className="btn btn--dark" onClick={acknowledgePerf}>
                    Got it — continue
                  </button>
                </div>
              </div>
            )}

            <div
              className={`dropzone${!perfAcked ? ' dropzone--disabled' : ''} ${dragging ? 'dropzone--active' : ''}`}
              onDragOver={(e) => {
                if (!perfAcked) return;
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => { if (perfAcked) fileInputRef.current?.click(); }}
              onKeyDown={(e) => {
                if (!perfAcked) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={perfAcked ? 0 : -1}
              aria-disabled={!perfAcked}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,.mp4,.webm,.mov,.avi,.mkv"
                hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) acceptFile(f); e.target.value = ''; }}
              />
              <div className="dropzone__inner">
                <UploadSimple size={34} weight="light" className="dropzone__icon" />
                <p className="dropzone__title">
                  Drop a video here <span className="muted">or click to browse</span>
                </p>
                <p className="dropzone__hint">
                  {perfAcked
                    ? 'Multi-track editor — cut clips, add text & image overlays, export in your browser.'
                    : 'Acknowledge the note above before uploading a video.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      {!file && <SiteFooter />}
    </div>
  );
}
