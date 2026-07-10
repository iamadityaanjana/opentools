import { SITE_URL } from '../lib/seo';

export function WebPageJsonLd({
  path,
  name,
  description,
  type = 'WebPage',
}: {
  path: string;
  name: string;
  description: string;
  type?: 'WebPage' | 'AboutPage';
}) {
  const url = `${SITE_URL}${path}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#page`,
    name,
    description,
    url,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en',
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
  );
}
