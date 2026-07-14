import { VIDEO_TRACK_IDS, type VideoTrackId } from './types';

/** 0 = bottom of stack, higher = closer to top (matches top timeline row). */
export function videoTrackStackIndex(trackId: VideoTrackId): number {
  const idx = VIDEO_TRACK_IDS.indexOf(trackId);
  if (idx < 0) return 0;
  return VIDEO_TRACK_IDS.length - 1 - idx;
}

export function videoTrackZIndex(trackId: VideoTrackId): number {
  return videoTrackStackIndex(trackId) + 1;
}

/** Composite bottom → top so the top timeline row ends up on top. */
export function videoTracksBottomToTop(): VideoTrackId[] {
  return [...VIDEO_TRACK_IDS].reverse();
}

export function videoTrackLabel(trackId: VideoTrackId): string {
  return trackId === 'track_video_1' ? 'V1 · top' : 'V2 · under';
}
