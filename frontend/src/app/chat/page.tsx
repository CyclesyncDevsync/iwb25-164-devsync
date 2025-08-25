'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { ChatSidebar } from '../../components/chat/ChatSidebar';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { ChatSettings } from '../../components/chat/ChatSettings';
import { ChatHeader } from '../../components/chat/ChatHeader';
import { NewConversationModal } from '../../components/chat/NewConversationModal';
import { FileShareModal } from '../../components/chat/FileShareModal';
import { QuickActionsModal } from '../../components/chat/QuickActionsModal';
import { chatWebSocketService } from '../../services/chatWebSocket';
import { setConnectionStatus, fetchConversations } from '../../store/slices/chatSlice';
import { motion, AnimatePresence } from 'framer-motion';
import '../../lib/i18n';

export default function ChatPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { currentConversationId, connectionStatus } = useSelector((state: RootState) => state.chat);
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showFileShare, setShowFileShare] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [conversationType, setConversationType] = useState<'conversation' | 'room'>('conversation');

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setShowSidebar(window.innerWidth >= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (user?.id && token) {
      dispatch(setConnectionStatus('connecting'));

      try {
        chatWebSocketService.connect(user.id, user.role, token);
        
        // Setup WebSocket event listeners
        chatWebSocketService.onNewMessage((_message) => {
          // Handle new message in Redux
        });

        chatWebSocketService.onTypingStatusChanged((_status) => {
          // Handle typing status in Redux
        });

        chatWebSocketService.onUserOnlineStatusChanged((_userId, _isOnline) => {
          // Handle user online status in Redux
        });

        dispatch(setConnectionStatus('connected'));
        dispatch(fetchConversations());
      } catch (error) {
        console.error('Failed to connect to chat service:', error);
        dispatch(setConnectionStatus('error'));
      }
    }

    return () => {
      chatWebSocketService.disconnect();
    };
  }, [user, token, dispatch]);

  const handleSidebarToggle = () => {
    setShowSidebar(!showSidebar);
  };

  const handleConversationSelect = () => {
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleStartChatting = (type: 'conversation' | 'room') => {
    setConversationType(type);
    setShowNewConversation(true);
  };

  const handleFileShare = () => {
    setShowFileShare(true);
  };

  const handleQuickActions = () => {
    setShowQuickActions(true);
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Disconnected';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Chat Header with enhanced styling */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10"
      >
        <ChatHeader
          onToggleSidebar={handleSidebarToggle}
          onOpenSettings={() => setShowSettings(true)}
          showSidebar={showSidebar}
          isMobile={isMobile}
        />
      </motion.div>

      {/* Enhanced Connection Status Bar */}
      <AnimatePresence>
        {connectionStatus !== 'connected' && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`relative overflow-hidden px-4 py-3 text-white text-sm font-medium flex items-center justify-center space-x-3 ${
              connectionStatus === 'error' 
                ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-500' 
                : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500'
            }`}
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-20">
              <motion.div
                className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
            
            {/* Status indicator with pulse */}
            <motion.div 
              className={`w-3 h-3 rounded-full ${getConnectionStatusColor()} relative`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className={`absolute inset-0 rounded-full ${getConnectionStatusColor()} opacity-30 animate-ping`} />
            </motion.div>
            
            <span className="relative z-10 font-semibold">{getConnectionStatusText()}</span>
            
            {connectionStatus === 'connecting' && (
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Layout with enhanced design */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 dark:bg-blue-900 rounded-full opacity-10 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200 dark:bg-purple-900 rounded-full opacity-10 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-green-200 dark:bg-green-900 rounded-full opacity-10 blur-2xl" />
        </div>

        {/* Enhanced Sidebar */}
        <AnimatePresence mode="wait">
          {showSidebar && (
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`${
                isMobile ? 'absolute inset-y-0 left-0 z-50' : 'relative'
              } w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col shadow-2xl`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent dark:from-gray-800/50 dark:to-transparent pointer-events-none" />
              <div className="relative z-10 h-full">
                <ChatSidebar onConversationSelect={handleConversationSelect} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Mobile Overlay */}
        {isMobile && showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Enhanced Chat Window */}
        <div className="flex-1 flex flex-col relative">
          {currentConversationId ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="h-full"
            >
              <ChatWindow conversationId={currentConversationId} />
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50/50 via-white/30 to-gray-100/50 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50 backdrop-blur-sm"
            >
              <div className="text-center space-y-6 max-w-md mx-auto px-6">
                {/* Enhanced empty state icon */}
                <motion.div 
                  className="relative mx-auto"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center shadow-lg border border-white/20 dark:border-gray-700/20">
                    <svg
                      className="w-12 h-12 text-blue-500 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  {/* Floating circles */}
                  <motion.div 
                    className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full opacity-70"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                  <motion.div 
                    className="absolute -bottom-1 -left-2 w-3 h-3 bg-purple-400 rounded-full opacity-70"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  />
                </motion.div>

                {/* Enhanced empty state content */}
                <div className="space-y-3">
                  <motion.h3 
                    className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Welcome to {t('chat.title') || 'CircularSync Chat'}
                  </motion.h3>
                  <motion.p 
                    className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Select a conversation to start messaging and collaborate with your team
                  </motion.p>
                </div>

                {/* Quick action suggestions */}
                <motion.div 
                  className="flex flex-wrap gap-3 justify-center pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <button 
                    className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
                    onClick={() => handleStartChatting('conversation')}
                  >
                    💬 Start Chatting
                  </button>
                  <button 
                    className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm font-medium border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer"
                    onClick={handleFileShare}
                  >
                    📁 Share Files
                  </button>
                  <button 
                    className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer"
                    onClick={handleQuickActions}
                  >
                    🎯 Quick Actions
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showSettings && (
          <ChatSettings
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
        
        {showNewConversation && (
          <NewConversationModal
            isOpen={showNewConversation}
            onClose={() => setShowNewConversation(false)}
            type={conversationType}
          />
        )}
        
        {showFileShare && (
          <FileShareModal
            isOpen={showFileShare}
            onClose={() => setShowFileShare(false)}
          />
        )}
        
        {showQuickActions && (
          <QuickActionsModal
            isOpen={showQuickActions}
            onClose={() => setShowQuickActions(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
