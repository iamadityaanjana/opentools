import type { ReactNode } from 'react';
import Link from 'next/link';
import { TopNav } from './TopNav';
import { SiteFooter } from './SiteFooter';

export function ContentShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="page page--wide">
      <TopNav />
      <main>
        <nav className="crumbs crumbs--sub" aria-label="Breadcrumb">
          <Link className="crumbs__link" href="/">Home</Link>
          <span className="crumbs__sep">/</span>
          <span className="crumbs__current">{title}</span>
        </nav>
        <header className="content-hero">
          <p className="directory-hero__eyebrow">{eyebrow}</p>
          <h1 className="tools-title">{title}</h1>
          <p className="tools-sub">{description}</p>
        </header>
        <div className="article-prose">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
