'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ThemeToggle } from '../common/ThemeToggle';
import {
  Bars3Icon,
  Cog6ToothIcon,
  BellIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  showSidebar: boolean;
  isMobile: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onToggleSidebar,
  onOpenSettings,
  showSidebar,
  isMobile,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { conversations, unreadCounts } = useSelector((state: RootState) => state.chat);

  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'agent':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'supplier':
        return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20';
      case 'buyer':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };


  return (
    <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 shadow-sm">
      {/* Decorative gradient line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500" />
      
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Enhanced Sidebar Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleSidebar}
            className="relative p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700/50 transition-all duration-200 group"
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </motion.button>

          {/* Enhanced Title and User Info */}
          <div className="flex items-center space-x-4">
            {/* App Icon */}
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg"
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              CS
            </motion.div>
            
            <div>
              <motion.h1 
                className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                CircularSync Chat
              </motion.h1>
              {!isMobile && (
                <motion.div 
                  className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-medium">{user?.name}</span>
                  </div>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <motion.span 
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user?.role || '')} shadow-sm border border-current/20`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {user?.role?.toUpperCase()}
                  </motion.span>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700/50 transition-all duration-200 group"
            aria-label="Notifications"
          >
            <BellIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
            {totalUnreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1 font-bold shadow-md"
              >
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </motion.span>
            )}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </motion.button>

          {/* Active Conversations */}
          {!isMobile && (
            <motion.div 
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100/80 dark:bg-gray-700/50 rounded-xl text-sm text-gray-600 dark:text-gray-300 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
            >
              <UserGroupIcon className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{conversations.length}</span>
              <span className="text-xs opacity-75">chats</span>
            </motion.div>
          )}

          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenSettings}
            className="relative p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700/50 transition-all duration-200 group"
            aria-label="Chat settings"
          >
            <Cog6ToothIcon className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </motion.button>
        </div>
      </div>

      {/* Mobile User Info */}
      {isMobile && (
        <motion.div 
          className="mt-3 flex items-center space-x-3 text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-medium">{user?.name}</span>
          </div>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user?.role || '')}`}>
            {user?.role}
          </span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <UserGroupIcon className="w-3 h-3" />
            <span>{conversations.length}</span>
          </div>
        </motion.div>
      )}
    </header>
  );
};
