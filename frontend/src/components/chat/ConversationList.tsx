'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Conversation } from '../../services/chatWebSocket';
import {
  archiveConversation,
  unarchiveConversation,
  flagMessage,
  markMessageAsRead,
} from '../../store/slices/chatSlice';
import {
  EllipsisVerticalIcon,
  ArchiveBoxIcon,
  ArchiveBoxXMarkIcon,
  FlagIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export interface ConversationListProps {
  conversations: Conversation[];
  onConversationSelect: (conversationId: string) => void;
  currentConversationId: string | null;
  isArchived?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onConversationSelect,
  currentConversationId,
  isArchived = false,
}) => {
  const dispatch = useDispatch();
  const { unreadCounts } = useSelector((state: RootState) => state.chat);
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const handleArchiveToggle = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isArchived) {
      dispatch(unarchiveConversation(conversationId));
    } else {
      dispatch(archiveConversation(conversationId));
    }
  };

  const handleFlag = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Implementation would flag the conversation
    console.log('Flag conversation:', conversationId);
  };

  const handleDelete = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Implementation would delete the conversation
    console.log('Delete conversation:', conversationId);
  };

  const getConversationIcon = (conversation: Conversation) => {
    if (conversation.type === 'group' || conversation.type === 'room') {
      return UsersIcon;
    }
    return UserIcon;
  };

  const getStatusColor = (conversation: Conversation) => {
    const isOnline = conversation.participants.some(p => p.isOnline);
    return isOnline ? 'bg-green-500' : 'bg-gray-400';
  };

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

  const formatLastActivity = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            {isArchived ? (
              <ArchiveBoxIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            ) : (
              <UserIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {isArchived 
                ? 'No archived conversations'
                : 'No conversations'
              }
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {isArchived 
                ? 'Archived conversations will appear here'
                : 'Start a new conversation to get started'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <AnimatePresence>
        {conversations.map((conversation) => {
          const Icon = getConversationIcon(conversation);
          const unreadCount = unreadCounts[conversation.id] || 0;
          const isActive = currentConversationId === conversation.id;
          const otherParticipant = conversation.participants.find(p => p.id !== 'current-user'); // This should be the actual user ID

          return (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
              onClick={() => onConversationSelect(conversation.id)}
              className={`relative flex items-center p-4 cursor-pointer border-b border-gray-100 dark:border-gray-700 transition-colors ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-r-blue-500' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
              }`}
            >
              {/* Avatar/Icon */}
              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  conversation.type === 'direct' 
                    ? 'bg-gray-200 dark:bg-gray-600' 
                    : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {otherParticipant?.avatar ? (
                    <img
                      src={otherParticipant.avatar}
                      alt={otherParticipant.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Icon className={`w-5 h-5 ${
                      conversation.type === 'direct' 
                        ? 'text-gray-500 dark:text-gray-400' 
                        : 'text-blue-600 dark:text-blue-400'
                    }`} />
                  )}
                </div>
                
                {/* Online status indicator */}
                {conversation.type === 'direct' && otherParticipant && (
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(conversation)}`} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 ml-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <h3 className={`text-sm font-medium truncate ${
                      isActive 
                        ? 'text-blue-900 dark:text-blue-100' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {conversation.name}
                    </h3>
                    
                    {/* Role badge for direct conversations */}
                    {conversation.type === 'direct' && otherParticipant && (
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(otherParticipant.role)}`}>
                        {otherParticipant.role}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Unread count */}
                    {unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full min-w-4 h-4 flex items-center justify-center px-1 font-medium">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                    
                    {/* Options menu */}
                    <Menu as="div" className="relative">
                      <Menu.Button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <EllipsisVerticalIcon className="w-4 h-4" />
                      </Menu.Button>
                      
                      <Transition
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={(e) => handleArchiveToggle(conversation.id, e)}
                                  className={`${
                                    active ? 'bg-gray-100 dark:bg-gray-600' : ''
                                  } flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 w-full text-left`}
                                >
                                  {isArchived ? (
                                    <>
                                      <ArchiveBoxXMarkIcon className="w-4 h-4" />
                                      <span>Unarchive</span>
                                    </>
                                  ) : (
                                    <>
                                      <ArchiveBoxIcon className="w-4 h-4" />
                                      <span>Archive</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </Menu.Item>
                            
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={(e) => handleFlag(conversation.id, e)}
                                  className={`${
                                    active ? 'bg-gray-100 dark:bg-gray-600' : ''
                                  } flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 w-full text-left`}
                                >
                                  <FlagIcon className="w-4 h-4" />
                                  <span>Flag</span>
                                </button>
                              )}
                            </Menu.Item>
                            
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={(e) => handleDelete(conversation.id, e)}
                                  className={`${
                                    active ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : ''
                                  } flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 w-full text-left`}
                                >
                                  <TrashIcon className="w-4 h-4" />
                                  <span>Delete</span>
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
                
                {/* Last message and timestamp */}
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-xs truncate ${
                    isActive 
                      ? 'text-blue-700 dark:text-blue-200' 
                      : unreadCount > 0 
                        ? 'text-gray-900 dark:text-white font-medium' 
                        : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </p>
                  
                  <span className={`text-xs ml-2 flex-shrink-0 ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-300' 
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {formatLastActivity(conversation.lastActivity)}
                  </span>
                </div>
                
                {/* Typing indicator */}
                {conversation.isTyping && conversation.isTyping.length > 0 && (
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      {conversation.isTyping[0]} is typing...
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
