import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CaretDown,
  FilePdf,
  ImageSquare,
  MagnifyingGlass,
  ShieldCheck,
} from '@phosphor-icons/react';
import { TopNav } from '../components/TopNav';
import {
  categoriesForGroup,
  GROUP_LABEL,
  TOOLS,
  type Tool,
  type ToolGroup,
} from '../tools/catalog';

function ToolCard({ tool, categoryIcon: Icon }: {
  tool: Tool;
  categoryIcon: ReturnType<typeof categoriesForGroup>[number]['icon'];
}) {
  const body = (
    <>
      <div className="tcard__top">
        <span className="tcard__icon"><Icon size={19} weight="fill" /></span>
        <span className={`tcard__badge ${tool.status === 'live' ? 'is-live' : 'is-soon'}`}>
          {tool.status === 'live' ? 'Live' : 'Soon'}
        </span>
      </div>
      <div className="tcard__name">
        {tool.name}
        {tool.status === 'live' && <ArrowUpRight className="tcard__go" size={14} weight="bold" />}
      </div>
      {tool.blurb && <div className="tcard__blurb">{tool.blurb}</div>}
    </>
  );

  if (tool.status === 'live' && tool.route) {
    return <Link className="tcard tcard--live" to={tool.route}>{body}</Link>;
  }
  return <article className="tcard tcard--soon">{body}</article>;
}

export default function ToolsDirectoryPage({ group }: { group: ToolGroup }) {
  const [query, setQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<Set<string>>(() => new Set());
  const categories = useMemo(() => categoriesForGroup(group), [group]);
  const normalizedQuery = query.trim().toLowerCase();

  const groups = useMemo(() => categories.map((category) => ({
    category,
    tools: TOOLS.filter((tool) => (
      tool.categoryId === category.id
      && (!normalizedQuery || `${tool.name} ${tool.blurb ?? ''}`.toLowerCase().includes(normalizedQuery))
    )),
  })).filter(({ tools }) => tools.length > 0), [categories, normalizedQuery]);

  const visibleCount = groups.reduce((count, item) => count + item.tools.length, 0);
  const title = GROUP_LABEL[group];
  const isImage = group === 'image';
  const HeroIcon = isImage ? ImageSquare : FilePdf;

  useEffect(() => {
    document.title = `${title} · opentools`;
    return () => { document.title = 'opentools'; };
  }, [title]);

  useEffect(() => {
    setOpenCategories(new Set());
  }, [group]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  return (
    <div className="page page--wide">
      <TopNav />

      <main>
        <section className="tools-hero">
          <div className="directory-hero__eyebrow">
            <HeroIcon size={16} weight="fill" />
            {visibleCount} tool{visibleCount === 1 ? '' : 's'}
          </div>
          <h1 className="tools-title">{title}</h1>
          <p className="tools-sub">
            {isImage
              ? 'Convert, resize, compress, edit, organize, and inspect images—entirely in your browser.'
              : 'Create, convert, and extract PDFs locally without uploading your files.'}
          </p>
          <div className="searchbar">
            <MagnifyingGlass className="searchbar__icon" size={18} />
            <input
              className="searchbar__input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${title.toLowerCase()}…`}
              aria-label={`Search ${title.toLowerCase()}`}
            />
          </div>
        </section>

        {!normalizedQuery && categories.length > 1 && (
          <nav className="catnav" aria-label={`${title} categories`}>
            {categories.map((category) => (
              <button
                className={`chip-btn ${openCategories.has(category.id) ? 'is-active' : ''}`}
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                type="button"
              >
                <span className="chip-btn__emoji">{category.emoji}</span>
                {category.label}
              </button>
            ))}
          </nav>
        )}

        {groups.length > 0 ? (
          <div className="tools-groups">
            {groups.map(({ category, tools }) => {
              const isOpen = openCategories.has(category.id);
              return (
                <section className={`tgroup tgroup--accordion ${isOpen ? 'is-open' : ''}`} id={`category-${category.id}`} key={category.id}>
                  <h2 className="tgroup__title">
                    <button
                      aria-expanded={isOpen}
                      className="tgroup__toggle"
                      onClick={() => toggleCategory(category.id)}
                      type="button"
                    >
                      <span className="tgroup__emoji">{category.emoji}</span>
                      <span>{category.label}</span>
                      <span className="tgroup__count">{tools.length}</span>
                      <CaretDown className="tgroup__caret" size={17} weight="bold" />
                    </button>
                  </h2>
                  {isOpen && (
                    <div className="tgrid tgrid--accordion">
                      {tools.map((tool) => (
                        <ToolCard categoryIcon={category.icon} key={tool.id} tool={tool} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          <p className="tools-empty">No tools match “{query}”.</p>
        )}
      </main>

      <footer className="footer">
        <span><ShieldCheck size={14} weight="fill" /> Your files never leave this device.</span>
      </footer>
    </div>
  );
}
