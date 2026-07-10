import type { Metadata } from 'next';
import Landing from '../screens/Landing';
import { HomeSeoContent } from '../components/HomeSeoContent';
import { HOME_FAQS } from '../content/home';
import { DEFAULT_OG_IMAGE, DEFAULT_TWITTER_IMAGE } from '../lib/seo';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    url: '/',
    title: 'opentools — private browser-based image and PDF tools',
    description: 'Free image and PDF tools that process files locally in your browser.',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'opentools — private browser-based image and PDF tools',
    description: 'Free image and PDF tools that process files locally in your browser.',
    images: [DEFAULT_TWITTER_IMAGE],
  },
};

export default function HomePage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
      />
      <Landing><HomeSeoContent /></Landing>
    </>
  );
}
