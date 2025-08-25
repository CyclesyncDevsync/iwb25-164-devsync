'use client';

import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Conversation {
  id: string;
  type: 'supplier' | 'admin' | 'support';
  participant: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    online?: boolean;
  };
  lastMessage: {
    id: string;
    content: string;
    timestamp: number;
    sender: string;
    type: 'text' | 'image' | 'voice' | 'file';
  };
  unreadCount: number;
  priority: 'normal' | 'high' | 'urgent';
  status?: 'active' | 'resolved' | 'pending';
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
}

const ConversationList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation 
}: ConversationListProps) => {
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      case 'high':
        return <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'supplier':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No conversations found
        </div>
      ) : (
        <div className="space-y-1 p-2">
          {conversations.map((conversation) => (
            <motion.button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                selectedConversation === conversation.id
                  ? 'bg-agent-DEFAULT/10 border border-agent-DEFAULT/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-agent-DEFAULT to-blue-600 flex items-center justify-center text-white font-medium">
                    {conversation.participant.name.charAt(0)}
                  </div>
                  {conversation.participant.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {conversation.participant.name}
                      </h3>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(conversation.type)}`}>
                        {conversation.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getPriorityIcon(conversation.priority)}
                      {getStatusIcon(conversation.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conversation.lastMessage.type === 'image' && '📷 '}
                      {conversation.lastMessage.type === 'voice' && '🎵 '}
                      {conversation.lastMessage.type === 'file' && '📎 '}
                      {conversation.lastMessage.content}
                    </p>
                    <div className="flex items-center space-x-1 ml-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(conversation.lastMessage.timestamp)}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-agent-DEFAULT text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationList;
