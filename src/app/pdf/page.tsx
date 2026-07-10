import type { Metadata } from 'next';
import ToolsDirectoryPage from '../../screens/ToolsDirectoryPage';
import { CATEGORY_BY_ID, TOOLS } from '../../tools/catalog';
import { GuideLinks } from '../../components/GuideLinks';

export const metadata: Metadata = {
  title: 'Free online PDF tools',
  description: 'Merge, split, rotate, crop, compress, convert, organize, inspect, and edit PDFs locally in your browser.',
  alternates: { canonical: '/pdf' },
  openGraph: { url: '/pdf', title: 'Free online PDF tools · opentools' },
};

export default function PdfToolsPage() {
  const items = TOOLS.filter((tool) => (
    tool.status === 'live'
    && tool.route
    && CATEGORY_BY_ID.get(tool.categoryId)?.group === 'pdf'
  ));
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'PDF tools',
    url: 'https://www.opentools.fun/pdf',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.name,
        url: `https://www.opentools.fun${tool.route}`,
      })),
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <ToolsDirectoryPage group="pdf">
        <GuideLinks
          slugs={['convert-images-to-pdf-privately', 'browser-vs-cloud-image-tools']}
          title="PDF workflow guides"
        />
      </ToolsDirectoryPage>
    </>
  );
}
