import type { SpeedEasing } from './speed';

export type AssetKind = 'video' | 'audio' | 'image';

export const VIDEO_TRACK_IDS = ['track_video_1', 'track_video_2'] as const;
export type VideoTrackId = (typeof VIDEO_TRACK_IDS)[number];

export interface MediaAsset {
  id: string;
  kind: AssetKind;
  file: File;
  url: string;
  name: string;
  duration: number;
  width?: number;
  height?: number;
  thumbnails?: string[];
  waveform?: number[];
}

export interface VideoClip {
  id: string;
  assetId: string;
  trackId: string;
  start: number;
  duration: number;
  trimIn: number;
  trimOut: number;
  /** Playback speed at clip start (0.25–4). */
  speedStart: number;
  /** Playback speed at clip end — ramp when different from speedStart. */
  speedEnd: number;
  easing: SpeedEasing;
}

export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  start: number;
  end: number;
}

export interface ImageLayer {
  id: string;
  assetId: string;
  x: number;
  y: number;
  width: number;
  opacity: number;
  start: number;
  end: number;
}

export type TrackType = 'video' | 'audio' | 'text' | 'image';

export interface Track {
  id: string;
  type: TrackType;
  name: string;
  muted: boolean;
  visible: boolean;
}

export type Selection =
  | { kind: 'clip'; id: string }
  | { kind: 'text'; id: string }
  | { kind: 'image'; id: string }
  | null;

export interface EditorProject {
  assets: MediaAsset[];
  tracks: Track[];
  clips: VideoClip[];
  textLayers: TextLayer[];
  imageLayers: ImageLayer[];
  duration: number;
  projectWidth: number;
  projectHeight: number;
  currentTime: number;
  isPlaying: boolean;
  selection: Selection;
  pxPerSec: number;
}

export interface ExportSettings {
  format: 'mp4' | 'webm';
  quality: 'medium' | 'high';
}

export function defaultClipFields(): Pick<VideoClip, 'speedStart' | 'speedEnd' | 'easing'> {
  return { speedStart: 1, speedEnd: 1, easing: 'linear' };
}
