import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BookOpenText } from '@phosphor-icons/react/dist/ssr';
import { ARTICLES } from '../../content/articles';
import { TopNav } from '../../components/TopNav';
import { SiteFooter } from '../../components/SiteFooter';
import { DEFAULT_OG_IMAGE, DEFAULT_TWITTER_IMAGE } from '../../lib/seo';
import { collectionPageGraph, jsonLdScript } from '../../lib/jsonld';

const TITLE = 'Image, PDF & Video Guides – Formats and Compression | opentools';
const DESCRIPTION = 'Practical, sourced guides to image formats, compression, resizing, metadata privacy, PDF creation, GIF optimization, and browser-local processing.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/guides' },
  openGraph: {
    type: 'website',
    url: '/guides',
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_TWITTER_IMAGE],
  },
};

export default function GuidesPage() {
  const graph = collectionPageGraph({
    path: '/guides',
    name: 'opentools guides',
    description: DESCRIPTION,
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Guides', path: '/guides' },
    ],
    items: ARTICLES.map((article) => ({
      name: article.title,
      path: `/guides/${article.slug}`,
      description: article.description,
    })),
  });

  return (
    <div className="page page--wide">
      <TopNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(graph) }} />
      <main>
        <nav className="crumbs crumbs--sub" aria-label="Breadcrumb">
          <Link className="crumbs__link" href="/">Home</Link>
          <span className="crumbs__sep">/</span>
          <span className="crumbs__current">Guides</span>
        </nav>
        <section className="tools-hero">
          <div className="directory-hero__eyebrow"><BookOpenText size={16} weight="fill" /> Evidence-led help</div>
          <h1 className="tools-title">Guides</h1>
          <p className="tools-sub">Make better decisions about image formats, privacy, dimensions, and delivery before processing a file.</p>
        </section>
        <section className="article-prose guides-focus" aria-labelledby="guides-focus-title">
          <h2 id="guides-focus-title">Browser-based image and PDF guidance</h2>
          <p>
            These guides cover image conversion, image compression, resizing, EXIF and metadata
            privacy, PDF conversion, PDF editing, PDF optimization, batch file processing, and the
            trade-offs between local browser tools and cloud services.
          </p>
          <p>
            Recommendations are matched to tools that are actually available, with limitations
            stated explicitly. Sources favour format specifications, browser documentation, and
            platform guidance rather than unsupported search claims.
          </p>
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
