import { ARTICLES } from '../../content/articles';
import { getToolPageContent } from '../../content/tool-page-content';
import { TOOLS } from '../../tools/catalog';

const SITE_URL = 'https://www.opentools.fun';

export const dynamic = 'force-static';

export function GET() {
  const tools = TOOLS
    .filter((tool) => tool.status === 'live' && tool.route)
    .map((tool) => {
      const content = getToolPageContent(tool);
      const steps = content.steps.map((step, index) => `${index + 1}. ${step.title}: ${step.description}`).join('\n');
      const limitations = content.limitations.map((item) => `- ${item}`).join('\n');
      const faqs = content.faqs.map((faq) => `### ${faq.question}\n${faq.answer}`).join('\n\n');
      return `## ${tool.name}

URL: ${SITE_URL}${tool.route}
Reviewed: ${content.reviewedAt}

${content.intro.join('\n\n')}

### How to use
${steps}

### Limitations
${limitations}

${faqs}`;
    })
    .join('\n\n---\n\n');

  const guides = ARTICLES.map((article) => {
    const sections = article.sections.map((section) => {
      const heading = section.heading ? `### ${section.heading}\n` : '';
      const paragraphs = section.paragraphs.join('\n\n');
      const bullets = section.bullets.map((item) => `- ${item}`).join('\n');
      return `${heading}${paragraphs}${bullets ? `\n\n${bullets}` : ''}`;
    }).join('\n\n');
    const sources = article.sources.map((source) => `- [${source.title}](${source.url})`).join('\n');
    return `## ${article.title}

URL: ${SITE_URL}/guides/${article.slug}
Published: ${article.publishedAt}
Updated: ${article.updatedAt}

${article.description}

${sections}

### Sources
${sources}`;
  }).join('\n\n---\n\n');

  const body = `# opentools full reference

Canonical site: ${SITE_URL}/
Language: Global English
Processing model: File operations run locally in the user's browser. Selected files are not uploaded to opentools for processing.

This document provides an extended, plain-text reference for the live tools and editorial guides listed in [llms.txt](${SITE_URL}/llms.txt).

# Live tools

${tools}

# Editorial guides

${guides}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Language': 'en',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
