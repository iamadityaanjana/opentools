import type { Metadata } from 'next';
import ConvertPage from '../../screens/ConvertPage';
import { ToolSeoContent } from '../../components/ToolSeoContent';
import { getToolContent } from '../../content/tool-content';
import { GuideLinks } from '../../components/GuideLinks';

export const metadata: Metadata = {
  title: 'Image converter — JPG, PNG, WebP, AVIF, HEIC and more',
  description: 'Convert images between JPG, PNG, WebP, AVIF, HEIC, TIFF and more in your browser. Batch convert without uploading files to opentools.',
  alternates: { canonical: '/convert' },
  openGraph: {
    url: '/convert',
    title: 'Private online image converter · opentools',
    description: 'Convert images locally in your browser with no account required.',
  },
};

export default function ImageConverterPage() {
  const content = getToolContent('image-converter');
  const canonical = 'https://www.opentools.fun/convert';
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'SoftwareApplication',
      '@id': `${canonical}#app`,
      name: 'Image Converter',
      url: canonical,
      description: content?.description,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.opentools.fun/' },
        { '@type': 'ListItem', position: 2, name: 'Image tools', item: 'https://www.opentools.fun/image' },
        { '@type': 'ListItem', position: 3, name: 'Image Converter' },
      ],
    },
  ];
  if (content?.faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: content.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    });
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c'),
        }}
      />
      <ConvertPage>
        <ToolSeoContent toolId="image-converter" />
        <GuideLinks slugs={[
          'png-vs-jpg-vs-webp-vs-avif',
          'heic-to-jpg-quality-metadata-privacy',
          'image-compression-vs-resizing-vs-conversion',
        ]} />
      </ConvertPage>
    </>
  );
}
