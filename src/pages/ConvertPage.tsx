import { lazy, Suspense } from 'react';
import { ImageSquare, ShieldCheck } from '@phosphor-icons/react';
import { DotsThinking } from '../components/Thinking';
import { TopNav } from '../components/TopNav';

const Converter = lazy(() => import('../components/Converter'));

export default function ConvertPage() {
  return (
    <div className="page page--wide">
      <TopNav />

      <nav className="crumbs crumbs--sub">
        <span className="crumbs__link">Image tools</span>
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
            Convert between 15+ formats. Add files, choose an output, then convert.
          </p>
        </div>
        <span className="privacy-pill">
          <ShieldCheck size={15} weight="fill" /> 100% on-device
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

      <footer className="footer">
        <span>Part of opentools · your files never leave this device.</span>
      </footer>
    </div>
  );
}
