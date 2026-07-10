import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
const destination = resolve(root, 'public/pdf.worker.min.mjs');

await mkdir(dirname(destination), { recursive: true });
await copyFile(source, destination);
console.log('Prepared public/pdf.worker.min.mjs');

const indexNowKey = process.env.INDEXNOW_KEY;
if (indexNowKey && indexNowKey !== 'replace_with_your_indexnow_key') {
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(indexNowKey)) {
    throw new Error('INDEXNOW_KEY must contain 8–128 letters, numbers, underscores, or hyphens.');
  }
  await writeFile(resolve(root, 'public/indexnow-key.txt'), indexNowKey, 'utf8');
  console.log('Prepared IndexNow verification file');
}
