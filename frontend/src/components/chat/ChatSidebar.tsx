'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ConversationList } from './ConversationList';
import { RoomList } from './RoomList';
import { SearchBar } from './SearchBar';
import { QuickActions } from './QuickActions';
import { setSearchQuery, setCurrentConversation } from '../../store/slices/chatSlice';
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  PlusIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatSidebarProps {
  onConversationSelect: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onConversationSelect,
}) => {
  const dispatch = useDispatch();
  const {
    filteredConversations,
    searchQuery,
    currentConversationId,
    archivedConversations,
  } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<'conversations' | 'rooms' | 'archived'>('conversations');
  const [showNewConversation, setShowNewConversation] = useState(false);

  // Filter conversations based on active tab
  const getFilteredConversations = () => {
    switch (activeTab) {
      case 'conversations':
        return filteredConversations.filter(
          conv => conv.type === 'direct' && !archivedConversations.includes(conv.id)
        );
      case 'rooms':
        return filteredConversations.filter(
          conv => conv.type === 'room' && !archivedConversations.includes(conv.id)
        );
      case 'archived':
        return filteredConversations.filter(
          conv => archivedConversations.includes(conv.id)
        );
      default:
        return filteredConversations;
    }
  };

  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const handleConversationSelect = (conversationId: string) => {
    dispatch(setCurrentConversation(conversationId));
    onConversationSelect();
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'conversations':
        return ChatBubbleLeftRightIcon;
      case 'rooms':
        return UserGroupIcon;
      case 'archived':
        return ArchiveBoxIcon;
      default:
        return ChatBubbleLeftRightIcon;
    }
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'conversations':
        return filteredConversations.filter(
          conv => conv.type === 'direct' && !archivedConversations.includes(conv.id)
        ).length;
      case 'rooms':
        return filteredConversations.filter(
          conv => conv.type === 'room' && !archivedConversations.includes(conv.id)
        ).length;
      case 'archived':
        return archivedConversations.length;
      default:
        return 0;
    }
  };

  const tabs = [
    { id: 'conversations', label: 'Conversations' },
    { id: 'rooms', label: 'Rooms' },
    { id: 'archived', label: 'Archived' },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-gray-800 dark:via-gray-800/80 dark:to-gray-800 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full blur-2xl opacity-50" />
      <div className="absolute bottom-20 left-0 w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-full blur-2xl opacity-50" />
      
      {/* Header */}
      <div className="relative z-10 p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        {/* Title */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent">
            Messages
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Stay connected with your team
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search conversations..."
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <QuickActions userRole={user?.role || 'buyer'} />
        </motion.div>
      </div>

      {/* Enhanced Tabs */}
      <div className="relative z-10 flex bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        {tabs.map((tab, index) => {
          const Icon = getTabIcon(tab.id);
          const count = getTabCount(tab.id);
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-3 text-sm font-semibold transition-all duration-200 relative group ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              {/* Background highlight */}
              <div className={`absolute inset-0 rounded-lg transition-opacity ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 opacity-100'
                  : 'bg-gray-100 dark:bg-gray-700 opacity-0 group-hover:opacity-50'
              }`} />
              
              <motion.div
                className="relative z-10"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Icon className="w-4 h-4" />
              </motion.div>
              <span className="hidden sm:inline relative z-10">{tab.label}</span>
              {count > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`relative z-10 px-2 py-1 rounded-full text-xs font-bold shadow-sm ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {count}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'rooms' ? (
              <RoomList
                userRole={user?.role || 'buyer'}
                onRoomSelect={handleConversationSelect}
                currentConversationId={currentConversationId}
              />
            ) : (
              <ConversationList
                conversations={getFilteredConversations()}
                onConversationSelect={handleConversationSelect}
                currentConversationId={currentConversationId}
                isArchived={activeTab === 'archived'}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Enhanced New Conversation Button */}
      {activeTab !== 'archived' && (
        <div className="relative z-10 p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowNewConversation(true)}
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group"
          >
            <motion.div
              className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center"
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <PlusIcon className="w-3 h-3" />
            </motion.div>
            <span className="text-sm font-semibold">
              {activeTab === 'rooms' 
                ? 'Create New Room'
                : 'Start New Chat'
              }
            </span>
            <motion.div
              className="w-1 h-1 bg-white/60 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        </div>
      )}
    </div>
  );
};
