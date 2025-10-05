'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  PlusCircleIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  UserGroupIcon,
  MapPinIcon,
  DocumentDuplicateIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAppSelector } from '../../hooks/redux';
import { SupplierType } from '../../types/supplier';
import { useAuth } from '../../hooks/useAuth';

interface SupplierLayoutProps {
  children: React.ReactNode;
}

export default function SupplierLayout({ children }: SupplierLayoutProps) {
  const pathname = usePathname();
  const { profile } = useAppSelector(state => state.supplier);
  const { user } = useAuth();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user?.asgardeoId) return;

      try {
        const authResponse = await fetch('/api/auth/me');
        if (!authResponse.ok) return;

        const authData = await authResponse.json();
        const idToken = authData.idToken;
        const supplierId = authData.user?.asgardeoId || authData.user?.sub || authData.userId;

        const response = await fetch(`/backend/chat/rooms/supplier/${supplierId}/unread-count`, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUnreadMessageCount(data.unread_count || 0);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    // Fetch initially
    fetchUnreadCount();

    // Poll every 10 seconds
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/supplier',
      icon: HomeIcon,
      current: pathname === '/supplier'
    },
    {
      name: 'Add Material',
      href: '/supplier/materials/new-enhanced',
      icon: PlusCircleIcon,
      current: pathname === '/supplier/materials/new' || pathname === '/supplier/materials/new-enhanced'
    },
    {
      name: 'My Materials',
      href: '/supplier/materials',
      icon: DocumentDuplicateIcon,
      current: pathname === '/supplier/materials' || (pathname.startsWith('/supplier/materials') && !pathname.includes('/new'))
    },
    {
      name: 'Orders',
      href: '/supplier/orders',
      icon: ShoppingBagIcon,
      current: pathname.startsWith('/supplier/orders')
    },
    {
      name: 'Messages',
      href: '/supplier/messages',
      icon: ChatBubbleLeftRightIcon,
      current: pathname.startsWith('/supplier/messages')
    },
    {
      name: 'Analytics',
      href: '/supplier/analytics',
      icon: ChartBarIcon,
      current: pathname.startsWith('/supplier/analytics')
    },
    {
      name: 'Earnings',
      href: '/supplier/earnings',
      icon: CurrencyDollarIcon,
      current: pathname.startsWith('/supplier/earnings')
    }
  ];

  // Add organization-specific items
  if (profile?.type === SupplierType.ORGANIZATION) {
    navigationItems.splice(-2, 0, 
      {
        name: 'Team',
        href: '/supplier/team',
        icon: UserGroupIcon,
        current: pathname.startsWith('/supplier/team')
      },
      {
        name: 'Locations',
        href: '/supplier/locations',
        icon: MapPinIcon,
        current: pathname.startsWith('/supplier/locations')
      }
    );
  }

  navigationItems.push(
    {
      name: 'Settings',
      href: '/supplier/settings',
      icon: CogIcon,
      current: pathname.startsWith('/supplier/settings')
    }
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">CS</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                CircularSync
              </span>
            </div>
          </div>

          {/* Supplier Info */}
          {profile && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                    {profile.contactPerson.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {profile.businessName || profile.contactPerson}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {profile.type} Supplier
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  item.current
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors`}
              >
                <item.icon
                  className={`${
                    item.current
                      ? 'text-emerald-500 dark:text-emerald-400'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                  } mr-3 h-5 w-5 flex-shrink-0`}
                  aria-hidden="true"
                />
                <span className="flex-1">{item.name}</span>
                {item.name === 'Messages' && unreadMessageCount > 0 && (
                  <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                    {unreadMessageCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>

        </div>
      </div>

      {/* Main content */}
      <div className="pl-64 min-h-screen flex flex-col">
        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname === '/supplier') return 'Dashboard';
  if (pathname === '/supplier/materials/new') return 'Add New Material';
  if (pathname.startsWith('/supplier/materials')) return 'My Materials';
  if (pathname.startsWith('/supplier/orders')) return 'Orders';
  if (pathname.startsWith('/supplier/analytics')) return 'Analytics';
  if (pathname.startsWith('/supplier/earnings')) return 'Earnings';
  if (pathname.startsWith('/supplier/team')) return 'Team Management';
  if (pathname.startsWith('/supplier/locations')) return 'Locations';
  if (pathname.startsWith('/supplier/settings')) return 'Settings';
  return 'Supplier Dashboard';
}
