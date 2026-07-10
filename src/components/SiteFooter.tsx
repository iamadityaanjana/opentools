import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="footer site-footer">
      <span>Files you select are processed on this device.</span>
      <nav className="site-footer__links" aria-label="Footer">
        <Link href="/image">Image tools</Link>
        <Link href="/pdf">PDF tools</Link>
        <Link href="/convert">Converter</Link>
        <Link href="/guides">Guides</Link>
        <Link href="/about">About</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/methodology">Methodology</Link>
      </nav>
    </footer>
  );
}
