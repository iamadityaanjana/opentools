import Link from 'next/link';
import { TopNav } from '../components/TopNav';

export default function NotFound() {
  return (
    <div className="page page--wide">
      <TopNav />
      <main className="not-found">
        <p className="directory-hero__eyebrow">404</p>
        <h1 className="tools-title">That page does not exist</h1>
        <p className="tools-sub">The link may be outdated, or the tool may have moved.</p>
        <div className="hero__cta">
          <Link className="btn btn--dark" href="/image">Browse image tools</Link>
          <Link className="btn" href="/guides">Read guides</Link>
        </div>
      </main>
    </div>
  );
}
