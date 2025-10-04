'use client';

import { useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChartBarIcon,
  HomeIcon,
  PlusCircleIcon,
  DocumentDuplicateIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  BellIcon,
  UserCircleIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import { useNotifications } from '../../hooks/useNotifications';
import { SupplierType } from '../../types/supplier';

interface SupplierLayoutProps {
  children: React.ReactNode;
}

const SupplierLayout: React.FC<SupplierLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((state: any) => state.supplier || {});
  const { unreadCount = 0 } = useNotifications() || {};
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Clean pathname by removing query parameters
  const cleanPathname = pathname?.split('?')[0] || '';

  const navigationItems = useMemo(() => {
    const items = [
      {
        name: 'Dashboard',
        href: '/supplier',
        icon: HomeIcon,
        current: cleanPathname === '/supplier'
      },
      {
        name: 'Add Material',
        href: '/supplier/materials/new-enhanced',
        icon: PlusCircleIcon,
        current: cleanPathname === '/supplier/materials/new' || cleanPathname === '/supplier/materials/new-enhanced'
      },
      {
        name: 'My Materials',
        href: '/supplier/materials',
        icon: DocumentDuplicateIcon,
        current: cleanPathname.startsWith('/supplier/materials') && !cleanPathname.includes('/new')
      },
      {
        name: 'Orders',
        href: '/supplier/orders',
        icon: ShoppingBagIcon,
        current: cleanPathname.startsWith('/supplier/orders')
      },
      {
        name: 'Analytics',
        href: '/supplier/analytics',
        icon: ChartBarIcon,
        current: cleanPathname === '/supplier/analytics'
      },
      {
        name: 'Earnings',
        href: '/supplier/earnings',
        icon: CurrencyDollarIcon,
        current: cleanPathname.startsWith('/supplier/earnings')
      }
    ];

    if (profile?.type === SupplierType.ORGANIZATION) {
      items.splice(-1, 0,
        {
          name: 'Team',
          href: '/supplier/team',
          icon: UserGroupIcon,
          current: cleanPathname.startsWith('/supplier/team')
        },
        {
          name: 'Locations',
          href: '/supplier/locations',
          icon: MapPinIcon,
          current: cleanPathname.startsWith('/supplier/locations')
        }
      );
    }

    items.push({
      name: 'Settings',
      href: '/supplier/settings',
      icon: Cog6ToothIcon,
      current: cleanPathname === '/supplier/settings'
    });

    return items;
  }, [cleanPathname, profile]);

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      dispatch(logout());
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[65] lg:hidden"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeSidebar} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed inset-y-0 left-0 w-64 bg-white dark:from-dark-surface dark:to-gray-900 shadow-2xl z-[70] lg:hidden"
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <UserCircleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-emerald-600 dark:text-emerald-300">
                    Supplier Portal
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Dashboard</p>
                </div>
              </div>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile User Profile */}
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-700 to-emerald-500 rounded-full flex items-center justify-center shadow-lg ring-1 ring-gray-100 dark:ring-transparent">
                    <span className="text-white font-semibold text-sm">
                      {profile?.contactPerson?.charAt(0) || 'S'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {profile?.businessName || profile?.contactPerson || 'Supplier'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {profile?.type ? `${profile.type} Supplier` : 'Supplier'}
                    </p>
                  </div>
                </div>
                <Link
                  href="/supplier/notifications"
                  onClick={closeSidebar}
                  className="relative p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <BellIcon className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="mt-6 px-3 flex-1">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={closeSidebar}
                    className={`group flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105 ${
                      item.current
                        ? 'bg-emerald-50 text-emerald-600 shadow-sm border-l-4 border-emerald-600 dark:bg-gradient-to-r dark:from-emerald-600 dark:to-emerald-700 dark:text-white dark:shadow-lg dark:shadow-emerald-600/25'
                        : 'text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md'
                    }`}
                  >
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      className={`w-5 h-5 mr-3 flex-shrink-0 ${
                        item.current ? 'text-emerald-600 dark:text-white' : 'text-gray-700 dark:text-gray-400 group-hover:text-emerald-600'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                    </motion.div>
                    <span className="flex-1">{item.name}</span>
                    {item.current && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Mobile Logout */}
            <div className="px-3 pb-4">
              <button
                onClick={handleLogout}
                className="group flex items-center w-full px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300 rounded-xl transition-all duration-200 transform hover:scale-105 hover:bg-red-100 dark:hover:bg-red-900/20"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 text-red-700 dark:text-red-300 group-hover:text-red-800" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-50">
        <div className="flex flex-col flex-grow bg-white dark:from-dark-surface dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-xl">
          {/* Desktop Header */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <UserCircleIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-emerald-600 dark:text-emerald-300">
                  Supplier Portal
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">Dashboard</p>
              </div>
            </div>
          </div>

          {/* Desktop User Profile */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-700 to-emerald-500 rounded-full flex items-center justify-center shadow-lg ring-1 ring-gray-100 dark:ring-transparent">
                  <span className="text-white font-semibold text-sm">
                    {profile?.contactPerson?.charAt(0) || 'S'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {profile?.businessName || profile?.contactPerson || 'Supplier'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {profile?.type ? `${profile.type} Supplier` : 'Supplier'}
                  </p>
                </div>
              </div>
              <Link
                href="/supplier/notifications"
                className="relative p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="mt-6 px-3 flex-1">
            {navigationItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`group flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105 ${
                    item.current
                      ? 'bg-emerald-50 text-emerald-600 shadow-sm border-l-4 border-emerald-600 dark:bg-gradient-to-r dark:from-emerald-600 dark:to-emerald-700 dark:text-white dark:shadow-lg dark:shadow-emerald-600/25'
                      : 'text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md'
                  }`}
                >
                  <motion.div
                    whileHover={{ rotate: 5 }}
                    className={`w-5 h-5 mr-3 flex-shrink-0 ${
                      item.current ? 'text-emerald-600 dark:text-white' : 'text-gray-700 dark:text-gray-400 group-hover:text-emerald-600'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>
                  <span className="flex-1">{item.name}</span>
                  {item.current && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Desktop Logout */}
          <div className="px-3 pb-4">
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300 rounded-xl transition-all duration-200 transform hover:scale-105 hover:bg-red-100 dark:hover:bg-red-900/20"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 text-red-700 dark:text-red-300 group-hover:text-red-800" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1 relative z-10">
        {/* Page Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SupplierLayout;