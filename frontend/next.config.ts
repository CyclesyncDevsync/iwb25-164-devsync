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
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

export default pwaConfig(nextConfig);
