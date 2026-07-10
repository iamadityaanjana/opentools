import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BookOpenText } from '@phosphor-icons/react/dist/ssr';
import { ARTICLES } from '../../content/articles';
import { TopNav } from '../../components/TopNav';
import { SiteFooter } from '../../components/SiteFooter';
import { DEFAULT_OG_IMAGE, DEFAULT_TWITTER_IMAGE } from '../../lib/seo';

export const metadata: Metadata = {
  title: 'Image and PDF guides',
  description: 'Practical, sourced guides to image formats, compression, resizing, metadata privacy, PDF creation, GIF optimization, and browser-local processing.',
  alternates: { canonical: '/guides' },
  openGraph: {
    url: '/guides',
    title: 'Image and PDF guides · opentools',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image and PDF guides · opentools',
    images: [DEFAULT_TWITTER_IMAGE],
  },
};

export default function GuidesPage() {
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'opentools guides',
    url: 'https://www.opentools.fun/guides',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: ARTICLES.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: article.title,
        url: `https://www.opentools.fun/guides/${article.slug}`,
      })),
    },
  };

  return (
    <div className="page page--wide">
      <TopNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList).replace(/</g, '\\u003c') }}
      />
      <main>
        <section className="tools-hero">
          <div className="directory-hero__eyebrow"><BookOpenText size={16} weight="fill" /> Evidence-led help</div>
          <h1 className="tools-title">Guides</h1>
          <p className="tools-sub">Make better decisions about image formats, privacy, dimensions, and delivery before processing a file.</p>
        </section>
        <div className="guide-grid">
          {ARTICLES.map((article) => (
            <article className="guide-card" key={article.slug}>
              <p className="guide-card__meta">{article.readingMinutes} min read · Updated {article.updatedAt}</p>
              <h2><Link href={`/guides/${article.slug}`}>{article.title}</Link></h2>
              <p>{article.excerpt}</p>
              <Link className="guide-card__link" href={`/guides/${article.slug}`}>
                Read guide <ArrowUpRight size={14} weight="bold" />
              </Link>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
