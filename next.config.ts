import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: '/tools',
        destination: '/image',
        permanent: true,
      },
      {
        source: '/tools/image-converter',
        destination: '/convert',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
