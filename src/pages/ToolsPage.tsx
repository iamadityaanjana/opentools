import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MagnifyingGlass, ArrowLeft, ArrowUpRight } from '@phosphor-icons/react';
import {
  CATEGORIES,
  CATEGORY_BY_ID,
  TOOLS,
  LIVE_COUNT,
  TOTAL_COUNT,
  type Tool,
} from '../tools/catalog';

function preload(route?: string) {
  if (route === '/convert') import('../components/Converter');
}

function ToolCard({ tool }: { tool: Tool }) {
  const cat = CATEGORY_BY_ID.get(tool.categoryId)!;
  const Icon = cat.icon;
  const inner = (
    <>
      <div className="tcard__top">
        <span className="tcard__icon">
          <Icon size={20} weight="regular" />
        </span>
        <span className={`tcard__badge ${tool.status === 'live' ? 'is-live' : 'is-soon'}`}>
          {tool.status === 'live' ? 'Live' : 'Soon'}
        </span>
      </div>
      <div className="tcard__name">
        {tool.name}
        {tool.status === 'live' && <ArrowUpRight size={15} weight="bold" className="tcard__go" />}
      </div>
      {tool.blurb && <div className="tcard__blurb">{tool.blurb}</div>}
    </>
  );

  if (tool.status === 'live' && tool.route) {
    return (
      <Link className="tcard tcard--live" to={tool.route} onMouseEnter={() => preload(tool.route)}>
        {inner}
      </Link>
    );
  }
  return (
    <div className="tcard tcard--soon" aria-disabled>
      {inner}
    </div>
  );
}

export default function ToolsPage() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string>('all');

  const q = query.trim().toLowerCase();

  const visibleCategories = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const tools = TOOLS.filter(
        (t) =>
          t.categoryId === cat.id &&
          (active === 'all' || active === cat.id) &&
          (q === '' || t.name.toLowerCase().includes(q)),
      );
      return { cat, tools };
    }).filter((g) => g.tools.length > 0);
  }, [active, q]);

  const noResults = visibleCategories.length === 0;

  return (
    <div className="page page--wide">
      <header className="topbar">
        <Link className="logo logo--link" to="/">
          toolbox…
        </Link>
        <Link className="btn btn--pill btn--icon" to="/">
          <ArrowLeft size={15} weight="bold" /> Home
        </Link>
      </header>

      <div className="tools-hero">
        <h1 className="tools-title">All tools</h1>
        <p className="tools-sub">
          {TOTAL_COUNT} tools across {CATEGORIES.length} categories · {LIVE_COUNT} live, the rest on the
          way. Everything runs 100% in your browser.
        </p>

        <div className="searchbar">
          <MagnifyingGlass size={18} className="searchbar__icon" />
          <input
            className="searchbar__input"
            placeholder="Search tools…  (try “resize”, “pdf”, “heic”)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <nav className="catnav">
        <button
          className={`chip-btn ${active === 'all' ? 'is-active' : ''}`}
          onClick={() => setActive('all')}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`chip-btn ${active === c.id ? 'is-active' : ''}`}
            onClick={() => setActive(c.id)}
          >
            <span className="chip-btn__emoji">{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </nav>

      {noResults && (
        <p className="tools-empty">No tools match “{query}”. Try a different term.</p>
      )}

      <div className="tools-groups">
        {visibleCategories.map(({ cat, tools }) => (
          <section key={cat.id} className="tgroup" id={cat.id}>
            <h2 className="tgroup__title">
              <span className="tgroup__emoji">{cat.emoji}</span>
              {cat.label}
              <span className="tgroup__count">{tools.length}</span>
            </h2>
            <motion.div layout className="tgrid">
              {tools.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </motion.div>
          </section>
        ))}
      </div>

      <footer className="footer">
        <span>toolbox · private, on-device tools · new ones shipping regularly.</span>
      </footer>
    </div>
  );
}
