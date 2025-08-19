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

  // Check if current route is an admin route
  const isAdminRoute = pathname?.startsWith('/admin');

  // Check if current route is a dashboard route (for any user type)
  const isDashboardRoute = pathname?.startsWith('/dashboard') || 
                          pathname?.startsWith('/chat') ||
                          pathname?.startsWith('/profile');

  // Don't show navbar/footer for auth routes, admin routes, or dashboard routes
  if (isAuthRoute || isAdminRoute || isDashboardRoute) {
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
