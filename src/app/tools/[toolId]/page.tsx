import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ToolClientPage } from '../../../components/ToolClientPage';
import { ToolSeoContent } from '../../../components/ToolSeoContent';
import { GuidesForTool } from '../../../components/GuidesForTool';
import { getToolPageContent } from '../../../content/tool-page-content';
import { CATEGORY_BY_ID, GROUP_HOME, GROUP_LABEL, TOOLS } from '../../../tools/catalog';
import { SITE_URL, toolTitle, toolDescription } from '../../../lib/seo';
const STATIC_TOOLS = TOOLS.filter((tool) => tool.status === 'live' && tool.route?.startsWith('/tools/'));

type ToolPageProps = {
  params: Promise<{ toolId: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return STATIC_TOOLS.map((tool) => ({ toolId: tool.id }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { toolId } = await params;
  const tool = STATIC_TOOLS.find((item) => item.id === toolId);
  if (!tool) return {};
  const category = CATEGORY_BY_ID.get(tool.categoryId);
  const isPdf = category?.group === 'pdf';
  const content = getToolPageContent(tool);
  const pageTitle = toolTitle(tool.name, content.seoTitle);
  const description = toolDescription(tool.name, content.description, isPdf);
  const canonical = `${SITE_URL}/tools/${tool.id}`;
  return {
    title: pageTitle,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      title: pageTitle,
      description,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${tool.name} – opentools` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: ['/opengraph-image'],
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { toolId } = await params;
  const tool = STATIC_TOOLS.find((item) => item.id === toolId);
  if (!tool) notFound();

  const content = getToolPageContent(tool);
  const category = CATEGORY_BY_ID.get(tool.categoryId);
  const isPdf = category?.group === 'pdf';
  const canonical = `${SITE_URL}/tools/${tool.id}`;
  const seoDesc = toolDescription(tool.name, content.description, isPdf);
  const groupPath = category ? GROUP_HOME[category.group] : '/image';
  const groupLabel = category ? GROUP_LABEL[category.group] : 'Image tools';
  const categoryLabel = category?.label ?? groupLabel;
  const categoryUrl = `${SITE_URL}${groupPath}#category-${tool.categoryId}`;

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'SoftwareApplication',
      '@id': `${canonical}#app`,
      name: tool.name,
      url: canonical,
      description: seoDesc,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires a modern web browser with JavaScript enabled.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: groupLabel, item: `${SITE_URL}${groupPath}` },
        { '@type': 'ListItem', position: 3, name: categoryLabel, item: categoryUrl },
        { '@type': 'ListItem', position: 4, name: tool.name, item: canonical },
      ],
    },
  ];

  // HowTo: each tool page has numbered steps — eligible for rich results.
  if (content.steps.length) {
    graph.push({
      '@type': 'HowTo',
      name: `How to use ${tool.name}`,
      description: seoDesc,
      step: content.steps.map((step, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: step.title,
        text: step.description,
      })),
      tool: { '@type': 'HowToTool', name: tool.name },
    });
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': graph,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ToolClientPage toolId={tool.id}>
        <ToolSeoContent toolId={tool.id} />
        <GuidesForTool toolId={tool.id} />
      </ToolClientPage>
    </>
  );
}
