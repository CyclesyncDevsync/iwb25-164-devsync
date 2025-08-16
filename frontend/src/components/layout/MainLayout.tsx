'use client';

import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { usePathname } from 'next/navigation';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  
  // Check if current route is an auth route
  const isAuthRoute = pathname?.startsWith('/auth/login') || 
                      pathname?.startsWith('/auth/register') || 
                      pathname?.startsWith('/auth/forgot-password');

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
