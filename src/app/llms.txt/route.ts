import { ARTICLES } from '../../content/articles';
import { getToolPageContent } from '../../content/tool-page-content';
import { TOOLS } from '../../tools/catalog';

const SITE_URL = 'https://www.opentools.fun';

export const dynamic = 'force-static';

export function GET() {
  const tools = TOOLS
    .filter((tool) => tool.status === 'live' && tool.route)
    .map((tool) => `- [${tool.name}](${SITE_URL}${tool.route}): ${getToolPageContent(tool).description}`)
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
- [About opentools](${SITE_URL}/about)
- [Privacy](${SITE_URL}/privacy)
- [Methodology](${SITE_URL}/methodology)

## Live tools

${tools}

## Guides

${guides}

## Crawling

- [Sitemap](${SITE_URL}/sitemap.xml)
- [Robots policy](${SITE_URL}/robots.txt)
- [Full LLM reference](${SITE_URL}/llms-full.txt)
- [This LLM index](${SITE_URL}/llms.txt)
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Language': 'en',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
