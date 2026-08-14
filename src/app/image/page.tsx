import type { Metadata } from 'next';
import ToolsDirectoryPage from '../../screens/ToolsDirectoryPage';
import { CATEGORY_BY_ID, TOOLS } from '../../tools/catalog';
import { GuideLinks } from '../../components/GuideLinks';
import { DEFAULT_OG_IMAGE, DEFAULT_TWITTER_IMAGE } from '../../lib/seo';
import { collectionPageGraph, jsonLdScript } from '../../lib/jsonld';

const TITLE = 'Free Image Tools Online – Convert, Resize | opentools';
const DESCRIPTION = 'Convert, resize, compress, edit, organize, and inspect images locally in your browser. No account, no uploads, no watermark — always free.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/image' },
  openGraph: {
    type: 'website',
    url: '/image',
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

export default function ImageToolsPage() {
  const items = TOOLS.filter((tool) => (
    tool.status === 'live'
    && tool.route
    && CATEGORY_BY_ID.get(tool.categoryId)?.group === 'image'
  ));

  const graph = collectionPageGraph({
    path: '/image',
    name: 'Image tools',
    description: DESCRIPTION,
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Image tools', path: '/image' },
    ],
    items: items.map((tool) => ({ name: tool.name, path: tool.route!, description: tool.blurb })),
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(graph) }} />
      <ToolsDirectoryPage group="image">
        <GuideLinks slugs={[
          'png-vs-jpg-vs-webp-vs-avif',
          'compress-images-for-web-without-visible-quality-loss',
          'remove-exif-gps-metadata-from-photos',
          'browser-vs-cloud-image-tools',
        ]} />
      </ToolsDirectoryPage>
    </>
  );
}
