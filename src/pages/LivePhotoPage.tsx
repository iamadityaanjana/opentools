import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FilmStrip, UploadSimple, DownloadSimple, Trash, ShieldCheck, ImageSquare, VideoCamera,
} from '@phosphor-icons/react';
import { usePostHog } from '@posthog/react';
import { TopNav } from '../components/TopNav';
import { Dropdown } from '../components/Dropdown';
import { decodeToImageData } from '../lib/decode';
import { extractEmbeddedVideo, type EmbeddedVideo } from '../lib/motionPhoto';

type StillFmt = 'jpeg' | 'png';

function isVideoFile(file: File): boolean {
  if (file.type.startsWith('video/')) return true;
  return /\.(mov|mp4|m4v|qt)$/i.test(file.name);
}

function fmtTime(t: number): string {
  if (!Number.isFinite(t)) return '0:00.0';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const d = Math.floor((t * 10) % 10);
  return `${m}:${String(s).padStart(2, '0')}.${d}`;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Could not encode image.'))),
      type,
      quality,
    );
  });
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export default function LivePhotoPage() {
  const posthog = usePostHog();
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const [baseName, setBaseName] = useState('live-photo');
  const [stillFmt, setStillFmt] = useState<StillFmt>('jpeg');
  const [hasStill, setHasStill] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [videoVia, setVideoVia] = useState<EmbeddedVideo['via'] | 'separate-file' | null>(null);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const stillCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrlRef = useRef<string | null>(null);

  const revokeVideoUrl = useCallback(() => {
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = null;
    }
  }, []);

  useEffect(() => () => revokeVideoUrl(), [revokeVideoUrl]);

  const drawStill = useCallback(async (file: File) => {
    const { imageData } = await decodeToImageData(file);
    const canvas = stillCanvasRef.current!;
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    canvas.getContext('2d')!.putImageData(imageData, 0, 0);
    setHasStill(true);
  }, []);

  const attachVideo = useCallback((blob: Blob) => {
    revokeVideoUrl();
    const url = URL.createObjectURL(blob);
    videoUrlRef.current = url;
    const v = videoRef.current!;
    v.src = url;
    v.load();
    setHasVideo(true);
  }, [revokeVideoUrl]);

  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    setNote(null);
    setHasStill(false);
    setHasVideo(false);
    setVideoVia(null);
    setDuration(0);
    setCurrentTime(0);
    revokeVideoUrl();

    try {
      const videoFile = files.find(isVideoFile) ?? null;
      const stillFile = files.find((f) => !isVideoFile(f)) ?? null;

      if (stillFile) setBaseName(stillFile.name.replace(/\.[^.]+$/, '') || 'live-photo');
      else if (videoFile) setBaseName(videoFile.name.replace(/\.[^.]+$/, '') || 'live-photo');

      // Separate-file Live Photo: explicit paired .MOV wins as the video source.
      if (videoFile) {
        attachVideo(videoFile);
        setVideoVia('separate-file');
      }

      if (stillFile) {
        await drawStill(stillFile);
        // A single JPEG may be a motion photo with the clip appended.
        if (!videoFile) {
          const embedded = await extractEmbeddedVideo(stillFile);
          if (embedded) {
            attachVideo(embedded.blob);
            setVideoVia(embedded.via);
          } else {
            setNote('No paired video found in this file — extracted the still image only. Drop the matching .MOV alongside it to pull motion frames.');
          }
        }
      } else if (!videoFile) {
        setError('Drop a Live Photo still (HEIC/JPG), a motion photo, and/or its paired .MOV.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not process these files.');
    } finally {
      setLoading(false);
    }
  }, [attachVideo, drawStill, revokeVideoUrl]);

  const onLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(Number.isFinite(v.duration) ? v.duration : 0);
  }, []);

  const onTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (v) setCurrentTime(v.currentTime);
  }, []);

  const seek = useCallback((t: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(0, t), v.duration || 0);
    setCurrentTime(v.currentTime);
  }, []);

  const exportStill = useCallback(async () => {
    const canvas = stillCanvasRef.current;
    if (!canvas) return;
    const type = stillFmt === 'png' ? 'image/png' : 'image/jpeg';
    const blob = await canvasToBlob(canvas, type, stillFmt === 'jpeg' ? 0.95 : undefined);
    triggerDownload(blob, `${baseName}-still.${stillFmt === 'png' ? 'png' : 'jpg'}`);
    posthog?.capture('live_photo_still_downloaded', { format: stillFmt });
  }, [baseName, stillFmt, posthog]);

  const exportFrame = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext('2d')!.drawImage(v, 0, 0, canvas.width, canvas.height);
    const type = stillFmt === 'png' ? 'image/png' : 'image/jpeg';
    const blob = await canvasToBlob(canvas, type, stillFmt === 'jpeg' ? 0.95 : undefined);
    const stamp = v.currentTime.toFixed(2).replace('.', 's');
    triggerDownload(blob, `${baseName}-frame-${stamp}.${stillFmt === 'png' ? 'png' : 'jpg'}`);
    posthog?.capture('live_photo_frame_exported', { format: stillFmt, timestamp_seconds: parseFloat(stamp) });
  }, [baseName, stillFmt, posthog]);

  const loaded = hasStill || hasVideo;

  return (
    <div className="page page--wide">
      <TopNav />

      <nav className="crumbs crumbs--sub">
        <Link className="crumbs__link" to="/convert">Image tools</Link>
        <span className="crumbs__sep">/</span>
        <span className="crumbs__link">Mobile Tasks</span>
        <span className="crumbs__sep">/</span>
        <span className="crumbs__current">Live Photo Extractor</span>
      </nav>

      <div className="tool-hero">
        <div className="tool-hero__icon"><FilmStrip size={26} weight="fill" /></div>
        <div>
          <h1 className="tool-title">Live Photo Extractor</h1>
          <p className="tool-desc">Pull the still image and any frame from Apple Live Photos (HEIC/JPG + .MOV) or Google/Samsung motion photos. Everything runs on-device.</p>
        </div>
        <span className="privacy-pill"><ShieldCheck size={15} weight="fill" /> 100% on-device</span>
      </div>

      <div
        className={`dropzone ${dragging ? 'dropzone--active' : ''} ${loaded ? 'dropzone--compact' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) handleFiles(Array.from(e.dataTransfer.files)); }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.heic,.heif,.jpg,.jpeg,video/*,.mov,.mp4,.m4v"
          hidden
          onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
        />
        <div className="dropzone__inner">
          <UploadSimple size={loaded ? 22 : 34} weight="light" className="dropzone__icon" />
          <p className="dropzone__title">
            {loaded ? 'Load a different Live Photo' : <>Drop a Live Photo or motion photo <span className="muted">or click to browse</span></>}
          </p>
          {!loaded && <p className="dropzone__hint">{loading ? 'Reading…' : 'Add the still + its .MOV together, or a single motion-photo JPEG.'}</p>}
        </div>
      </div>

      {error && <div className="job__error" style={{ marginTop: 12 }}>{error}</div>}
      {note && <div className="dropzone__hint" style={{ marginTop: 12 }}>{note}</div>}

      {loaded && (
        <>
          <div className="converter__controls converter__controls--stack" style={{ marginTop: 18 }}>
            <label className="field field--grow">
              <span className="field__label">Output name</span>
              <input className="select" type="text" value={baseName} onChange={(e) => setBaseName(e.target.value)} placeholder="live-photo" />
            </label>
            <label className="field">
              <span className="field__label">Export format</span>
              <Dropdown
                value={stillFmt}
                onChange={(v) => setStillFmt(v as StillFmt)}
                ariaLabel="Export format"
                options={[{ value: 'jpeg', label: 'JPEG' }, { value: 'png', label: 'PNG' }]}
              />
            </label>
          </div>

          <div className="picker" style={{ marginTop: 18 }}>
            <div className="picker__stage-wrap">
              <div className="preview-head">
                <span className="preview-head__label"><ImageSquare size={14} weight="bold" /> Still image</span>
              </div>
              <div className="picker__stage" style={{ display: hasStill ? 'block' : 'none' }}>
                <canvas ref={stillCanvasRef} className="picker__canvas" />
              </div>
              {!hasStill && <p className="picker__empty">No still image in this drop.</p>}
              <button className="btn btn--dark btn--icon" style={{ marginTop: 12 }} onClick={exportStill} disabled={!hasStill}>
                <DownloadSimple size={16} weight="bold" /> Download still
              </button>
            </div>

            <aside className="picker__side">
              <div className="preview-head">
                <span className="preview-head__label"><VideoCamera size={14} weight="bold" /> Motion clip</span>
                {videoVia && (
                  <span className="preview-head__note">
                    {videoVia === 'separate-file' ? 'paired .MOV'
                      : videoVia === 'ftyp-scan' ? 'embedded MP4 (scan)'
                      : 'embedded MP4 (XMP)'}
                  </span>
                )}
              </div>

              <div className="picker__stage" style={{ display: hasVideo ? 'block' : 'none' }}>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  ref={videoRef}
                  className="picker__canvas"
                  playsInline
                  muted
                  preload="auto"
                  crossOrigin="anonymous"
                  onLoadedMetadata={onLoadedMetadata}
                  onTimeUpdate={onTimeUpdate}
                  onSeeked={onTimeUpdate}
                />
              </div>

              {hasVideo ? (
                <>
                  <div className="scrubber" style={{ marginTop: 12 }}>
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      step={0.01}
                      value={currentTime}
                      onChange={(e) => seek(Number(e.target.value))}
                      style={{ width: '100%' }}
                      aria-label="Scrub motion clip"
                    />
                    <div className="preview-head__note" style={{ marginTop: 4 }}>
                      {fmtTime(currentTime)} / {fmtTime(duration)}
                    </div>
                  </div>
                  <button className="btn btn--dark btn--icon" style={{ marginTop: 12 }} onClick={exportFrame}>
                    <DownloadSimple size={16} weight="bold" /> Export current frame
                  </button>
                </>
              ) : (
                <p className="picker__empty">No motion clip found. Drop the paired .MOV to scrub frames.</p>
              )}
            </aside>
          </div>

          <div className="controls__actions controls__actions--full" style={{ marginTop: 14 }}>
            <button
              className="btn btn--ghost btn--icon"
              onClick={() => {
                setHasStill(false);
                setHasVideo(false);
                setVideoVia(null);
                setNote(null);
                setError(null);
                revokeVideoUrl();
              }}
            >
              <Trash size={15} /> Clear
            </button>
          </div>
        </>
      )}

      <footer className="footer"><span>Part of opentools · your files never leave this device.</span></footer>
    </div>
  );
}
