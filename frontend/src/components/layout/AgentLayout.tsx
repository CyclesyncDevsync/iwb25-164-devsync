'use client';

import { useState, useEffect } from 'react';
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
  BellIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentLayoutProps {
  children: React.ReactNode;
}

const AgentLayout: React.FC<AgentLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Clean pathname by removing query parameters
  const cleanPathname = pathname.split('?')[0];

  // Debug logging
  useEffect(() => {
    console.log('Current pathname:', pathname);
    console.log('Clean pathname:', cleanPathname);
  }, [pathname, cleanPathname]);

  const navigationItems = [
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
  ];

  // Debug log navigation items
  useEffect(() => {
    console.log('Navigation items current state:', 
      navigationItems.map(item => ({ name: item.name, href: item.href, current: item.current }))
    );
  }, [cleanPathname]);

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
              className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-dark-surface shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-agent-DEFAULT dark:text-agent-dark">
                  Field Agent
                </h2>
                <button
                  onClick={closeSidebar}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Mobile sidebar */}
              <nav className="mt-4 px-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeSidebar}
                    className={`group flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-md transition-colors ${
                      item.current
                        ? 'bg-agent-DEFAULT text-black dark:text-black'
                        : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                        <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${item.current ? 'text-black dark:text-black' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`} />
                        <span className={`flex-1 ${item.current ? 'text-black dark:text-black' : ''}`}>{item.name}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-agent-DEFAULT dark:text-agent-dark">
              Field Agent Portal
            </h2>
          </div>
          
          {/* Desktop sidebar */}
          <nav className="mt-4 flex-1 px-2 pb-4">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-md transition-colors ${
                  item.current
                    ? 'bg-agent-DEFAULT text-black dark:text-black'
                    : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${item.current ? 'text-black dark:text-black' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`} />
                <span className={`flex-1 ${item.current ? 'text-black dark:text-black' : ''}`}>{item.name}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
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
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative">
                <BellIcon className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                <UserCircleIcon className="w-6 h-6" />
              </button>
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
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative">
                <BellIcon className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                <UserCircleIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-gray-700 safe-area-pb">
          <div className="grid grid-cols-5 py-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-1 relative ${
                  item.current
                    ? 'text-agent-DEFAULT dark:text-agent-dark'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-xs">
                  {item.name === 'Verify Materials' ? 'Verify' : 
                   item.name === 'Task Map' ? 'Map' : 
                   item.name.split(' ')[0]}
                </span>
                {item.badge && (
                  <span className="absolute -top-1 right-1/4 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentLayout;
