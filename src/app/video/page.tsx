import type { Metadata } from 'next';
import ToolsDirectoryPage from '../../screens/ToolsDirectoryPage';
import { CATEGORY_BY_ID, TOOLS } from '../../tools/catalog';
import { DEFAULT_OG_IMAGE, DEFAULT_TWITTER_IMAGE } from '../../lib/seo';

export const metadata: Metadata = {
  title: 'Free Online Video Tools – Trim, Speed, Compress, Convert | opentools',
  description: 'Trim, speed up, mute, compress, convert, and edit videos directly in your browser. No upload, no account, powered by FFmpeg.wasm.',
  alternates: { canonical: '/video' },
  openGraph: {
    url: '/video',
    title: 'Free online video tools · opentools',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free online video tools · opentools',
    images: [DEFAULT_TWITTER_IMAGE],
  },
};

export default function VideoToolsPage() {
  const items = TOOLS.filter((tool) => (
    tool.status === 'live'
    && tool.route
    && CATEGORY_BY_ID.get(tool.categoryId)?.group === 'video'
  ));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Video tools',
    url: 'https://www.opentools.fun/video',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ToolsDirectoryPage group="video">
        <section className="dir-note">
          <p>
            All processing runs locally using{' '}
            <a href="https://ffmpegwasm.netlify.app/" target="_blank" rel="noopener noreferrer">FFmpeg.wasm</a>.
            Your video files are never uploaded — everything happens in your browser tab.
            The FFmpeg engine (~31 MB) is downloaded once and cached for future visits.
          </p>
        </section>
      </ToolsDirectoryPage>
    </>
  );
}
