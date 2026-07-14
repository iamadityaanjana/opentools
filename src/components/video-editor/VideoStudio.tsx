'use client';

import {
  useCallback, useEffect, useReducer, useRef, useState,
} from 'react';
import {
  DownloadSimple, Image as ImageIcon, Pause, Play, Scissors, TextT, Trash,
} from '@phosphor-icons/react';
import { getFFmpeg, isFFmpegLoaded, onFFmpegProgress } from '../../lib/ffmpeg';
import { exportProject } from '../../lib/videoEditor/export';
import {
  createEmptyProject, editorReducer, clipAtTime, sourceTime,
} from '../../lib/videoEditor/reducer';
import type { MediaAsset, TextLayer, ImageLayer, VideoTrackId } from '../../lib/videoEditor/types';
import { VIDEO_TRACK_IDS } from '../../lib/videoEditor/types';
import {
  uid, probeVideo, probeImage, probeAudio, extractThumbnails, extractWaveform, fmtTime,
} from '../../lib/videoEditor/utils';
import { StudioPreview } from './StudioPreview';
import { StudioTimeline } from './StudioTimeline';
import { StudioPanel } from './StudioPanel';

interface VideoStudioProps {
  initialFile?: File | null;
  onRequestNewFile?: () => void;
}

export function VideoStudio({ initialFile, onRequestNewFile }: VideoStudioProps) {
  const [project, dispatch] = useReducer(editorReducer, undefined, createEmptyProject);
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'processing' | 'done' | 'error'>('idle');
  const [exportPct, setExportPct] = useState(0);
  const [exportLabel, setExportLabel] = useState('');
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [panelTab, setPanelTab] = useState<'layers' | 'clip' | 'text' | 'overlay'>('layers');
  const [addTrackTarget, setAddTrackTarget] = useState<VideoTrackId | null>(null);
  const videoRefs = {
    track_video_1: useRef<HTMLVideoElement>(null),
    track_video_2: useRef<HTMLVideoElement>(null),
  };
  const rafRef = useRef<number>(0);
  const loadedInitial = useRef(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const selectedClip = project.selection?.kind === 'clip'
    ? project.clips.find((c) => c.id === project.selection!.id) ?? null
    : null;
  const selectedText = project.selection?.kind === 'text'
    ? project.textLayers.find((t) => t.id === project.selection!.id) ?? null
    : null;
  const selectedImage = project.selection?.kind === 'image'
    ? project.imageLayers.find((t) => t.id === project.selection!.id) ?? null
    : null;

  const ingestFile = useCallback(async (file: File, trackId?: VideoTrackId) => {
    const kind = file.type.startsWith('video/') ? 'video'
      : file.type.startsWith('audio/') ? 'audio'
        : file.type.startsWith('image/') ? 'image' : null;
    if (!kind) return;

    let asset: MediaAsset;
    if (kind === 'video') {
      const meta = await probeVideo(file);
      const thumbs = await extractThumbnails(meta.url, meta.duration, Math.min(24, Math.ceil(meta.duration)));
      const wave = await extractWaveform(file, Math.min(200, Math.floor(meta.duration * 6)));
      asset = {
        id: uid('asset'), kind, file, url: meta.url, name: file.name,
        duration: meta.duration, width: meta.width, height: meta.height,
        thumbnails: thumbs, waveform: wave,
      };
      dispatch({ type: 'ADD_ASSET', asset });
      dispatch({ type: 'ADD_VIDEO_FROM_ASSET', assetId: asset.id, trackId });
      setPanelTab('clip');
    } else if (kind === 'image') {
      const meta = await probeImage(file);
      asset = {
        id: uid('asset'), kind, file, url: meta.url, name: file.name,
        duration: project.duration, width: meta.width, height: meta.height,
      };
      dispatch({ type: 'ADD_ASSET', asset });
      dispatch({ type: 'ADD_IMAGE', assetId: asset.id });
      setPanelTab('overlay');
    } else {
      const meta = await probeAudio(file);
      asset = {
        id: uid('asset'), kind, file, url: meta.url, name: file.name,
        duration: meta.duration, waveform: await extractWaveform(file, 120),
      };
      dispatch({ type: 'ADD_ASSET', asset });
    }
  }, [project.duration]);

  useEffect(() => {
    if (initialFile && !loadedInitial.current) {
      loadedInitial.current = true;
      void ingestFile(initialFile);
    }
  }, [initialFile, ingestFile]);

  useEffect(() => {
    for (const trackId of VIDEO_TRACK_IDS) {
      const v = videoRefs[trackId].current;
      if (!v) continue;
      const clip = clipAtTime(project.clips, project.currentTime, trackId);
      if (!clip) {
        v.pause();
        continue;
      }
      const asset = project.assets.find((a) => a.id === clip.assetId);
      if (!asset) continue;
      if (v.src !== asset.url) v.src = asset.url;
      const t = sourceTime(clip, project.currentTime);
      if (Math.abs(v.currentTime - t) > 0.12) v.currentTime = t;
    }
  }, [project.clips, project.assets, project.currentTime]);

  useEffect(() => {
    if (!project.isPlaying) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const next = project.currentTime + dt;
      if (next >= project.duration) {
        dispatch({ type: 'SET_PLAYING', playing: false });
        dispatch({ type: 'SET_CURRENT_TIME', time: 0 });
        return;
      }
      dispatch({ type: 'SET_CURRENT_TIME', time: next });

      for (const trackId of VIDEO_TRACK_IDS) {
        const v = videoRefs[trackId].current;
        if (!v) continue;
        const clip = clipAtTime(project.clips, next, trackId);
        if (!clip) { v.pause(); continue; }
        const t = sourceTime(clip, next);
        if (Math.abs(v.currentTime - t) > 0.08) v.currentTime = t;
        if (v.paused) void v.play().catch(() => {});
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [project.isPlaying, project.currentTime, project.duration, project.clips]);

  useEffect(() => {
    for (const trackId of VIDEO_TRACK_IDS) {
      const v = videoRefs[trackId].current;
      if (!v) continue;
      if (project.isPlaying) void v.play().catch(() => {});
      else v.pause();
    }
  }, [project.isPlaying]);

  const togglePlay = () => dispatch({ type: 'SET_PLAYING', playing: !project.isPlaying });

  const handleExport = async () => {
    setExportStatus('idle');
    setExportError(null);
    setExportUrl(null);
    setExportPct(0);

    try {
      if (!isFFmpegLoaded()) {
        setExportStatus('loading');
        setExportLabel('Downloading video engine…');
        const unsub = onFFmpegProgress((p, l) => { setExportPct(p); setExportLabel(l); });
        try {
          await getFFmpeg();
        } finally {
          unsub();
        }
      }

      setExportStatus('processing');
      setExportLabel('Rendering…');

      const ffmpeg = await getFFmpeg();
      const blob = await exportProject(ffmpeg, project, { format: 'mp4', quality: 'high' }, setExportPct);
      const url = URL.createObjectURL(blob);
      setExportUrl(url);
      setExportLabel('Export complete');
      setExportStatus('done');
    } catch (err) {
      setExportError(err instanceof Error ? err.message : String(err));
      setExportStatus('error');
    }
  };

  const requestVideoForTrack = (trackId: VideoTrackId) => {
    setAddTrackTarget(trackId);
    videoInputRef.current?.click();
  };

  return (
    <div className="ve-shell">
      <div className="ve-shell__grid">
        <div className="ve-shell__main">
          <div className="ve-preview">
            <StudioPreview
              videoRefs={videoRefs}
              project={project}
              onSelectText={(id) => {
                dispatch({ type: 'SELECT', selection: { kind: 'text', id } });
                setPanelTab('text');
              }}
              onUpdateText={(id, patch) => dispatch({ type: 'UPDATE_TEXT', id, patch })}
              onSelectImage={(id) => {
                dispatch({ type: 'SELECT', selection: { kind: 'image', id } });
                setPanelTab('overlay');
              }}
              onUpdateImage={(id, patch) => dispatch({ type: 'UPDATE_IMAGE', id, patch })}
            />
          </div>

          <div className="ve-transport">
            <button type="button" className="veditor-tool veditor-tool--primary veditor-tool--round" onClick={togglePlay}>
              {project.isPlaying ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
            </button>
            <span className="ve-transport__time">
              {fmtTime(project.currentTime)} <span className="muted">/ {fmtTime(project.duration)}</span>
            </span>
            <div className="ve-transport__tools">
              <button type="button" className="veditor-tool" onClick={() => dispatch({ type: 'SPLIT_AT_PLAYHEAD' })} title="Split at playhead">
                <Scissors size={16} weight="bold" /> Cut
              </button>
              <button type="button" className="veditor-tool" onClick={() => dispatch({ type: 'DELETE_SELECTED' })} disabled={!project.selection}>
                <Trash size={16} weight="bold" /> Delete
              </button>
              <button type="button" className="veditor-tool" onClick={() => { dispatch({ type: 'ADD_TEXT' }); setPanelTab('text'); }}>
                <TextT size={16} weight="bold" /> Text
              </button>
              <button type="button" className="veditor-tool" onClick={() => imageInputRef.current?.click()}>
                <ImageIcon size={16} weight="bold" /> Overlay
              </button>
            </div>
            <div className="ve-transport__spacer" />
            {onRequestNewFile && (
              <button type="button" className="btn" onClick={onRequestNewFile}>Change video</button>
            )}
            <button
              type="button"
              className="btn btn--dark btn--icon"
              disabled={exportStatus === 'loading' || exportStatus === 'processing' || project.clips.length === 0}
              onClick={handleExport}
            >
              <DownloadSimple size={16} weight="bold" />
              Export
            </button>
          </div>

          {(exportStatus === 'loading' || exportStatus === 'processing' || exportStatus === 'done' || exportStatus === 'error') && (
            <div className={`veditor-export${exportStatus === 'done' ? ' veditor-export--done' : ''}${exportStatus === 'error' ? ' veditor-export--error' : ''}`}>
              {(exportStatus === 'loading' || exportStatus === 'processing' || exportStatus === 'done') && (
                <div className="veditor-export__track">
                  <div className="veditor-export__fill" style={{ width: `${exportPct}%` }} />
                </div>
              )}
              <div className="veditor-export__row">
                <span className="veditor-export__label">
                  {exportStatus === 'error' ? exportError : `${exportLabel}${exportStatus === 'processing' ? ` · ${exportPct}%` : ''}`}
                </span>
                {exportStatus === 'done' && exportUrl && (
                  <a className="btn btn--dark btn--icon" href={exportUrl} download="edited-video.mp4">
                    <DownloadSimple size={15} weight="bold" /> Download
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="ve-timeline">
            <StudioTimeline
              project={project}
              onSeek={(t) => dispatch({ type: 'SET_CURRENT_TIME', time: t })}
              onSelect={(sel) => {
                dispatch({ type: 'SELECT', selection: sel });
                if (sel?.kind === 'clip') setPanelTab('clip');
                if (sel?.kind === 'text') setPanelTab('text');
                if (sel?.kind === 'image') setPanelTab('overlay');
              }}
              onMoveClip={(id, start) => dispatch({ type: 'MOVE_CLIP', clipId: id, start })}
              onMoveClipTrack={(id, trackId) => dispatch({ type: 'MOVE_CLIP_TRACK', clipId: id, trackId })}
              onTrimClip={(id, side, delta) => dispatch({ type: 'TRIM_CLIP', clipId: id, side, delta })}
              onMoveText={(id, start) => dispatch({ type: 'MOVE_TEXT', id, start })}
              onTrimText={(id, side, delta) => dispatch({ type: 'TRIM_TEXT', id, side, delta })}
              onMoveImage={(id, start) => dispatch({ type: 'MOVE_IMAGE', id, start })}
              onTrimImage={(id, side, delta) => dispatch({ type: 'TRIM_IMAGE', id, side, delta })}
              onZoom={(px) => dispatch({ type: 'SET_ZOOM', pxPerSec: px })}
            />
          </div>
        </div>

        <StudioPanel
          tab={panelTab}
          setTab={setPanelTab}
          project={project}
          selectedClip={selectedClip}
          selectedText={selectedText}
          selectedImage={selectedImage}
          onSelect={(sel) => {
            dispatch({ type: 'SELECT', selection: sel });
            if (sel?.kind === 'clip') setPanelTab('clip');
            if (sel?.kind === 'text') setPanelTab('text');
            if (sel?.kind === 'image') setPanelTab('overlay');
          }}
          onUpdateClip={(id, patch) => dispatch({ type: 'UPDATE_CLIP', id, patch })}
          onUpdateText={(id, patch) => dispatch({ type: 'UPDATE_TEXT', id, patch })}
          onUpdateImage={(id, patch) => dispatch({ type: 'UPDATE_IMAGE', id, patch })}
          onToggleMute={(id) => dispatch({ type: 'TOGGLE_TRACK_MUTE', trackId: id })}
          onToggleVisible={(id) => dispatch({ type: 'TOGGLE_TRACK_VISIBLE', trackId: id })}
          onAddToTrack={(trackId) => requestVideoForTrack(trackId as VideoTrackId)}
        />
      </div>

      <input ref={videoInputRef} type="file" accept="video/*" hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void ingestFile(f, addTrackTarget ?? undefined);
          e.target.value = '';
          setAddTrackTarget(null);
        }} />
      <input ref={imageInputRef} type="file" accept="image/*" hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void ingestFile(f); e.target.value = ''; }} />
    </div>
  );
}
