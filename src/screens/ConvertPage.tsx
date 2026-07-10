import { lazy, Suspense, type ReactNode } from 'react';
import Link from 'next/link';
import { ImageSquare, ShieldCheck } from '@phosphor-icons/react/dist/ssr';
import { DotsThinking } from '../components/Thinking';
import { TopNav } from '../components/TopNav';
import { SiteFooter } from '../components/SiteFooter';
import { getToolContent } from '../content/tool-content';
import { ToolEditorial } from '../components/ToolEditorial';

const Converter = lazy(() => import('../components/Converter'));

export default function ConvertPage({ children }: { children?: ReactNode }) {
  const content = getToolContent('image-converter');
  return (
    <div className="page page--tool">
      <TopNav />
      <main>

      <nav className="crumbs crumbs--sub">
        <Link className="crumbs__link" href="/image">Image tools</Link>
        <span className="crumbs__sep">/</span>
        <span className="crumbs__current">Image converter</span>
      </nav>

      <div className="tool-hero">
        <div className="tool-hero__icon">
          <ImageSquare size={26} weight="fill" />
        </div>
        <div>
          <h1 className="tool-title">Image converter</h1>
          <p className="tool-desc">
            {content?.description ?? 'Convert between 15+ formats. Add files, choose an output, then convert.'}
          </p>
        </div>
        <span className="privacy-pill">
          <ShieldCheck size={15} weight="fill" /> Files process locally
        </span>
      </div>

      <Suspense
        fallback={
          <div className="loading-panel">
            <DotsThinking label="Loading converter" />
          </div>
        }
      >
        <Converter />
      </Suspense>
      <ToolEditorial>{children}</ToolEditorial>
      </main>

      <SiteFooter />
    </div>
  );
}
