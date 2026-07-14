import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Inline @ffmpeg/ffmpeg worker deps so /public/ffmpeg-worker.mjs is self-contained. */
async function bundleFfmpegWorker() {
  let worker = await readFile(
    resolve(root, 'node_modules/@ffmpeg/ffmpeg/dist/esm/worker.js'),
    'utf8',
  );

  const constBlock = `const CORE_URL = "https://unpkg.com/@ffmpeg/core@0.12.9/dist/umd/ffmpeg-core.js";
const FFMessageType = {
  LOAD: "LOAD", EXEC: "EXEC", FFPROBE: "FFPROBE", WRITE_FILE: "WRITE_FILE",
  READ_FILE: "READ_FILE", DELETE_FILE: "DELETE_FILE", RENAME: "RENAME",
  CREATE_DIR: "CREATE_DIR", LIST_DIR: "LIST_DIR", DELETE_DIR: "DELETE_DIR",
  ERROR: "ERROR", DOWNLOAD: "DOWNLOAD", PROGRESS: "PROGRESS", LOG: "LOG",
  MOUNT: "MOUNT", UNMOUNT: "UNMOUNT",
};`;

  const errorsBlock = `const ERROR_UNKNOWN_MESSAGE_TYPE = new Error("unknown message type");
const ERROR_NOT_LOADED = new Error("ffmpeg is not loaded, call \`await ffmpeg.load()\` first");
const ERROR_IMPORT_FAILURE = new Error("failed to import ffmpeg-core.js");`;

  worker = worker
    .replace(/import \{ CORE_URL, FFMessageType \} from "\.\/const\.js";/, constBlock)
    .replace(
      /import \{ ERROR_UNKNOWN_MESSAGE_TYPE, ERROR_NOT_LOADED, ERROR_IMPORT_FAILURE, \} from "\.\/errors\.js";/,
      errorsBlock,
    )
    .replace(
      'self.createFFmpegCore = (await import(\n        /* @vite-ignore */ _coreURL)).default;',
      `const coreImportURL = _coreURL.startsWith("blob:") || _coreURL.startsWith("http")
            ? _coreURL
            : new URL(_coreURL, self.location.origin).href;
        self.createFFmpegCore = (await import(coreImportURL)).default;`,
    );

  const out = resolve(root, 'public/ffmpeg-worker.mjs');
  await writeFile(out, worker);
  console.log('Prepared public/ffmpeg-worker.mjs');
}

// Static assets that must live under /public so the browser can fetch them at a
// stable URL: the pdf.js worker and the qpdf WebAssembly binary.
const assets = [
  ['node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'public/pdf.worker.min.mjs'],
  ['node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.wasm', 'public/qpdf.wasm'],
  // ESM build — required for @ffmpeg/ffmpeg's module worker (dynamic import).
  ['node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js', 'public/ffmpeg-core.js'],
  ['node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm', 'public/ffmpeg-core.wasm'],
];

for (const [from, to] of assets) {
  const destination = resolve(root, to);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(resolve(root, from), destination);
  console.log(`Prepared ${to}`);
}

await bundleFfmpegWorker();

const indexNowKey = process.env.INDEXNOW_KEY;
if (indexNowKey && indexNowKey !== 'replace_with_your_indexnow_key') {
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(indexNowKey)) {
    throw new Error('INDEXNOW_KEY must contain 8–128 letters, numbers, underscores, or hyphens.');
  }
  await writeFile(resolve(root, 'public/indexnow-key.txt'), indexNowKey, 'utf8');
  console.log('Prepared IndexNow verification file');
}
