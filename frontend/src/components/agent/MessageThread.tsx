'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  conversationId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  content: string;
  type: 'text' | 'image' | 'voice' | 'file' | 'location' | 'report';
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number;
    location?: { lat: number; lng: number; address?: string };
    reportType?: string;
  };
}

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

interface MessageThreadProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
}

const MessageThread = ({ conversation, messages, currentUserId }: MessageThreadProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case 'image':
        return (
          <div className="max-w-xs">
            <img
              src={message.content}
              alt="Shared image"
              className="rounded-lg max-w-full h-auto"
            />
            {message.metadata?.fileName && (
              <p className="text-xs text-gray-500 mt-1">{message.metadata.fileName}</p>
            )}
          </div>
        );
      
      case 'voice':
        return (
          <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
            <button className="w-8 h-8 bg-agent-DEFAULT text-white rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex-1">
              <div className="w-32 h-1 bg-gray-300 dark:bg-gray-600 rounded-full">
                <div className="w-1/3 h-1 bg-agent-DEFAULT rounded-full"></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Voice message • {message.metadata?.duration}s
              </p>
            </div>
          </div>
        );
      
      case 'location':
        return (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">📍</span>
              <span className="font-medium text-gray-900 dark:text-white">Location</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {message.content}
            </p>
            <button className="mt-2 text-xs text-agent-DEFAULT hover:underline">
              View on map
            </button>
          </div>
        );
      
      case 'report':
        return (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">🚨</span>
              <span className="font-medium text-red-800 dark:text-red-400">Issue Report</span>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">
              {message.content}
            </p>
          </div>
        );
      
      default:
        return (
          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
            {message.content}
          </p>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read':
        return (
          <div className="relative flex items-center">
            <CheckIcon className="w-4 h-4 text-agent-DEFAULT" />
            <CheckIcon className="w-4 h-4 text-agent-DEFAULT -ml-2" />
          </div>
        );
      case 'delivered':
        return (
          <div className="relative flex items-center">
            <CheckIcon className="w-4 h-4 text-gray-400" />
            <CheckIcon className="w-4 h-4 text-gray-400 -ml-2" />
          </div>
        );
      case 'sent':
        return <CheckIcon className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-agent-DEFAULT to-blue-600 flex items-center justify-center text-white font-medium">
                {conversation.participant.name.charAt(0)}
              </div>
              {conversation.participant.online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              )}
            </div>
            <div>
              <h2 className="font-medium text-gray-900 dark:text-white">
                {conversation.participant.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {conversation.participant.online ? 'Online' : 'Offline'} • {conversation.participant.role}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <PhoneIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <VideoCameraIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <InformationCircleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isOwn = message.sender.id === currentUserId;
          const showAvatar = !isOwn && (index === 0 || messages[index - 1].sender.id !== message.sender.id);
          const showTime = index === 0 || 
            (message.timestamp - messages[index - 1].timestamp) > 300000; // 5 minutes

          return (
            <div key={message.id}>
              {showTime && (
                <div className="flex justify-center mb-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {showAvatar && !isOwn && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-medium">
                      {message.sender.name.charAt(0)}
                    </div>
                  )}
                  
                  <div className={`rounded-lg px-3 py-2 ${
                    isOwn 
                      ? 'bg-agent-DEFAULT text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    {renderMessageContent(message)}
                    
                    <div className={`flex items-center justify-end space-x-1 mt-1 ${
                      isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span className="text-xs">
                        {formatTime(message.timestamp)}
                      </span>
                      {isOwn && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageThread;
