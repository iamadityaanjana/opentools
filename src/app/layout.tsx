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
    default: 'opentools — private browser-based image and PDF tools',
    template: '%s · opentools',
  },
  description: 'Free image and PDF tools that process your files locally in the browser. No account required and no file uploads to opentools.',
  applicationName: 'opentools',
  manifest: '/manifest.webmanifest',
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
    title: 'opentools — private browser-based image and PDF tools',
    description: 'Free image and PDF tools that process files locally in your browser.',
    url: '/',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'opentools browser-based file tools' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'opentools — private browser-based image and PDF tools',
    description: 'Free image and PDF tools that process files locally in your browser.',
    images: ['/opengraph-image'],
  },
};

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'opentools',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/icon.svg`,
      sameAs: ['https://github.com/iamadityaanjana/opentools'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'opentools',
      url: `${SITE_URL}/`,
      description: 'Private browser-based image and PDF tools.',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en',
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
