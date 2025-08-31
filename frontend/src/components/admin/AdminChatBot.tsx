'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Minimize2, Maximize2, Bot, ChevronRight, Users, Package, TrendingUp, AlertCircle, FileText, Settings, Shield, DollarSign, UserCheck, BarChart3, MapPin, Gavel } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: AdminAction[];
}

interface AdminAction {
  label: string;
  action: 'navigate' | 'display' | 'execute';
  target?: string;
  data?: any;
  icon?: React.ReactNode;
}

interface AdminChatBotProps {
  className?: string;
}

const ADMIN_QUICK_ACTIONS = [
  { 
    label: "Manage Users", 
    icon: <Users size={16} />, 
    path: "/admin/users",
    description: "View, edit, and manage all platform users"
  },
  { 
    label: "Verify Materials", 
    icon: <MapPin size={16} />, 
    path: "/admin/verification",
    description: "Review pending material submissions with location data"
  },
  { 
    label: "Monitor Auctions", 
    icon: <Gavel size={16} />, 
    path: "/admin/auctions",
    description: "Track active auctions and bidding activity"
  },
  { 
    label: "Resolve Disputes", 
    icon: <AlertCircle size={16} />, 
    path: "/admin/disputes",
    description: "Handle user disputes and conflicts"
  },
  { 
    label: "View Transactions", 
    icon: <DollarSign size={16} />, 
    path: "/admin/transactions",
    description: "Monitor all financial transactions"
  },
  { 
    label: "Manage Agents", 
    icon: <UserCheck size={16} />, 
    path: "/admin/agents",
    description: "Track agent assignments and performance"
  },
  { 
    label: "System Reports", 
    icon: <BarChart3 size={16} />, 
    path: "/admin/reports",
    description: "Generate analytics and performance reports"
  },
  { 
    label: "Admin Settings", 
    icon: <Shield size={16} />, 
    path: "/admin/admin-management",
    description: "Manage admin accounts and permissions"
  }
];

export default function AdminChatBot({ className = '' }: AdminChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect to WebSocket when chat opens
  useEffect(() => {
    if (isOpen && !wsRef.current) {
      connectWebSocket();
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isOpen]);

  const connectWebSocket = () => {
    try {
      wsRef.current = new WebSocket('ws://localhost:8094/chat');
      
      wsRef.current.onopen = () => {
        console.log('Connected to admin chatbot');
        setIsConnected(true);
        // Send initial admin context
        if (wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'context',
            role: 'admin',
            timestamp: new Date().toISOString()
          }));
        }
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleServerMessage(data);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
      
      wsRef.current.onclose = () => {
        console.log('Disconnected from admin chatbot');
        setIsConnected(false);
        wsRef.current = null;
      };
    } catch (error) {
      console.error('Failed to connect:', error);
      setIsConnected(false);
    }
  };

  const handleServerMessage = (data: any) => {
    switch (data.type) {
      case 'connection':
        setSessionId(data.sessionId);
        // Show admin-specific welcome message
        addBotMessage(
          "Welcome Admin! I'm here to help you manage the CircularSync platform. Select an option below or type your question:",
          [],
          ADMIN_QUICK_ACTIONS.map(action => ({
            label: action.label,
            action: 'navigate',
            target: action.path,
            icon: action.icon,
            description: action.description
          }))
        );
        break;
        
      case 'bot_response':
        setIsTyping(false);
        // Parse admin-specific responses
        const actions = parseAdminActions(data.content);
        addBotMessage(data.content, data.suggestions || [], actions);
        break;
        
      case 'typing':
        setIsTyping(data.status === 'start');
        break;
        
      case 'error':
        setIsTyping(false);
        addBotMessage(`Error: ${data.message}`);
        break;
        
      case 'data_response':
        // Handle data display
        setModalData(data.data);
        setShowDataModal(true);
        break;
    }
  };

  const parseAdminActions = (content: string): AdminAction[] => {
    // Parse content for admin-specific actions
    const actions: AdminAction[] = [];
    
    if (content.toLowerCase().includes('user')) {
      actions.push({ label: 'Go to User Management', action: 'navigate', target: '/admin/users' });
    }
    if (content.toLowerCase().includes('material')) {
      actions.push({ label: 'View Materials', action: 'navigate', target: '/admin/materials' });
    }
    if (content.toLowerCase().includes('auction')) {
      actions.push({ label: 'Monitor Auctions', action: 'navigate', target: '/admin/auctions' });
    }
    if (content.toLowerCase().includes('report')) {
      actions.push({ label: 'Generate Report', action: 'navigate', target: '/admin/reports' });
    }
    
    return actions;
  };

  const addBotMessage = (content: string, suggestions: string[] = [], actions: AdminAction[] = []) => {
    const newMessage: Message = {
      id: `bot-${Date.now()}`,
      type: 'bot',
      content,
      timestamp: new Date(),
      suggestions,
      actions
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = (message?: string) => {
    const textToSend = message || inputMessage.trim();
    if (!textToSend || !wsRef.current || !isConnected || !sessionId) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: textToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Send message to server with admin context
    const messageData = {
      type: 'user_message',
      content: textToSend,
      sessionId: sessionId,
      role: 'admin',
      timestamp: new Date().toISOString()
    };
    
    wsRef.current.send(JSON.stringify(messageData));
    setInputMessage('');
    setIsTyping(true);
  };

  const handleActionClick = (action: AdminAction) => {
    switch (action.action) {
      case 'navigate':
        if (action.target) {
          router.push(action.target);
        }
        break;
      case 'display':
        setModalData(action.data);
        setShowDataModal(true);
        break;
      case 'execute':
        // Execute admin command
        sendMessage(`Execute: ${action.label}`);
        break;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-4 right-4 ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 group"
          aria-label="Open admin assistant"
        >
          <Bot size={24} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-2xl flex flex-col ${isMinimized ? 'h-14' : 'h-[600px]'} transition-all ${className}`}>
        {/* Header */}
        <div className="bg-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot size={20} />
            <h3 className="font-semibold">Admin Assistant</h3>
            {isConnected && <span className="w-2 h-2 bg-green-400 rounded-full"></span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-purple-700 p-1 rounded transition-colors"
              aria-label={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-purple-700 p-1 rounded transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <Bot size={48} className="mx-auto mb-4 text-purple-300" />
                  <p className="font-medium">Admin Assistant Ready!</p>
                  <p className="text-sm mt-2">I can help you manage the platform efficiently.</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div key={message.id}>
                  <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleActionClick(action)}
                          className="w-full flex items-start gap-3 px-4 py-3 text-left bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors group border border-purple-200 hover:border-purple-300"
                        >
                          <div className="mt-0.5">{action.icon || <ChevronRight size={16} />}</div>
                          <div className="flex-1">
                            <div className="font-medium">{action.label}</div>
                            {action.description && (
                              <div className="text-xs text-purple-600 mt-0.5">{action.description}</div>
                            )}
                          </div>
                          <ChevronRight size={16} className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              {!isConnected && (
                <div className="text-center text-red-500 text-sm mb-2">
                  Connecting to admin assistant...
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about users, materials, auctions..."
                  disabled={!isConnected}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!isConnected || !inputMessage.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white p-2 rounded-md transition-colors"
                  aria-label="Send message"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Data Modal */}
      {showDataModal && modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Data View</h3>
              <button
                onClick={() => setShowDataModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(modalData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}