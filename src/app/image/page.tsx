import type { Metadata } from 'next';
import ToolsDirectoryPage from '../../screens/ToolsDirectoryPage';
import { CATEGORY_BY_ID, TOOLS } from '../../tools/catalog';
import { GuideLinks } from '../../components/GuideLinks';
import { DEFAULT_OG_IMAGE, DEFAULT_TWITTER_IMAGE } from '../../lib/seo';

export const metadata: Metadata = {
  title: 'Free online image tools',
  description: 'Convert, resize, compress, edit, organize, and inspect images locally in your browser. No account and no uploads to opentools.',
  alternates: { canonical: '/image' },
  openGraph: {
    url: '/image',
    title: 'Free online image tools · opentools',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free online image tools · opentools',
    images: [DEFAULT_TWITTER_IMAGE],
  },
};

export default function ImageToolsPage() {
  const items = TOOLS.filter((tool) => (
    tool.status === 'live'
    && tool.route
    && CATEGORY_BY_ID.get(tool.categoryId)?.group === 'image'
  ));
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Image tools',
    url: 'https://www.opentools.fun/image',
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
