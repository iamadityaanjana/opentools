'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UploadSimple } from '@phosphor-icons/react';
import { TopNav } from '../components/TopNav';
import { SiteFooter } from '../components/SiteFooter';
import { PdfTextStudio } from '../components/pdf-editor/PdfTextStudio';
import { TOOL_BY_ID, CATEGORY_BY_ID, GROUP_HOME, GROUP_LABEL } from '../tools/catalog';
import { getToolPageContent } from '../content/tool-page-content';

export default function PdfEditorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tool = TOOL_BY_ID.get('pdf-editor');
  const cat = tool ? CATEGORY_BY_ID.get(tool.categoryId) : undefined;
  const pageContent = tool ? getToolPageContent(tool) : null;
  const Icon = cat?.icon;

  const acceptFile = useCallback((next: File) => {
    if (next.type === 'application/pdf' || /\.pdf$/i.test(next.name)) setFile(next);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const next = e.dataTransfer.files[0];
    if (next) acceptFile(next);
  };

  return (
    <div className={`page page--tool${file ? ' page--pdf-editor-active' : ''}`}>
      <TopNav />
      <main className={file ? 'pdf-editor-main' : undefined}>
        {file ? (
          <div className="pdf-editor-active">
            <div className="pdf-editor-active__bar">
              <nav className="crumbs crumbs--sub crumbs--compact">
                <Link className="crumbs__link" href={GROUP_HOME.pdf}>{GROUP_LABEL.pdf}</Link>
                <span className="crumbs__sep">/</span>
                <span className="crumbs__current">PDF Editor</span>
              </nav>
              <Link className="btn btn--sm btn--pill btn--icon" href={GROUP_HOME.pdf}>
                <ArrowLeft size={14} weight="bold" /> Back
              </Link>
            </div>
            <PdfTextStudio
              key={file.name + file.size}
              file={file}
              onRequestNewFile={() => setFile(null)}
            />
          </div>
        ) : (
          <div className="tool-workspace">
            <nav className="crumbs crumbs--sub">
              <Link className="crumbs__link" href={GROUP_HOME.pdf}>{GROUP_LABEL.pdf}</Link>
              <span className="crumbs__sep">/</span>
              <span className="crumbs__current">PDF Editor</span>
            </nav>

            <div className="tool-hero">
              {Icon && <div className="tool-hero__icon"><Icon size={26} weight="fill" /></div>}
              <div>
                <h1 className="tool-title">{tool?.name ?? 'PDF Editor'}</h1>
                <p className="tool-desc">
                  {pageContent?.description ?? 'Place and style text anywhere on your PDF — font, size, and color — without rasterizing the document.'}
                </p>
              </div>
              <Link className="btn btn--pill btn--icon" href={GROUP_HOME.pdf}>
                <ArrowLeft size={15} weight="bold" /> {GROUP_LABEL.pdf}
              </Link>
            </div>

            <div
              className={`dropzone ${dragging ? 'dropzone--active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                hidden
                onChange={(e) => { const next = e.target.files?.[0]; if (next) acceptFile(next); e.target.value = ''; }}
              />
              <div className="dropzone__inner">
                <UploadSimple size={34} weight="light" className="dropzone__icon" />
                <p className="dropzone__title">
                  Drop a PDF here <span className="muted">or click to browse</span>
                </p>
                <p className="dropzone__hint">
                  Click to place text boxes, pick fonts and colors, then download — everything stays local.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      {!file && <SiteFooter />}
    </div>
  );
}
