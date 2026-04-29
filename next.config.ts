import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  // Disable SW in dev to avoid stale cache issues during development
  disable: process.env.NODE_ENV === 'development',
  additionalPrecacheEntries: [{ url: '/~offline', revision: crypto.randomUUID() }],
});

const nextConfig: NextConfig = {};

export default withSerwist(nextConfig);
