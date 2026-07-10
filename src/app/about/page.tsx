import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentShell } from '../../components/ContentShell';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn why opentools processes image and PDF files locally in your browser, what the project supports, and how it is maintained.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <ContentShell
      eyebrow="About opentools"
      title="Useful file tools without the upload step"
      description="opentools is an independent collection of browser-based utilities for images, PDFs, GIFs, colors, and file organization."
    >
      <h2>Why it exists</h2>
      <p>Many small file tasks do not require a remote server. Modern browsers can decode, edit, and encode common formats directly on your device. opentools makes those capabilities accessible through focused tools that do not require an account.</p>
      <h2>What “local processing” means</h2>
      <p>When a tool says it processes locally, the selected file is read by code running in your browser. The file is not uploaded to an opentools file-processing service. The website itself, fonts, JavaScript, and privacy-safe analytics are still delivered over the internet.</p>
      <h2>Limits</h2>
      <p>Browser processing depends on your device memory, browser, and format support. Very large files can be slower than desktop software, and some specialist formats may require a lazily downloaded codec. Each tool documents relevant limitations.</p>
      <h2>Explore</h2>
      <p>Start with the <Link href="/image">image tools</Link>, <Link href="/pdf">PDF tools</Link>, or read the <Link href="/guides">guides</Link> for practical format and privacy advice.</p>
    </ContentShell>
  );
}
