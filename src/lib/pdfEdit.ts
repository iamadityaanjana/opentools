import {
  PDFDocument,
  StandardFonts,
  degrees,
  rgb,
  type PDFPage,
} from 'pdf-lib';

export interface PdfOutput {
  bytes: Uint8Array;
  filename: string;
}

function baseName(file: File): string {
  return file.name.replace(/\.[^.]+$/, '') || 'document';
}

function pdfBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes as BlobPart], { type: 'application/pdf' });
}

export function bytesToPdfBlob(bytes: Uint8Array): Blob {
  return pdfBlob(bytes);
}

export function parsePageSelection(value: string, total: number): number[] {
  const trimmed = value.trim();
  if (!trimmed) return Array.from({ length: total }, (_, index) => index);
  const selected = new Set<number>();
  for (const token of trimmed.split(',')) {
    const part = token.trim();
    if (!part) continue;
    const range = part.match(/^(\d+)?\s*-\s*(\d+)?$/);
    if (range) {
      const start = range[1] ? Number(range[1]) : 1;
      const end = range[2] ? Number(range[2]) : total;
      for (let page = start; page <= end; page++) {
        if (page >= 1 && page <= total) selected.add(page - 1);
      }
    } else {
      const page = Number(part);
      if (Number.isInteger(page) && page >= 1 && page <= total) selected.add(page - 1);
    }
  }
  return [...selected].sort((a, b) => a - b);
}

async function load(file: File): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(await file.arrayBuffer());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/encrypt/i.test(message)) {
      throw new Error('This PDF is encrypted. Password-protected PDFs are not supported by this local tool yet.');
    }
    throw new Error(`Could not open this PDF. ${message}`);
  }
}

async function copySelected(source: PDFDocument, indices: number[]): Promise<Uint8Array> {
  if (!indices.length) throw new Error('No valid pages were selected.');
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, indices);
  pages.forEach((page) => output.addPage(page));
  return output.save();
}

export async function mergePdfFiles(files: File[]): Promise<Uint8Array> {
  if (files.length < 2) throw new Error('Add at least two PDFs to merge.');
  const output = await PDFDocument.create();
  for (const file of files) {
    const source = await load(file);
    const pages = await output.copyPages(source, source.getPageIndices());
    pages.forEach((page) => output.addPage(page));
  }
  return output.save();
}

export async function extractPdfPages(file: File, range: string): Promise<Uint8Array> {
  const source = await load(file);
  return copySelected(source, parsePageSelection(range, source.getPageCount()));
}

export async function extractPdfPageIndices(file: File, indices: number[]): Promise<Uint8Array> {
  const source = await load(file);
  return copySelected(source, indices);
}

export async function deletePdfPages(file: File, range: string): Promise<Uint8Array> {
  const source = await load(file);
  const removed = new Set(parsePageSelection(range, source.getPageCount()));
  const kept = source.getPageIndices().filter((index) => !removed.has(index));
  if (!kept.length) throw new Error('Deleting those pages would leave an empty PDF.');
  return copySelected(source, kept);
}

export async function reorderPdfPages(file: File, order: string): Promise<Uint8Array> {
  const source = await load(file);
  const indices = order.split(',')
    .map((value) => Number(value.trim()) - 1)
    .filter((index) => Number.isInteger(index) && index >= 0 && index < source.getPageCount());
  if (indices.length !== source.getPageCount() || new Set(indices).size !== source.getPageCount()) {
    throw new Error(`Enter every page exactly once, for example ${source.getPageIndices().map((i) => i + 1).reverse().join(',')}.`);
  }
  return copySelected(source, indices);
}

export async function splitPdfPages(file: File, mode: string, chunkSize: number): Promise<PdfOutput[]> {
  const source = await load(file);
  const total = source.getPageCount();
  const size = mode === 'chunks' ? Math.max(1, Math.round(chunkSize)) : 1;
  const outputs: PdfOutput[] = [];
  for (let start = 0; start < total; start += size) {
    const indices = Array.from({ length: Math.min(size, total - start) }, (_, offset) => start + offset);
    const end = indices.at(-1)! + 1;
    outputs.push({
      bytes: await copySelected(source, indices),
      filename: mode === 'chunks'
        ? `${baseName(file)}-pages-${start + 1}-${end}.pdf`
        : `${baseName(file)}-page-${start + 1}.pdf`,
    });
  }
  return outputs;
}

export async function rotatePdfPages(file: File, range: string, angle: number): Promise<Uint8Array> {
  const document = await load(file);
  const selected = parsePageSelection(range, document.getPageCount());
  for (const index of selected) {
    const page = document.getPage(index);
    const current = page.getRotation().angle;
    page.setRotation(degrees(((current + angle) % 360 + 360) % 360));
  }
  return document.save();
}

export async function cropPdfPages(
  file: File,
  range: string,
  margins: { top: number; right: number; bottom: number; left: number },
): Promise<Uint8Array> {
  const document = await load(file);
  const selected = parsePageSelection(range, document.getPageCount());
  for (const index of selected) {
    const page = document.getPage(index);
    const { width, height } = page.getSize();
    const cropWidth = width - margins.left - margins.right;
    const cropHeight = height - margins.top - margins.bottom;
    if (cropWidth <= 0 || cropHeight <= 0) {
      throw new Error(`Crop margins are larger than page ${index + 1}.`);
    }
    page.setCropBox(margins.left, margins.bottom, cropWidth, cropHeight);
  }
  return document.save();
}

function pageSize(value: string): [number, number] {
  if (value === 'letter') return [612, 792];
  if (value === 'a4-landscape') return [841.89, 595.28];
  if (value === 'letter-landscape') return [792, 612];
  return [595.28, 841.89];
}

export async function addBlankPdfPages(
  file: File,
  count: number,
  position: string,
  size: string,
): Promise<Uint8Array> {
  const source = await load(file);
  const output = await PDFDocument.create();
  const blanks = Math.max(1, Math.min(100, Math.round(count)));
  const dimensions = pageSize(size);
  if (position === 'start') {
    for (let index = 0; index < blanks; index++) output.addPage(dimensions);
  }
  const pages = await output.copyPages(source, source.getPageIndices());
  pages.forEach((page) => output.addPage(page));
  if (position !== 'start') {
    for (let index = 0; index < blanks; index++) output.addPage(dimensions);
  }
  return output.save();
}

function hexColor(value: string): ReturnType<typeof rgb> {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
  if (!match) return rgb(0, 0, 0);
  return rgb(
    parseInt(match[1], 16) / 255,
    parseInt(match[2], 16) / 255,
    parseInt(match[3], 16) / 255,
  );
}

function textPosition(page: PDFPage, textWidth: number, size: number, position: string, margin: number) {
  const { width, height } = page.getSize();
  const x = position.endsWith('left') ? margin : position.endsWith('right') ? width - textWidth - margin : (width - textWidth) / 2;
  const y = position.startsWith('top') ? height - size - margin : margin;
  return { x, y };
}

export async function addPdfPageNumbers(
  file: File,
  range: string,
  position: string,
  start: number,
  fontSize: number,
  color: string,
): Promise<Uint8Array> {
  const document = await load(file);
  const font = await document.embedFont(StandardFonts.Helvetica);
  const selected = parsePageSelection(range, document.getPageCount());
  selected.forEach((pageIndex, offset) => {
    const page = document.getPage(pageIndex);
    const text = String(Math.round(start) + offset);
    const width = font.widthOfTextAtSize(text, fontSize);
    const point = textPosition(page, width, fontSize, position, 24);
    page.drawText(text, { ...point, size: fontSize, font, color: hexColor(color) });
  });
  return document.save();
}

export async function stampPdfText(
  file: File,
  range: string,
  text: string,
  position: string,
  fontSize: number,
  color: string,
  opacity: number,
  rotation: number,
): Promise<Uint8Array> {
  if (!text.trim()) throw new Error('Enter text to add to the PDF.');
  const document = await load(file);
  const font = await document.embedFont(StandardFonts.Helvetica);
  const selected = parsePageSelection(range, document.getPageCount());
  for (const pageIndex of selected) {
    const page = document.getPage(pageIndex);
    const width = font.widthOfTextAtSize(text, fontSize);
    const point = textPosition(page, width, fontSize, position, 36);
    page.drawText(text, {
      ...point,
      size: fontSize,
      font,
      color: hexColor(color),
      opacity: Math.max(0.05, Math.min(1, opacity)),
      rotate: degrees(rotation),
    });
  }
  return document.save();
}

export async function viewPdfMetadata(file: File): Promise<string> {
  const document = await load(file);
  const first = document.getPageCount() ? document.getPage(0).getSize() : null;
  const fields = document.getForm().getFields();
  return [
    `File: ${file.name}`,
    `Size: ${(file.size / 1024).toFixed(1)} KB`,
    `Pages: ${document.getPageCount()}`,
    first ? `First page: ${first.width.toFixed(1)} × ${first.height.toFixed(1)} pt` : '',
    `Title: ${document.getTitle() ?? ''}`,
    `Author: ${document.getAuthor() ?? ''}`,
    `Subject: ${document.getSubject() ?? ''}`,
    `Creator: ${document.getCreator() ?? ''}`,
    `Producer: ${document.getProducer() ?? ''}`,
    `Keywords: ${document.getKeywords() ?? ''}`,
    `Form fields: ${fields.length}`,
    ...fields.map((field) => `  • ${field.getName()} (${field.constructor.name})`),
  ].filter(Boolean).join('\n');
}

export async function editPdfMetadata(
  file: File,
  values: { title: string; author: string; subject: string; keywords: string },
): Promise<Uint8Array> {
  const document = await load(file);
  document.setTitle(values.title);
  document.setAuthor(values.author);
  document.setSubject(values.subject);
  document.setKeywords(values.keywords.split(',').map((value) => value.trim()).filter(Boolean));
  document.setModificationDate(new Date());
  return document.save();
}

export async function removePdfMetadata(file: File): Promise<Uint8Array> {
  const document = await load(file);
  document.setTitle('');
  document.setAuthor('');
  document.setSubject('');
  document.setKeywords([]);
  document.setCreator('');
  document.setProducer('');
  return document.save();
}

export async function flattenPdfForms(file: File): Promise<Uint8Array> {
  const document = await load(file);
  const form = document.getForm();
  form.flatten();
  return document.save();
}

export async function extractPdfFormData(file: File): Promise<string> {
  const document = await load(file);
  const values: Record<string, string | boolean> = {};
  for (const field of document.getForm().getFields()) {
    const name = field.getName();
    const candidate = field as unknown as {
      getText?: () => string | undefined;
      getSelected?: () => string[];
      isChecked?: () => boolean;
    };
    if (candidate.getText) values[name] = candidate.getText() ?? '';
    else if (candidate.getSelected) values[name] = candidate.getSelected().join(', ');
    else if (candidate.isChecked) values[name] = candidate.isChecked();
    else values[name] = field.constructor.name;
  }
  return JSON.stringify(values, null, 2);
}

export async function fillPdfForm(file: File, json: string): Promise<Uint8Array> {
  let values: Record<string, unknown>;
  try {
    values = JSON.parse(json) as Record<string, unknown>;
  } catch {
    throw new Error('Form data must be a JSON object, for example {"Full Name":"Ada Lovelace"}.');
  }
  const document = await load(file);
  const form = document.getForm();
  for (const [name, value] of Object.entries(values)) {
    const field = form.getFieldMaybe(name);
    if (!field) continue;
    const candidate = field as unknown as {
      setText?: (text: string) => void;
      select?: (option: string) => void;
      check?: () => void;
      uncheck?: () => void;
    };
    if (candidate.setText) candidate.setText(String(value ?? ''));
    else if (candidate.select) candidate.select(String(value ?? ''));
    else if (candidate.check && candidate.uncheck) {
      if (value) candidate.check(); else candidate.uncheck();
    }
  }
  return document.save();
}
