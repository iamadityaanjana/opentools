import { ImageResponse } from 'next/og';
import { ARTICLES, ARTICLE_BY_SLUG } from '../../../content/articles';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export default async function GuideOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = ARTICLE_BY_SLUG.get(slug);
  const title = article?.title ?? 'opentools guides';
  const excerpt = article?.excerpt ?? 'Practical, sourced guides to image, PDF, and video workflows.';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#171717',
          color: '#f7f5ef',
          padding: '68px 72px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 34, fontStyle: 'italic' }}>opentools…</div>
          <div style={{ display: 'flex', fontSize: 24, color: '#b8b4aa' }}>
            {article ? `${article.readingMinutes} min read · Updated ${article.updatedAt}` : 'Guides'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', maxWidth: 1000, fontSize: 68, lineHeight: 1.08, fontWeight: 700 }}>
            {title.length > 90 ? `${title.slice(0, 87)}…` : title}
          </div>
          <div style={{ display: 'flex', maxWidth: 940, fontSize: 28, lineHeight: 1.35, color: '#c9c5bb' }}>
            {excerpt.length > 140 ? `${excerpt.slice(0, 137)}…` : excerpt}
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 25, color: '#8d8a82' }}>
          opentools.fun/guides
        </div>
      </div>
    ),
    size,
  );
}
