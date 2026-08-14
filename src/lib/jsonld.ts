import { SITE_URL } from './seo';

export type JsonLdNode = Record<string, unknown>;

/** Serialise a graph for a <script type="application/ld+json"> tag. */
export function jsonLdScript(nodes: JsonLdNode[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(/</g, '\\u003c');
}

export interface BreadcrumbStep {
  name: string;
  /** Path relative to the site root, e.g. `/pdf`. Omit for the current page. */
  path: string;
}

export function breadcrumbList(steps: BreadcrumbStep[], id: string): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${id}#breadcrumb`,
    itemListElement: steps.map((step, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: step.name,
      item: `${SITE_URL}${step.path}`,
    })),
  };
}

export interface CollectionEntry {
  name: string;
  path: string;
  description?: string;
}

/**
 * Build the standard graph for a listing page (tool hubs, guides index):
 * a CollectionPage wired to the site WebSite node, its ItemList, and breadcrumbs.
 */
export function collectionPageGraph(options: {
  path: string;
  name: string;
  description: string;
  breadcrumb: BreadcrumbStep[];
  items: CollectionEntry[];
}): JsonLdNode[] {
  const url = `${SITE_URL}${options.path}`;
  return [
    {
      '@type': 'CollectionPage',
      '@id': `${url}#webpage`,
      url,
      name: options.name,
      description: options.description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      inLanguage: 'en',
      breadcrumb: { '@id': `${url}#breadcrumb` },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: options.items.length,
        itemListElement: options.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          url: `${SITE_URL}${item.path}`,
          ...(item.description ? { description: item.description } : {}),
        })),
      },
    },
    breadcrumbList(options.breadcrumb, url),
  ];
}
