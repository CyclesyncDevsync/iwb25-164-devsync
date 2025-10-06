'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Minimize2, Maximize2, Bot } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface ChatBotProps {
  className?: string;
}

export default function ChatBot({ className = '' }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      wsRef.current = new WebSocket('ws://localhost:8083/chat');
      
      wsRef.current.onopen = () => {
        console.log('✅ Connected to chatbot service');
        setIsConnected(true);
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleServerMessage(data);
      };
      
      wsRef.current.onerror = () => {
        // Silently handle WebSocket errors - chatbot service may not be running
        // This is expected if the chatbot backend is not started
        setIsConnected(false);
      };
      
      wsRef.current.onclose = () => {
        console.log('⚠️ Chatbot service disconnected (backend may not be running)');
        setIsConnected(false);
        wsRef.current = null;
      };
    } catch (error) {
      // Silently handle connection errors - chatbot is optional
      setIsConnected(false);
    }
  };

  const handleServerMessage = (data: any) => {
    switch (data.type) {
      case 'connection':
        setSessionId(data.sessionId);
        if (data.message) {
          addBotMessage(data.message);
        }
        // Set initial quick replies
        setSuggestions([
          "What is CircularSync?",
          "What waste types do you accept?",
          "How does it work?",
          "What are your fees?",
          "How to register?"
        ]);
        break;
        
      case 'bot_response':
        setIsTyping(false);
        addBotMessage(data.content, data.suggestions || []);
        // Update suggestions
        setSuggestions(data.suggestions || []);
        break;
        
      case 'typing':
        setIsTyping(data.status === 'start');
        break;
        
      case 'error':
        setIsTyping(false);
        addBotMessage(`Error: ${data.message}`);
        break;
    }
  };

  const addBotMessage = (content: string, suggestions: string[] = []) => {
    const newMessage: Message = {
      id: `bot-${Date.now()}`,
      type: 'bot',
      content,
      timestamp: new Date(),
      suggestions
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
    
    // Send message to server
    const messageData = {
      type: 'user_message',
      content: textToSend,
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    };
    
    wsRef.current.send(JSON.stringify(messageData));
    setInputMessage('');
    setSuggestions([]); // Clear suggestions when sending a message
    setIsTyping(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-600 hover:from-emerald-700 hover:to-emerald-800 dark:hover:from-emerald-600 dark:hover:to-emerald-700 text-white rounded-full p-4 shadow-xl shadow-emerald-500/30 dark:shadow-emerald-400/20 transition-all duration-300 hover:scale-110 hover:shadow-2xl backdrop-blur-sm border border-emerald-500/20"
          aria-label="Open chat"
        >
          <Bot size={24} />
        </button>
      </div>
    );
  }

  return (
  <div className={`fixed bottom-4 right-4 w-96 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-emerald-100 dark:border-slate-700 rounded-xl shadow-2xl shadow-emerald-500/10 dark:shadow-emerald-400/5 flex flex-col ${isMinimized ? 'h-14' : 'h-[600px]'} transition-all duration-300 z-40 ${className}`}>
      {/* Header */}
  <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-600 text-white p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <h3 className="font-semibold">CircularSync Assistant</h3>
          {isConnected && <span className="w-2 h-2 bg-green-400 rounded-full"></span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-emerald-700/50 dark:hover:bg-emerald-600/50 p-2 rounded-lg transition-all duration-200 hover:scale-105"
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-emerald-700/50 dark:hover:bg-emerald-600/50 p-2 rounded-lg transition-all duration-200 hover:scale-105"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <Bot size={48} className="mx-auto mb-4 text-emerald-400 dark:text-emerald-500" />
                <p className="font-medium text-gray-700 dark:text-gray-300">Welcome to CircularSync!</p>
                <p className="text-sm mt-2">Ask me about:</p>
                <div className="mt-4 text-left max-w-xs mx-auto space-y-2 text-sm">
                  <p>• Platform features & how it works</p>
                  <p>• Waste types we accept</p>
                  <p>• Pricing & fees</p>
                  <p>• Registration & getting started</p>
                  <p>• Quality assessment & auctions</p>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-xl shadow-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-emerald-500/20'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 shadow-gray-200/50 dark:shadow-slate-800/50'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-slate-700 p-4 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-slate-800/50">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Suggestions */}
          {suggestions.length > 0 && (
            <div className="border-t border-gray-100 dark:border-slate-600 p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">Quick replies:</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-2 text-sm bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-700 transition-all duration-200 hover:scale-105 shadow-sm"
                    disabled={!isConnected}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-100 dark:border-slate-600 p-4 bg-gray-50/50 dark:bg-slate-800/50 rounded-b-xl">
            {!isConnected && (
              <div className="text-center text-red-500 dark:text-red-400 text-sm mb-3 font-medium">
                Connecting to assistant...
              </div>
            )}
            
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={!isConnected}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 disabled:bg-gray-100 dark:disabled:bg-slate-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm transition-all duration-200"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!isConnected || !inputMessage.trim()}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-slate-600 dark:disabled:to-slate-700 text-white p-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-emerald-500/20 disabled:shadow-none"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}