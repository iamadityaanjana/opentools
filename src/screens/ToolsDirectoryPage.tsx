'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  CaretDown,
  FilePdf,
  ImageSquare,
  MagnifyingGlass,
} from '@phosphor-icons/react';
import { usePostHog } from '@posthog/react';
import { TopNav } from '../components/TopNav';
import { SiteFooter } from '../components/SiteFooter';
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
    return <Link className="tcard tcard--live" href={tool.route}>{body}</Link>;
  }
  return <article className="tcard tcard--soon" data-nosnippet>{body}</article>;
}

export default function ToolsDirectoryPage({ group, children }: { group: ToolGroup; children?: ReactNode }) {
  const posthog = usePostHog();
  const [query, setQuery] = useState('');
  const categories = useMemo(() => categoriesForGroup(group), [group]);
  const normalizedQuery = query.trim().toLowerCase();
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const groups = useMemo(() => categories.map((category) => ({
    category,
    tools: TOOLS.filter((tool) => (
      tool.categoryId === category.id
      && (!normalizedQuery || `${tool.name} ${tool.blurb ?? ''}`.toLowerCase().includes(normalizedQuery))
    )).sort((a, b) => Number(b.status === 'live') - Number(a.status === 'live')),
  })).filter(({ tools }) => tools.length > 0), [categories, normalizedQuery]);

  const visibleTools = groups.flatMap((item) => item.tools);
  const liveCount = visibleTools.filter((tool) => tool.status === 'live').length;
  const soonCount = visibleTools.length - liveCount;
  const title = GROUP_LABEL[group];
  const isImage = group === 'image';
  const HeroIcon = isImage ? ImageSquare : FilePdf;

  // Deep-link support: a hash like #category-pdf-security (e.g. from a tool
  // breadcrumb or the category chips) opens that collapsed section and scrolls
  // to it. Runs on mount and whenever the hash changes.
  useEffect(() => {
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      if (el instanceof HTMLDetailsElement) {
        el.open = true;
        requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      }
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, [groups]);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (value.trim()) {
      searchDebounceRef.current = setTimeout(() => {
        posthog?.capture('tool_search_performed', {
          query: value.trim(),
          tool_group: group,
        });
      }, 600);
    }
  }, [posthog, group]);

  return (
    <div className="page page--wide">
      <TopNav />

      <main>
        <section className="tools-hero">
          <div className="directory-hero__eyebrow">
            <HeroIcon size={16} weight="fill" />
            {liveCount} live{soonCount > 0 ? ` · ${soonCount} coming soon` : ''}
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
              onChange={(event) => handleSearch(event.target.value)}
              placeholder={`Search ${title.toLowerCase()}…`}
              aria-label={`Search ${title.toLowerCase()}`}
            />
          </div>
        </section>

        {!normalizedQuery && categories.length > 1 && (
          <nav className="catnav" aria-label={`${title} categories`}>
            {categories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <a
                  className="chip-btn"
                  href={`#category-${category.id}`}
                  key={category.id}
                >
                  <CategoryIcon size={14} weight="bold" />
                  {category.label}
                </a>
              );
            })}
          </nav>
        )}

        {groups.length > 0 ? (
          <div className="tools-groups">
            {groups.map(({ category, tools }) => {
              const CategoryIcon = category.icon;
              return (
                <details
                  className="tgroup tgroup--accordion"
                  id={`category-${category.id}`}
                  key={category.id}
                  onToggle={(event) => posthog?.capture('tool_category_toggled', {
                    category_id: category.id,
                    action: event.currentTarget.open ? 'open' : 'close',
                    tool_group: group,
                  })}
                >
                  <summary className="tgroup__title">
                    <span
                      className="tgroup__toggle"
                    >
                      <CategoryIcon size={18} weight="fill" />
                      <span>{category.label}</span>
                      <span className="tgroup__count">{tools.length}</span>
                      <CaretDown className="tgroup__caret" size={17} weight="bold" />
                    </span>
                  </summary>
                  <div className="tgrid tgrid--accordion">
                    {tools.map((tool) => (
                      <ToolCard categoryIcon={category.icon} key={tool.id} tool={tool} />
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        ) : (
          <p className="tools-empty">No tools match “{query}”.</p>
        )}
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
