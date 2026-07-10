'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CaretDown, GithubLogo, List, X } from '@phosphor-icons/react';
import { TOOL_BY_ID } from '../tools/catalog';

function ToolMenu({ label, toolIds }: { label: string; toolIds: string[] }) {
  const tools = toolIds.map((id) => TOOL_BY_ID.get(id)).filter((tool) => tool?.status === 'live' && tool.route);
  return (
    <div className="nav__item">
      <button className="nav__trigger">
        {label} <CaretDown size={12} weight="bold" />
      </button>
      <div className="dropdown" role="menu">
        <ul className="dropdown__list">
          {tools.map((tool) => (
            <li key={tool!.id}>
              <Link className="megalink" href={tool!.route!}>{tool!.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function OtherMenu() {
  return (
    <div className="nav__item">
      <button className="nav__trigger">
        Other tools <CaretDown size={12} weight="bold" />
      </button>
      <div className="dropdown" role="menu">
        <ul className="dropdown__list">
          <li><Link className="megalink" href="/image">All image tools</Link></li>
          <li><Link className="megalink" href="/pdf">All PDF tools</Link></li>
          <li><Link className="megalink" href="/tools/color-picker">Color Picker</Link></li>
          <li><Link className="megalink" href="/tools/view-exif-data">View EXIF Data</Link></li>
          <li><Link className="megalink" href="/guides">Guides</Link></li>
        </ul>
      </div>
    </div>
  );
}

function BookCall() {
  return (
    <a className="btn btn--pill" href="https://cal.com/adityaanjana" target="_blank" rel="noopener noreferrer">
      Book a call
    </a>
  );
}

function GitHubButton() {
  return (
    <a
      aria-label="View opentools on GitHub"
      className="btn btn--pill btn--github"
      href="https://github.com/iamadityaanjana/opentools"
      target="_blank"
      rel="noopener noreferrer"
    >
      <GithubLogo size={17} weight="fill" />
      GitHub
    </a>
  );
}

/**
 * Shared top navigation.
 * - `minimal` (landing): logo + Book a call only.
 * - default (tool pages): concise directory links. Category navigation lives
 *   on the searchable image and PDF directory pages.
 */
export function TopNav({ minimal = false }: { minimal?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes.
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="topbar topbar--nav">
      <Link className="logo logo--link" href="/" onClick={close}>
        opentools…
      </Link>

      {minimal ? (
        <div className="nav">
          <GitHubButton />
          <BookCall />
        </div>
      ) : (
        <>
          <div className="nav nav--desktop">
            <ToolMenu label="Convert" toolIds={['image-converter']} />
            <ToolMenu label="Resize & crop" toolIds={['resize-image', 'crop-image', 'rotate-image', 'flip-image', 'change-canvas-size']} />
            <ToolMenu label="Compress" toolIds={['compress-jpg', 'compress-png', 'compress-webp', 'batch-compress-images']} />
            <ToolMenu label="PDF tools" toolIds={['merge-pdfs', 'split-pdf', 'compress-pdf', 'pdf-to-jpg', 'images-to-pdf', 'delete-pages', 'rearrange-pages', 'pdf-to-text']} />
            <OtherMenu />
            <GitHubButton />
            <BookCall />
          </div>

          <button
            className="nav__burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
          </button>
        </>
      )}

      {open && !minimal && (
        <>
          <div className="mnav__scrim" onClick={close} />
          <div className="mnav" role="dialog" aria-label="Tools menu">
            <div className="mnav__quick">
              <Link className="btn btn--dark btn--sm" href="/image" onClick={close}>All image tools</Link>
              <Link className="btn btn--sm" href="/pdf" onClick={close}>PDF tools</Link>
            </div>
            <Link className="mnav__guide" href="/guides" onClick={close}>Guides</Link>
            <Link className="mnav__guide" href="/about" onClick={close}>About</Link>
            <Link className="mnav__guide" href="/privacy" onClick={close}>Privacy</Link>
            <div className="mnav__foot">
              <GitHubButton />
              <BookCall />
            </div>
          </div>
        </>
      )}
    </header>
  );
}
