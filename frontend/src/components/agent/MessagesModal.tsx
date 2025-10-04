'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  MicrophoneIcon,
  StopIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon,
  CheckIcon,
  MapPinIcon
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

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Inline ConversationList for modal
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
          {conversations.map((conversation, index) => (
            <motion.button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`w-full p-3 rounded-xl text-left transition-all duration-300 ${
                selectedConversation === conversation.id
                  ? 'bg-gradient-to-r from-agent-DEFAULT/15 to-blue-500/10 border-2 border-agent-DEFAULT/30 shadow-lg'
                  : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 hover:shadow-md border border-transparent'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold shadow-lg ${
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
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse"
                    />
                  )}
                  {conversation.unreadCount > 0 && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800"
                    >
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </motion.div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                        {conversation.participant.name}
                      </h3>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(conversation.type)}`}>
                        {conversation.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {isTyping && selectedConversation === conversation.id ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[0, 0.2, 0.4].map((delay, i) => (
                            <motion.div 
                              key={i}
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 1, delay }}
                              className="w-1.5 h-1.5 bg-agent-DEFAULT rounded-full"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-agent-DEFAULT font-medium">typing...</span>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {formatTime(conversation.lastMessage.timestamp)}
                    </span>
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

// Inline MessageThread for modal
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700 p-3 flex-shrink-0 relative z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-medium ${
                conversation.type === 'admin' ? 'from-red-500 to-pink-600' :
                conversation.type === 'support' ? 'from-purple-500 to-indigo-600' :
                'from-agent-DEFAULT to-blue-600'
              }`}>
                {conversation.participant.name.charAt(0)}
              </div>
              {conversation.participant.online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              )}
            </div>
            <div>
              <h2 className="font-medium text-gray-900 dark:text-white text-sm">
                {conversation.participant.name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {conversation.participant.online ? 'Online' : 'Offline'} • {conversation.participant.role}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <PhoneIcon className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <VideoCameraIcon className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <InformationCircleIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message, index) => {
          const isOwn = message.sender.id === currentUserId;
          const showTime = index === 0 || 
            (message.timestamp - messages[index - 1].timestamp) > 300000;

          return (
            <div key={message.id}>
              {showTime && (
                <div className="flex justify-center mb-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md rounded-lg px-3 py-2 ${
                  isOwn 
                    ? 'bg-agent-DEFAULT text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}>
                  {message.type === 'location' && message.metadata?.location ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium">Location Shared</span>
                      </div>
                      {message.metadata.location.address && (
                        <p className="text-xs opacity-90">{message.metadata.location.address}</p>
                      )}
                      <div className="text-xs opacity-75">
                        Lat: {message.metadata.location.lat.toFixed(6)}, Lng: {message.metadata.location.lng.toFixed(6)}
                      </div>
                      <button
                        onClick={() => {
                          const { lat, lng } = message.metadata!.location!;
                          window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                        }}
                        className={`text-xs px-2 py-1 rounded ${
                          isOwn 
                            ? 'bg-white/20 hover:bg-white/30' 
                            : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                        } transition-colors`}
                      >
                        View on Map
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  
                  <div className={`flex items-center justify-end space-x-1 mt-1 ${
                    isOwn ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <span className="text-xs">{formatTime(message.timestamp)}</span>
                    {isOwn && <CheckIcon className="w-3 h-3" />}
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

export default function MessagesModal({ isOpen, onClose }: MessagesModalProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'suppliers' | 'admin' | 'reports'>('all');
  const [isTyping, setIsTyping] = useState(false);
  const [isSharingLocation, setIsSharingLocation] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data initialization
  useEffect(() => {
    if (isOpen) {
      setConversations([
        {
          id: 'conv-1',
          type: 'supplier',
          participant: {
            id: 'supplier-1',
            name: 'Green Recyclers Pvt Ltd',
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
        }
      ]);
    }
  }, [isOpen]);

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
        },
        {
          id: 'msg-2',
          conversationId: selectedConversation,
          sender: {
            id: 'agent-1',
            name: 'You',
            role: 'Agent'
          },
          content: '📍 Shared Location: Colombo, Sri Lanka',
          type: 'location',
          timestamp: Date.now() - 900000,
          status: 'read',
          metadata: {
            location: { lat: 6.9271, lng: 79.8612, address: 'Colombo, Sri Lanka' }
          }
        },
        {
          id: 'msg-3',
          conversationId: selectedConversation,
          sender: {
            id: 'supplier-1',
            name: 'Green Recyclers Pvt Ltd',
            role: 'Supplier'
          },
          content: 'Thank you for sharing your location! We\'ll prepare the materials for pickup.',
          type: 'text',
          timestamp: Date.now() - 600000,
          status: 'read'
        }
      ];
      setMessages(mockMessages);
    }
  }, [selectedConversation]);

  const sendMessage = useCallback(async (content: string) => {
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
      type: 'text',
      timestamp: Date.now(),
      status: 'sent'
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
  }, [selectedConversation]);

  const shareLocation = useCallback(async () => {
    if (!selectedConversation) return;

    setIsSharingLocation(true);

    try {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser.');
        setIsSharingLocation(false);
        return;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;

      // Get address using reverse geocoding (optional)
      let address = '';
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await response.json();
        address = `${data.city || ''} ${data.locality || ''} ${data.countryName || ''}`.trim();
      } catch (error) {
        console.error('Could not get address, using coordinates only', error);
      }

      const locationMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: selectedConversation,
        sender: {
          id: 'agent-1',
          name: 'You',
          role: 'Agent'
        },
        content: `📍 Shared Location${address ? `: ${address}` : ''}`,
        type: 'location',
        timestamp: Date.now(),
        status: 'sent',
        metadata: {
          location: { lat: latitude, lng: longitude, address }
        }
      };

      setMessages(prev => [...prev, locationMessage]);
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to get your location. Please check your location permissions.');
    } finally {
      setIsSharingLocation(false);
    }
  }, [selectedConversation]);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'suppliers' && conv.type === 'supplier') ||
                      (activeTab === 'admin' && conv.type === 'admin') ||
                      (activeTab === 'reports' && conv.priority === 'urgent');
    return matchesSearch && matchesTab;
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-6xl h-[90vh] bg-white dark:bg-dark-surface rounded-2xl shadow-2xl overflow-hidden flex"
        >
          {/* Close Button - positioned over sidebar area only */}
          <button
            onClick={onClose}
            className="absolute top-4 left-[calc(20rem-2rem)] z-20 p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors shadow-lg"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Conversations Sidebar */}
          <div className="w-80 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Messages
              </h1>
              
              {/* Search */}
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-agent-DEFAULT focus:border-agent-DEFAULT"
              />
              
              {/* Tabs */}
              <div className="flex space-x-1 mt-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                {[
                  { id: 'all', label: 'All', icon: ChatBubbleLeftRightIcon },
                  { id: 'suppliers', label: 'Suppliers', icon: UserGroupIcon },
                  { id: 'admin', label: 'Admin', icon: CheckCircleIcon },
                  { id: 'reports', label: 'Urgent', icon: ExclamationTriangleIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex-1 flex items-center justify-center py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-700 text-agent-DEFAULT shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:text-agent-DEFAULT'
                    }`}
                  >
                    <tab.icon className="w-3 h-3 mr-1" />
                    {tab.label}
                  </button>
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
            <div className="flex-1 flex flex-col">
              <MessageThread
                conversation={conversations.find(c => c.id === selectedConversation)!}
                messages={messages}
                currentUserId="agent-1"
              />
              
              {/* Message Input */}
              <div className="bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-gray-700 p-3 flex-shrink-0">
                <div className="flex items-end space-x-3">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
                  
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-agent-DEFAULT rounded-lg">
                    <PhotoIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={shareLocation}
                    disabled={isSharingLocation}
                    className={`p-2 rounded-lg transition-colors ${
                      isSharingLocation 
                        ? 'text-blue-500 animate-pulse' 
                        : 'text-gray-400 hover:text-blue-500'
                    }`}
                    title="Share Location"
                  >
                    <MapPinIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`p-2 rounded-lg ${isRecording ? 'text-red-500' : 'text-gray-400 hover:text-agent-DEFAULT'}`}
                  >
                    {isRecording ? <StopIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
                  </button>

                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(newMessage);
                      }
                    }}
                    placeholder="Type your message..."
                    rows={1}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-agent-DEFAULT resize-none"
                  />

                  <button
                    onClick={() => sendMessage(newMessage)}
                    disabled={!newMessage.trim()}
                    className={`p-2 rounded-lg transition-all ${
                      newMessage.trim() 
                        ? 'bg-agent-DEFAULT text-white hover:bg-agent-DEFAULT/90' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-dark-bg dark:to-gray-800">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
