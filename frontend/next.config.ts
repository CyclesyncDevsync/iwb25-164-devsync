import type { NextConfig } from "next";

// @ts-ignore - No type definitions available for next-pwa
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['images.unsplash.com', 'cloudinary.com'],
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/auction/:path*',
        destination: 'http://localhost:8096/api/auction/:path*',
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
