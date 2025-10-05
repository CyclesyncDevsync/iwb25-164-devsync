"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ShoppingBagIcon,
  HeartIcon,
  BookmarkIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

interface BuyerLayoutProps {
  children: React.ReactNode;
}

const BuyerLayout: React.FC<BuyerLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  // Clean pathname by removing query parameters
  const cleanPathname = pathname.split("?")[0];

  const navigationItems = useMemo(
    () => [
      {
        name: "Dashboard",
        href: "/buyer",
        icon: ChartBarIcon,
        current: cleanPathname === "/buyer",
      },
      {
        name: "Search Materials",
        href: "/buyer/search",
        icon: MagnifyingGlassIcon,
        current: cleanPathname.startsWith("/buyer/search"),
      },
      {
        name: "Live Auctions",
        href: "/buyer/auctions",
        icon: ClockIcon,
        current: cleanPathname.startsWith("/buyer/auctions"),
      },
      {
        name: "My Orders",
        href: "/buyer/orders",
        icon: ShoppingBagIcon,
        current: cleanPathname.startsWith("/buyer/orders"),
      },
      {
        name: "Wallet",
        href: "/buyer/wallet",
        icon: WalletIcon,
        current: cleanPathname.startsWith("/buyer/wallet"),
      },
      {
        name: "Analytics",
        href: "/buyer/analytics",
        icon: ChartBarIcon,
        current: cleanPathname === "/buyer/analytics",
      },
      {
        name: "Favorites",
        href: "/buyer/favorites",
        icon: HeartIcon,
        current: cleanPathname === "/buyer/favorites",
      },
      {
        name: "Saved Items",
        href: "/buyer/saved",
        icon: BookmarkIcon,
        current: cleanPathname === "/buyer/saved",
      },
      {
        name: "Settings",
        href: "/buyer/settings",
        icon: Cog6ToothIcon,
        current: cleanPathname === "/buyer/settings",
      },
    ],
    [cleanPathname]
  );

  const closeSidebar = () => setIsSidebarOpen(false);

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
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={closeSidebar}
            />
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
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-buyer-DEFAULT/10 to-buyer-DEFAULT/5">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
                  <UserCircleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-buyer-DEFAULT dark:text-buyer-dark">
                    Buyer Portal
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Dashboard
                  </p>
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
                <div className="w-10 h-10 bg-gradient-to-br from-green-700 to-green-500 rounded-full flex items-center justify-center shadow-lg ring-1 ring-gray-100 dark:ring-transparent">
                  <span className="text-white font-semibold text-sm">
                    {user?.firstName?.charAt(0) ||
                      user?.email?.charAt(0) ||
                      "B"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.firstName || "Buyer"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email || "buyer@example.com"}
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
                        ? "bg-buyer-DEFAULT/15 text-buyer-DEFAULT shadow-sm border-l-4 border-buyer-DEFAULT dark:bg-gradient-to-r dark:from-buyer-DEFAULT dark:to-blue-600 dark:text-white dark:shadow-lg dark:shadow-buyer-DEFAULT/25"
                        : "text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md"
                    }`}
                  >
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      className={`w-5 h-5 mr-3 flex-shrink-0 ${
                        item.current
                          ? "text-buyer-DEFAULT dark:text-white"
                          : "text-gray-700 dark:text-gray-400 group-hover:text-buyer-DEFAULT"
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
                onClick={logout}
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
          <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-buyer-DEFAULT/10 to-buyer-DEFAULT/5">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
                <UserCircleIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-buyer-DEFAULT dark:text-buyer-dark">
                  Buyer Portal
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Desktop User Profile */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-700 to-green-500 rounded-full flex items-center justify-center shadow-lg ring-1 ring-gray-100 dark:ring-transparent">
                <span className="text-white font-semibold text-sm">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "B"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName || "Buyer"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || "buyer@example.com"}
                </p>
              </div>
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
                      ? "bg-buyer-DEFAULT/15 text-buyer-DEFAULT shadow-sm border-l-4 border-buyer-DEFAULT dark:bg-gradient-to-r dark:from-buyer-DEFAULT dark:to-blue-600 dark:text-white dark:shadow-lg dark:shadow-buyer-DEFAULT/25"
                      : "text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md"
                  }`}
                >
                  <motion.div
                    whileHover={{ rotate: 5 }}
                    className={`w-5 h-5 mr-3 flex-shrink-0 ${
                      item.current
                        ? "text-buyer-DEFAULT dark:text-white"
                        : "text-gray-700 dark:text-gray-400 group-hover:text-buyer-DEFAULT"
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
              onClick={logout}
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
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
};

export default BuyerLayout;
