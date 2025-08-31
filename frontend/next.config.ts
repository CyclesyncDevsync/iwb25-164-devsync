import type { NextConfig } from "next";

// @ts-ignore - No type definitions available for next-pwa
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['images.unsplash.com', 'cloudinary.com'],
  },
  reactStrictMode: true,

  // No experimental settings for now
  async rewrites() {
    return [
      {
        source: '/api/auction/:path*',
        destination: 'http://localhost:8096/api/auction/:path*',
      },
      {
        source: '/backend/agent/:path*',
        destination: 'http://localhost:8080/api/agent/:path*',
      },
      {
        source: '/backend/notifications/:path*',
        destination: 'http://localhost:9102/api/notifications/:path*',
      },
      {
        source: '/backend/material-submissions/:path*',
        destination: 'http://localhost:8086/api/material-submissions/:path*',
      },
    ];
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Disable PWA in development to prevent the GenerateSW warning
  disable: process.env.NODE_ENV === 'development',
});

export default pwaConfig(nextConfig);
