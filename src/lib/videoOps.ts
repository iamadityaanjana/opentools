import type { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { buildAtempoChain, videoMime } from './ffmpeg';

/** Copy FFmpeg output (may be backed by SharedArrayBuffer) into a safe Blob. */
function toBlob(raw: Uint8Array, type: string): Blob {
  const copy = new Uint8Array(raw.byteLength);
  copy.set(raw);
  return new Blob([copy], { type });
}

export interface VideoControl {
  key: string;
  label: string;
  type: 'range' | 'select' | 'number' | 'text' | 'checkbox';
  def: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  options?: { value: string; label: string }[];
  hint?: string;
}

export interface VideoResult {
  blob: Blob;
  filename: string;
  mimeType: string;
}

export interface VideoOp {
  label: string;
  description: string;
  icon: string;
  controls: VideoControl[];
  estimatedTime?: string;
  run: (ffmpeg: FFmpeg, file: File, params: Record<string, string | number | boolean>) => Promise<VideoResult>;
}

function ext(file: File): string {
  return (file.name.split('.').pop() ?? 'mp4').toLowerCase();
}
function base(file: File): string {
  return file.name.replace(/\.[^.]+$/, '');
}

export const VIDEO_OPS: Record<string, VideoOp> = {

  'trim-video': {
    label: 'Trim Video',
    description: 'Cut a video to a specific start and end time.',
    icon: 'scissors',
    estimatedTime: 'Fast — stream copy, no re-encode',
    controls: [
      { key: 'start', label: 'Start (seconds)', type: 'number', def: 0, min: 0, step: 0.1, hint: 'e.g. 5 for 5 seconds in' },
      { key: 'end', label: 'End (seconds)', type: 'number', def: 30, min: 0, step: 0.1, hint: 'leave 0 for end of file' },
    ],
    async run(ffmpeg, file, params) {
      const e = ext(file);
      const start = Number(params.start) || 0;
      const end = Number(params.end) || 0;
      await ffmpeg.writeFile(`in.${e}`, await fetchFile(file));
      const args = ['-ss', String(start)];
      if (end > start) args.push('-to', String(end));
      args.push('-i', `in.${e}`, '-c', 'copy', `out.${e}`);
      await ffmpeg.exec(args);
      const raw = await ffmpeg.readFile(`out.${e}`) as Uint8Array;
      const data = new Uint8Array(raw.buffer instanceof ArrayBuffer ? raw.buffer : raw.buffer.slice(0));
      await Promise.all([ffmpeg.deleteFile(`in.${e}`), ffmpeg.deleteFile(`out.${e}`)]);
      return { blob: toBlob(raw, videoMime(e)), filename: `${base(file)}-trimmed.${e}`, mimeType: videoMime(e) };
    },
  },

  'change-video-speed': {
    label: 'Change Video Speed',
    description: 'Speed up or slow down a video.',
    icon: 'fast-forward',
    estimatedTime: 'Requires re-encode — may take a while',
    controls: [
      {
        key: 'speed', label: 'Speed', type: 'select', def: '2',
        options: [
          { value: '0.25', label: '0.25× (very slow)' },
          { value: '0.5', label: '0.5× (slow motion)' },
          { value: '0.75', label: '0.75× (slightly slow)' },
          { value: '1.5', label: '1.5× (slightly fast)' },
          { value: '2', label: '2× (double speed)' },
          { value: '4', label: '4× (very fast)' },
        ],
      },
    ],
    async run(ffmpeg, file, params) {
      const e = ext(file);
      const speed = parseFloat(String(params.speed)) || 1;
      const pts = (1 / speed).toFixed(6);
      await ffmpeg.writeFile(`in.${e}`, await fetchFile(file));
      const vf = `setpts=${pts}*PTS`;
      const af = buildAtempoChain(speed);
      await ffmpeg.exec(['-i', `in.${e}`, '-vf', vf, '-af', af, `out.${e}`]);
      const raw = await ffmpeg.readFile(`out.${e}`) as Uint8Array;
      const data = new Uint8Array(raw.buffer instanceof ArrayBuffer ? raw.buffer : raw.buffer.slice(0));
      await Promise.all([ffmpeg.deleteFile(`in.${e}`), ffmpeg.deleteFile(`out.${e}`)]);
      return { blob: toBlob(raw, videoMime(e)), filename: `${base(file)}-${speed}x.${e}`, mimeType: videoMime(e) };
    },
  },

  'mute-video': {
    label: 'Mute Video',
    description: 'Remove the audio track from a video.',
    icon: 'speaker-slash',
    estimatedTime: 'Very fast — stream copy',
    controls: [],
    async run(ffmpeg, file, _params) {
      const e = ext(file);
      await ffmpeg.writeFile(`in.${e}`, await fetchFile(file));
      await ffmpeg.exec(['-i', `in.${e}`, '-an', '-c:v', 'copy', `out.${e}`]);
      const raw = await ffmpeg.readFile(`out.${e}`) as Uint8Array;
      const data = new Uint8Array(raw.buffer instanceof ArrayBuffer ? raw.buffer : raw.buffer.slice(0));
      await Promise.all([ffmpeg.deleteFile(`in.${e}`), ffmpeg.deleteFile(`out.${e}`)]);
      return { blob: toBlob(raw, videoMime(e)), filename: `${base(file)}-muted.${e}`, mimeType: videoMime(e) };
    },
  },

  'extract-audio': {
    label: 'Extract Audio',
    description: 'Extract the audio track from a video as MP3.',
    icon: 'music-note',
    estimatedTime: 'Fast',
    controls: [
      {
        key: 'quality', label: 'MP3 quality', type: 'select', def: '2',
        options: [
          { value: '0', label: 'Best (VBR 0)' },
          { value: '2', label: 'High (VBR 2)' },
          { value: '5', label: 'Medium (VBR 5)' },
        ],
      },
    ],
    async run(ffmpeg, file, params) {
      const e = ext(file);
      await ffmpeg.writeFile(`in.${e}`, await fetchFile(file));
      await ffmpeg.exec(['-i', `in.${e}`, '-vn', '-acodec', 'libmp3lame', '-q:a', String(params.quality ?? 2), 'out.mp3']);
      const raw = await ffmpeg.readFile('out.mp3') as Uint8Array;
      const data = raw.slice() as Uint8Array<ArrayBuffer>;
      await Promise.all([ffmpeg.deleteFile(`in.${e}`), ffmpeg.deleteFile('out.mp3')]);
      return { blob: toBlob(raw, 'audio/mpeg'), filename: `${base(file)}-audio.mp3`, mimeType: 'audio/mpeg' };
    },
  },

  'compress-video': {
    label: 'Compress Video',
    description: 'Reduce video file size with H.264 re-encoding.',
    icon: 'archive',
    estimatedTime: 'Slow — full re-encode',
    controls: [
      {
        key: 'quality', label: 'Output quality', type: 'select', def: '28',
        options: [
          { value: '23', label: 'High quality (larger file)' },
          { value: '28', label: 'Balanced (recommended)' },
          { value: '35', label: 'Small file (lower quality)' },
        ],
      },
    ],
    async run(ffmpeg, file, params) {
      const e = ext(file) === 'webm' ? 'mp4' : ext(file);
      await ffmpeg.writeFile(`in.${ext(file)}`, await fetchFile(file));
      await ffmpeg.exec([
        '-i', `in.${ext(file)}`,
        '-c:v', 'libx264', '-crf', String(params.quality ?? 28),
        '-preset', 'fast',
        '-c:a', 'aac', '-b:a', '128k',
        `out.${e}`,
      ]);
      const raw = await ffmpeg.readFile(`out.${e}`) as Uint8Array;
      const data = raw.slice() as Uint8Array<ArrayBuffer>;
      await Promise.all([ffmpeg.deleteFile(`in.${ext(file)}`), ffmpeg.deleteFile(`out.${e}`)]);
      return { blob: toBlob(raw, videoMime(e)), filename: `${base(file)}-compressed.${e}`, mimeType: videoMime(e) };
    },
  },

  'convert-video': {
    label: 'Convert Video',
    description: 'Convert between MP4 and WebM formats.',
    icon: 'arrows-clockwise',
    estimatedTime: 'Slow — full re-encode',
    controls: [
      {
        key: 'format', label: 'Output format', type: 'select', def: 'mp4',
        options: [
          { value: 'mp4', label: 'MP4 (H.264 — universal)' },
          { value: 'webm', label: 'WebM (VP9 — web-optimised)' },
        ],
      },
    ],
    async run(ffmpeg, file, params) {
      const e = ext(file);
      const fmt = String(params.format || 'mp4');
      await ffmpeg.writeFile(`in.${e}`, await fetchFile(file));
      const args = fmt === 'webm'
        ? ['-i', `in.${e}`, '-c:v', 'libvpx-vp9', '-crf', '30', '-b:v', '0', '-c:a', 'libopus', 'out.webm']
        : ['-i', `in.${e}`, '-c:v', 'libx264', '-crf', '22', '-c:a', 'aac', 'out.mp4'];
      await ffmpeg.exec(args);
      const raw = await ffmpeg.readFile(`out.${fmt}`) as Uint8Array;
      const data = raw.slice() as Uint8Array<ArrayBuffer>;
      await Promise.all([ffmpeg.deleteFile(`in.${e}`), ffmpeg.deleteFile(`out.${fmt}`)]);
      return { blob: toBlob(raw, videoMime(fmt)), filename: `${base(file)}.${fmt}`, mimeType: videoMime(fmt) };
    },
  },

  'rotate-video': {
    label: 'Rotate Video',
    description: 'Rotate a video 90°, 180°, or 270°.',
    icon: 'arrow-clockwise',
    estimatedTime: 'Medium — re-encode needed for rotation',
    controls: [
      {
        key: 'rotation', label: 'Rotation', type: 'select', def: '1',
        options: [
          { value: '1', label: '90° clockwise' },
          { value: '2', label: '90° counter-clockwise' },
          { value: '180', label: '180°' },
        ],
      },
    ],
    async run(ffmpeg, file, params) {
      const e = ext(file);
      await ffmpeg.writeFile(`in.${e}`, await fetchFile(file));
      const rot = String(params.rotation);
      const vf = rot === '180' ? 'hflip,vflip' : `transpose=${rot}`;
      await ffmpeg.exec(['-i', `in.${e}`, '-vf', vf, '-c:a', 'copy', `out.${e}`]);
      const raw = await ffmpeg.readFile(`out.${e}`) as Uint8Array;
      const data = raw.slice() as Uint8Array<ArrayBuffer>;
      await Promise.all([ffmpeg.deleteFile(`in.${e}`), ffmpeg.deleteFile(`out.${e}`)]);
      const label = rot === '1' ? '90cw' : rot === '2' ? '90ccw' : '180';
      return { blob: toBlob(raw, videoMime(e)), filename: `${base(file)}-${label}.${e}`, mimeType: videoMime(e) };
    },
  },

  'video-to-gif': {
    label: 'Video to GIF',
    description: 'Convert a video clip to an animated GIF.',
    icon: 'gif',
    estimatedTime: 'Medium',
    controls: [
      { key: 'start', label: 'Start (seconds)', type: 'number', def: 0, min: 0, step: 0.5 },
      { key: 'duration', label: 'Duration (seconds)', type: 'number', def: 5, min: 1, max: 30, step: 0.5 },
      { key: 'fps', label: 'Frame rate', type: 'select', def: '15', options: [{ value: '10', label: '10 fps' }, { value: '15', label: '15 fps' }, { value: '24', label: '24 fps' }] },
      { key: 'width', label: 'Width (px)', type: 'number', def: 480, min: 120, max: 1280, step: 10, hint: 'Height scales automatically' },
    ],
    async run(ffmpeg, file, params) {
      const e = ext(file);
      const start = Number(params.start) || 0;
      const dur = Math.min(Number(params.duration) || 5, 30);
      const fps = Number(params.fps) || 15;
      const w = Number(params.width) || 480;
      await ffmpeg.writeFile(`in.${e}`, await fetchFile(file));
      const vf = `fps=${fps},scale=${w}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;
      await ffmpeg.exec(['-ss', String(start), '-t', String(dur), '-i', `in.${e}`, '-vf', vf, '-loop', '0', 'out.gif']);
      const raw = await ffmpeg.readFile('out.gif') as Uint8Array;
      const data = raw.slice() as Uint8Array<ArrayBuffer>;
      await Promise.all([ffmpeg.deleteFile(`in.${e}`), ffmpeg.deleteFile('out.gif')]);
      return { blob: toBlob(raw, 'image/gif'), filename: `${base(file)}.gif`, mimeType: 'image/gif' };
    },
  },

  'reverse-video': {
    label: 'Reverse Video',
    description: 'Play a video backwards.',
    icon: 'rewind',
    estimatedTime: 'Slow — loads entire video into memory',
    controls: [],
    async run(ffmpeg, file, _params) {
      const e = ext(file);
      await ffmpeg.writeFile(`in.${e}`, await fetchFile(file));
      await ffmpeg.exec(['-i', `in.${e}`, '-vf', 'reverse', '-af', 'areverse', `out.${e}`]);
      const raw = await ffmpeg.readFile(`out.${e}`) as Uint8Array;
      const data = new Uint8Array(raw.buffer instanceof ArrayBuffer ? raw.buffer : raw.buffer.slice(0));
      await Promise.all([ffmpeg.deleteFile(`in.${e}`), ffmpeg.deleteFile(`out.${e}`)]);
      return { blob: toBlob(raw, videoMime(e)), filename: `${base(file)}-reversed.${e}`, mimeType: videoMime(e) };
    },
  },
};

export const VIDEO_TOOL_IDS = Object.keys(VIDEO_OPS);
