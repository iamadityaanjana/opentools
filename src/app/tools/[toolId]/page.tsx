import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ToolClientPage } from '../../../components/ToolClientPage';
import { ToolSeoContent } from '../../../components/ToolSeoContent';
import { GuidesForTool } from '../../../components/GuidesForTool';
import { getToolPageContent } from '../../../content/tool-page-content';
import { CATEGORY_BY_ID, GROUP_HOME, GROUP_LABEL, TOOLS } from '../../../tools/catalog';

const SITE_URL = 'https://www.opentools.fun';
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
  const content = getToolPageContent(tool);
  const description = content.description;
  const canonical = `/tools/${tool.id}`;
  return {
    title: tool.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      title: `${tool.name} · opentools`,
      description,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${tool.name} on opentools` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} · opentools`,
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
  const canonical = `${SITE_URL}/tools/${tool.id}`;
  const description = content.description;
  const groupPath = category ? GROUP_HOME[category.group] : '/image';
  const groupLabel = category ? GROUP_LABEL[category.group] : 'Image tools';
  const graph: Record<string, unknown>[] = [
      {
        '@type': 'SoftwareApplication',
        '@id': `${canonical}#app`,
        name: tool.name,
        url: canonical,
        description,
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
          { '@type': 'ListItem', position: 3, name: tool.name, item: canonical },
        ],
      },
    ];
  if (content.faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: content.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
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
