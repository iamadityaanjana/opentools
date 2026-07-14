import type { FFmpeg } from '@ffmpeg/ffmpeg';
import {
  buildAtempoChain, videoMime,
  deleteQuiet, execAndRead, probeHasAudio, writeInputFile,
} from './ffmpeg';

/** Copy FFmpeg output into a safe Blob. */
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
      const inPath = `in.${e}`;
      const outPath = `out.${e}`;
      const start = Number(params.start) || 0;
      const end = Number(params.end) || 0;
      await writeInputFile(ffmpeg, inPath, file);
      const args = ['-ss', String(start)];
      if (end > start) args.push('-to', String(end));
      args.push('-i', inPath, '-c', 'copy', outPath);
      const raw = await execAndRead(ffmpeg, args, outPath, 'Trim failed — try different start/end times.');
      await deleteQuiet(ffmpeg, inPath, outPath);
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
      const inPath = `in.${e}`;
      const outPath = `out.${e}`;
      const speed = parseFloat(String(params.speed)) || 1;
      const pts = (1 / speed).toFixed(6);
      await writeInputFile(ffmpeg, inPath, file);
      const hasAudio = await probeHasAudio(ffmpeg, inPath);
      const vf = `setpts=${pts}*PTS`;
      const args = hasAudio
        ? ['-i', inPath, '-vf', vf, '-af', buildAtempoChain(speed), outPath]
        : ['-i', inPath, '-vf', vf, '-an', outPath];
      const raw = await execAndRead(ffmpeg, args, outPath, 'Speed change failed — try a shorter clip.');
      await deleteQuiet(ffmpeg, inPath, outPath);
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
      const inPath = `in.${e}`;
      const outPath = `out.${e}`;
      await writeInputFile(ffmpeg, inPath, file);
      const raw = await execAndRead(
        ffmpeg, ['-i', inPath, '-an', '-c:v', 'copy', outPath], outPath,
        'Mute failed — the file may not contain a video stream.',
      );
      await deleteQuiet(ffmpeg, inPath, outPath);
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
      const inPath = `in.${e}`;
      const outPath = 'out.mp3';
      await writeInputFile(ffmpeg, inPath, file);
      if (!(await probeHasAudio(ffmpeg, inPath))) {
        await deleteQuiet(ffmpeg, inPath);
        throw new Error('This video has no audio track to extract.');
      }
      const raw = await execAndRead(
        ffmpeg,
        ['-i', inPath, '-vn', '-acodec', 'libmp3lame', '-q:a', String(params.quality ?? 2), outPath],
        outPath,
        'Audio extraction failed — try a shorter clip or a different video format.',
      );
      await deleteQuiet(ffmpeg, inPath, outPath);
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
      const inExt = ext(file);
      const outExt = inExt === 'webm' ? 'mp4' : inExt;
      const inPath = `in.${inExt}`;
      const outPath = `out.${outExt}`;
      await writeInputFile(ffmpeg, inPath, file);
      const hasAudio = await probeHasAudio(ffmpeg, inPath);
      const args = ['-i', inPath, '-c:v', 'libx264', '-crf', String(params.quality ?? 28), '-preset', 'fast', '-pix_fmt', 'yuv420p'];
      if (hasAudio) args.push('-c:a', 'aac', '-b:a', '128k');
      else args.push('-an');
      args.push(outPath);
      const raw = await execAndRead(ffmpeg, args, outPath, 'Compress failed — try a shorter clip.');
      await deleteQuiet(ffmpeg, inPath, outPath);
      return { blob: toBlob(raw, videoMime(outExt)), filename: `${base(file)}-compressed.${outExt}`, mimeType: videoMime(outExt) };
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
      const inPath = `in.${e}`;
      const outPath = `out.${fmt}`;
      await writeInputFile(ffmpeg, inPath, file);
      const hasAudio = await probeHasAudio(ffmpeg, inPath);
      const args = fmt === 'webm'
        ? ['-i', inPath, '-c:v', 'libvpx-vp9', '-crf', '30', '-b:v', '0', '-pix_fmt', 'yuv420p']
        : ['-i', inPath, '-c:v', 'libx264', '-crf', '22', '-pix_fmt', 'yuv420p'];
      if (hasAudio) {
        args.push('-c:a', fmt === 'webm' ? 'libopus' : 'aac');
      } else {
        args.push('-an');
      }
      args.push(outPath);
      const raw = await execAndRead(ffmpeg, args, outPath, 'Convert failed — try a shorter clip.');
      await deleteQuiet(ffmpeg, inPath, outPath);
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
      const inPath = `in.${e}`;
      const outPath = `out.${e}`;
      await writeInputFile(ffmpeg, inPath, file);
      const rot = String(params.rotation);
      const vf = rot === '180' ? 'hflip,vflip' : `transpose=${rot}`;
      const hasAudio = await probeHasAudio(ffmpeg, inPath);
      const args = hasAudio
        ? ['-i', inPath, '-vf', vf, '-c:a', 'aac', '-b:a', '128k', outPath]
        : ['-i', inPath, '-vf', vf, '-an', outPath];
      const raw = await execAndRead(ffmpeg, args, outPath, 'Rotate failed — try a shorter clip.');
      await deleteQuiet(ffmpeg, inPath, outPath);
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
      const inPath = `in.${e}`;
      const outPath = 'out.gif';
      const start = Number(params.start) || 0;
      const dur = Math.min(Number(params.duration) || 5, 30);
      const fps = Number(params.fps) || 15;
      const w = Number(params.width) || 480;
      await writeInputFile(ffmpeg, inPath, file);
      const vf = `fps=${fps},scale=${w}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;
      const raw = await execAndRead(
        ffmpeg,
        ['-ss', String(start), '-t', String(dur), '-i', inPath, '-vf', vf, '-an', '-loop', '0', outPath],
        outPath,
        'GIF conversion failed — try a shorter duration or smaller width.',
      );
      await deleteQuiet(ffmpeg, inPath, outPath);
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
      const inPath = `in.${e}`;
      const outPath = `out.${e}`;
      await writeInputFile(ffmpeg, inPath, file);
      const hasAudio = await probeHasAudio(ffmpeg, inPath);
      const args = hasAudio
        ? ['-i', inPath, '-vf', 'reverse', '-af', 'areverse', outPath]
        : ['-i', inPath, '-vf', 'reverse', '-an', outPath];
      const raw = await execAndRead(ffmpeg, args, outPath, 'Reverse failed — clip may be too long for browser memory.');
      await deleteQuiet(ffmpeg, inPath, outPath);
      return { blob: toBlob(raw, videoMime(e)), filename: `${base(file)}-reversed.${e}`, mimeType: videoMime(e) };
    },
  },
};

export const VIDEO_TOOL_IDS = Object.keys(VIDEO_OPS);
