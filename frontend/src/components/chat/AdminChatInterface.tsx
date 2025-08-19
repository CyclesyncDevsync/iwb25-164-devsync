'use client';

import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { ConversationList } from './ConversationList';
import { ChatArea } from './ChatArea';
import { UserDetailsSidebar } from './UserDetailsSidebar';

// Types
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
  metadata?: {
    fileName?: string;
    fileSize?: number;
    imageUrl?: string;
  };
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

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'supplier',
    online: true,
    avatar: '/api/placeholder/32/32'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    role: 'agent',
    online: true,
    avatar: '/api/placeholder/32/32'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'buyer',
    online: false,
    lastSeen: Date.now() - 300000,
    avatar: '/api/placeholder/32/32'
  },
  {
    id: '4',
    name: 'Emma Brown',
    email: 'emma@example.com',
    role: 'supplier',
    online: true,
    avatar: '/api/placeholder/32/32'
  }
];

const mockConversations: Conversation[] = [
  {
    id: '1',
    type: 'direct',
    title: 'John Doe',
    participants: [mockUsers[0]],
    lastMessage: {
      id: '1',
      conversationId: '1',
      senderId: '1',
      content: 'I have some plastic materials ready for collection. When can we schedule?',
      type: 'text',
      timestamp: Date.now() - 60000,
      status: 'delivered'
    },
    unreadCount: 2,
    priority: 'normal',
    status: 'active',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 60000
  },
  {
    id: '2',
    type: 'support',
    title: 'Sarah Wilson - Material Verification Issue',
    participants: [mockUsers[1]],
    lastMessage: {
      id: '2',
      conversationId: '2',
      senderId: '2',
      content: 'The material quality seems inconsistent with the photos provided.',
      type: 'text',
      timestamp: Date.now() - 120000,
      status: 'read'
    },
    unreadCount: 0,
    priority: 'high',
    status: 'active',
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 120000
  },
  {
    id: '3',
    type: 'direct',
    title: 'Mike Johnson',
    participants: [mockUsers[2]],
    lastMessage: {
      id: '3',
      conversationId: '3',
      senderId: '3',
      content: 'Thanks for the quick response!',
      type: 'text',
      timestamp: Date.now() - 300000,
      status: 'read'
    },
    unreadCount: 0,
    priority: 'normal',
    status: 'resolved',
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 300000
  },
  {
    id: '4',
    type: 'direct',
    title: 'Emma Brown',
    participants: [mockUsers[3]],
    lastMessage: {
      id: '4',
      conversationId: '4',
      senderId: '4',
      content: 'The auction results look good. When can we proceed with pickup?',
      type: 'text',
      timestamp: Date.now() - 1800000,
      status: 'delivered'
    },
    unreadCount: 1,
    priority: 'normal',
    status: 'active',
    createdAt: Date.now() - 432000000,
    updatedAt: Date.now() - 1800000
  }
];

const mockMessages: { [key: string]: Message[] } = {
  '1': [
    {
      id: '1',
      conversationId: '1',
      senderId: 'admin',
      content: 'Hello John! I see you have materials ready for collection.',
      type: 'text',
      timestamp: Date.now() - 180000,
      status: 'read'
    },
    {
      id: '2',
      conversationId: '1',
      senderId: '1',
      content: 'Yes, I have about 50kg of mixed plastic bottles and containers.',
      type: 'text',
      timestamp: Date.now() - 120000,
      status: 'read'
    },
    {
      id: '3',
      conversationId: '1',
      senderId: '1',
      content: 'I have some plastic materials ready for collection. When can we schedule?',
      type: 'text',
      timestamp: Date.now() - 60000,
      status: 'delivered'
    }
  ],
  '2': [
    {
      id: '4',
      conversationId: '2',
      senderId: '2',
      content: 'I need help with material verification for supplier ID 12345.',
      type: 'text',
      timestamp: Date.now() - 240000,
      status: 'read'
    },
    {
      id: '5',
      conversationId: '2',
      senderId: 'admin',
      content: 'What seems to be the issue with the verification?',
      type: 'text',
      timestamp: Date.now() - 180000,
      status: 'read'
    },
    {
      id: '6',
      conversationId: '2',
      senderId: '2',
      content: 'The material quality seems inconsistent with the photos provided.',
      type: 'text',
      timestamp: Date.now() - 120000,
      status: 'read'
    }
  ],
  '3': [
    {
      id: '7',
      conversationId: '3',
      senderId: 'admin',
      content: 'Hi Mike! How can I help you today?',
      type: 'text',
      timestamp: Date.now() - 360000,
      status: 'read'
    },
    {
      id: '8',
      conversationId: '3',
      senderId: '3',
      content: 'I had a question about the bidding process.',
      type: 'text',
      timestamp: Date.now() - 330000,
      status: 'read'
    },
    {
      id: '9',
      conversationId: '3',
      senderId: 'admin',
      content: 'Of course! You can place bids on any active auction. The highest bid wins when the auction ends.',
      type: 'text',
      timestamp: Date.now() - 310000,
      status: 'read'
    },
    {
      id: '10',
      conversationId: '3',
      senderId: '3',
      content: 'Thanks for the quick response!',
      type: 'text',
      timestamp: Date.now() - 300000,
      status: 'read'
    }
  ],
  '4': [
    {
      id: '11',
      conversationId: '4',
      senderId: 'admin',
      content: 'Hi Emma! Congratulations on winning the auction.',
      type: 'text',
      timestamp: Date.now() - 2100000,
      status: 'read'
    },
    {
      id: '12',
      conversationId: '4',
      senderId: '4',
      content: 'Thank you! I\'m excited to work with these materials.',
      type: 'text',
      timestamp: Date.now() - 1900000,
      status: 'read'
    },
    {
      id: '13',
      conversationId: '4',
      senderId: '4',
      content: 'The auction results look good. When can we proceed with pickup?',
      type: 'text',
      timestamp: Date.now() - 1800000,
      status: 'delivered'
    }
  ]
};

export function AdminChatInterface() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'urgent'>('all');
  const [showUserDetails, setShowUserDetails] = useState(false);

  const currentConversation = selectedConversation 
    ? mockConversations.find(c => c.id === selectedConversation)
    : null;
  
  const currentMessages = selectedConversation 
    ? mockMessages[selectedConversation] || []
    : [];

  const handleSendMessage = (message: string) => {
    if (!selectedConversation) return;
    
    // Here you would typically send the message to your backend
    console.log('Sending message:', message, 'to conversation:', selectedConversation);
    
    // For demo purposes, add the message to the mock data
    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId: selectedConversation,
      senderId: 'admin',
      content: message,
      type: 'text',
      timestamp: Date.now(),
      status: 'sent'
    };
    
    // Update the messages (in a real app, this would be handled by state management)
    if (mockMessages[selectedConversation]) {
      mockMessages[selectedConversation].push(newMessage);
    }
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-900">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Search and Filter */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2 mb-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
            </div>
            <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <FunnelIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <div className="flex space-x-1">
            {(['all', 'unread', 'urgent'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`px-3 py-1 text-sm rounded-md capitalize ${
                  filterType === filter
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <ConversationList
          conversations={mockConversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          searchQuery={searchQuery}
          filterType={filterType}
        />
      </div>

      {/* Chat Area */}
      <ChatArea
        conversation={currentConversation || null}
        messages={currentMessages}
        onSendMessage={handleSendMessage}
        onShowUserDetails={() => setShowUserDetails(!showUserDetails)}
      />

      {/* User Details Sidebar */}
      {currentConversation && (
        <UserDetailsSidebar
          conversation={currentConversation}
          isVisible={showUserDetails}
          onClose={() => setShowUserDetails(false)}
        />
      )}
    </div>
  );
}
