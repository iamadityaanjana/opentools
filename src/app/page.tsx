import type { Metadata } from 'next';
import Landing from '../screens/Landing';
import { HomeSeoContent } from '../components/HomeSeoContent';
import { HOME_FAQS } from '../content/home';
import { DEFAULT_OG_IMAGE, DEFAULT_TWITTER_IMAGE, SITE_URL } from '../lib/seo';

const HOME_TITLE = 'Free Image, PDF & Video Tools – No Upload | opentools';
const HOME_DESCRIPTION = 'Convert, compress, resize, crop, and edit images, PDFs, and videos entirely in your browser. Free, private, no sign-up and no watermark.';

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    url: `${SITE_URL}/`,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [DEFAULT_TWITTER_IMAGE],
  },
};

export default function HomePage() {
  // Organization and WebSite live in the root layout graph; this page only adds
  // the page-level nodes and links back to them by @id.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['WebPage', 'FAQPage'],
        '@id': `${SITE_URL}/#webpage`,
        url: `${SITE_URL}/`,
        name: HOME_TITLE,
        description: HOME_DESCRIPTION,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en',
        primaryImageOfPage: { '@id': `${SITE_URL}/#logo` },
        mainEntity: HOME_FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE_URL}/#hubs`,
        name: 'opentools categories',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Image tools', url: `${SITE_URL}/image` },
          { '@type': 'ListItem', position: 2, name: 'PDF tools', url: `${SITE_URL}/pdf` },
          { '@type': 'ListItem', position: 3, name: 'Video tools', url: `${SITE_URL}/video` },
        ],
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
