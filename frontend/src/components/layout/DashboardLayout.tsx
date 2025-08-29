'use client';

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { USER_ROLES, ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';
import type { User } from '../../types/user';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

function SidebarLink({ href, icon, label, isActive, onClick }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center px-4 py-2 my-1 text-sm font-medium rounded-md transition-colors",
        isActive
          ? "bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light"
          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-surface"
      )}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth() as { user: User | null };
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock user for development when authentication is disabled
  const mockUser = {
    id: 'dev-user',
    name: 'Development User',
    email: 'dev@cyclesync.com',
    role: USER_ROLES.ADMIN
  };

  // Use mock user if no authenticated user (for development)
  const currentUser = user || mockUser;

  const userRole =
    currentUser?.role && Object.values(USER_ROLES).includes(currentUser.role)
      ? currentUser.role
      : USER_ROLES.GUEST;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Define sidebar links based on user role
  const sidebarLinks: { href: string; icon: React.ReactNode; label: string }[] = [];

  // Role-specific dashboard link
  const getDashboardRoute = () => {
    switch (userRole) {
      case USER_ROLES.SUPER_ADMIN:
        return '/admin'; // Super Admin uses admin dashboard with additional privileges
      case USER_ROLES.ADMIN:
        return '/admin'; // Admin dashboard
      case USER_ROLES.AGENT:
        return '/agent'; // Agent main dashboard
      case USER_ROLES.SUPPLIER:
        return '/supplier'; // Supplier main dashboard
      case USER_ROLES.BUYER:
        return '/buyer'; // Buyer main dashboard
      default:
        return ROUTES.DASHBOARD;
    }
  };

  // Dashboard link
  sidebarLinks.push({
    href: getDashboardRoute(),
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    label: 'Dashboard',
  });

  // Role-specific links
  if (userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.SUPER_ADMIN) {
    sidebarLinks.push(
      {
        href: ROUTES.ADMIN.USERS,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
        label: 'Users',
      },
      {
        href: ROUTES.ADMIN.MATERIALS,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
        label: 'Materials',
      },
      {
        href: ROUTES.ADMIN.AUCTIONS,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        label: 'Auctions',
      },
      {
        href: ROUTES.ADMIN.TRANSACTIONS,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
        label: 'Transactions',
      },
      {
        href: ROUTES.ADMIN.DISPUTES,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        ),
        label: 'Disputes',
      },
      {
        href: ROUTES.ADMIN.REPORTS,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        label: 'Reports',
      }
    );

    // Super Admin specific section
    if (userRole === USER_ROLES.SUPER_ADMIN) {
      sidebarLinks.push({
        href: '/admin/admin-management',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ),
        label: 'Admin Management',
      });
    }
  } else if (userRole === USER_ROLES.AGENT) {
    sidebarLinks.push(
      {
        href: ROUTES.AGENT.ASSIGNMENTS,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
        label: 'Assignments',
      },
      {
        href: ROUTES.AGENT.VERIFICATION,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: 'Verification',
      }
    );
  } else if (userRole === USER_ROLES.SUPPLIER) {
    sidebarLinks.push(
      {
        href: ROUTES.SUPPLIER.MATERIALS,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
        label: 'My Materials',
      },
      {
        href: ROUTES.SUPPLIER.AUCTIONS,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        label: 'My Auctions',
      }
    );
  } else if (userRole === USER_ROLES.BUYER) {
    sidebarLinks.push(
      {
        href: ROUTES.BUYER.MARKETPLACE,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        label: 'Marketplace',
      },
      {
        href: ROUTES.BUYER.AUCTIONS,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        ),
        label: 'Active Auctions',
      }
    );
  }

  // Common links for all authenticated users
  sidebarLinks.push({
    href: ROUTES.CHAT,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    label: 'Messages',
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden fixed inset-0">
      {/* Sidebar for larger screens - Made sticky and full height */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-screen border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h2 className="text-lg font-semibold text-primary dark:text-primary-light">
                  CircularSync
                </h2>
              </div>
              
              {/* User Profile Section */}
              <div className="mt-4 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-medium text-sm">
                        {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {currentUser?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUser?.email || 'No email'}
                    </p>
                  </div>
                </div>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {sidebarLinks.map((link) => (
                  <SidebarLink
                    key={link.href}
                    href={link.href}
                    icon={link.icon}
                    label={link.label}
                    isActive={pathname === link.href}
                  />
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 flex z-40 md:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div
          className={cn(
            "fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity",
            sidebarOpen ? "opacity-100 ease-out duration-300" : "opacity-0 ease-in duration-200"
          )}
          onClick={toggleSidebar}
        />

        <div className={cn(
          "relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-dark-bg transition-transform",
          sidebarOpen ? "translate-x-0 ease-out duration-300" : "-translate-x-full ease-in duration-200"
        )}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Close sidebar</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h2 className="text-lg font-semibold text-primary dark:text-primary-light">
                CircularSync
              </h2>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {sidebarLinks.map((link) => (
                <SidebarLink
                  key={link.href}
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                  isActive={pathname === link.href}
                  onClick={toggleSidebar}
                />
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content - Full height without navbar */}
      <div className="flex flex-col w-0 flex-1 h-screen overflow-hidden">
        {/* Mobile menu button - Only show on mobile */}
        <div className="md:hidden pl-3 pt-3 pb-3 bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary dark:text-gray-400 dark:hover:text-gray-50"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
