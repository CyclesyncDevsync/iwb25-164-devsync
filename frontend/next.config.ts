import type { NextConfig } from "next";

// @ts-ignore - No type definitions available for next-pwa
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    domains: ["images.unsplash.com", "cloudinary.com"],
  },
  reactStrictMode: true,
  
  // Allow build to complete with TypeScript errors (warnings will still show)
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  
  // Configure ESLint
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // No experimental settings for now
  async rewrites() {
    return [
      {
        source: "/api/auction/:path*",
        destination: "http://localhost:8096/api/auction/:path*",
      },
      {
        source: "/backend/auction/:path*",
        destination: "http://localhost:8096/api/auction/:path*",
      },
      {
        source: "/backend/agent/:path*",
        destination: "http://localhost:8080/api/agent/:path*",
      },
      {
        source: "/backend/notifications/:path*",
        destination: "http://localhost:9102/api/notifications/:path*",
      },
      {
        source: "/backend/material-submissions/:path*",
        destination: "http://localhost:8086/api/material-submissions/:path*",
      },
      {
        source: "/backend/chat/:path*",
        destination: "http://localhost:8087/api/chat/:path*",
      },
      {
        source: "/backend/scheduling/:path*",
        destination: "http://localhost:8089/api/scheduling/:path*",
      },
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:8085/api/auth/:path*",
      },
    ];
  },
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  // Disable PWA in development to prevent the GenerateSW warning
  disable: process.env.NODE_ENV === "development",
});

export default pwaConfig(nextConfig);
