import type { FFmpeg } from '@ffmpeg/ffmpeg';
import type { EditorProject, ExportSettings, TextLayer, VideoClip } from './types';
import { videoTracksBottomToTop } from './tracks';
import { avgSpeedFactor } from './speed';
import { videoMime } from '../ffmpeg';
import {
  deleteQuiet, execAndRead, probeHasAudio, writeBytes, writeInputFile,
} from '../ffmpegExec';

function safeBlob(raw: Uint8Array, type: string): Blob {
  const copy = new Uint8Array(raw.byteLength);
  copy.set(raw);
  return new Blob([copy], { type });
}

function inputExt(file: File, kind: string): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  if (kind === 'image') return 'png';
  if (kind === 'audio') return 'mp3';
  return 'mp4';
}

function buildClipVideoFilter(
  clip: VideoClip,
  inputIdx: number,
  W: number,
  H: number,
  label: string,
): string {
  const srcLen = clip.trimOut - clip.trimIn;
  const avg = avgSpeedFactor(clip.speedStart, clip.speedEnd, clip.easing);
  const srcDur = srcLen / Math.max(avg, 0.01);
  const padDur = Math.max(clip.duration - srcDur / avg, 0);
  let chain = `[${inputIdx}:v]trim=start=${clip.trimIn.toFixed(3)}:duration=${srcDur.toFixed(3)},setpts=PTS-STARTPTS`;
  if (Math.abs(avg - 1) > 0.02) chain += `,setpts=PTS/${avg.toFixed(4)}`;
  chain += `,scale=${W}:${H}:force_original_aspect_ratio=decrease`;
  chain += `,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1`;
  if (padDur > 0.02) {
    chain += `,tpad=stop_mode=clone:stop_duration=${padDur.toFixed(3)}`;
  }
  return `${chain}[${label}]`;
}

function buildClipAudioFilter(
  clip: VideoClip,
  inputIdx: number,
  label: string,
): string {
  const srcLen = clip.trimOut - clip.trimIn;
  const avg = avgSpeedFactor(clip.speedStart, clip.speedEnd, clip.easing);
  const srcDur = srcLen / Math.max(avg, 0.01);
  const delayMs = Math.round(clip.start * 1000);
  let chain = `[${inputIdx}:a]atrim=start=${clip.trimIn.toFixed(3)}:duration=${srcDur.toFixed(3)},asetpts=PTS-STARTPTS`;
  if (Math.abs(avg - 1) > 0.02) {
    const tempo = Math.max(0.5, Math.min(2, avg));
    chain += `,atempo=${tempo.toFixed(4)}`;
  }
  if (delayMs > 0) chain += `,adelay=${delayMs}|${delayMs}`;
  return `${chain}[${label}]`;
}

async function renderTextLayerPng(text: TextLayer, W: number, H: number): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not render text overlay.');

  const x = (text.x / 100) * W;
  const y = (text.y / 100) * H;
  const lines = text.text.split('\n');
  const lineHeight = text.fontSize * 1.15;

  ctx.font = `700 ${text.fontSize}px sans-serif`;
  ctx.fillStyle = text.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;

  const blockH = lines.length * lineHeight;
  lines.forEach((line, i) => {
    ctx.fillText(line, x, y - blockH / 2 + lineHeight * (i + 0.5));
  });

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Text render failed'))), 'image/png');
  });
  return new Uint8Array(await blob.arrayBuffer());
}

function usedAssetIds(project: EditorProject): Set<string> {
  const ids = new Set<string>();
  for (const clip of project.clips) ids.add(clip.assetId);
  for (const im of project.imageLayers) ids.add(im.assetId);
  return ids;
}

/**
 * Export timeline to MP4/WebM using FFmpeg.wasm.
 * Composites two video layers with overlay; applies averaged speed ramps per clip.
 */
export async function exportProject(
  ffmpeg: FFmpeg,
  project: EditorProject,
  settings: ExportSettings,
  onProgress: (pct: number) => void,
): Promise<Blob> {
  const ext = settings.format === 'webm' ? 'webm' : 'mp4';
  const outName = `export.${ext}`;
  const videoClips = [...project.clips].sort((a, b) => a.start - b.start);

  if (videoClips.length === 0) throw new Error('Add at least one video clip to export.');

  const needed = usedAssetIds(project);
  const assets = project.assets.filter((a) => needed.has(a.id));
  const assetIndex = new Map<string, number>();
  const assetFiles = new Map<string, string>();
  const inputArgs: string[] = [];
  const audioByAsset = new Map<string, boolean>();

  for (const asset of assets) {
    const idx = assetIndex.size;
    assetIndex.set(asset.id, idx);
    const extIn = inputExt(asset.file, asset.kind);
    const fname = `in${idx}.${extIn}`;
    await writeInputFile(ffmpeg, fname, asset.file);
    assetFiles.set(asset.id, fname);
    if (asset.kind === 'image') inputArgs.push('-loop', '1');
    inputArgs.push('-i', fname);
    if (asset.kind === 'video') {
      audioByAsset.set(asset.id, await probeHasAudio(ffmpeg, fname));
    }
  }

  const { projectWidth: W, projectHeight: H, duration: D } = project;
  const parts: string[] = [];
  let videoOut = 'base';

  parts.push(`color=c=black:s=${W}x${H}:d=${D.toFixed(3)}:r=30[${videoOut}]`);

  let clipIdx = 0;
  for (const trackId of videoTracksBottomToTop()) {
    const trackClips = videoClips.filter((c) => c.trackId === trackId);
    for (const clip of trackClips) {
      const ii = assetIndex.get(clip.assetId);
      if (ii === undefined) continue;
      const label = `cv${clipIdx}`;
      parts.push(buildClipVideoFilter(clip, ii, W, H, label));
      const prev = videoOut;
      videoOut = `ov${clipIdx}`;
      parts.push(
        `[${prev}][${label}]overlay=0:0:enable='between(t,${clip.start.toFixed(3)},${(clip.start + clip.duration).toFixed(3)})'[${videoOut}]`,
      );
      clipIdx++;
    }
  }

  let textStep = 0;
  for (const t of project.textLayers) {
    const fname = `text${textStep}.png`;
    await writeBytes(ffmpeg, fname, await renderTextLayerPng(t, W, H));
    assetFiles.set(fname, fname);
    const textInputIdx = assets.length + textStep;
    inputArgs.push('-loop', '1', '-i', fname);

    const prev = videoOut;
    videoOut = `outv_text${textStep}`;
    parts.push(`[${textInputIdx}:v]scale=${W}:${H},format=rgba[txt${textStep}]`);
    parts.push(
      `[${prev}][txt${textStep}]overlay=0:0:enable='between(t,${t.start.toFixed(3)},${t.end.toFixed(3)})'[${videoOut}]`,
    );
    textStep++;
  }

  let imgStep = 0;
  for (const im of project.imageLayers) {
    const ii = assetIndex.get(im.assetId);
    if (ii === undefined) continue;
    const prev = videoOut;
    videoOut = `outv_img${imgStep}`;
    const iw = Math.round((im.width / 100) * W);
    const x = Math.round((im.x / 100) * W);
    const y = Math.round((im.y / 100) * H);
    parts.push(`[${ii}:v]scale=${iw}:-1,format=rgba,colorchannelmixer=aa=${im.opacity}[img${imgStep}]`);
    parts.push(
      `[${prev}][img${imgStep}]overlay=${x}:${y}:enable='between(t,${im.start.toFixed(3)},${im.end.toFixed(3)})'[${videoOut}]`,
    );
    imgStep++;
  }

  const audioTrack = project.tracks.find((t) => t.id === 'track_audio');
  const audioMuted = audioTrack?.muted ?? false;
  let audioOut: string | null = null;

  if (!audioMuted) {
    const aFilters: string[] = [];
    const aLabels: string[] = [];
    videoClips.forEach((clip, i) => {
      if (!audioByAsset.get(clip.assetId)) return;
      const ii = assetIndex.get(clip.assetId);
      if (ii === undefined) return;
      const label = `a${i}`;
      aFilters.push(buildClipAudioFilter(clip, ii, label));
      aLabels.push(`[${label}]`);
    });
    if (aLabels.length > 0) {
      parts.push(...aFilters);
      if (aLabels.length > 1) {
        audioOut = 'outa';
        parts.push(`${aLabels.join('')}amix=inputs=${aLabels.length}:duration=longest:dropout_transition=0[${audioOut}]`);
      } else {
        audioOut = aLabels[0].slice(1, -1);
      }
    }
  }

  const filterComplex = parts.join(';');
  const args = [
    ...inputArgs,
    '-filter_complex', filterComplex,
    '-map', `[${videoOut}]`,
    '-t', D.toFixed(3),
  ];
  if (audioOut) args.push('-map', `[${audioOut}]`);

  if (settings.format === 'webm') {
    args.push('-c:v', 'libvpx-vp9', '-crf', settings.quality === 'high' ? '28' : '35', '-b:v', '0');
    if (audioOut) args.push('-c:a', 'libopus');
  } else {
    args.push('-c:v', 'libx264', '-preset', 'fast', '-crf', settings.quality === 'high' ? '20' : '23', '-pix_fmt', 'yuv420p');
    if (audioOut) args.push('-c:a', 'aac', '-b:a', '128k');
    args.push('-movflags', '+faststart');
  }
  args.push(outName);

  const onProg = ({ progress }: { progress: number }) => onProgress(Math.min(98, Math.round(progress * 100)));
  ffmpeg.on('progress', onProg);
  let raw: Uint8Array;
  try {
    raw = await execAndRead(ffmpeg, args, outName, 'Export failed — try a shorter clip with fewer layers.');
  } finally {
    ffmpeg.off('progress', onProg);
  }

  const blob = safeBlob(raw, videoMime(ext));

  await deleteQuiet(ffmpeg, outName, ...assetFiles.values());

  onProgress(100);
  return blob;
}
