'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

// Route mapping for generating breadcrumbs automatically
const routeMapping: Record<string, string> = {
  'admin': 'Admin Dashboard',
  'supplier': 'Supplier Dashboard', 
  'buyer': 'Buyer Dashboard',
  'agent': 'Agent Dashboard',
  'dashboard': 'Dashboard',
  'profile': 'Profile',
  'settings': 'Settings',
  'chat': 'Messages',
  'auctions': 'Auctions',
  'materials': 'Materials',
  'orders': 'Orders',
  'transactions': 'Transactions',
  'analytics': 'Analytics',
  'reports': 'Reports',
  'users': 'Users',
  'disputes': 'Disputes',
  'search': 'Search',
  'marketplace': 'Marketplace',
  'wallet': 'Wallet',
  'notifications': 'Notifications',
  'enhanced-auctions': 'Enhanced Auctions',
  'enhanced-orders': 'Enhanced Orders',
  'enhanced-search': 'Enhanced Search',
  'locations': 'Locations',
  'earnings': 'Earnings',
  'team': 'Team',
  'inventory': 'Inventory',
  'verify': 'Verification',
  'map': 'Map',
  'messages': 'Messages'
};

export function Breadcrumb({ items, showHome = true, className = '' }: BreadcrumbProps) {
  const pathname = usePathname();
  
  // Generate breadcrumbs from pathname if items not provided
  const getBreadcrumbsFromPath = (): BreadcrumbItem[] => {
    if (!pathname || pathname === '/') return [];
    
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    let currentPath = '';
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip dynamic segments like [id]
      if (segment.startsWith('[') && segment.endsWith(']')) {
        return;
      }
      
      const label = routeMapping[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      breadcrumbs.push({
        label,
        href: currentPath
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbItems = items || getBreadcrumbsFromPath();
  
  if (breadcrumbItems.length === 0) return null;
  
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      {showHome && (
        <>
          <Link 
            href="/" 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <HomeIcon className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </Link>
          {breadcrumbItems.length > 0 && (
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          )}
        </>
      )}
      
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={item.href} className="flex items-center space-x-2">
              {index > 0 && (
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              )}
              
              {isLast ? (
                <span className="text-gray-900 dark:text-white font-medium flex items-center space-x-1">
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors flex items-center space-x-1"
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Hook to generate breadcrumbs for specific user types
export function useBreadcrumbs(userRole?: string) {
  const pathname = usePathname();
  
  const getDashboardBreadcrumbs = (): BreadcrumbItem[] => {
    if (!pathname || !userRole) return [];
    
    const dashboardPaths: Record<string, string> = {
      admin: '/admin',
      supplier: '/supplier', 
      buyer: '/buyer',
      agent: '/agent'
    };
    
    const dashboardPath = dashboardPaths[userRole];
    if (!dashboardPath || !pathname.startsWith(dashboardPath)) return [];
    
    const segments = pathname.replace(dashboardPath, '').split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard`,
        href: dashboardPath
      }
    ];
    
    let currentPath = dashboardPath;
    segments.forEach(segment => {
      currentPath += `/${segment}`;
      const label = routeMapping[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({
        label,
        href: currentPath
      });
    });
    
    return breadcrumbs;
  };
  
  return getDashboardBreadcrumbs();
}
