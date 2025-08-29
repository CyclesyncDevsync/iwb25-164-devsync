'use client';

import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import Footer from './Footer';
import { FloatingActionButton } from '../ui/FloatingActionButton';
import { usePathname } from 'next/navigation';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  
  // Routes where navbar should be completely hidden
  const hideNavbarRoutes = [
    '/auth/login',
    '/auth/register', 
    '/auth/forgot-password',
    '/auth/verify-email'
  ];

  // Routes where navbar should be hidden (exact matches and patterns)
  const isHiddenRoute = hideNavbarRoutes.some(route => pathname === route) ||
                       (pathname && pathname.startsWith('/auction/') && pathname.endsWith('/bid')) ||
                       pathname === '/offline';

  // Routes where footer should be hidden (supplier and admin dashboards have their own layouts)
  const hideFooterRoutes = pathname?.startsWith('/supplier') || pathname?.startsWith('/admin');

  // Show FAB on public pages and some specific routes
  const showFAB = !isHiddenRoute && (
    pathname === '/' || 
    pathname?.startsWith('/demo') ||
    pathname?.startsWith('/showcase')
  );

  // Don't show navbar/footer for hidden routes
  if (isHiddenRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      {!hideFooterRoutes && <Footer />}
      {showFAB && <FloatingActionButton />}
    </div>
  );
}
