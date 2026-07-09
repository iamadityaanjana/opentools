import { Link } from 'react-router-dom';
import { CaretDown } from '@phosphor-icons/react';
import {
  CATEGORY_BY_ID, TOOLS, PRIMARY_NAV_CATEGORIES, OTHER_NAV_CATEGORIES, type Tool,
} from '../tools/catalog';

function preload(route?: string) {
  if (route === '/convert') import('./Converter');
}

function ToolLink({ t }: { t: Tool }) {
  if (t.status === 'live' && t.route) {
    return (
      <li>
        <Link className="megalink" to={t.route} onMouseEnter={() => preload(t.route)}>
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

/**
 * Shared top navigation.
 * - `minimal` (landing): logo + Book a call only.
 * - default (tool pages): common image categories by name, a PDF menu,
 *   and an "Other tools" mega menu holding the rest.
 */
export function TopNav({ minimal = false }: { minimal?: boolean }) {
  return (
    <header className="topbar topbar--nav">
      <Link className="logo logo--link" to="/">
        opentools…
      </Link>

      {minimal ? (
        <div className="nav">
          <BookCall />
        </div>
      ) : (
        <div className="nav">
          {PRIMARY_NAV_CATEGORIES.map((id) => <CategoryMenu key={id} catId={id} />)}
          <CategoryMenu catId="pdf" />
          <OtherMenu label="Other tools" catIds={OTHER_NAV_CATEGORIES} />
          <BookCall />
        </div>
      )}
    </header>
  );
}
