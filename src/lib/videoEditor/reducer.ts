import type {
  EditorProject, VideoClip, TextLayer, ImageLayer, Selection, VideoTrackId,
} from './types';
import { VIDEO_TRACK_IDS, defaultClipFields } from './types';
import { sourceTimeAt, speedAt } from './speed';
import { uid, computeDuration } from './utils';

export function createEmptyProject(): EditorProject {
  return {
    assets: [],
    tracks: [
      { id: 'track_video_1', type: 'video', name: 'Video 1', muted: false, visible: true },
      { id: 'track_video_2', type: 'video', name: 'Video 2', muted: false, visible: true },
      { id: 'track_audio', type: 'audio', name: 'Audio', muted: false, visible: true },
      { id: 'track_text', type: 'text', name: 'Text', muted: false, visible: true },
      { id: 'track_image', type: 'image', name: 'Overlay', muted: false, visible: true },
    ],
    clips: [],
    textLayers: [],
    imageLayers: [],
    duration: 30,
    projectWidth: 1920,
    projectHeight: 1080,
    currentTime: 0,
    isPlaying: false,
    selection: null,
    pxPerSec: 80,
  };
}

export type EditorAction =
  | { type: 'ADD_ASSET'; asset: import('./types').MediaAsset }
  | { type: 'ADD_VIDEO_FROM_ASSET'; assetId: string; trackId?: VideoTrackId }
  | { type: 'SET_CURRENT_TIME'; time: number }
  | { type: 'SET_PLAYING'; playing: boolean }
  | { type: 'SELECT'; selection: Selection }
  | { type: 'SPLIT_AT_PLAYHEAD' }
  | { type: 'DELETE_SELECTED' }
  | { type: 'MOVE_CLIP'; clipId: string; start: number }
  | { type: 'MOVE_CLIP_TRACK'; clipId: string; trackId: string }
  | { type: 'TRIM_CLIP'; clipId: string; side: 'start' | 'end'; delta: number }
  | { type: 'UPDATE_CLIP'; id: string; patch: Partial<Pick<VideoClip, 'speedStart' | 'speedEnd' | 'easing'>> }
  | { type: 'MOVE_TEXT'; id: string; start: number }
  | { type: 'TRIM_TEXT'; id: string; side: 'start' | 'end'; delta: number }
  | { type: 'MOVE_IMAGE'; id: string; start: number }
  | { type: 'TRIM_IMAGE'; id: string; side: 'start' | 'end'; delta: number }
  | { type: 'ADD_TEXT' }
  | { type: 'UPDATE_TEXT'; id: string; patch: Partial<TextLayer> }
  | { type: 'ADD_IMAGE'; assetId: string }
  | { type: 'UPDATE_IMAGE'; id: string; patch: Partial<ImageLayer> }
  | { type: 'TOGGLE_TRACK_MUTE'; trackId: string }
  | { type: 'TOGGLE_TRACK_VISIBLE'; trackId: string }
  | { type: 'SET_ZOOM'; pxPerSec: number }
  | { type: 'RESET' };

function recalc(p: EditorProject): EditorProject {
  const duration = computeDuration(p.assets, p.clips, p.textLayers, p.imageLayers);
  return { ...p, duration: Math.max(duration, 1) };
}

/** Minimum timeline duration when trimming clips / overlays. */
export const MIN_CLIP_DURATION = 0.4;
export const MIN_OVERLAY_DURATION = 0.3;

function pickVideoTrack(state: EditorProject, preferred?: VideoTrackId): VideoTrackId {
  if (preferred && VIDEO_TRACK_IDS.includes(preferred)) return preferred;
  for (const tid of VIDEO_TRACK_IDS) {
    if (!state.clips.some((c) => c.trackId === tid)) return tid;
  }
  return 'track_video_1';
}

export function editorReducer(state: EditorProject, action: EditorAction): EditorProject {
  switch (action.type) {
    case 'ADD_ASSET':
      return recalc({ ...state, assets: [...state.assets, action.asset] });

    case 'ADD_VIDEO_FROM_ASSET': {
      const asset = state.assets.find((a) => a.id === action.assetId);
      if (!asset || asset.kind !== 'video') return state;
      const trackId = pickVideoTrack(state, action.trackId);
      const clip: VideoClip = {
        id: uid('clip'),
        assetId: asset.id,
        trackId,
        start: state.currentTime > 0 ? state.currentTime : 0,
        duration: asset.duration,
        trimIn: 0,
        trimOut: asset.duration,
        ...defaultClipFields(),
      };
      return recalc({
        ...state,
        clips: [...state.clips, clip],
        projectWidth: asset.width ?? state.projectWidth,
        projectHeight: asset.height ?? state.projectHeight,
        selection: { kind: 'clip', id: clip.id },
      });
    }

    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: Math.max(0, Math.min(action.time, state.duration)) };

    case 'SET_PLAYING':
      return { ...state, isPlaying: action.playing };

    case 'SELECT':
      return { ...state, selection: action.selection };

    case 'SPLIT_AT_PLAYHEAD': {
      const t = state.currentTime;
      const clip = state.clips.find((c) => t > c.start + MIN_CLIP_DURATION && t < c.start + c.duration - MIN_CLIP_DURATION);
      if (!clip) return state;
      const rel = t - clip.start;
      const left: VideoClip = { ...clip, duration: rel, trimOut: clip.trimIn + rel };
      const right: VideoClip = {
        ...clip,
        id: uid('clip'),
        start: t,
        duration: clip.duration - rel,
        trimIn: clip.trimIn + rel,
      };
      return recalc({
        ...state,
        clips: state.clips.flatMap((c) => (c.id === clip.id ? [left, right] : [c])),
        selection: { kind: 'clip', id: right.id },
      });
    }

    case 'DELETE_SELECTED': {
      if (!state.selection) return state;
      if (state.selection.kind === 'clip') {
        return recalc({ ...state, clips: state.clips.filter((c) => c.id !== state.selection!.id), selection: null });
      }
      if (state.selection.kind === 'text') {
        return recalc({ ...state, textLayers: state.textLayers.filter((x) => x.id !== state.selection!.id), selection: null });
      }
      return recalc({ ...state, imageLayers: state.imageLayers.filter((x) => x.id !== state.selection!.id), selection: null });
    }

    case 'MOVE_CLIP': {
      const start = Math.max(0, action.start);
      return recalc({
        ...state,
        clips: state.clips.map((c) => (c.id === action.clipId ? { ...c, start } : c)),
      });
    }

    case 'MOVE_CLIP_TRACK':
      if (!VIDEO_TRACK_IDS.includes(action.trackId as VideoTrackId)) return state;
      return {
        ...state,
        clips: state.clips.map((c) => (c.id === action.clipId ? { ...c, trackId: action.trackId } : c)),
      };

    case 'TRIM_CLIP': {
      const clip = state.clips.find((c) => c.id === action.clipId);
      if (!clip) return state;
      const asset = state.assets.find((a) => a.id === clip.assetId);
      const srcMax = asset?.duration ?? clip.trimOut;
      const minDur = MIN_CLIP_DURATION;

      if (action.side === 'start') {
        const d = Math.max(-clip.start, Math.min(action.delta, clip.duration - minDur));
        if (Math.abs(d) < 1e-6) return state;
        return recalc({
          ...state,
          clips: state.clips.map((c) => c.id === clip.id ? {
            ...c,
            start: c.start + d,
            duration: c.duration - d,
            trimIn: Math.min(c.trimIn + d, c.trimOut - minDur),
          } : c),
        });
      }
      const d = Math.max(-(clip.duration - minDur), Math.min(action.delta, srcMax - clip.trimOut));
      if (Math.abs(d) < 1e-6) return state;
      return recalc({
        ...state,
        clips: state.clips.map((c) => c.id === clip.id ? {
          ...c,
          duration: c.duration + d,
          trimOut: Math.min(c.trimOut + d, srcMax),
        } : c),
      });
    }

    case 'UPDATE_CLIP':
      return {
        ...state,
        clips: state.clips.map((c) => c.id === action.id ? { ...c, ...action.patch } : c),
      };

    case 'ADD_TEXT': {
      const layer: TextLayer = {
        id: uid('text'), text: 'Your text', x: 50, y: 50, fontSize: 72, color: '#ffffff',
        start: state.currentTime,
        end: Math.min(state.currentTime + 5, state.duration),
      };
      return recalc({ ...state, textLayers: [...state.textLayers, layer], selection: { kind: 'text', id: layer.id } });
    }

    case 'UPDATE_TEXT':
      return recalc({
        ...state,
        textLayers: state.textLayers.map((t) => {
          if (t.id !== action.id) return t;
          const next = { ...t, ...action.patch };
          if (next.end - next.start < MIN_OVERLAY_DURATION) {
            if (action.patch.end !== undefined) next.end = next.start + MIN_OVERLAY_DURATION;
            else next.start = Math.max(0, next.end - MIN_OVERLAY_DURATION);
          }
          next.start = Math.max(0, next.start);
          return next;
        }),
      });

    case 'MOVE_TEXT': {
      const layer = state.textLayers.find((t) => t.id === action.id);
      if (!layer) return state;
      const dur = layer.end - layer.start;
      const start = Math.max(0, action.start);
      return recalc({
        ...state,
        textLayers: state.textLayers.map((t) => t.id === action.id ? { ...t, start, end: start + dur } : t),
      });
    }

    case 'TRIM_TEXT': {
      const layer = state.textLayers.find((t) => t.id === action.id);
      if (!layer) return state;
      const minDur = MIN_OVERLAY_DURATION;
      if (action.side === 'start') {
        const d = Math.max(-layer.start, Math.min(action.delta, (layer.end - layer.start) - minDur));
        if (Math.abs(d) < 1e-6) return state;
        return recalc({
          ...state,
          textLayers: state.textLayers.map((t) => t.id === action.id ? { ...t, start: t.start + d } : t),
        });
      }
      const d = Math.max(-((layer.end - layer.start) - minDur), action.delta);
      if (Math.abs(d) < 1e-6) return state;
      return recalc({
        ...state,
        textLayers: state.textLayers.map((t) => t.id === action.id ? { ...t, end: t.end + d } : t),
      });
    }

    case 'ADD_IMAGE': {
      const asset = state.assets.find((a) => a.id === action.assetId);
      if (!asset || asset.kind !== 'image') return state;
      const layer: ImageLayer = {
        id: uid('img'), assetId: asset.id, x: 20, y: 20, width: 30, opacity: 1,
        start: state.currentTime, end: Math.min(state.currentTime + 5, state.duration),
      };
      return recalc({ ...state, imageLayers: [...state.imageLayers, layer], selection: { kind: 'image', id: layer.id } });
    }

    case 'UPDATE_IMAGE':
      return recalc({
        ...state,
        imageLayers: state.imageLayers.map((im) => {
          if (im.id !== action.id) return im;
          const next = { ...im, ...action.patch };
          if (next.end - next.start < MIN_OVERLAY_DURATION) {
            if (action.patch.end !== undefined) next.end = next.start + MIN_OVERLAY_DURATION;
            else next.start = Math.max(0, next.end - MIN_OVERLAY_DURATION);
          }
          next.start = Math.max(0, next.start);
          return next;
        }),
      });

    case 'MOVE_IMAGE': {
      const layer = state.imageLayers.find((im) => im.id === action.id);
      if (!layer) return state;
      const dur = layer.end - layer.start;
      const start = Math.max(0, action.start);
      return recalc({
        ...state,
        imageLayers: state.imageLayers.map((im) => im.id === action.id ? { ...im, start, end: start + dur } : im),
      });
    }

    case 'TRIM_IMAGE': {
      const layer = state.imageLayers.find((im) => im.id === action.id);
      if (!layer) return state;
      const minDur = MIN_OVERLAY_DURATION;
      if (action.side === 'start') {
        const d = Math.max(-layer.start, Math.min(action.delta, (layer.end - layer.start) - minDur));
        if (Math.abs(d) < 1e-6) return state;
        return recalc({
          ...state,
          imageLayers: state.imageLayers.map((im) => im.id === action.id ? { ...im, start: im.start + d } : im),
        });
      }
      const d = Math.max(-((layer.end - layer.start) - minDur), action.delta);
      if (Math.abs(d) < 1e-6) return state;
      return recalc({
        ...state,
        imageLayers: state.imageLayers.map((im) => im.id === action.id ? { ...im, end: im.end + d } : im),
      });
    }

    case 'TOGGLE_TRACK_MUTE':
      return { ...state, tracks: state.tracks.map((tr) => tr.id === action.trackId ? { ...tr, muted: !tr.muted } : tr) };

    case 'TOGGLE_TRACK_VISIBLE':
      return { ...state, tracks: state.tracks.map((tr) => tr.id === action.trackId ? { ...tr, visible: !tr.visible } : tr) };

    case 'SET_ZOOM':
      return { ...state, pxPerSec: Math.max(32, Math.min(200, action.pxPerSec)) };

    case 'RESET':
      return createEmptyProject();

    default:
      return state;
  }
}

export function clipAtTime(clips: VideoClip[], t: number, trackId?: string): VideoClip | null {
  return clips.find((c) =>
    (!trackId || c.trackId === trackId) && t >= c.start && t < c.start + c.duration,
  ) ?? null;
}

export function clipsAtTime(clips: VideoClip[], t: number): VideoClip[] {
  return VIDEO_TRACK_IDS
    .map((tid) => clipAtTime(clips, t, tid))
    .filter((c): c is VideoClip => !!c);
}

export function sourceTime(clip: VideoClip, timelineTime: number): number {
  return sourceTimeAt(clip, timelineTime);
}

/** Playback rate at timeline position within a clip (for preview). */
export function playbackRateAt(clip: VideoClip, timelineTime: number): number {
  const u = (timelineTime - clip.start) / clip.duration;
  return speedAt(u, clip.speedStart, clip.speedEnd, clip.easing);
}
