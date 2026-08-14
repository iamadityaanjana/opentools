import type { MetadataRoute } from 'next';
import { ARTICLES } from '../content/articles';
import { getToolPageContent } from '../content/tool-page-content';
import { TOOLS, toolGroup, type ToolGroup } from '../tools/catalog';

const SITE_URL = 'https://www.opentools.fun';
const LAST_MODIFIED = new Date('2026-08-15T00:00:00.000Z');

/**
 * The hub pages list every live tool in their group, so their freshness should
 * follow the newest tool content rather than a hardcoded date that goes stale.
 */
function newestToolDate(group: ToolGroup): Date {
  const dates = TOOLS
    .filter((tool) => tool.status === 'live' && tool.route && toolGroup(tool) === group)
    .map((tool) => new Date(`${getToolPageContent(tool).reviewedAt}T00:00:00.000Z`).getTime());
  return dates.length ? new Date(Math.max(...dates)) : LAST_MODIFIED;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const newestGuide = ARTICLES.length
    ? new Date(Math.max(...ARTICLES.map((a) => new Date(`${a.updatedAt}T00:00:00.000Z`).getTime())))
    : LAST_MODIFIED;

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/image`, lastModified: newestToolDate('image'), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/pdf`, lastModified: newestToolDate('pdf'), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/video`, lastModified: newestToolDate('video'), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/convert`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/guides`, lastModified: newestGuide, changeFrequency: 'weekly', priority: 0.8 },
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
