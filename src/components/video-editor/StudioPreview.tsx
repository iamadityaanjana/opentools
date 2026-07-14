'use client';

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { EditorProject, TextLayer, ImageLayer, VideoClip, VideoTrackId } from '../../lib/videoEditor/types';
import { VIDEO_TRACK_IDS } from '../../lib/videoEditor/types';
import { clipAtTime } from '../../lib/videoEditor/reducer';
import { videoTrackLabel, videoTrackZIndex, videoTracksBottomToTop } from '../../lib/videoEditor/tracks';

interface StudioPreviewProps {
  videoRefs: Record<string, RefObject<HTMLVideoElement | null>>;
  project: EditorProject;
  onSelectText: (id: string) => void;
  onUpdateText: (id: string, patch: Partial<TextLayer>) => void;
  onSelectImage: (id: string) => void;
  onUpdateImage: (id: string, patch: Partial<ImageLayer>) => void;
}

function clipForTrack(clips: VideoClip[], t: number, trackId: string): VideoClip | null {
  return clipAtTime(clips, t, trackId);
}

export function StudioPreview({
  videoRefs, project, onSelectText, onUpdateText, onSelectImage, onUpdateImage,
}: StudioPreviewProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setStageSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scaleX = stageSize.w > 0 ? stageSize.w / project.projectWidth : 1;
  const scaleY = stageSize.h > 0 ? stageSize.h / project.projectHeight : scaleX;
  const previewScale = Math.min(scaleX, scaleY);

  const visibleTexts = project.textLayers.filter(
    (t) => project.currentTime >= t.start && project.currentTime <= t.end,
  );
  const visibleImages = project.imageLayers.filter(
    (im) => project.currentTime >= im.start && project.currentTime <= im.end,
  );

  const activeVideoTracks = VIDEO_TRACK_IDS.filter((trackId) => {
    const track = project.tracks.find((t) => t.id === trackId);
    return track?.visible !== false && clipForTrack(project.clips, project.currentTime, trackId);
  });
  const hasVideo = activeVideoTracks.length > 0;

  const renderVideo = (trackId: VideoTrackId) => {
    const clip = clipForTrack(project.clips, project.currentTime, trackId);
    const asset = clip ? project.assets.find((a) => a.id === clip.assetId) : null;
    const track = project.tracks.find((t) => t.id === trackId);
    const active = !!clip && !!asset && track?.visible !== false;
    const z = videoTrackZIndex(trackId);

    return (
      <div
        key={trackId}
        className={`vstudio-preview__video-wrap${active ? ' is-active' : ''}`}
        style={{ zIndex: z }}
      >
        <video
          ref={videoRefs[trackId]}
          className="vstudio-preview__video"
          playsInline
          muted={project.tracks.find((t) => t.id === 'track_audio')?.muted ?? true}
          preload="auto"
        />
        {active && (
          <span className="vstudio-preview__layer-badge" aria-hidden>
            {videoTrackLabel(trackId)}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="vstudio-preview">
      <div className="vstudio-preview__stage" ref={stageRef}>
        {!hasVideo && project.clips.length === 0 ? (
          <div className="vstudio-preview__empty">Add a video clip to the timeline</div>
        ) : (
          <>
            {activeVideoTracks.length >= 2 && (
              <div className="vstudio-preview__stack-hint">
                {activeVideoTracks.length} video layers · top row covers lower row
              </div>
            )}
            {videoTracksBottomToTop().map((trackId) => renderVideo(trackId))}
          </>
        )}

        {visibleImages.map((im) => {
          const asset = project.assets.find((a) => a.id === im.assetId);
          if (!asset) return null;
          const selected = project.selection?.kind === 'image' && project.selection.id === im.id;
          return (
            <img
              key={im.id}
              src={asset.url}
              alt=""
              draggable={false}
              className={`vstudio-overlay-img${selected ? ' is-selected' : ''}`}
              style={{
                left: `${im.x}%`,
                top: `${im.y}%`,
                width: `${im.width}%`,
                opacity: im.opacity,
                zIndex: selected ? 22 : 20,
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectImage(im.id);
                const startX = e.clientX;
                const startY = e.clientY;
                const ox = im.x;
                const oy = im.y;
                const stage = stageRef.current;
                if (!stage) return;
                const rect = stage.getBoundingClientRect();
                const maxX = 100 - im.width;
                const onMove = (ev: MouseEvent) => {
                  const nx = ox + ((ev.clientX - startX) / rect.width) * 100;
                  const ny = oy + ((ev.clientY - startY) / rect.height) * 100;
                  onUpdateImage(im.id, {
                    x: Math.max(0, Math.min(maxX, nx)),
                    y: Math.max(0, Math.min(100, ny)),
                  });
                };
                const onUp = () => {
                  document.removeEventListener('mousemove', onMove);
                  document.removeEventListener('mouseup', onUp);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
              }}
            />
          );
        })}

        {visibleTexts.map((t) => {
          const selected = project.selection?.kind === 'text' && project.selection.id === t.id;
          const displaySize = Math.max(12, t.fontSize * previewScale);
          return (
            <div
              key={t.id}
              className={`vstudio-overlay-text${selected ? ' is-selected' : ''}`}
              style={{
                left: `${t.x}%`,
                top: `${t.y}%`,
                fontSize: `${displaySize}px`,
                color: t.color,
                lineHeight: 1.15,
                zIndex: 30,
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelectText(t.id);
                const startX = e.clientX;
                const startY = e.clientY;
                const ox = t.x;
                const oy = t.y;
                const stage = stageRef.current;
                if (!stage) return;
                const rect = stage.getBoundingClientRect();
                const onMove = (ev: MouseEvent) => {
                  const nx = ox + ((ev.clientX - startX) / rect.width) * 100;
                  const ny = oy + ((ev.clientY - startY) / rect.height) * 100;
                  onUpdateText(t.id, { x: Math.max(0, Math.min(100, nx)), y: Math.max(0, Math.min(100, ny)) });
                };
                const onUp = () => {
                  document.removeEventListener('mousemove', onMove);
                  document.removeEventListener('mouseup', onUp);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
              }}
            >
              {t.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
