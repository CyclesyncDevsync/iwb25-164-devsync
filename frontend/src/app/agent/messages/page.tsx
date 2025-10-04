'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  MicrophoneIcon,
  StopIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import AgentLayout from '@/components/layout/AgentLayout';

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

// Simple Conversation List Component (inline)
const ConversationList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation,
  isTyping
}: {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
  isTyping?: boolean;
}) => {
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
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: conversations.indexOf(conversation) * 0.1 }}
              className={`w-full p-4 rounded-xl text-left transition-all duration-300 group relative overflow-hidden ${
                selectedConversation === conversation.id
                  ? 'bg-gradient-to-r from-agent-DEFAULT/15 to-blue-500/10 border-2 border-agent-DEFAULT/30 shadow-lg'
                  : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 hover:shadow-md border border-transparent'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                      conversation.type === 'admin' ? 'from-red-500 to-pink-600' :
                      conversation.type === 'support' ? 'from-purple-500 to-indigo-600' :
                      'from-agent-DEFAULT to-blue-600'
                    }`}
                  >
                    {conversation.participant.name.charAt(0)}
                  </motion.div>
                  {conversation.participant.online && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-3 border-white dark:border-gray-800 rounded-full animate-pulse"
                    />
                  )}
                  {conversation.unreadCount > 0 && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800"
                    >
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </motion.div>
                  )}
                </div>

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
                    {isTyping && selectedConversation === conversation.id ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                            className="w-2 h-2 bg-agent-DEFAULT rounded-full"
                          />
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                            className="w-2 h-2 bg-agent-DEFAULT rounded-full"
                          />
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                            className="w-2 h-2 bg-agent-DEFAULT rounded-full"
                          />
                        </div>
                        <span className="text-sm text-agent-DEFAULT font-medium">typing...</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate font-medium">
                        {conversation.lastMessage.type === 'image' && '📷 '}
                        {conversation.lastMessage.type === 'voice' && '🎵 '}
                        {conversation.lastMessage.type === 'file' && '📎 '}
                        {conversation.lastMessage.content}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 ml-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {formatTime(conversation.lastMessage.timestamp)}
                      </span>
                      {conversation.priority === 'urgent' && (
                        <motion.div 
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="w-2 h-2 bg-red-500 rounded-full"
                        />
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

// Simple Message Thread Component (inline)
const MessageThread = ({ conversation, messages, currentUserId }: {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
}) => {
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
        return <CheckIcon className="w-4 h-4 text-agent-DEFAULT" />;
      case 'delivered':
        return <CheckIcon className="w-4 h-4 text-gray-400" />;
      case 'sent':
        return <CheckIcon className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700 p-3 flex-shrink-0">
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
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
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

const AgentMessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'suppliers' | 'admin' | 'reports'>('all');
  const [isTyping, setIsTyping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data initialization
  useEffect(() => {
    setTimeout(() => {
      setConversations([
        {
          id: 'conv-1',
          type: 'supplier',
          participant: {
            id: 'supplier-1',
            name: 'Green Recyclers Pvt Ltd',
            avatar: '/avatars/supplier1.jpg',
            role: 'Supplier',
            online: true
          },
          lastMessage: {
            id: 'msg-1',
            content: 'Material is ready for verification at our facility 🏭',
            timestamp: Date.now() - 300000,
            sender: 'supplier-1',
            type: 'text'
          },
          unreadCount: 3,
          priority: 'high',
          status: 'active'
        },
        {
          id: 'conv-2',
          type: 'admin',
          participant: {
            id: 'admin-1',
            name: 'Admin Support',
            avatar: '/avatars/admin.jpg',
            role: 'Administrator',
            online: true
          },
          lastMessage: {
            id: 'msg-2',
            content: 'New assignment has been allocated to your route',
            timestamp: Date.now() - 900000,
            sender: 'admin-1',
            type: 'text'
          },
          unreadCount: 1,
          priority: 'normal',
          status: 'active'
        },
        {
          id: 'conv-3',
          type: 'supplier',
          participant: {
            id: 'supplier-2',
            name: 'Metal Works Lanka',
            avatar: '/avatars/supplier2.jpg',
            role: 'Supplier',
            online: false
          },
          lastMessage: {
            id: 'msg-3',
            content: 'Thank you for the quick verification! ✅',
            timestamp: Date.now() - 1800000,
            sender: 'supplier-2',
            type: 'text'
          },
          unreadCount: 0,
          priority: 'normal',
          status: 'resolved'
        },
        {
          id: 'conv-4',
          type: 'support',
          participant: {
            id: 'support-1',
            name: 'Technical Support',
            avatar: '/avatars/support.jpg',
            role: 'Support',
            online: true
          },
          lastMessage: {
            id: 'msg-4',
            content: 'GPS calibration completed successfully',
            timestamp: Date.now() - 3600000,
            sender: 'support-1',
            type: 'text'
          },
          unreadCount: 0,
          priority: 'normal',
          status: 'resolved'
        }
      ]);
      setIsLoading(false);
      // Simulate typing indicator occasionally
      setInterval(() => {
        if (Math.random() > 0.8) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      }, 10000);
    }, 1000);
  }, []);

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const mockMessages: Message[] = [
        {
          id: 'msg-1',
          conversationId: selectedConversation,
          sender: {
            id: 'supplier-1',
            name: 'Green Recyclers Pvt Ltd',
            role: 'Supplier'
          },
          content: 'Hello! Our plastic bottle collection is ready for verification.',
          type: 'text',
          timestamp: Date.now() - 1200000,
          status: 'read'
        }
      ];
      setMessages(mockMessages);
    }
  }, [selectedConversation]);

  const sendMessage = useCallback(async (content: string, type: 'text' | 'image' | 'voice' | 'file' = 'text', metadata?: Record<string, unknown>) => {
    if (!selectedConversation || !content.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation,
      sender: {
        id: 'agent-1',
        name: 'You',
        role: 'Agent'
      },
      content: content.trim(),
      type,
      timestamp: Date.now(),
      status: 'sent',
      metadata
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');

    // Update conversation last message with type compatibility
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation 
        ? { 
            ...conv, 
            lastMessage: { 
              id: newMsg.id,
              content: newMsg.content,
              timestamp: newMsg.timestamp,
              sender: 'agent-1',
              type: ['location', 'report'].includes(newMsg.type) ? 'text' : newMsg.type as 'text' | 'image' | 'voice' | 'file'
            } 
          }
        : conv
    ));
  }, [selectedConversation]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      sendMessage(content, 'image', {
        fileName: file.name,
        fileSize: file.size
      });
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    }
  }, [sendMessage]);

  const sendLocationMessage = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        sendMessage(
          `📍 Current Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          'text', // Changed from 'location' to 'text'
          {
            location: { lat: latitude, lng: longitude }
          }
        );
      });
    }
  }, [sendMessage]);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'suppliers' && conv.type === 'supplier') ||
                      (activeTab === 'admin' && conv.type === 'admin') ||
                      (activeTab === 'reports' && conv.priority === 'urgent');
    return matchesSearch && matchesTab;
  });

  if (isLoading) {
    return (
      <AgentLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-agent-DEFAULT/30 border-t-agent-DEFAULT rounded-full mx-auto mb-4"
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading Messages</h3>
              <p className="text-gray-600 dark:text-gray-400">Connecting to your conversations...</p>
            </motion.div>
          </div>
        </div>
      </AgentLayout>
    );
  }

  return (
    <AgentLayout>
      <div className="fixed inset-0 top-16 lg:top-0 bg-gray-50 dark:bg-dark-bg flex overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-full lg:w-80 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
          {/* Header */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Messages
            </h1>
            
            {/* Search */}
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-agent-DEFAULT focus:border-agent-DEFAULT"
            />
            
            {/* Enhanced Tabs */}
            <div className="flex space-x-1 mt-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              {[
                { id: 'all', label: 'All', icon: ChatBubbleLeftRightIcon, count: conversations.length },
                { id: 'suppliers', label: 'Suppliers', icon: UserGroupIcon, count: conversations.filter(c => c.type === 'supplier').length },
                { id: 'admin', label: 'Admin', icon: CheckCircleIcon, count: conversations.filter(c => c.type === 'admin').length },
                { id: 'reports', label: 'Urgent', icon: ExclamationTriangleIcon, count: conversations.filter(c => c.priority === 'urgent').length }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'all' | 'suppliers' | 'admin' | 'reports')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-lg text-xs font-bold transition-all duration-300 relative ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-700 text-agent-DEFAULT shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-agent-DEFAULT hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-1.5" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-1.5 bg-agent-DEFAULT text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                    >
                      {tab.count > 9 ? '9+' : tab.count}
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <ConversationList
            conversations={filteredConversations}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            isTyping={isTyping}
          />
        </div>

        {/* Message Thread */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <MessageThread
              conversation={conversations.find(c => c.id === selectedConversation)!}
              messages={messages}
              currentUserId="agent-1"
            />
            
            {/* Enhanced Message Input */}
            <div className="bg-gradient-to-r from-white to-gray-50 dark:from-dark-surface dark:to-gray-900 border-t border-gray-200 dark:border-gray-700 p-3 flex-shrink-0">
              <div className="flex items-end space-x-4">
                {/* File Upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-gray-400 hover:text-agent-DEFAULT hover:bg-agent-DEFAULT/10 rounded-xl transition-all duration-200"
                >
                  <PhotoIcon className="w-6 h-6" />
                </motion.button>

                {/* Voice Recorder */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    isRecording 
                      ? 'text-red-500 bg-red-100 dark:bg-red-900/20 animate-pulse' 
                      : 'text-gray-400 hover:text-agent-DEFAULT hover:bg-agent-DEFAULT/10'
                  }`}
                >
                  {isRecording ? <StopIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
                </motion.button>

                {/* Message Input */}
                <div className="flex-1 relative">
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    className="relative"
                  >
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(newMessage);
                        }
                      }}
                      placeholder="Type your message here... 💬"
                      rows={1}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-4 focus:ring-agent-DEFAULT/20 focus:border-agent-DEFAULT resize-none transition-all duration-200 font-medium shadow-sm"
                    />
                    {isTyping && (
                      <div className="absolute top-2 right-3 flex space-x-1">
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                          className="w-2 h-2 bg-agent-DEFAULT rounded-full"
                        />
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                          className="w-2 h-2 bg-agent-DEFAULT rounded-full"
                        />
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                          className="w-2 h-2 bg-agent-DEFAULT rounded-full"
                        />
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Send Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => sendMessage(newMessage)}
                  disabled={!newMessage.trim()}
                  className={`p-3 rounded-2xl transition-all duration-200 shadow-lg ${
                    newMessage.trim() 
                      ? 'bg-gradient-to-r from-agent-DEFAULT to-blue-600 text-white hover:shadow-xl transform hover:-translate-y-0.5' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <PaperAirplaneIcon className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Enhanced Quick Actions */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendLocationMessage}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-agent-DEFAULT hover:bg-agent-DEFAULT/10 rounded-lg transition-all duration-200"
                  >
                    <span className="text-lg">📍</span>
                    <span>Share Location</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => sendMessage('⚠️ Issue Report: Quality concerns identified', 'text')}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                  >
                    <span className="text-lg">🚨</span>
                    <span>Report Issue</span>
                  </motion.button>
                </div>
                <div className="text-xs text-gray-400">
                  Press Enter to send • Shift+Enter for new line
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-dark-bg dark:to-gray-800 h-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="mb-6"
              >
                <ChatBubbleLeftRightIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Welcome to Messages 💬
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
                Select a conversation from the sidebar to start chatting with suppliers, admin, or support team
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Real-time messaging</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>File sharing</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AgentLayout>
  );
};

export default AgentMessagesPage;
