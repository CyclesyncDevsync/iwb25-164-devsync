'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { RootState } from '../../store';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { ConversationHeader } from './ConversationHeader';
import { VoiceRecorder } from './VoiceRecorder';
import { FileUpload } from './FileUpload';
import { LocationPicker } from './LocationPicker';
import { QuickResponsePanel } from './QuickResponsePanel';
import { TranslationPanel } from './TranslationPanel';
import {
  addMessage,
  fetchMessages,
} from '../../store/slices/chatSlice';
import { chatWebSocketService } from '../../services/chatWebSocket';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaperAirplaneIcon,
  MicrophoneIcon,
  PaperClipIcon,
  MapPinIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline';

interface ChatWindowProps {
  conversationId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { messages, conversations, typingStatuses, selectedLanguage } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [messageText, setMessageText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  // Emoji picker not yet implemented in this component
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const currentConversation = conversations.find(c => c.id === conversationId);
  const conversationMessages = useMemo(() => messages[conversationId] || [], [messages, conversationId]);
  const conversationTyping = typingStatuses.filter(t => t.conversationId === conversationId);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
  // dispatching async thunk
  dispatch(fetchMessages({ conversationId }));
    }
  }, [conversationId, dispatch]);

  // Handle typing indicators
  useEffect(() => {
    if (messageText.trim() && conversationId) {
      chatWebSocketService.startTyping(conversationId);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        chatWebSocketService.stopTyping(conversationId);
      }, 3000);
    } else if (conversationId) {
      chatWebSocketService.stopTyping(conversationId);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageText, conversationId]);

  const mapUserRoleToChatRole = (role?: string): 'admin' | 'agent' | 'supplier' | 'buyer' => {
    if (!role) return 'agent';
    const r = role.toLowerCase();
    if (r.includes('admin')) return 'admin';
    if (r.includes('agent')) return 'agent';
    if (r.includes('supplier')) return 'supplier';
    if (r.includes('buyer')) return 'buyer';
    return 'agent';
  };

  const handleSendMessage = async (
    content: string,
    type: 'text' | 'file' | 'voice' | 'location' = 'text',
    metadata?: Record<string, unknown>
  ) => {
    if (!content.trim() && type === 'text') return;
    if (!user?.id || !conversationId) return;

    try {
      const senderIdStr = user ? String(user.id) : 'unknown';
      const senderName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || user.asgardeoId || senderIdStr : 'Unknown User';
      const senderRole = mapUserRoleToChatRole(user?.role as unknown as string);

      const message = await chatWebSocketService.sendMessage({
        conversationId,
        senderId: senderIdStr,
        senderName,
        senderRole,
        content,
        type,
        metadata,
      });

      dispatch(addMessage(message));
      
      if (type === 'text') {
        setMessageText('');
        inputRef.current?.focus();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error toast
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(messageText);
    }
  };

  const handleVoiceRecording = (audioBlob: Blob, duration: number) => {
    // Convert blob to base64 or upload to server
    // For now, we'll simulate sending a voice message
    const voiceMessage = `Voice message (${duration.toFixed(1)}s)`;
    handleSendMessage(voiceMessage, 'voice', {
      voiceDuration: duration,
      // In real implementation, this would be the audio file URL
      fileUrl: URL.createObjectURL(audioBlob),
    });
  };

  const handleFileUpload = async (files: File[] | FileList) => {
    const fileArray: File[] = Array.isArray(files) ? files : Array.from(files as FileList);
    for (const file of fileArray) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        // Show error toast
        continue;
      }

      try {
  const uploadResult = await chatWebSocketService.uploadFile(file, conversationId);

        handleSendMessage(file.name, 'file', {
          fileName: uploadResult.fileName,
          fileSize: uploadResult.fileSize,
          fileType: uploadResult.fileType,
          fileUrl: uploadResult.fileUrl,
        });
      } catch (error) {
        console.error('Failed to upload file:', error);
        // Show error toast
      }
    }
  };

  const handleLocationShare = (location: { latitude: number; longitude: number; address?: string }) => {
    const locationMessage = location.address || `Location: ${location.latitude}, ${location.longitude}`;
    handleSendMessage(locationMessage, 'location', { location });
  };

  const handleQuickResponse = (response: string) => {
    setMessageText(response);
    setShowQuickResponses(false);
    inputRef.current?.focus();
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Conversation not found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              This conversation may have been deleted or you don't have access to it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Conversation Header */}
      <ConversationHeader 
        conversation={currentConversation}
        onToggleTranslation={() => setShowTranslation(!showTranslation)}
        showTranslation={showTranslation}
      />

      {/* Translation Panel */}
      <AnimatePresence>
        {showTranslation && (
          <TranslationPanel
            message={''}
            onClose={() => setShowTranslation(false)}
            isOpen={showTranslation}
            sourceLanguage={selectedLanguage || 'auto'}
          />
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <MessageList
            messages={conversationMessages}
            conversationId={conversationId}
            currentUserId={String(user?.id || '')}
          />
          
          {/* Typing Indicators */}
          {conversationTyping.length > 0 && (
            <TypingIndicator typingUsers={conversationTyping} />
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Responses Panel */}
        <AnimatePresence>
          {showQuickResponses && (
            <QuickResponsePanel
              onSendResponse={handleQuickResponse}
              onCancel={() => setShowQuickResponses(false)}
              isOpen={showQuickResponses}
              userRole={user?.role}
            />
          )}
        </AnimatePresence>

        {/* Message Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="p-4">
            {/* Input Bar */}
            <div className="flex items-end space-x-2">
              {/* Quick Actions */}
              <div className="flex space-x-1">
                {/* File Upload */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowFileUpload(true)}
                  className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                  title="Attach file"
                >
                  <PaperClipIcon className="w-5 h-5" />
                </motion.button>

                {/* Location Share */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowLocationPicker(true)}
                  className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                  title="Share location"
                >
                  <MapPinIcon className="w-5 h-5" />
                </motion.button>

                {/* Quick Responses */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowQuickResponses(!showQuickResponses)}
                  className={`p-2 rounded-full transition-colors ${
                      showQuickResponses
                        ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  title="Quick responses"
                >
                  <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Message Input */}
              <div className="flex-1">
                <MessageInput
                  ref={inputRef}
                  value={messageText}
                  onChange={setMessageText}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isRecording}
                />
              </div>

              {/* Voice Recording / Send Button */}
              <div className="flex space-x-1">
                {messageText.trim() ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSendMessage(messageText)}
                    className="p-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    title="Send"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleRecording}
                    className={`p-2 rounded-full transition-colors ${
                      isRecording
                        ? 'bg-red-600 text-white'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    title="Record voice message"
                  >
                    <MicrophoneIcon className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals and Overlays */}
      <AnimatePresence>
        {isRecording && (
          <VoiceRecorder
            onSendVoiceMessage={handleVoiceRecording}
            onCancel={() => setIsRecording(false)}
            isOpen={isRecording}
          />
        )}

        {showFileUpload && (
          <FileUpload
            onSendFiles={(files, message) => {
              // Normalize FileList to File[]
              const fileArray: File[] = Array.isArray(files) ? files : Array.from(files as FileList);
              handleFileUpload(fileArray);
              if (message) {
                handleSendMessage(message, 'text');
              }
            }}
            onCancel={() => setShowFileUpload(false)}
            isOpen={showFileUpload}
          />
        )}

        {showLocationPicker && (
          <LocationPicker
            onSendLocation={handleLocationShare}
            onCancel={() => setShowLocationPicker(false)}
            isOpen={showLocationPicker}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
