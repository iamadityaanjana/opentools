'use client';

import { useCallback, useRef, useState } from 'react';
import type { EditorProject, Selection, VideoClip } from '../../lib/videoEditor/types';
import { VIDEO_TRACK_IDS } from '../../lib/videoEditor/types';
import { videoTrackLabel } from '../../lib/videoEditor/tracks';
import { fmtShort } from '../../lib/videoEditor/utils';

interface StudioTimelineProps {
  project: EditorProject;
  onSeek: (t: number) => void;
  onSelect: (sel: Selection) => void;
  onMoveClip: (id: string, start: number) => void;
  onMoveClipTrack: (id: string, trackId: string) => void;
  onTrimClip: (id: string, side: 'start' | 'end', delta: number) => void;
  onMoveText: (id: string, start: number) => void;
  onTrimText: (id: string, side: 'start' | 'end', delta: number) => void;
  onMoveImage: (id: string, start: number) => void;
  onTrimImage: (id: string, side: 'start' | 'end', delta: number) => void;
  onZoom: (pxPerSec: number) => void;
}

const TRACK_H = 48;
const TRACK_H_TEXT = 56;
const LABEL_W = 76;
const DRAG_THRESHOLD_PX = 4;

interface ClipDragPreview {
  clipId: string;
  trackId: string;
  start: number;
  duration: number;
  assetId: string;
  speedStart: number;
  speedEnd: number;
}

/** Drag helper — incremental time delta per mousemove. */
function bindIncrementalDrag(
  e: React.MouseEvent,
  pxPerSec: number,
  onStep: (deltaSec: number) => void,
) {
  e.stopPropagation();
  e.preventDefault();
  let lastX = e.clientX;
  const onMove = (ev: MouseEvent) => {
    const step = (ev.clientX - lastX) / pxPerSec;
    lastX = ev.clientX;
    if (Math.abs(step) > 1e-6) onStep(step);
  };
  const onUp = () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

export function StudioTimeline({
  project, onSeek, onSelect, onMoveClip, onMoveClipTrack, onTrimClip,
  onMoveText, onTrimText, onMoveImage, onTrimImage, onZoom,
}: StudioTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lanesRef = useRef<HTMLDivElement>(null);
  const [clipDrag, setClipDrag] = useState<ClipDragPreview | null>(null);
  const dragSession = useRef<{
    clip: VideoClip;
    origTrackId: string;
    origStart: number;
    startX: number;
    startY: number;
    moved: boolean;
    raf: number;
  } | null>(null);

  const width = Math.max(720, project.duration * project.pxPerSec + 80);

  const step = project.duration > 120 ? 30 : project.duration > 30 ? 10 : 5;
  const ticks: number[] = [];
  for (let t = 0; t <= project.duration; t += step) ticks.push(t);

  const playheadX = project.currentTime * project.pxPerSec;

  const laneTimeFromEvent = useCallback((clientX: number) => {
    const lanes = lanesRef.current;
    if (!lanes) return 0;
    const rect = lanes.getBoundingClientRect();
    const scroll = scrollRef.current?.scrollLeft ?? 0;
    const x = clientX - rect.left + scroll - LABEL_W;
    return Math.max(0, Math.min(x / project.pxPerSec, project.duration));
  }, [project.duration, project.pxPerSec]);

  const videoTrackAtY = useCallback((clientY: number): string => {
    const lanes = lanesRef.current;
    if (!lanes) return VIDEO_TRACK_IDS[0];
    for (const trackId of VIDEO_TRACK_IDS) {
      const lane = lanes.querySelector(`[data-track-id="${trackId}"] .vstudio-track__lane`);
      const rect = lane?.getBoundingClientRect();
      if (rect && clientY >= rect.top && clientY <= rect.bottom) return trackId;
    }
    // Snap to nearest video lane when between tracks
    const rows = VIDEO_TRACK_IDS.map((id) => {
      const lane = lanes.querySelector(`[data-track-id="${id}"] .vstudio-track__lane`);
      const rect = lane?.getBoundingClientRect();
      return { id, mid: rect ? rect.top + rect.height / 2 : 0 };
    });
    let best = rows[0];
    let bestDist = Infinity;
    for (const row of rows) {
      const d = Math.abs(clientY - row.mid);
      if (d < bestDist) { bestDist = d; best = row; }
    }
    return best.id;
  }, []);

  const trackLaneTop = useCallback((trackId: string) => {
    const lanes = lanesRef.current;
    if (!lanes) return 0;
    const trackRow = lanes.querySelector(`[data-track-id="${trackId}"]`);
    if (!trackRow) return 0;
    return (trackRow as HTMLElement).offsetTop;
  }, []);

  const autoScroll = useCallback((clientX: number) => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const rect = scroller.getBoundingClientRect();
    const edge = 48;
    if (clientX < rect.left + edge) scroller.scrollLeft -= 12;
    else if (clientX > rect.right - edge) scroller.scrollLeft += 12;
  }, []);

  const updateClipDragPreview = useCallback((clientX: number, clientY: number) => {
    const session = dragSession.current;
    if (!session) return;
    const dx = clientX - session.startX;
    const dy = clientY - session.startY;
    if (!session.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
    session.moved = true;

    const previewStart = Math.max(0, session.origStart + dx / project.pxPerSec);
    const previewTrack = videoTrackAtY(clientY);

    setClipDrag({
      clipId: session.clip.id,
      trackId: previewTrack,
      start: previewStart,
      duration: session.clip.duration,
      assetId: session.clip.assetId,
      speedStart: session.clip.speedStart,
      speedEnd: session.clip.speedEnd,
    });
    autoScroll(clientX);
  }, [autoScroll, project.pxPerSec, videoTrackAtY]);

  const startClipMove = (clip: VideoClip, trackId: string) => (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.vstudio-clip__handle')) return;
    e.stopPropagation();
    e.preventDefault();
    onSelect({ kind: 'clip', id: clip.id });

    dragSession.current = {
      clip,
      origTrackId: trackId,
      origStart: clip.start,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      raf: 0,
    };

    setClipDrag({
      clipId: clip.id,
      trackId,
      start: clip.start,
      duration: clip.duration,
      assetId: clip.assetId,
      speedStart: clip.speedStart,
      speedEnd: clip.speedEnd,
    });

    const onMove = (ev: MouseEvent) => {
      const session = dragSession.current;
      if (!session) return;
      if (session.raf) cancelAnimationFrame(session.raf);
      session.raf = requestAnimationFrame(() => {
        if (dragSession.current) dragSession.current.raf = 0;
        updateClipDragPreview(ev.clientX, ev.clientY);
      });
    };

    const onUp = (ev: MouseEvent) => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      const session = dragSession.current;
      dragSession.current = null;
      setClipDrag(null);

      if (!session) return;
      if (!session.moved) return;

      const previewStart = Math.max(0, session.origStart + (ev.clientX - session.startX) / project.pxPerSec);
      const previewTrack = videoTrackAtY(ev.clientY);
      onMoveClip(session.clip.id, previewStart);
      if (previewTrack !== session.origTrackId) {
        onMoveClipTrack(session.clip.id, previewTrack);
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const startClipTrim = (clipId: string, side: 'start' | 'end') => (e: React.MouseEvent) => {
    bindIncrementalDrag(e, project.pxPerSec, (d) => onTrimClip(clipId, side, d));
  };

  const startPlayheadDrag = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const onMove = (ev: MouseEvent) => onSeek(laneTimeFromEvent(ev.clientX));
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const startOverlayDrag = (
    kind: 'text' | 'image',
    id: string,
    mode: 'move' | 'trim-start' | 'trim-end',
    origStart: number,
  ) => (e: React.MouseEvent) => {
    if (mode === 'trim-start' || mode === 'trim-end') {
      const side = mode === 'trim-start' ? 'start' : 'end';
      const trim = kind === 'text' ? onTrimText : onTrimImage;
      bindIncrementalDrag(e, project.pxPerSec, (d) => trim(id, side, d));
      return;
    }
    if ((e.target as HTMLElement).closest('.vstudio-clip__handle')) return;

    e.stopPropagation();
    const dragStartX = e.clientX;
    let moved = false;
    const onMove = (ev: MouseEvent) => {
      if (Math.abs(ev.clientX - dragStartX) > DRAG_THRESHOLD_PX) moved = true;
      const move = kind === 'text' ? onMoveText : onMoveImage;
      move(id, Math.max(0, origStart + (ev.clientX - dragStartX) / project.pxPerSec));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      void moved;
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const trackHeight = (type: string) => (type === 'text' ? TRACK_H_TEXT : TRACK_H);

  const clipsForTrack = (trackId: string) => project.clips.filter((c) => c.trackId === trackId);
  const draggingId = clipDrag?.clipId ?? null;

  const renderVideoClip = (clip: VideoClip, trackId: string, ghost = false) => {
    const asset = project.assets.find((a) => a.id === clip.assetId);
    const preview = ghost && clipDrag ? clipDrag : null;
    const left = (preview?.start ?? clip.start) * project.pxPerSec;
    const w = Math.max((preview?.duration ?? clip.duration) * project.pxPerSec, 24);
    const selected = !ghost && project.selection?.kind === 'clip' && project.selection.id === clip.id;
    const isSource = !ghost && draggingId === clip.id;
    const speedBadge = clip.speedStart !== 1 || clip.speedEnd !== 1;

    return (
      <div
        key={ghost ? 'ghost' : clip.id}
        className={[
          'vstudio-clip', 'vstudio-clip--video',
          selected ? 'is-selected' : '',
          isSource ? 'is-dragging-source' : '',
          ghost ? 'vstudio-clip--ghost' : '',
        ].filter(Boolean).join(' ')}
        style={{
          left: `${left}px`,
          width: `${w}px`,
          ...(ghost && preview ? {
            top: `${trackLaneTop(preview.trackId) + 4}px`,
            height: `${TRACK_H - 8}px`,
            bottom: 'auto',
          } : {}),
        }}
        onClick={ghost ? undefined : (e) => { e.stopPropagation(); onSelect({ kind: 'clip', id: clip.id }); }}
        onMouseDown={ghost ? undefined : startClipMove(clip, trackId)}
      >
        <div className="vstudio-clip__body">
          <div className="vstudio-clip__thumbs">
            {asset?.thumbnails?.slice(0, 12).map((src, i) => (
              <img key={i} src={src} alt="" draggable={false} />
            ))}
          </div>
          {speedBadge && (
            <span className="vstudio-clip__speed">
              {clip.speedStart.toFixed(1)}×→{clip.speedEnd.toFixed(1)}×
            </span>
          )}
          <span className="vstudio-clip__name">{asset?.name ?? 'Clip'}</span>
        </div>
        {!ghost && (
          <>
            <div className="vstudio-clip__handle vstudio-clip__handle--l" onMouseDown={startClipTrim(clip.id, 'start')} />
            <div className="vstudio-clip__handle vstudio-clip__handle--r" onMouseDown={startClipTrim(clip.id, 'end')} />
          </>
        )}
      </div>
    );
  };

  const ghostClip = clipDrag
    ? project.clips.find((c) => c.id === clipDrag.clipId)
    : null;

  return (
    <div className={`vstudio-timeline-wrap${clipDrag ? ' is-clip-dragging' : ''}`}>
      <div className="vstudio-timeline__header">
        <span className="vstudio-timeline__title">Timeline</span>
        <div className="vstudio-timeline__zoom">
          <button type="button" className="btn btn--sm" onClick={() => onZoom(project.pxPerSec - 16)} aria-label="Zoom out">−</button>
          <span>{project.pxPerSec}px/s</span>
          <button type="button" className="btn btn--sm" onClick={() => onZoom(project.pxPerSec + 16)} aria-label="Zoom in">+</button>
        </div>
      </div>

      <div className="vstudio-timeline" ref={scrollRef}>
        <div className="vstudio-timeline__inner" style={{ width: `${width}px` }}>
          <div className="veditor-ruler" style={{ paddingLeft: LABEL_W }}>
            {ticks.map((t) => (
              <div key={t} className="veditor-ruler__tick" style={{ left: `${LABEL_W + t * project.pxPerSec}px` }}>
                <span className="veditor-ruler__label">{fmtShort(t)}</span>
              </div>
            ))}
          </div>

          <div
            ref={lanesRef}
            className="vstudio-tracks"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('.vstudio-clip, .veditor-playhead')) return;
              onSeek(laneTimeFromEvent(e.clientX));
            }}
          >
            {project.tracks.map((track) => (
              <div
                key={track.id}
                className={`vstudio-track${clipDrag?.trackId === track.id && track.type === 'video' ? ' is-drop-target' : ''}`}
                data-track-id={track.id}
                style={{ height: trackHeight(track.type) }}
              >
                <div className="vstudio-track__label">
                  {VIDEO_TRACK_IDS.includes(track.id as typeof VIDEO_TRACK_IDS[number])
                    ? videoTrackLabel(track.id as typeof VIDEO_TRACK_IDS[number])
                    : track.name}
                </div>
                <div className="vstudio-track__lane">
                  {track.type === 'video' && clipsForTrack(track.id).map((clip) => renderVideoClip(clip, track.id))}

                  {track.type === 'audio' && project.clips.map((clip) => {
                    const asset = project.assets.find((a) => a.id === clip.assetId);
                    const left = clip.start * project.pxPerSec;
                    const w = clip.duration * project.pxPerSec;
                    return (
                      <div key={`a-${clip.id}`} className="vstudio-clip vstudio-clip--audio"
                        style={{ left: `${left}px`, width: `${w}px` }}>
                        <div className="vstudio-clip__wave">
                          {asset?.waveform?.map((v, i) => (
                            <div key={i} style={{ height: `${Math.max(8, v * 100)}%` }} />
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {track.type === 'text' && project.textLayers.map((t) => {
                    const left = t.start * project.pxPerSec;
                    const w = Math.max((t.end - t.start) * project.pxPerSec, 64);
                    const selected = project.selection?.kind === 'text' && project.selection.id === t.id;
                    return (
                      <div
                        key={t.id}
                        className={`vstudio-clip vstudio-clip--text${selected ? ' is-selected' : ''}`}
                        style={{ left: `${left}px`, width: `${w}px` }}
                        onClick={(e) => { e.stopPropagation(); onSelect({ kind: 'text', id: t.id }); }}
                      >
                        <div className="vstudio-clip__body" onMouseDown={startOverlayDrag('text', t.id, 'move', t.start)}>
                          <span className="vstudio-clip__label">{t.text}</span>
                        </div>
                        <div className="vstudio-clip__handle vstudio-clip__handle--overlay vstudio-clip__handle--l" onMouseDown={startOverlayDrag('text', t.id, 'trim-start', t.start)} />
                        <div className="vstudio-clip__handle vstudio-clip__handle--overlay vstudio-clip__handle--r" onMouseDown={startOverlayDrag('text', t.id, 'trim-end', t.start)} />
                      </div>
                    );
                  })}

                  {track.type === 'image' && project.imageLayers.map((im) => {
                    const asset = project.assets.find((a) => a.id === im.assetId);
                    const left = im.start * project.pxPerSec;
                    const w = Math.max((im.end - im.start) * project.pxPerSec, 64);
                    const label = asset?.name ?? 'Image';
                    const selected = project.selection?.kind === 'image' && project.selection.id === im.id;
                    return (
                      <div
                        key={im.id}
                        className={`vstudio-clip vstudio-clip--image${selected ? ' is-selected' : ''}`}
                        style={{ left: `${left}px`, width: `${w}px` }}
                        onClick={(e) => { e.stopPropagation(); onSelect({ kind: 'image', id: im.id }); }}
                      >
                        <div className="vstudio-clip__body" onMouseDown={startOverlayDrag('image', im.id, 'move', im.start)}>
                          <span className="vstudio-clip__label">{label}</span>
                        </div>
                        <div className="vstudio-clip__handle vstudio-clip__handle--overlay vstudio-clip__handle--l" onMouseDown={startOverlayDrag('image', im.id, 'trim-start', im.start)} />
                        <div className="vstudio-clip__handle vstudio-clip__handle--overlay vstudio-clip__handle--r" onMouseDown={startOverlayDrag('image', im.id, 'trim-end', im.start)} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {ghostClip && clipDrag && renderVideoClip(ghostClip, clipDrag.trackId, true)}

            <div
              className="veditor-playhead veditor-playhead--draggable"
              style={{ left: `${LABEL_W + playheadX}px` }}
              onMouseDown={startPlayheadDrag}
              role="slider"
              aria-label="Playhead"
              aria-valuemin={0}
              aria-valuemax={project.duration}
              aria-valuenow={project.currentTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
