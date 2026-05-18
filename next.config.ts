import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  // Disable SW in dev to avoid stale cache issues during development
  disable: process.env.NODE_ENV === 'development',
  additionalPrecacheEntries: [{ url: '/~offline', revision: crypto.randomUUID() }],
});

const nextConfig: NextConfig = {
  // Piper WASM needs SharedArrayBuffer → requires cross-origin isolation
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
  serverExternalPackages: ['@diffusionstudio/vits-web', 'onnxruntime-web'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    }
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};

export default withSerwist(nextConfig);
