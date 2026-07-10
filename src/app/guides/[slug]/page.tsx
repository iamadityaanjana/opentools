import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ARTICLES, ARTICLE_BY_SLUG } from '../../../content/articles';
import { TOOL_BY_ID } from '../../../tools/catalog';
import { TopNav } from '../../../components/TopNav';
import { SiteFooter } from '../../../components/SiteFooter';
import { TrackedToolLink } from '../../../components/TrackedToolLink';
import { DEFAULT_OG_IMAGE, DEFAULT_TWITTER_IMAGE } from '../../../lib/seo';

const SITE_URL = 'https://www.opentools.fun';

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLE_BY_SLUG.get(slug);
  if (!article) return {};
  const canonical = `/guides/${article.slug}`;
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical },
    authors: [{ name: 'opentools editorial', url: '/methodology' }],
    openGraph: {
      type: 'article',
      url: canonical,
      title: article.title,
      description: article.description,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: [{ ...DEFAULT_OG_IMAGE, alt: article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [DEFAULT_TWITTER_IMAGE],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = ARTICLE_BY_SLUG.get(slug);
  if (!article) notFound();

  const related = article.relatedToolIds
    .map((id) => TOOL_BY_ID.get(id))
    .filter((tool) => tool?.status === 'live' && tool.route);
  const canonical = `${SITE_URL}/guides/${article.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${canonical}#article`,
        headline: article.title,
        description: article.description,
        url: canonical,
        image: `${SITE_URL}/opengraph-image`,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        author: { '@type': 'Organization', name: 'opentools editorial', url: `${SITE_URL}/methodology` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        mainEntityOfPage: canonical,
        inLanguage: 'en',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
          { '@type': 'ListItem', position: 3, name: article.title, item: canonical },
        ],
      },
    ],
  };

  return (
    <div className="page page--wide">
      <TopNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <main>
        <nav className="crumbs crumbs--sub" aria-label="Breadcrumb">
          <Link className="crumbs__link" href="/">Home</Link>
          <span className="crumbs__sep">/</span>
          <Link className="crumbs__link" href="/guides">Guides</Link>
          <span className="crumbs__sep">/</span>
          <span className="crumbs__current">{article.title}</span>
        </nav>

        <article className="guide-article">
          <header className="content-hero">
            <p className="directory-hero__eyebrow">Practical guide</p>
            <h1 className="tools-title">{article.title}</h1>
            <p className="tools-sub">{article.excerpt}</p>
            <p className="article-meta">
              By <Link href="/methodology">opentools editorial</Link> · Published {article.publishedAt} · Updated {article.updatedAt} · {article.readingMinutes} min read
            </p>
          </header>

          <div className="article-prose">
            {article.sections.map((section, index) => (
              <section key={section.heading ?? index}>
                {section.heading && <h2>{section.heading}</h2>}
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets.length > 0 && (
                  <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
                )}
              </section>
            ))}

            {related.length > 0 && (
              <aside className="article-cta">
                <h2>Use the tools</h2>
                <p>Apply the workflow locally in your browser. Keep the original until you have inspected the result.</p>
                <div className="related-links">
                  {related.map((tool) => (
                    <TrackedToolLink
                      guideSlug={article.slug}
                      href={tool!.route!}
                      key={tool!.id}
                      toolId={tool!.id}
                    >
                      {tool!.name}
                    </TrackedToolLink>
                  ))}
                </div>
              </aside>
            )}

            <section className="article-sources">
              <h2>Sources</h2>
              <ol>
                {article.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
