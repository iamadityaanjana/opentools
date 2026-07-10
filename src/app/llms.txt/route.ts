import { ARTICLES } from '../../content/articles';
import { TOOLS } from '../../tools/catalog';

const SITE_URL = 'https://www.opentools.fun';

export const dynamic = 'force-static';

export function GET() {
  const tools = TOOLS
    .filter((tool) => tool.status === 'live' && tool.route)
    .map((tool) => `- [${tool.name}](${SITE_URL}${tool.route}): ${tool.blurb ?? `Use ${tool.name} with local browser processing.`}`)
    .join('\n');
  const guides = ARTICLES
    .map((article) => `- [${article.title}](${SITE_URL}/guides/${article.slug}): ${article.description}`)
    .join('\n');

  const body = `# opentools

> opentools provides free image, PDF, GIF, color, metadata, and file utilities. Selected files are processed locally in the user's browser and are not uploaded to opentools for processing.

Canonical site: ${SITE_URL}/
Language: Global English
Access: Free; no account required

## Primary pages

- [Image tools](${SITE_URL}/image)
- [PDF tools](${SITE_URL}/pdf)
- [Image converter](${SITE_URL}/convert)
- [Guides](${SITE_URL}/guides)
- [Privacy](${SITE_URL}/privacy)
- [Methodology](${SITE_URL}/methodology)

## Live tools

${tools}

## Guides

${guides}

## Crawling

- [Sitemap](${SITE_URL}/sitemap.xml)
- [Robots policy](${SITE_URL}/robots.txt)
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
