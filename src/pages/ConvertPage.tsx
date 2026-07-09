import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ImageSquare, ShieldCheck } from '@phosphor-icons/react';
import { DotsThinking } from '../components/Thinking';

const Converter = lazy(() => import('../components/Converter'));

export default function ConvertPage() {
  return (
    <div className="page">
      <header className="topbar">
        <nav className="crumbs">
          <Link className="crumbs__home" to="/">
            toolbox…
          </Link>
          <span className="crumbs__sep">/</span>
          <Link className="crumbs__link" to="/tools">
            Tools
          </Link>
          <span className="crumbs__sep">/</span>
          <span className="crumbs__current">Image converter</span>
        </nav>
        <Link className="btn btn--pill btn--icon" to="/tools">
          <ArrowLeft size={15} weight="bold" /> All tools
        </Link>
      </header>

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
        <span>Part of toolbox · your files never leave this device.</span>
      </footer>
    </div>
  );
}
