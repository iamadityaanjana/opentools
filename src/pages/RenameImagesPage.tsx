import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TextAa, UploadSimple, DownloadSimple, Trash, X, ArrowLeft, ShieldCheck,
} from '@phosphor-icons/react';
import { usePostHog } from '@posthog/react';
import { TopNav } from '../components/TopNav';
import { Dropdown } from '../components/Dropdown';
import { formatBytes } from '../lib/convert';
import {
  splitName, joinName, dedupeNames, buildRenamedZip, type NamePair,
} from '../lib/rename';

interface Item {
  id: string;
  file: File;
}

type ExtMode = 'keep' | 'replace';

let seq = 0;

export default function RenameImagesPage() {
  const posthog = usePostHog();
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [prefix, setPrefix] = useState('');
  const [base, setBase] = useState('image');
  const [start, setStart] = useState(1);
  const [pad, setPad] = useState(3);
  const [extMode, setExtMode] = useState<ExtMode>('keep');
  const [replaceExt, setReplaceExt] = useState('jpg');

  const addFiles = useCallback((files: FileList | File[]) => {
    const next = Array.from(files).map((file) => ({ id: `f-${seq++}`, file }));
    setItems((prev) => [...prev, ...next]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const clearAll = useCallback(() => setItems([]), []);

  // Compute the old→new mapping; this is the single source of truth for both
  // the preview table and the generated ZIP so they can never diverge.
  const pairs = useMemo<NamePair[]>(() => {
    const rawNames = items.map((it, i) => {
      const { ext: origExt } = splitName(it.file.name);
      const ext = extMode === 'replace' ? replaceExt : origExt;
      const idx = String(start + i).padStart(Math.max(0, pad), '0');
      const newBase = `${prefix}${base}${idx}`;
      return joinName(newBase || `file${idx}`, ext);
    });
    const deduped = dedupeNames(rawNames);
    return items.map((it, i) => ({ file: it.file, newName: deduped[i] }));
  }, [items, prefix, base, start, pad, extMode, replaceExt]);

  const download = useCallback(async () => {
    if (pairs.length === 0) return;
    setBusy(true);
    try {
      const blob = await buildRenamedZip(pairs);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'renamed-images.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      posthog?.capture('images_renamed_downloaded', { file_count: pairs.length });
    } finally {
      setBusy(false);
    }
  }, [pairs, posthog]);

  useEffect(() => () => { /* nothing to revoke — we hold Files, not object URLs */ }, []);

  const hasFiles = items.length > 0;

  return (
    <div className="page page--wide">
      <TopNav />

      <nav className="crumbs crumbs--sub">
        <Link className="crumbs__link" to="/convert">Image tools</Link>
        <span className="crumbs__sep">/</span>
        <span className="crumbs__link">Utilities</span>
        <span className="crumbs__sep">/</span>
        <span className="crumbs__current">Rename Images</span>
      </nav>

      <div className="tool-hero">
        <div className="tool-hero__icon"><TextAa size={26} weight="fill" /></div>
        <div>
          <h1 className="tool-title">Rename Images</h1>
          <p className="tool-desc">Rename many images with a prefix, base name and auto-numbering, then download a ZIP. Files are renamed byte-for-byte — never re-encoded.</p>
        </div>
        <span className="privacy-pill"><ShieldCheck size={15} weight="fill" /> 100% on-device</span>
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
          {!hasFiles && <p className="dropzone__hint">The preview table updates live as you tweak the pattern.</p>}
        </div>
      </div>

      {hasFiles && (
        <>
          <div className="converter__controls converter__controls--stack" style={{ marginTop: 18 }}>
            <label className="field field--grow">
              <span className="field__label">Prefix</span>
              <input className="select" type="text" value={prefix} placeholder="e.g. vacation-" onChange={(e) => setPrefix(e.target.value)} />
            </label>
            <label className="field field--grow">
              <span className="field__label">Base name</span>
              <input className="select" type="text" value={base} placeholder="image" onChange={(e) => setBase(e.target.value)} />
            </label>
            <label className="field">
              <span className="field__label">Start index</span>
              <input className="select" type="number" value={start} onChange={(e) => setStart(Number.isNaN(Number(e.target.value)) ? 0 : Math.round(Number(e.target.value)))} />
            </label>
            <label className="field">
              <span className="field__label">Zero-padding</span>
              <input className="select" type="number" min={0} max={10} value={pad} onChange={(e) => setPad(Math.max(0, Math.min(10, Number(e.target.value) || 0)))} />
            </label>
            <label className="field">
              <span className="field__label">Extension</span>
              <Dropdown
                value={extMode}
                onChange={(v) => setExtMode(v as ExtMode)}
                ariaLabel="Extension"
                options={[{ value: 'keep', label: 'Keep original' }, { value: 'replace', label: 'Replace' }]}
              />
            </label>
            {extMode === 'replace' && (
              <label className="field">
                <span className="field__label">New extension</span>
                <input className="select" type="text" value={replaceExt} placeholder="jpg" onChange={(e) => setReplaceExt(e.target.value)} />
              </label>
            )}
          </div>

          {extMode === 'replace' && (
            <p className="dropzone__hint" style={{ marginTop: 8 }}>
              Note: this changes the filename extension only — the file bytes are not converted.
            </p>
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
        <Link className="btn btn--pill btn--icon" to="/tools/batch-rename"><ArrowLeft size={15} weight="bold" /> Batch Rename (advanced)</Link>
      </div>

      <footer className="footer"><span>Part of opentools · your files never leave this device.</span></footer>
    </div>
  );
}
