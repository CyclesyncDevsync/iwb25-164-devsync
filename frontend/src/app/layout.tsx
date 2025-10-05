import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Providers } from "../components/common/Providers";
import { MainLayout } from "../components/layout/MainLayout";

import ChatBot from "@/components/ChatBot";

// Import fetch interceptor for global 401 handling
import '../utils/fetchInterceptor';


// Using Inter as a replacement for Geist since it's more widely supported
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {

  title: "CircularSync - Sustainable Material Management",
  description: "A platform for sustainable material management and circular economy.",
  icons: {
    icon: '/favicon.ico',
  },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00684A" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <MainLayout>{children}</MainLayout>
          <ChatBot />
        </Providers>
      </body>
    </html>
  );
}
