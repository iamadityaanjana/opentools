import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ImageSquare, FilePdf, DotsThreeCircle } from '@phosphor-icons/react';
import { PlusGrid } from '../components/PlusGrid';
import { BlinkingCursor } from '../components/Thinking';
import { TopNav } from '../components/TopNav';
import { TOTAL_COUNT } from '../tools/catalog';

export default function Landing() {
  return (
    <div className="page page--landing">
      <TopNav />

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
          <Link className="btn btn--dark btn--icon" to="/image">
            <ImageSquare size={16} weight="fill" /> Image tools <ArrowRight size={15} weight="bold" />
          </Link>
          <Link className="btn btn--icon" to="/pdf">
            <FilePdf size={16} weight="fill" /> PDF tools
          </Link>
          <button className="btn btn--soon btn--icon" disabled>
            <DotsThreeCircle size={16} /> Other <span className="soon-tag">coming soon</span>
          </button>
        </div>
      </main>
    </div>
  );
}
