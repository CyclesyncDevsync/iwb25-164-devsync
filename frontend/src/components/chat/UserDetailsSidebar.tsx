'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircleIcon,
  XMarkIcon,
  PhoneIcon,
  VideoCameraIcon
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

interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'support';
  title: string;
  participants: User[];
  unreadCount: number;
  priority: 'normal' | 'high' | 'urgent';
  status: 'active' | 'resolved' | 'archived';
  createdAt: number;
  updatedAt: number;
}

interface UserDetailsSidebarProps {
  conversation: Conversation;
  isVisible: boolean;
  onClose: () => void;
}

export function UserDetailsSidebar({ conversation, isVisible, onClose }: UserDetailsSidebarProps) {
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

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Details</h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-center mb-6">
            {conversation.participants[0]?.avatar ? (
              <img
                src={conversation.participants[0].avatar}
                alt={conversation.participants[0].name}
                className="w-20 h-20 rounded-full mx-auto mb-4"
              />
            ) : (
              <UserCircleIcon className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            )}
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              {conversation.participants[0]?.name}
            </h4>
            <p className="text-sm text-gray-500">
              {conversation.participants[0]?.email}
            </p>
            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full mt-2 ${
              getRoleColor(conversation.participants[0]?.role || 'guest')
            }`}>
              {conversation.participants[0]?.role}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  conversation.participants[0]?.online ? 'bg-green-400' : 'bg-gray-400'
                }`} />
                <p className="text-sm text-gray-900 dark:text-white">
                  {conversation.participants[0]?.online ? 'Online' : 
                   conversation.participants[0]?.lastSeen ? 
                   `Last seen ${formatTime(conversation.participants[0].lastSeen)}` : 'Offline'}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Conversation Status</label>
              <p className="text-sm text-gray-900 dark:text-white capitalize">{conversation.status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
              <p className="text-sm text-gray-900 dark:text-white capitalize">{conversation.priority}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <p className="text-sm text-gray-900 dark:text-white capitalize">{conversation.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</label>
              <p className="text-sm text-gray-900 dark:text-white">
                {new Date(conversation.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              <PhoneIcon className="w-4 h-4 mr-2" />
              Start Call
            </button>
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              <VideoCameraIcon className="w-4 h-4 mr-2" />
              Video Call
            </button>
          </div>

          {/* Additional Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                View Profile
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                View Transactions
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                View Materials
              </button>
              {conversation.status === 'active' && (
                <button className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md">
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
