import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CaretDown, List, X } from '@phosphor-icons/react';
import {
  CATEGORY_BY_ID, TOOLS, PRIMARY_NAV_CATEGORIES, OTHER_NAV_CATEGORIES, type Tool,
} from '../tools/catalog';

function preload(route?: string) {
  if (route === '/convert') import('./Converter');
}

function ToolLink({ t, onNavigate }: { t: Tool; onNavigate?: () => void }) {
  if (t.status === 'live' && t.route) {
    return (
      <li>
        <Link className="megalink" to={t.route} onMouseEnter={() => preload(t.route)} onClick={onNavigate}>
          {t.name}
        </Link>
      </li>
    );
  }
  return (
    <li>
      <span className="megalink megalink--soon">
        {t.name}
        <span className="megalink__soon">soon</span>
      </span>
    </li>
  );
}

function toolsIn(catId: string) {
  return TOOLS.filter((t) => t.categoryId === catId);
}

/** Single-category dropdown surfaced directly in the nav. */
function CategoryMenu({ catId }: { catId: string }) {
  const cat = CATEGORY_BY_ID.get(catId);
  if (!cat) return null;
  return (
    <div className="nav__item">
      <button className="nav__trigger">
        {cat.label} <CaretDown size={12} weight="bold" />
      </button>
      <div className="dropdown" role="menu">
        <ul className="dropdown__list">
          {toolsIn(catId).map((t) => <ToolLink key={t.id} t={t} />)}
        </ul>
      </div>
    </div>
  );
}

/** Mega menu holding the remaining categories, grouped in columns. */
function OtherMenu({ label, catIds }: { label: string; catIds: string[] }) {
  return (
    <div className="nav__item nav__item--mega">
      <button className="nav__trigger">
        {label} <CaretDown size={12} weight="bold" />
      </button>
      <div className="megamenu" role="menu">
        <div className="megamenu__grid">
          {catIds.map((catId) => {
            const cat = CATEGORY_BY_ID.get(catId)!;
            return (
              <div key={catId} className="megacol">
                <div className="megacol__head">
                  <span className="megacol__emoji">{cat.emoji}</span>
                  {cat.label}
                </div>
                <ul className="megacol__list">
                  {toolsIn(catId).map((t) => <ToolLink key={t.id} t={t} />)}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BookCall() {
  return (
    <a className="btn btn--pill" href="http://cal.com/adityaanjana" target="_blank" rel="noopener noreferrer">
      Book a call
    </a>
  );
}

/** Collapsible category section used inside the mobile drawer. */
function MobileCategory({ catId, onNavigate }: { catId: string; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const cat = CATEGORY_BY_ID.get(catId);
  if (!cat) return null;
  return (
    <div className={`mnav__cat ${open ? 'is-open' : ''}`}>
      <button className="mnav__cathead" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="mnav__catlabel"><span>{cat.emoji}</span> {cat.label}</span>
        <CaretDown className="mnav__caret" size={14} weight="bold" />
      </button>
      {open && (
        <ul className="mnav__list">
          {toolsIn(catId).map((t) => <ToolLink key={t.id} t={t} onNavigate={onNavigate} />)}
        </ul>
      )}
    </div>
  );
}

/**
 * Shared top navigation.
 * - `minimal` (landing): logo + Book a call only.
 * - default (tool pages): common image categories by name, a PDF menu,
 *   and an "Other tools" mega menu holding the rest. On small screens the
 *   category menus collapse into a slide-down drawer behind a hamburger.
 */
export function TopNav({ minimal = false }: { minimal?: boolean }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

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
  const allCats = [...PRIMARY_NAV_CATEGORIES, 'pdf', ...OTHER_NAV_CATEGORIES];

  return (
    <header className="topbar topbar--nav">
      <Link className="logo logo--link" to="/" onClick={close}>
        opentools…
      </Link>

      {minimal ? (
        <div className="nav">
          <BookCall />
        </div>
      ) : (
        <>
          <div className="nav nav--desktop">
            {PRIMARY_NAV_CATEGORIES.map((id) => <CategoryMenu key={id} catId={id} />)}
            <CategoryMenu catId="pdf" />
            <OtherMenu label="Other tools" catIds={OTHER_NAV_CATEGORIES} />
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
              <Link className="btn btn--dark btn--sm" to="/image" onClick={close}>All image tools</Link>
              <Link className="btn btn--sm" to="/pdf" onClick={close}>PDF tools</Link>
            </div>
            <div className="mnav__cats">
              {allCats.map((id) => <MobileCategory key={id} catId={id} onNavigate={close} />)}
            </div>
            <div className="mnav__foot">
              <BookCall />
            </div>
          </div>
        </>
      )}
    </header>
  );
}
