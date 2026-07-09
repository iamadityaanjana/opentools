import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FilePdf, ImageSquare, Sparkle } from '@phosphor-icons/react';
import { PlusGrid } from '../components/PlusGrid';
import { BlinkingCursor } from '../components/Thinking';

// Warm the converter route's chunk on intent, without loading it up front.
function preloadConverter() {
  import('../components/Converter');
}

export default function Landing() {
  return (
    <div className="page page--landing">
      <header className="topbar">
        <div className="logo">toolbox…</div>
        <div className="topbar__actions">
          <a
            className="btn btn--ghost"
            href="http://cal.com/adityaanjana"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book a call
          </a>
          <Link className="btn btn--pill" to="/convert" onMouseEnter={preloadConverter}>
            Open tool
          </Link>
        </div>
      </header>

      <main className="hero">
        <motion.h1
          className="hero__hi"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Hey,
        </motion.h1>

        <PlusGrid />

        <p className="hero__lead">
          A little box of fast, private tools that run entirely in your browser. Today:{' '}
          <span className="kw kw--blue">image conversion</span>. Soon:{' '}
          <span className="kw kw--red">PDF tools</span>,{' '}
          <span className="kw kw--green">compression</span>, and{' '}
          <span className="kw kw--purple">more</span>.
        </p>
        <p className="hero__sub">
          no servers, no uploads, no waiting <BlinkingCursor />
        </p>

        <div className="hero__cta">
          <Link
            className="btn btn--dark btn--icon"
            to="/convert"
            onMouseEnter={preloadConverter}
            onFocus={preloadConverter}
          >
            <ImageSquare size={16} weight="fill" /> Image converter <ArrowRight size={15} weight="bold" />
          </Link>
          <button className="btn btn--soon btn--icon" disabled>
            <FilePdf size={16} /> PDF tools <span className="soon-tag">soon</span>
          </button>
          <button className="btn btn--soon btn--icon" disabled>
            <Sparkle size={16} /> More <span className="soon-tag">soon</span>
          </button>
        </div>
      </main>
    </div>
  );
}
