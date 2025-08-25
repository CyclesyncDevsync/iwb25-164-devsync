'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  ClockIcon,
  ChartBarIcon,
  BellIcon,
  UserCircleIcon,
  HeartIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  current: boolean;
  badge?: string;
}

interface BuyerLayoutProps {
  children: React.ReactNode;
}

const BuyerLayout: React.FC<BuyerLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/buyer',
      icon: ChartBarIcon,
      current: pathname === '/buyer'
    },
    {
      name: 'Search Materials',
      href: '/buyer/search',
      icon: MagnifyingGlassIcon,
      current: pathname === '/buyer/search'
    },
    {
      name: 'Enhanced Search',
      href: '/buyer/enhanced-search',
      icon: MagnifyingGlassIcon,
      current: pathname === '/buyer/enhanced-search',
      badge: 'NEW'
    },
    {
      name: 'Live Auctions',
      href: '/buyer/auctions',
      icon: ClockIcon,
      current: pathname === '/buyer/auctions'
    },
    {
      name: 'Enhanced Auctions',
      href: '/buyer/enhanced-auctions',
      icon: ClockIcon,
      current: pathname === '/buyer/enhanced-auctions',
      badge: 'ENHANCED'
    },
    {
      name: 'My Orders',
      href: '/buyer/orders',
      icon: ShoppingBagIcon,
      current: pathname === '/buyer/orders'
    },
    {
      name: 'Enhanced Orders',
      href: '/buyer/enhanced-orders',
      icon: ShoppingBagIcon,
      current: pathname === '/buyer/enhanced-orders',
      badge: 'PREMIUM'
    },
    {
      name: 'Analytics',
      href: '/buyer/analytics',
      icon: ChartBarIcon,
      current: pathname === '/buyer/analytics'
    },
    {
      name: 'Favorites',
      href: '/buyer/favorites',
      icon: HeartIcon,
      current: pathname === '/buyer/favorites'
    },
    {
      name: 'Saved Items',
      href: '/buyer/saved',
      icon: BookmarkIcon,
      current: pathname === '/buyer/saved'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CS</span>
            </div>
            <span className="ml-3 text-lg font-semibold text-gray-900">CircularSync</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  item.current
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      item.current ? 'text-purple-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    item.badge === 'NEW' ? 'bg-green-100 text-green-800' :
                    item.badge === 'ENHANCED' ? 'bg-blue-100 text-blue-800' :
                    item.badge === 'PREMIUM' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-medium text-sm">JD</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">Buyer Account</p>
            </div>
            <button className="text-gray-400 hover:text-gray-500">
              <UserCircleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex-1">
              {/* Quick Search */}
              <div className="max-w-lg">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Quick search materials..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-1 right-1 block h-2 w-2 bg-red-400 rounded-full"></span>
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 text-sm">
                  <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-medium text-xs">JD</span>
                  </div>
                  <span className="text-gray-700 font-medium">John Doe</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default BuyerLayout;
