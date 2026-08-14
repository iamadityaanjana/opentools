import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@fontsource/instrument-sans/latin-400.css';
import '@fontsource/instrument-sans/latin-400-italic.css';
import '@fontsource/instrument-sans/latin-500.css';
import '@fontsource/instrument-sans/latin-600.css';
import '@fontsource/instrument-sans/latin-700.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import { AnalyticsProvider } from '../components/AnalyticsProvider';
import '../index.css';
import '../App.css';

const SITE_URL = 'https://www.opentools.fun';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // Each page sets its own optimised title. This fallback covers any page
    // that doesn't — the template is intentionally not used so tool pages can
    // build the full string themselves (e.g. "Compress PDF Free Online | opentools").
    default: 'opentools — Free Image, PDF & Video Tools, No Upload',
    template: '%s',
  },
  description: 'Free image, PDF, and video tools that run entirely in your browser. No file uploads, no account, no watermark — always free.',
  applicationName: 'opentools',
  manifest: '/manifest.webmanifest',
  authors: [{ name: 'opentools', url: `${SITE_URL}/about` }],
  creator: 'opentools',
  publisher: 'opentools',
  category: 'technology',
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'opentools',
    locale: 'en_US',
    title: 'opentools — private browser-based image, PDF and video tools',
    description: 'Free image, PDF, and video tools that process files locally in your browser.',
    url: '/',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'opentools browser-based file tools' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'opentools — private browser-based image, PDF and video tools',
    description: 'Free image, PDF, and video tools that process files locally in your browser.',
    images: ['/opengraph-image'],
  },
};

// Single source of truth for the site-level entities. Every page inherits this
// graph, so page-level JSON-LD should reference these @ids instead of redefining
// Organization / WebSite (duplicate nodes make the graph ambiguous).
const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'opentools',
      url: `${SITE_URL}/`,
      logo: {
        '@type': 'ImageObject',
        '@id': `${SITE_URL}/#logo`,
        url: `${SITE_URL}/icon.svg`,
        contentUrl: `${SITE_URL}/icon.svg`,
        width: 48,
        height: 48,
        caption: 'opentools',
      },
      image: { '@id': `${SITE_URL}/#logo` },
      description: 'Free browser-based image, PDF, and video tools. No upload, no sign-up, no watermark.',
      sameAs: ['https://github.com/iamadityaanjana/opentools'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'opentools',
      alternateName: 'opentools.fun',
      url: `${SITE_URL}/`,
      description: 'Private browser-based image, PDF, and video tools.',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/image?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd).replace(/</g, '\\u003c') }}
        />
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
