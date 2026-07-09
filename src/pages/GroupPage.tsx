import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MagnifyingGlass, ArrowUpRight } from '@phosphor-icons/react';
import { TopNav } from '../components/TopNav';
import {
  categoriesForGroup,
  CATEGORY_BY_ID,
  TOOLS,
  type Tool,
  type ToolGroup,
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

const GROUP_META: Record<ToolGroup, { title: string; sub: string }> = {
  image: { title: 'Image tools', sub: 'Convert, resize, compress, edit and more — all on-device.' },
  pdf: { title: 'PDF tools', sub: 'Turn images into PDFs and back. More PDF tools on the way.' },
};

export default function GroupPage({ group }: { group: ToolGroup }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string>('all');
  const q = query.trim().toLowerCase();

  const cats = useMemo(() => categoriesForGroup(group), [group]);

  const visible = useMemo(() => {
    return cats
      .map((cat) => ({
        cat,
        tools: TOOLS.filter(
          (t) =>
            t.categoryId === cat.id &&
            (active === 'all' || active === cat.id) &&
            (q === '' || t.name.toLowerCase().includes(q)),
        ),
      }))
      .filter((g) => g.tools.length > 0);
  }, [cats, active, q]);

  const meta = GROUP_META[group];
  const liveCount = TOOLS.filter((t) => cats.some((c) => c.id === t.categoryId) && t.status === 'live').length;
  const total = TOOLS.filter((t) => cats.some((c) => c.id === t.categoryId)).length;

  return (
    <div className="page page--wide">
      <TopNav />

      <div className="tools-hero">
        <h1 className="tools-title">{meta.title}</h1>
        <p className="tools-sub">
          {meta.sub} {liveCount} of {total} live.
        </p>
        <div className="searchbar">
          <MagnifyingGlass size={18} className="searchbar__icon" />
          <input
            className="searchbar__input"
            placeholder="Search tools…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {cats.length > 1 && (
        <nav className="catnav">
          <button className={`chip-btn ${active === 'all' ? 'is-active' : ''}`} onClick={() => setActive('all')}>
            All
          </button>
          {cats.map((c) => (
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
      )}

      {visible.length === 0 && <p className="tools-empty">No tools match “{query}”.</p>}

      <div className="tools-groups">
        {visible.map(({ cat, tools }) => (
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
