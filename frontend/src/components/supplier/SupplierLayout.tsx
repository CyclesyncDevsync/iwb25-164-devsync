'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  CubeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  BellIcon,
  UserCircleIcon,
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAppSelector } from '../../hooks/redux';
import { SupplierType } from '../../types/supplier';

interface SupplierLayoutProps {
  children: React.ReactNode;
}

export default function SupplierLayout({ children }: SupplierLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  const { profile } = useAppSelector(state => state.supplier);
  const supplierType = profile?.type || SupplierType.INDIVIDUAL;

  const navigation = [
    { name: 'Dashboard', href: '/supplier', icon: HomeIcon },
    { name: 'Materials', href: '/supplier/materials', icon: CubeIcon },
    { name: 'Analytics', href: '/supplier/analytics', icon: ChartBarIcon },
    { name: 'Earnings', href: '/supplier/earnings', icon: CurrencyDollarIcon },
    { name: 'Locations', href: '/supplier/locations', icon: MapPinIcon },
    { name: 'Notifications', href: '/supplier/notifications', icon: BellIcon },
    { name: 'Profile', href: '/supplier/profile', icon: UserCircleIcon },
    ...(supplierType === SupplierType.ORGANIZATION ? [
      { name: 'Team', href: '/supplier/team', icon: UsersIcon }
    ] : [])
  ];

  const isActive = (href: string) => {
    if (href === '/supplier') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        
        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 transform transition ease-in-out duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className={`ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white ${
                sidebarOpen ? '' : 'sr-only'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>

          <SidebarContent navigation={navigation} isActive={isActive} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navigation={navigation} isActive={isActive} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow">
          <button
            className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {navigation.find(item => isActive(item.href))?.name || 'Supplier Dashboard'}
              </h1>
            </div>
            
            {/* User menu */}
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {profile?.contactPerson || 'Supplier'}
                </span>
                <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center">
                  <UserCircleIcon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

interface SidebarContentProps {
  navigation: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  isActive: (href: string) => boolean;
}

function SidebarContent({ navigation, isActive }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full pt-5 pb-4 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            CircularSync
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-8 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                active
                  ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-200'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon
                className={`mr-3 flex-shrink-0 h-6 w-6 ${
                  active
                    ? 'text-emerald-500 dark:text-emerald-400'
                    : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                }`}
              />
              {item.name}
              {active && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute right-0 w-1 h-8 bg-emerald-600 dark:bg-emerald-400 rounded-l-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
