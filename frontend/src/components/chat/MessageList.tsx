'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store';
import { ChatMessage } from '../../services/chatWebSocket';
import { Message } from './Message';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';

interface MessageListProps {
  messages: ChatMessage[];
  conversationId: string;
  currentUserId: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  conversationId,
  currentUserId,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { selectedLanguage, autoTranslate } = useSelector((state: RootState) => state.chat);
  
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Group messages by date
  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (isToday(date)) {
      return t('chat.today') || 'Today';
    } else if (isYesterday(date)) {
      return t('chat.yesterday') || 'Yesterday';
    } else if (differenceInDays(today, date) < 7) {
      return format(date, 'EEEE'); // Day of week
    } else {
      return format(date, 'MMM dd, yyyy');
    }
  };

  // Check if messages are consecutive from same sender
  const shouldGroupMessage = (currentMessage: ChatMessage, previousMessage?: ChatMessage) => {
    if (!previousMessage) return false;
    
    const isSameSender = currentMessage.senderId === previousMessage.senderId;
    const timeDiff = new Date(currentMessage.timestamp).getTime() - new Date(previousMessage.timestamp).getTime();
    const isWithinGroupTime = timeDiff < 5 * 60 * 1000; // 5 minutes
    
    return isSameSender && isWithinGroupTime;
  };

  // Handle scroll to check if user should see "scroll to bottom" button
  useEffect(() => {
    const handleScroll = () => {
      if (listRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollToBottom(!isNearBottom && messages.length > 0);
      }
    };

    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
      return () => listElement.removeEventListener('scroll', handleScroll);
    }
  }, [messages.length]);

  // Auto-scroll to bottom on new messages if user is near bottom
  useEffect(() => {
    if (lastMessageRef.current && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.senderId === currentUserId) {
        // Always scroll to bottom for own messages
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
      } else if (listRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        if (isNearBottom) {
          lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [messages, currentUserId]);

  const scrollToBottom = () => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMessageSelect = (messageId: string) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedMessages(new Set());
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('chat.empty') || 'No messages yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Start the conversation by sending a message
            </p>
          </div>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);
  const sortedDates = Object.keys(messageGroups).sort();

  return (
    <div className="relative flex-1">
      {/* Message selection toolbar */}
      <AnimatePresence>
        {selectedMessages.size > 0 && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-0 left-0 right-0 bg-blue-600 text-white p-3 z-10 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">
                {selectedMessages.size} {selectedMessages.size === 1 ? 'message' : 'messages'} selected
              </span>
            </div>
            <button
              onClick={clearSelection}
              className="text-blue-100 hover:text-white text-sm font-medium"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {sortedDates.map((dateKey) => {
          const dateMessages = messageGroups[dateKey];
          
          return (
            <div key={dateKey} className="space-y-2">
              {/* Date separator */}
              <div className="flex items-center justify-center">
                <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {formatDateLabel(dateKey)}
                  </span>
                </div>
              </div>

              {/* Messages for this date */}
              <div className="space-y-1">
                {dateMessages.map((message, index) => {
                  const previousMessage = index > 0 ? dateMessages[index - 1] : undefined;
                  const isGrouped = shouldGroupMessage(message, previousMessage);
                  const isSelected = selectedMessages.has(message.id);
                  const isOwnMessage = message.senderId === currentUserId;

                  return (
                    <Message
                      key={message.id}
                      message={message}
                      isOwnMessage={isOwnMessage}
                      isGrouped={isGrouped}
                      isSelected={isSelected}
                      onSelect={() => handleMessageSelect(message.id)}
                      showTranslation={autoTranslate}
                      targetLanguage={selectedLanguage}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {/* Scroll anchor */}
        <div ref={lastMessageRef} />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollToBottom && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-10"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
