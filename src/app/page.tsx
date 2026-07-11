import type { Metadata } from 'next';
import Landing from '../screens/Landing';
import { HomeSeoContent } from '../components/HomeSeoContent';
import { HOME_FAQS } from '../content/home';
import { DEFAULT_OG_IMAGE, DEFAULT_TWITTER_IMAGE, SITE_URL } from '../lib/seo';

export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    url: `${SITE_URL}/`,
    title: 'opentools — Free Image & PDF Tools, No Upload',
    description: 'Convert, compress, resize, crop, and edit images and PDFs entirely in your browser. Free, private, no sign-up required.',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'opentools — Free Image & PDF Tools, No Upload',
    description: 'Convert, compress, resize, crop, and edit images and PDFs entirely in your browser. Free, private, no sign-up required.',
    images: [DEFAULT_TWITTER_IMAGE],
  },
};

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'opentools',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/icon.svg`,
          width: 48,
          height: 48,
        },
        sameAs: ['https://github.com/iamadityaanjana/opentools'],
        description: 'Free browser-based image and PDF tools. No upload, no sign-up, no watermark.',
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'opentools',
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/image?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: HOME_FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Landing><HomeSeoContent /></Landing>
    </>
  );
}
