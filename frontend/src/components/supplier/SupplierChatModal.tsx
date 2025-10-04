'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PhotoIcon,
  MapPinIcon,
  CheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  message_id: string;
  room_id: string;
  sender_id: string;
  sender_type: 'agent' | 'supplier' | 'system';
  message_type: 'text' | 'image' | 'file' | 'location' | 'voice';
  content: string;
  file_url?: string;
  location?: any;
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
  delivered_at?: string;
  read_at?: string;
}

interface SupplierChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  agentName: string;
  agentId: string;
  materialTitle: string;
  materialId: string;
}

export function SupplierChatModal({
  isOpen,
  onClose,
  roomId,
  agentName,
  agentId,
  materialTitle,
  materialId
}: SupplierChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch messages
  const fetchMessages = async () => {
    if (!roomId) return;

    try {
      const authResponse = await fetch('/api/auth/me');
      if (!authResponse.ok) return;
      
      const authData = await authResponse.json();
      const idToken = authData.idToken;
      
      const response = await fetch(`/backend/chat/messages/${roomId}?limit=100`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        markMessagesAsRead();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async () => {
    try {
      const authResponse = await fetch('/api/auth/me');
      if (!authResponse.ok) return;
      
      const authData = await authResponse.json();
      const idToken = authData.idToken;
      
      await fetch('/backend/chat/messages/read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          room_id: roomId,
          reader_id: authData.user?.asgardeoId || authData.userId || authData.sub || user?.sub
        })
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !roomId || isSending) return;
    
    setIsSending(true);
    const messageContent = newMessage;
    setNewMessage('');

    try {
      const authResponse = await fetch('/api/auth/me');
      if (!authResponse.ok) return;
      
      const authData = await authResponse.json();
      const idToken = authData.idToken;
      
      const response = await fetch('/backend/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          room_id: roomId,
          sender_id: authData.user?.asgardeoId || authData.userId || authData.sub || user?.sub,
          sender_type: 'supplier',
          message: {
            content: messageContent,
            message_type: 'text'
          }
        })
      });

      if (response.ok) {
        // Immediately fetch updated messages
        await fetchMessages();
      } else {
        const errorData = await response.text();
        console.error('Failed to send message:', response.status, errorData);
        // Restore message on error
        setNewMessage(messageContent);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize and start polling when modal opens
  useEffect(() => {
    if (isOpen && roomId) {
      setIsLoading(true);
      fetchMessages().finally(() => setIsLoading(false));
      
      // Start polling for new messages
      pollingInterval.current = setInterval(() => {
        fetchMessages();
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
  }, [isOpen, roomId]);

  if (!isOpen) return null;

  const getMessageStatusIcon = (message: Message) => {
    if (message.sender_type !== 'supplier') return null;
    
    if (message.status === 'read') {
      return <CheckCircleIcon className="w-4 h-4 text-blue-500" />;
    } else if (message.status === 'delivered') {
      return (
        <div className="flex">
          <CheckIcon className="w-4 h-4 text-gray-400" />
          <CheckIcon className="w-4 h-4 text-gray-400 -ml-2" />
        </div>
      );
    } else {
      return <CheckIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      // Parse timestamp and ensure it's treated as UTC
      const date = timestamp.includes('Z') || timestamp.includes('+') 
        ? new Date(timestamp) 
        : new Date(timestamp + 'Z');
      return formatInTimeZone(date, 'Asia/Colombo', 'hh:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Chat with {agentName}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {materialTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Start a conversation with the agent</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.message_id}
                  className={`flex ${
                    message.sender_type === 'supplier' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className={`max-w-[70%] ${
                    message.sender_type === 'supplier' ? 'order-2' : ''
                  }`}>
                    <div className={`rounded-2xl px-4 py-2 ${
                      message.sender_type === 'supplier'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className={`flex items-center gap-2 mt-1 ${
                      message.sender_type === 'supplier' ? 'justify-end' : ''
                    }`}>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatMessageTime(message.created_at)}
                      </span>
                      {getMessageStatusIcon(message)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Attach file"
              >
                <PaperClipIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Send photo"
              >
                <PhotoIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Send location"
              >
                <MapPinIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <PaperAirplaneIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}