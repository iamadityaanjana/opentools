import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'opentools',
    short_name: 'opentools',
    description: 'Private browser-based image and PDF tools.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f5ef',
    theme_color: '#171717',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
