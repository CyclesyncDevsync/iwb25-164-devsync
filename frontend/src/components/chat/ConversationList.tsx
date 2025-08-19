'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'supplier' | 'buyer';
  avatar?: string;
  online: boolean;
  lastSeen?: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'support';
  title: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  priority: 'normal' | 'high' | 'urgent';
  status: 'active' | 'resolved' | 'archived';
  createdAt: number;
  updatedAt: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
  searchQuery: string;
  filterType: 'all' | 'unread' | 'urgent';
}

export function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  searchQuery,
  filterType
}: ConversationListProps) {
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conversation.participants.some(p => 
                           p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.email.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    
    const matchesFilter = filterType === 'all' ||
                         (filterType === 'unread' && conversation.unreadCount > 0) ||
                         (filterType === 'urgent' && conversation.priority === 'urgent');
    
    return matchesSearch && matchesFilter;
  });

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      case 'high':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'active':
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'agent':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'supplier':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'buyer':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {filteredConversations.map((conversation) => (
        <motion.div
          key={conversation.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onSelectConversation(conversation.id)}
          className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
            selectedConversation === conversation.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="relative">
              {conversation.participants[0]?.avatar ? (
                <img
                  src={conversation.participants[0].avatar}
                  alt={conversation.participants[0].name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <UserCircleIcon className="w-10 h-10 text-gray-400" />
              )}
              {conversation.participants[0]?.online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {conversation.title}
                </h3>
                <div className="flex items-center space-x-1">
                  {getPriorityIcon(conversation.priority)}
                  {getStatusIcon(conversation.status)}
                  <span className="text-xs text-gray-500">
                    {formatTime(conversation.updatedAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {conversation.lastMessage?.content || 'No messages yet'}
                </p>
                {conversation.unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center mt-2">
                {conversation.participants.map((participant, index) => (
                  <span
                    key={participant.id}
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(participant.role)} ${
                      index > 0 ? 'ml-1' : ''
                    }`}
                  >
                    {participant.role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      {filteredConversations.length === 0 && (
        <div className="p-8 text-center">
          <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No conversations found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
