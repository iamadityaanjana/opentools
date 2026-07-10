import type { Metadata } from 'next';
import { ContentShell } from '../../components/ContentShell';

export const metadata: Metadata = {
  title: 'Editorial and testing methodology',
  description: 'How opentools researches format guidance, tests browser tools, cites sources, and reviews time-sensitive information.',
  alternates: { canonical: '/methodology' },
};

export default function MethodologyPage() {
  return (
    <ContentShell
      eyebrow="Methodology"
      title="How tools and guides are checked"
      description="A transparent standard for technical claims, browser tests, sources, and content updates."
    >
      <h2>Tool verification</h2>
      <p>Core workflows are checked with representative files and a production build. Verification covers decoding, parameter validation, output generation, repeated processing of the same upload, and download behavior. Browser memory and codec differences mean no web tool can guarantee identical behavior on every device.</p>
      <h2>Content standards</h2>
      <p>Guides prioritize primary specifications and platform documentation. Competitor features are described from publicly accessible pages and are dated because services change. Search-volume or keyword-difficulty numbers are included only when a named data source is available; estimates are never presented as measured traffic.</p>
      <h2>Updates and corrections</h2>
      <p>Each guide includes published and reviewed dates. Time-sensitive dimensions and browser support should be rechecked before major use. Corrections should update both the visible copy and any matching structured data.</p>
      <h2>AI assistance</h2>
      <p>Automation may help organize research or draft code, but published claims must remain traceable, specific, and consistent with the actual tool. Content is not expanded merely to capture keyword variations.</p>
    </ContentShell>
  );
}
