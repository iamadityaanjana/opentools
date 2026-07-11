// PDF security helpers — all processing stays in the browser.
//
// Password protect / unlock are powered by qpdf (Apache-2.0) compiled to
// WebAssembly. This gives real 256-bit AES encryption and lossless decryption
// (text, links, and structure are preserved — nothing is rasterized).
//
// Redaction is different on purpose: it renders each page to pixels and burns
// opaque boxes into those pixels, then rebuilds an image-only PDF. Because the
// output no longer contains the original text/vector content, redacted areas
// (and everything else) cannot be recovered by copy-paste or text extraction.

type QpdfFS = {
  writeFile: (path: string, data: Uint8Array) => void;
  readFile: (path: string) => Uint8Array;
};
type QpdfInstance = { callMain: (args: string[]) => number; FS: QpdfFS };
type QpdfFactory = (opts: { locateFile: () => string; noInitialRun?: boolean }) => Promise<QpdfInstance>;

const INPUT = '/input.pdf';
const OUTPUT = '/output.pdf';

async function createQpdf(): Promise<QpdfInstance> {
  const factory = (await import('@neslinesli93/qpdf-wasm')).default as unknown as QpdfFactory;
  return factory({ locateFile: () => '/qpdf.wasm', noInitialRun: true });
}

async function runQpdf(inputBytes: Uint8Array, args: string[]): Promise<Uint8Array> {
  const qpdf = await createQpdf();
  qpdf.FS.writeFile(INPUT, inputBytes);

  let code: number;
  try {
    code = qpdf.callMain(args);
  } catch (err) {
    // Some Emscripten builds throw an ExitStatus instead of returning the code.
    const status = (err as { status?: number } | null)?.status;
    if (typeof status === 'number') code = status;
    else throw err;
  }

  // qpdf exit codes: 0 = success, 3 = success with warnings, 2 = errors.
  if (code === 2) {
    throw new Error('Could not process this PDF. If it is password-protected, the password may be incorrect.');
  }

  let out: Uint8Array;
  try {
    out = qpdf.FS.readFile(OUTPUT);
  } catch {
    throw new Error('The operation did not produce an output PDF. Check the password and try again.');
  }
  if (!out || out.length === 0) throw new Error('The resulting PDF was empty.');
  return out;
}

/** Encrypt a PDF with 256-bit AES. Owner password defaults to the user password. */
export async function protectPdf(file: File, userPassword: string, ownerPassword: string): Promise<Uint8Array> {
  const user = userPassword.trim();
  if (!user) throw new Error('Enter a password to protect the PDF.');
  const owner = ownerPassword.trim() || user;
  const input = new Uint8Array(await file.arrayBuffer());
  // Passwords are passed as argv entries (not a shell), so no escaping is needed.
  return runQpdf(input, [INPUT, '--encrypt', user, owner, '256', '--', OUTPUT]);
}

/** Remove password/encryption from a PDF. The correct password is required. */
export async function decryptPdf(file: File, password: string): Promise<Uint8Array> {
  const input = new Uint8Array(await file.arrayBuffer());
  const pw = password.trim();
  const args = pw
    ? [`--password=${pw}`, INPUT, '--decrypt', OUTPUT]
    : [INPUT, '--decrypt', OUTPUT];
  return runQpdf(input, args);
}

/** A redaction rectangle in normalized page coordinates (0..1, origin top-left). */
export interface RedactBox {
  page: number; // 0-based page index
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Rasterize each page and paint opaque boxes over the redacted regions, then
 * assemble an image-only PDF. Underlying text is physically removed.
 */
export async function redactPdf(
  file: File,
  boxes: RedactBox[],
  dpi = 150,
  quality = 0.9,
): Promise<Blob> {
  const [{ renderPdfPages }, { jsPDF }] = await Promise.all([
    import('./pdf'),
    import('jspdf'),
  ]);
  const safeDpi = Math.max(72, Math.min(300, Math.round(dpi)));
  const q = Math.max(0.3, Math.min(1, quality));
  const pages = await renderPdfPages(file, { dpi: safeDpi, range: '' });
  if (!pages.length) throw new Error('No pages could be rendered from this PDF.');

  const byPage = new Map<number, RedactBox[]>();
  for (const box of boxes) {
    const list = byPage.get(box.page) ?? [];
    list.push(box);
    byPage.set(box.page, list);
  }

  let output: InstanceType<typeof jsPDF> | null = null;
  for (const rendered of pages) {
    const canvas = document.createElement('canvas');
    canvas.width = rendered.width;
    canvas.height = rendered.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(rendered.imageData, 0, 0);
    ctx.fillStyle = '#000000';
    for (const box of byPage.get(rendered.index) ?? []) {
      ctx.fillRect(
        Math.round(box.x * rendered.width),
        Math.round(box.y * rendered.height),
        Math.round(box.w * rendered.width),
        Math.round(box.h * rendered.height),
      );
    }
    const widthPt = (rendered.width * 72) / safeDpi;
    const heightPt = (rendered.height * 72) / safeDpi;
    const orientation = widthPt >= heightPt ? 'l' : 'p';
    if (!output) output = new jsPDF({ orientation, unit: 'pt', format: [widthPt, heightPt], compress: true });
    else output.addPage([widthPt, heightPt], orientation);
    output.addImage(canvas.toDataURL('image/jpeg', q), 'JPEG', 0, 0, widthPt, heightPt, undefined, 'FAST');
  }
  return output!.output('blob');
}
