import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Static assets that must live under /public so the browser can fetch them at a
// stable URL: the pdf.js worker and the qpdf WebAssembly binary.
const assets = [
  ['node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'public/pdf.worker.min.mjs'],
  ['node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.wasm', 'public/qpdf.wasm'],
];

for (const [from, to] of assets) {
  const destination = resolve(root, to);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(resolve(root, from), destination);
  console.log(`Prepared ${to}`);
}

const indexNowKey = process.env.INDEXNOW_KEY;
if (indexNowKey && indexNowKey !== 'replace_with_your_indexnow_key') {
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(indexNowKey)) {
    throw new Error('INDEXNOW_KEY must contain 8–128 letters, numbers, underscores, or hyphens.');
  }
  await writeFile(resolve(root, 'public/indexnow-key.txt'), indexNowKey, 'utf8');
  console.log('Prepared IndexNow verification file');
}
