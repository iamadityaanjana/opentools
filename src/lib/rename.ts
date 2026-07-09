// Shared helpers for the renaming utilities (Rename Images, Batch Rename).
// Renaming is LOSSLESS: original File bytes are streamed straight into the ZIP
// with no decode/re-encode, so only the filename ever changes.

export interface NamePair {
  file: File;
  /** Filename as it will appear inside the ZIP (already de-duplicated). */
  newName: string;
}

/** Split a filename into its base name and extension (extension excludes the dot). */
export function splitName(filename: string): { base: string; ext: string } {
  const dot = filename.lastIndexOf('.');
  // Treat a leading dot (dotfiles) or missing dot as "no extension".
  if (dot <= 0) return { base: filename, ext: '' };
  return { base: filename.slice(0, dot), ext: filename.slice(dot + 1) };
}

/** Join a base + extension, omitting the dot when there is no extension. */
export function joinName(base: string, ext: string): string {
  const clean = ext.replace(/^\.+/, '').trim();
  return clean ? `${base}.${clean}` : base;
}

/**
 * De-duplicate a list of names, appending "-1", "-2", … before the extension
 * so the ZIP never silently overwrites entries that resolve to the same name.
 */
export function dedupeNames(names: string[]): string[] {
  const seen = new Map<string, number>();
  return names.map((name) => {
    const key = name.toLowerCase();
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    if (count === 0) return name;
    const { base, ext } = splitName(name);
    // Keep bumping until we land on a name we have not emitted yet.
    let n = count;
    let candidate: string;
    do {
      candidate = joinName(`${base}-${n}`, ext);
      n += 1;
    } while (seen.has(candidate.toLowerCase()));
    seen.set(candidate.toLowerCase(), 1);
    return candidate;
  });
}

export type CaseMode = 'none' | 'lower' | 'upper' | 'kebab' | 'snake';

/** Apply a case transform to a base name (never touches the extension). */
export function applyCase(base: string, mode: CaseMode): string {
  switch (mode) {
    case 'lower':
      return base.toLowerCase();
    case 'upper':
      return base.toUpperCase();
    case 'kebab':
      return base.trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').toLowerCase();
    case 'snake':
      return base.trim().replace(/[\s-]+/g, '_').replace(/_+/g, '_').toLowerCase();
    default:
      return base;
  }
}

/** Today's date as YYYY-MM-DD, used by the {date} token. */
export function todayStamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * Expand the batch-rename token pattern. Supported tokens:
 *   {n}    → 1-based index, zero-padded to `pad`
 *   {name} → the (already find/replaced + case-transformed) base name
 *   {ext}  → original extension (no dot)
 *   {date} → today's date, YYYY-MM-DD
 */
export function expandPattern(
  pattern: string,
  ctx: { index: number; pad: number; name: string; ext: string; date: string },
): string {
  return pattern.replace(/\{(n|name|ext|date)\}/g, (_, token: string) => {
    switch (token) {
      case 'n':
        return String(ctx.index).padStart(ctx.pad, '0');
      case 'name':
        return ctx.name;
      case 'ext':
        return ctx.ext;
      case 'date':
        return ctx.date;
      default:
        return '';
    }
  });
}

/**
 * Build a ZIP of the renamed files. `jszip` is lazy-loaded so it stays out of
 * the initial bundle. Original bytes are preserved (no re-encode).
 */
export async function buildRenamedZip(pairs: NamePair[]): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  for (const { file, newName } of pairs) {
    zip.file(newName, file);
  }
  return zip.generateAsync({ type: 'blob' });
}
