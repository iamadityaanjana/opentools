import { fetchFile } from '@ffmpeg/util';
import type { FFmpeg } from '@ffmpeg/ffmpeg';

/** Copy into a plain ArrayBuffer — required for FFmpeg.wasm MEMFS writes. */
export function toMemfsBytes(data: Uint8Array): Uint8Array {
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return copy;
}

export async function writeInputFile(ffmpeg: FFmpeg, path: string, file: File): Promise<void> {
  const data = await fetchFile(file);
  await ffmpeg.writeFile(path, toMemfsBytes(data));
}

export async function writeBytes(ffmpeg: FFmpeg, path: string, data: Uint8Array): Promise<void> {
  await ffmpeg.writeFile(path, toMemfsBytes(data));
}

export function isFsError(err: unknown): boolean {
  if (err instanceof Error) {
    return /ErrnoError|FS error/i.test(err.message) || err.name === 'ErrnoError';
  }
  return String(err).includes('FS error');
}

export async function probeHasAudio(ffmpeg: FFmpeg, fname: string): Promise<boolean> {
  const out = `probe_${fname.replace(/[^a-z0-9._-]/gi, '_')}.txt`;
  try {
    await ffmpeg.ffprobe([
      '-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index',
      '-of', 'csv=p=0', fname, '-o', out,
    ]);
    const raw = await ffmpeg.readFile(out, 'utf8');
    const txt = typeof raw === 'string' ? raw : new TextDecoder().decode(raw);
    return txt.trim().length > 0;
  } catch {
    return false;
  } finally {
    await ffmpeg.deleteFile(out).catch(() => {});
  }
}

export async function execAndRead(
  ffmpeg: FFmpeg,
  args: string[],
  outputPath: string,
  failHint?: string,
): Promise<Uint8Array> {
  const logs: string[] = [];
  const onLog = ({ message }: { message: string }) => { logs.push(message); };
  ffmpeg.on('log', onLog);
  let code: number;
  try {
    code = await ffmpeg.exec(args);
  } finally {
    ffmpeg.off('log', onLog);
  }

  if (code !== 0) {
    const tail = logs.map((l) => l.trim()).filter(Boolean).slice(-8).join(' | ');
    throw new Error(
      tail || failHint || `FFmpeg failed (exit ${code}). Try a shorter clip or different format.`,
    );
  }

  try {
    const raw = await ffmpeg.readFile(outputPath) as Uint8Array;
    return toMemfsBytes(raw);
  } catch (err) {
    if (isFsError(err)) {
      const tail = logs.map((l) => l.trim()).filter(Boolean).slice(-6).join(' | ');
      throw new Error(
        tail
          ? `Output was not created: ${tail}`
          : 'Output file was not created. The video may be unsupported, too large, or missing an audio track where one is required.',
      );
    }
    throw err;
  }
}

export async function deleteQuiet(ffmpeg: FFmpeg, ...paths: string[]): Promise<void> {
  await Promise.all(paths.map((p) => ffmpeg.deleteFile(p).catch(() => {})));
}
