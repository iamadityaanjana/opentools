import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  turbopack: {
    root: process.cwd(),
    // The qpdf Emscripten glue references Node built-ins behind runtime
    // environment checks; it only ever runs in the browser, so stub them.
    resolveAlias: {
      fs: { browser: './src/lib/empty-module.ts' },
      path: { browser: './src/lib/empty-module.ts' },
      crypto: { browser: './src/lib/empty-module.ts' },
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve ?? {};
      config.resolve.fallback = {
        ...(config.resolve.fallback ?? {}),
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
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
