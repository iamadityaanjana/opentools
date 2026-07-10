import Link from 'next/link';
import { ARTICLE_BY_SLUG } from '../content/articles';

export function GuideLinks({ slugs, title = 'Helpful guides' }: { slugs: string[]; title?: string }) {
  const articles = slugs.map((slug) => ARTICLE_BY_SLUG.get(slug)).filter(Boolean);
  if (!articles.length) return null;

  return (
    <section className="directory-guides" aria-labelledby="directory-guides-title">
      <h2 id="directory-guides-title">{title}</h2>
      <div className="guide-grid guide-grid--compact">
        {articles.map((article) => (
          <article className="guide-card" key={article!.slug}>
            <p className="guide-card__meta">{article!.readingMinutes} min read</p>
            <h3><Link href={`/guides/${article!.slug}`}>{article!.title}</Link></h3>
            <p>{article!.excerpt}</p>
            <Link className="guide-card__link" href={`/guides/${article!.slug}`}>Read guide →</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
