import type { Metadata } from 'next';
import ToolsDirectoryPage from '../../screens/ToolsDirectoryPage';
import { CATEGORY_BY_ID, TOOLS } from '../../tools/catalog';
import { DEFAULT_OG_IMAGE, DEFAULT_TWITTER_IMAGE } from '../../lib/seo';
import { collectionPageGraph, jsonLdScript } from '../../lib/jsonld';

const TITLE = 'Free Online Video Tools – Trim, Compress, Convert | opentools';
const DESCRIPTION = 'Trim, speed up, mute, compress, convert, and edit videos directly in your browser with FFmpeg.wasm. No upload, no account, no watermark.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/video' },
  openGraph: {
    type: 'website',
    url: '/video',
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

export default function VideoToolsPage() {
  const items = TOOLS.filter((tool) => (
    tool.status === 'live'
    && tool.route
    && CATEGORY_BY_ID.get(tool.categoryId)?.group === 'video'
  ));

  const graph = collectionPageGraph({
    path: '/video',
    name: 'Video tools',
    description: DESCRIPTION,
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Video tools', path: '/video' },
    ],
    items: items.map((tool) => ({ name: tool.name, path: tool.route!, description: tool.blurb })),
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(graph) }} />
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
