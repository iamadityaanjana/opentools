import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ImageSquare, SquaresFour } from '@phosphor-icons/react';
import { PlusGrid } from '../components/PlusGrid';
import { BlinkingCursor } from '../components/Thinking';
import { TOTAL_COUNT } from '../tools/catalog';

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
          <Link className="btn btn--pill" to="/tools">
            All tools
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
          A little box of fast, private tools that run entirely in your browser —{' '}
          <span className="kw kw--blue">convert</span>,{' '}
          <span className="kw kw--red">compress</span>,{' '}
          <span className="kw kw--green">resize</span>,{' '}
          <span className="kw kw--yellow">edit</span>,{' '}
          <span className="kw kw--purple">PDF</span> and more.
        </p>
        <p className="hero__sub">
          {TOTAL_COUNT}+ tools · no servers, no uploads, no waiting <BlinkingCursor />
        </p>

        <div className="hero__cta">
          <Link className="btn btn--dark btn--icon" to="/tools">
            <SquaresFour size={16} weight="fill" /> Browse all tools <ArrowRight size={15} weight="bold" />
          </Link>
          <Link
            className="btn btn--icon"
            to="/convert"
            onMouseEnter={preloadConverter}
            onFocus={preloadConverter}
          >
            <ImageSquare size={16} weight="fill" /> Image converter
          </Link>
        </div>
      </main>
    </div>
  );
}
