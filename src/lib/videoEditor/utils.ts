import type { MediaAsset } from './types';

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 100);
  return `${m}:${String(sec).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
}

export function fmtShort(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export async function probeVideo(file: File): Promise<{
  duration: number;
  width: number;
  height: number;
  url: string;
}> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.src = url;
    v.onloadedmetadata = () => {
      resolve({
        duration: v.duration,
        width: v.videoWidth || 1920,
        height: v.videoHeight || 1080,
        url,
      });
    };
    v.onerror = () => reject(new Error('Could not read video metadata'));
  });
}

export async function probeAudio(file: File): Promise<{ duration: number; url: string }> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const a = document.createElement('audio');
    a.preload = 'metadata';
    a.src = url;
    a.onloadedmetadata = () => resolve({ duration: a.duration, url });
    a.onerror = () => reject(new Error('Could not read audio metadata'));
  });
}

export async function probeImage(file: File): Promise<{ url: string; width: number; height: number }> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ url, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Could not read image'));
    img.src = url;
  });
}

export async function extractThumbnails(url: string, duration: number, count: number): Promise<string[]> {
  return new Promise((resolve) => {
    const vid = document.createElement('video');
    vid.src = url;
    vid.crossOrigin = 'anonymous';
    vid.preload = 'auto';
    const W = 96;
    const H = 54;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    const thumbs: string[] = [];
    let i = 0;

    vid.addEventListener('loadedmetadata', () => {
      const seek = () => {
        if (i >= count) { resolve(thumbs); return; }
        vid.currentTime = (i / count) * duration;
      };
      vid.addEventListener('seeked', () => {
        ctx.drawImage(vid, 0, 0, W, H);
        thumbs.push(canvas.toDataURL('image/jpeg', 0.65));
        i++;
        seek();
      }, { passive: true });
      seek();
    }, { once: true });
  });
}

export async function extractWaveform(file: File, bars: number): Promise<number[]> {
  try {
    const Ctx = window.AudioContext
      ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ac = new Ctx();
    const buf = await file.arrayBuffer();
    const audio = await ac.decodeAudioData(buf);
    const data = audio.getChannelData(0);
    const step = Math.floor(data.length / bars);
    const out: number[] = [];
    for (let i = 0; i < bars; i++) {
      let peak = 0;
      for (let j = 0; j < step; j++) peak = Math.max(peak, Math.abs(data[i * step + j] ?? 0));
      out.push(peak);
    }
    ac.close();
    return out;
  } catch {
    return Array.from({ length: bars }, (_, i) => 0.2 + 0.5 * Math.abs(Math.sin(i * 0.4)));
  }
}

export function computeDuration(assets: MediaAsset[], clips: { start: number; duration: number }[], texts: { end: number }[], images: { end: number }[]): number {
  let max = 0;
  for (const c of clips) max = Math.max(max, c.start + c.duration);
  for (const t of texts) max = Math.max(max, t.end);
  for (const im of images) max = Math.max(max, im.end);
  for (const a of assets) if (a.kind === 'video') max = Math.max(max, a.duration);
  return Math.max(max, 1);
}
