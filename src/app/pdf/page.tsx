import type { Metadata } from 'next';
import ToolsDirectoryPage from '../../screens/ToolsDirectoryPage';
import { CATEGORY_BY_ID, TOOLS } from '../../tools/catalog';
import { GuideLinks } from '../../components/GuideLinks';
import { DEFAULT_OG_IMAGE, DEFAULT_TWITTER_IMAGE } from '../../lib/seo';
import { collectionPageGraph, jsonLdScript } from '../../lib/jsonld';

const TITLE = 'Free PDF Tools Online – Merge, Split, Edit | opentools';
const DESCRIPTION = 'Merge, split, rotate, crop, compress, convert, and edit PDFs locally in your browser. No uploads, no account, no watermark — always free.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/pdf' },
  openGraph: {
    type: 'website',
    url: '/pdf',
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_TWITTER_IMAGE],
  },
};

export default function PdfToolsPage() {
  const items = TOOLS.filter((tool) => (
    tool.status === 'live'
    && tool.route
    && CATEGORY_BY_ID.get(tool.categoryId)?.group === 'pdf'
  ));

  const graph = collectionPageGraph({
    path: '/pdf',
    name: 'PDF tools',
    description: DESCRIPTION,
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'PDF tools', path: '/pdf' },
    ],
    items: items.map((tool) => ({ name: tool.name, path: tool.route!, description: tool.blurb })),
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(graph) }} />
      <ToolsDirectoryPage group="pdf">
        <GuideLinks
          slugs={['convert-images-to-pdf-privately', 'browser-vs-cloud-image-tools']}
          title="PDF workflow guides"
        />
      </ToolsDirectoryPage>
    </>
  );
}
