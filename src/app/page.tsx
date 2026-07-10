import type { Metadata } from 'next';
import Landing from '../screens/Landing';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { url: '/' },
};

export default function HomePage() {
  return <Landing />;
}
