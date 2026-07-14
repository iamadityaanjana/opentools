import { FFmpeg } from '@ffmpeg/ffmpeg';
import { downloadWithProgress } from '@ffmpeg/util';

const CORE_JS = '/ffmpeg-core.js';
const CORE_WASM = '/ffmpeg-core.wasm';
const WORKER_JS = '/ffmpeg-worker.mjs';

/** Absolute http(s) URL — @ffmpeg/ffmpeg resolves classWorkerURL against import.meta.url which can be file://. */
function publicUrl(path: string): string {
  if (typeof window === 'undefined') return path;
  return new URL(path, window.location.origin).href;
}

let _instance: FFmpeg | null = null;
let _loadPromise: Promise<FFmpeg> | null = null;

// Re-export exec helpers for video tools / editor.
export { deleteQuiet, execAndRead, isFsError, probeHasAudio, writeBytes, writeInputFile } from './ffmpegExec';
export { toMemfsBytes } from './ffmpegExec';

// Shared loading progress — broadcast to all subscribers
const _subs = new Set<(pct: number, label: string) => void>();
let _lastPct = 0;
let _lastLabel = '';

function broadcast(pct: number, label: string) {
  _lastPct = pct;
  _lastLabel = label;
  _subs.forEach((fn) => fn(pct, label));
}

function pctFromDownload(received: number, total: number, base: number, span: number): number {
  if (total <= 0) return base;
  return Math.min(base + Math.round((received / total) * span), base + span);
}

/**
 * Subscribe to FFmpeg load progress (fires during first WASM download and init).
 * Returns an unsubscribe function. Immediately fires with the current state.
 */
export function onFFmpegProgress(fn: (pct: number, label: string) => void): () => void {
  _subs.add(fn);
  fn(_lastPct, _lastLabel);
  return () => _subs.delete(fn);
}

/**
 * Returns the shared FFmpeg singleton.
 * On first call it downloads the ~31 MB WASM with progress reporting.
 * Subsequent calls return the cached instance immediately.
 */
export async function getFFmpeg(): Promise<FFmpeg> {
  if (_instance?.loaded) return _instance;
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    try {
      broadcast(0, 'Downloading video engine…');

      // Warm the browser cache with byte-level progress (load uses the same URLs).
      await Promise.all([
        downloadWithProgress(CORE_JS, ({ received, total }) => {
          const pct = pctFromDownload(received, total, 0, 42);
          const label = total > 0
            ? `Downloading video engine… ${Math.round((received / total) * 100)}%`
            : 'Downloading video engine…';
          broadcast(pct, label);
        }),
        downloadWithProgress(CORE_WASM, ({ received, total }) => {
          const pct = pctFromDownload(received, total, 45, 40);
          const label = total > 0
            ? `Downloading video engine… ${Math.round((received / total) * 100)}%`
            : 'Downloading video engine…';
          broadcast(pct, label);
        }),
      ]);

      broadcast(88, 'Initialising FFmpeg…');

      const ffmpeg = new FFmpeg();
      // Public worker avoids webpack's "expression is too dynamic" on blob/core imports.
      await ffmpeg.load({
        classWorkerURL: publicUrl(WORKER_JS),
        coreURL: publicUrl(CORE_JS),
        wasmURL: publicUrl(CORE_WASM),
      });

      broadcast(100, 'Ready');
      _instance = ffmpeg;
      return ffmpeg;
    } catch (err) {
      _loadPromise = null;
      _lastPct = 0;
      _lastLabel = '';
      throw err;
    }
  })();

  return _loadPromise;
}

/** Build a chain of `atempo` filters. Per-filter range: 0.5–2.0. */
export function buildAtempoChain(speed: number): string {
  const filters: string[] = [];
  let rem = speed;
  if (speed >= 1) {
    while (rem > 2.0) { filters.push('atempo=2.0'); rem /= 2.0; }
  } else {
    while (rem < 0.5) { filters.push('atempo=0.5'); rem /= 0.5; }
  }
  filters.push(`atempo=${rem.toFixed(6)}`);
  return filters.join(',');
}

/** Derive MIME type from file extension. */
export function videoMime(ext: string): string {
  const map: Record<string, string> = {
    mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
    avi: 'video/x-msvideo', mkv: 'video/x-matroska',
    gif: 'image/gif', mp3: 'audio/mpeg', aac: 'audio/aac', wav: 'audio/wav',
  };
  return map[ext.toLowerCase()] ?? 'application/octet-stream';
}

/** Returns true if the singleton is already loaded (no download needed). */
export function isFFmpegLoaded(): boolean {
  return !!(_instance?.loaded);
}

/** Terminate a broken worker so the next getFFmpeg() starts fresh. */
export async function resetFFmpeg(): Promise<void> {
  if (_instance) {
    try { _instance.terminate(); } catch { /* ignore */ }
    _instance = null;
  }
  _loadPromise = null;
  _lastPct = 0;
  _lastLabel = '';
}
