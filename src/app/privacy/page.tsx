import type { Metadata } from 'next';
import { ContentShell } from '../../components/ContentShell';
import { WebPageJsonLd } from '../../components/WebPageJsonLd';
import { DEFAULT_OG_IMAGE, DEFAULT_TWITTER_IMAGE } from '../../lib/seo';

const DESCRIPTION = 'How opentools handles selected files, browser processing, analytics, and temporary output URLs.';

export const metadata: Metadata = {
  title: 'Privacy',
  description: DESCRIPTION,
  alternates: { canonical: '/privacy' },
  openGraph: { url: '/privacy', title: 'Privacy · opentools', description: DESCRIPTION, images: [DEFAULT_OG_IMAGE] },
  twitter: { card: 'summary_large_image', title: 'Privacy · opentools', description: DESCRIPTION, images: [DEFAULT_TWITTER_IMAGE] },
};

export default function PrivacyPage() {
  return (
    <>
      <WebPageJsonLd path="/privacy" name="Privacy" description={DESCRIPTION} />
      <ContentShell
        eyebrow="Privacy"
        title="Your selected files stay in your browser"
        description="This page explains the difference between local file processing and ordinary website analytics."
      >
        <h2>Files you choose</h2>
        <p>Supported image and PDF operations run in your browser. opentools does not send the contents of selected files to its servers for processing. Temporary previews and downloads use browser memory and local object URLs; clearing a job, closing the tab, or refreshing the page removes that working state.</p>
        <h2>Website delivery</h2>
        <p>Like any website, opentools is served from hosting infrastructure. Your browser requests page assets and lazily loaded format codecs when needed. These requests do not include the contents of the files you selected.</p>
        <h2>Analytics</h2>
        <p>opentools uses PostHog through the first-party analytics host <code>t.opentools.fun</code> to understand page usage, tool actions, errors, and Core Web Vitals. Analytics events must not include filenames, file contents, image pixels, extracted metadata, or generated outputs. Anonymous or pseudonymous technical identifiers may be used to distinguish visits.</p>
        <h2>External links</h2>
        <p>Links such as the booking page are operated by third parties and follow their own privacy practices. No selected file is transferred when you follow those links.</p>
        <h2>Last reviewed</h2>
        <p>10 July 2026. This notice will be updated when the processing or analytics model changes materially.</p>
      </ContentShell>
    </>
  );
}
