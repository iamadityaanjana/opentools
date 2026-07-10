'use client';

import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Textbox, UploadSimple, DownloadSimple, Trash, X, ArrowLeft, ShieldCheck, Warning,
} from '@phosphor-icons/react';
import { usePostHog } from '@posthog/react';
import { TopNav } from '../components/TopNav';
import { SiteFooter } from '../components/SiteFooter';
import { ToolEditorial } from '../components/ToolEditorial';
import { Dropdown } from '../components/Dropdown';
import { formatBytes } from '../lib/convert';
import {
  splitName, joinName, dedupeNames, applyCase, expandPattern, todayStamp,
  buildRenamedZip, type NamePair, type CaseMode,
} from '../lib/rename';

interface Item {
  id: string;
  file: File;
}

let seq = 0;

export default function BatchRenamePage({ children }: { children?: ReactNode }) {
  const posthog = usePostHog();
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [caseMode, setCaseMode] = useState<CaseMode>('none');
  const [pattern, setPattern] = useState('{name}');
  const [pad, setPad] = useState(3);
  const [start, setStart] = useState(1);

  const addFiles = useCallback((files: FileList | File[]) => {
    const next = Array.from(files).map((file) => ({ id: `f-${seq++}`, file }));
    setItems((prev) => [...prev, ...next]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const clearAll = useCallback(() => setItems([]), []);

  // Compile the regex once (when enabled) so we can surface a friendly error
  // instead of throwing on every keystroke.
  const { regex, regexError } = useMemo(() => {
    if (!useRegex || !find) return { regex: null as RegExp | null, regexError: '' };
    try {
      return { regex: new RegExp(find, 'g'), regexError: '' };
    } catch (e) {
      return { regex: null, regexError: e instanceof Error ? e.message : 'Invalid regular expression.' };
    }
  }, [useRegex, find]);

  const applyFindReplace = useCallback((baseName: string): string => {
    if (!find) return baseName;
    if (useRegex) {
      if (!regex) return baseName; // invalid pattern → leave untouched
      regex.lastIndex = 0;
      return baseName.replace(regex, replace);
    }
    return baseName.split(find).join(replace);
  }, [find, replace, useRegex, regex]);

  // Single source of truth for both the preview table and the ZIP.
  const pairs = useMemo<NamePair[]>(() => {
    const date = todayStamp();
    const raw = items.map((it, i) => {
      const { base, ext } = splitName(it.file.name);
      const transformed = applyCase(applyFindReplace(base), caseMode);
      const index = start + i;
      const pat = pattern.trim() || '{name}';
      let name = expandPattern(pat, { index, pad: Math.max(0, pad), name: transformed, ext, date });
      // If the pattern didn't include an explicit {ext}, keep the original one.
      if (!/\{ext\}/.test(pat)) name = joinName(name, ext);
      return name || joinName(`file${index}`, ext);
    });
    const deduped = dedupeNames(raw);
    return items.map((it, i) => ({ file: it.file, newName: deduped[i] }));
  }, [items, applyFindReplace, caseMode, pattern, pad, start]);

  const download = useCallback(async () => {
    if (pairs.length === 0) return;
    setBusy(true);
    try {
      const blob = await buildRenamedZip(pairs);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'batch-renamed.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      posthog?.capture('batch_renamed_downloaded', {
        file_count: pairs.length,
        use_regex: useRegex,
        case_mode: caseMode,
      });
    } finally {
      setBusy(false);
    }
  }, [pairs, posthog, useRegex, caseMode]);

  const hasFiles = items.length > 0;

  return (
    <div className="page page--tool">
      <TopNav />
      <main>
      <div className="tool-workspace">

      <nav className="crumbs crumbs--sub">
        <Link className="crumbs__link" href="/image">Image tools</Link>
        <span className="crumbs__sep">/</span>
        <span className="crumbs__link">Utilities</span>
        <span className="crumbs__sep">/</span>
        <span className="crumbs__current">Batch Rename</span>
      </nav>

      <div className="tool-hero">
        <div className="tool-hero__icon"><Textbox size={26} weight="fill" /></div>
        <div>
          <h1 className="tool-title">Batch Rename</h1>
          <p className="tool-desc">Find/replace (with regex), case transforms and numbering tokens like <code>{'{n}'}</code>, <code>{'{name}'}</code>, <code>{'{ext}'}</code>, <code>{'{date}'}</code>. Byte-identical files, zipped for download.</p>
        </div>
        <span className="privacy-pill"><ShieldCheck size={15} weight="fill" /> Files process locally</span>
      </div>

      <div
        className={`dropzone ${dragging ? 'dropzone--active' : ''} ${hasFiles ? 'dropzone--compact' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.heic,.heif,.tif,.tiff,.avif,.svg,.ico,.jp2"
          hidden
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <div className="dropzone__inner">
          <UploadSimple size={hasFiles ? 22 : 34} weight="light" className="dropzone__icon" />
          <p className="dropzone__title">{hasFiles ? 'Add more images' : <>Drop images here <span className="muted">or click to browse</span></>}</p>
          {!hasFiles && <p className="dropzone__hint">Tokens: {'{n}'} (padded index), {'{name}'}, {'{ext}'}, {'{date}'}.</p>}
        </div>
      </div>

      {hasFiles && (
        <>
          <div className="converter__controls converter__controls--stack" style={{ marginTop: 18 }}>
            <label className="field field--grow">
              <span className="field__label">Find</span>
              <input className={`select ${regexError ? 'is-invalid' : ''}`} type="text" value={find} placeholder={useRegex ? 'e.g. \\d+' : 'text to find'} onChange={(e) => setFind(e.target.value)} />
            </label>
            <label className="field field--grow">
              <span className="field__label">Replace</span>
              <input className="select" type="text" value={replace} placeholder="replacement" onChange={(e) => setReplace(e.target.value)} />
            </label>
            <label className="field field--check">
              <input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} />
              <span className="field__label">Regex</span>
            </label>
            <label className="field">
              <span className="field__label">Case</span>
              <Dropdown
                value={caseMode}
                onChange={(v) => setCaseMode(v as CaseMode)}
                ariaLabel="Case"
                options={[
                  { value: 'none', label: 'Keep' },
                  { value: 'lower', label: 'lowercase' },
                  { value: 'upper', label: 'UPPERCASE' },
                  { value: 'kebab', label: 'kebab-case' },
                  { value: 'snake', label: 'snake_case' },
                ]}
              />
            </label>
          </div>

          <div className="converter__controls converter__controls--stack">
            <label className="field field--grow">
              <span className="field__label">Name pattern</span>
              <input className="select" type="text" value={pattern} placeholder="{name}-{n}" onChange={(e) => setPattern(e.target.value)} />
            </label>
            <label className="field">
              <span className="field__label">Start index</span>
              <input className="select" type="number" value={start} onChange={(e) => setStart(Number.isNaN(Number(e.target.value)) ? 0 : Math.round(Number(e.target.value)))} />
            </label>
            <label className="field">
              <span className="field__label">Number padding</span>
              <input className="select" type="number" min={0} max={10} value={pad} onChange={(e) => setPad(Math.max(0, Math.min(10, Number(e.target.value) || 0)))} />
            </label>
          </div>

          {regexError && (
            <div className="job__error" style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Warning size={14} weight="fill" /> Invalid regex: {regexError}
            </div>
          )}

          <div className="controls__actions controls__actions--full" style={{ marginTop: 14 }}>
            <button className="btn btn--dark btn--icon" onClick={download} disabled={busy}>
              <DownloadSimple size={16} weight="bold" /> {busy ? 'Zipping…' : `Download ZIP (${items.length})`}
            </button>
            <button className="btn btn--ghost btn--icon" onClick={clearAll} disabled={busy}><Trash size={15} /> Clear</button>
          </div>

          <div className="editor__preview" style={{ marginTop: 18, padding: 14 }}>
            <div className="preview-head">
              <span className="preview-head__label">Preview</span>
              <span className="preview-head__note">{items.length} file{items.length === 1 ? '' : 's'} · matches ZIP contents exactly</span>
            </div>
            <table className="exif__table">
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>#</th>
                  <th style={{ width: '42%' }}>Original name</th>
                  <th style={{ width: '42%' }}>New name</th>
                  <th style={{ width: '11%' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={it.id}>
                    <td>{i + 1}</td>
                    <td title={it.file.name}>{it.file.name} <span className="muted">({formatBytes(it.file.size)})</span></td>
                    <td>{pairs[i]?.newName}</td>
                    <td>
                      <button className="job__remove" onClick={() => removeItem(it.id)} aria-label="Remove"><X size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="colorconv__foot">
        <Link className="btn btn--pill btn--icon" href="/tools/rename-images"><ArrowLeft size={15} weight="bold" /> Rename Images (simple)</Link>
      </div>

      </div>
      <ToolEditorial>{children}</ToolEditorial>
      </main>
      <SiteFooter />
    </div>
  );
}
