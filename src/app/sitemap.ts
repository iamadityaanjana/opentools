import type { MetadataRoute } from 'next';
import { ARTICLES } from '../content/articles';
import { getToolPageContent } from '../content/tool-page-content';
import { TOOLS } from '../tools/catalog';

const SITE_URL = 'https://www.opentools.fun';
const LAST_MODIFIED = new Date('2026-07-10T00:00:00.000Z');

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/image`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/pdf`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/convert`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/guides`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/methodology`, lastModified: LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.5 },
  ];

  const toolPages: MetadataRoute.Sitemap = TOOLS
    .filter((tool) => tool.status === 'live' && tool.route && tool.route !== '/convert')
    .map((tool) => ({
      url: `${SITE_URL}${tool.route}`,
      lastModified: new Date(`${getToolPageContent(tool).reviewedAt}T00:00:00.000Z`),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  const articlePages: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: `${SITE_URL}/guides/${article.slug}`,
    lastModified: new Date(`${article.updatedAt}T00:00:00.000Z`),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  return [...staticPages, ...toolPages, ...articlePages];
}
