'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  HomeIcon,
  DocumentCheckIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface AgentLayoutProps {
  children: React.ReactNode;
}

const AgentLayout: React.FC<AgentLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  // Clean pathname by removing query parameters
  const cleanPathname = pathname.split('?')[0];

  // Debug logging
  useEffect(() => {
    console.log('Current pathname:', pathname);
    console.log('Clean pathname:', cleanPathname);
  }, [pathname, cleanPathname]);

  const navigationItems = useMemo(() => [
    {
      name: 'Dashboard',
      href: '/agent',
      icon: HomeIcon,
      current: cleanPathname === '/agent'
    },
    {
      name: 'Verify Materials',
      href: '/agent/verify',
      icon: DocumentCheckIcon,
      current: cleanPathname.startsWith('/agent/verify')
    },
    {
      name: 'Task Map',
      href: '/agent/map',
      icon: MapPinIcon,
      current: cleanPathname === '/agent/map'
    },
    {
      name: 'Messages',
      href: '/agent/messages',
      icon: ChatBubbleLeftRightIcon,
      current: cleanPathname.startsWith('/agent/messages'),
      badge: 3 // Unread messages count
    },
    {
      name: 'Settings',
      href: '/agent/settings',
      icon: Cog6ToothIcon,
      current: cleanPathname === '/agent/settings'
    }
  ], [cleanPathname]);

  // Debug log navigation items
  useEffect(() => {
    console.log('Navigation items current state:', 
      navigationItems.map(item => ({ name: item.name, href: item.href, current: item.current }))
    );
  }, [cleanPathname, navigationItems]);

  const closeSidebar = () => setIsSidebarOpen(false);

  // Get current page name for mobile header
  const getCurrentPageName = () => {
    const currentItem = navigationItems.find(item => item.current);
    return currentItem ? currentItem.name : 'Field Agent';
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
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeSidebar} />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-white to-gray-50 dark:from-dark-surface dark:to-gray-900 shadow-2xl z-50"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-agent-DEFAULT/10 to-agent-DEFAULT/5">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-agent-DEFAULT rounded-lg flex items-center justify-center">
                    <UserCircleIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-agent-DEFAULT dark:text-agent-dark">
                      Field Agent
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Portal</p>
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
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-agent-DEFAULT to-green-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-semibold text-sm">
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.firstName || 'Agent'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email || 'agent@example.com'}
                    </p>
                  </div>
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
                          ? 'bg-gradient-to-r from-agent-DEFAULT to-green-600 text-white shadow-lg shadow-agent-DEFAULT/25'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:shadow-md'
                      }`}
                    >
                      <motion.div
                        whileHover={{ rotate: 5 }}
                        className={`w-5 h-5 mr-3 flex-shrink-0 ${
                          item.current ? 'text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-agent-DEFAULT'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                      </motion.div>
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center shadow-sm"
                        >
                          {item.badge}
                        </motion.span>
                      )}
                      {item.current && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-white rounded-full ml-2"
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Mobile Sign Out Button */}
              <div className="px-3 pb-6">
                <motion.button
                  onClick={() => {
                    closeSidebar();
                    logout();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 group"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-200" />
                  <span>Sign Out</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-white to-gray-50 dark:from-dark-surface dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-xl">
          {/* Header with enhanced styling */}
          <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-agent-DEFAULT/10 to-agent-DEFAULT/5">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-agent-DEFAULT rounded-lg flex items-center justify-center">
                <UserCircleIcon className="w-5 h-5 text-white" />
              </div>
              <div>
               
              </div>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-agent-DEFAULT to-green-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-semibold text-sm">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName || 'Agent'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || 'agent@example.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Navigation */}
          <nav className="mt-6 flex-1 px-3">
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
                      ? 'bg-gradient-to-r from-agent-DEFAULT to-green-600 text-white shadow-lg shadow-agent-DEFAULT/25'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:shadow-md'
                  }`}
                >
                  <motion.div
                    whileHover={{ rotate: 5 }}
                    className={`w-5 h-5 mr-3 flex-shrink-0 ${
                      item.current ? 'text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-agent-DEFAULT'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center shadow-sm"
                    >
                      {item.badge}
                    </motion.span>
                  )}
                  {item.current && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-white rounded-full ml-2"
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Sign Out Button */}
          <div className="px-3 pb-6">
            <motion.button
              onClick={logout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 group"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-200" />
              <span>Sign Out</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Desktop header */}
        <div className="hidden lg:block bg-white dark:bg-dark-surface shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getCurrentPageName()}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Field Agent Portal
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Agent users don't need notification and profile buttons in header */}
            </div>
          </div>
        </div>

        {/* Mobile header */}
        <div className="lg:hidden bg-white dark:bg-dark-surface shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            
            <h1 className="text-lg font-semibold text-agent-DEFAULT dark:text-agent-dark">
              {getCurrentPageName()}
            </h1>
            
            <div className="flex items-center space-x-2">
              {/* Agent users don't need notification and profile buttons in mobile header */}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>

      </div>
    </div>
  );
};

export default AgentLayout;
