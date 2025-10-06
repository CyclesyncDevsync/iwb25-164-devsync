'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatMessage } from '../../services/chatWebSocket';
import { chatWebSocketService } from '../../services/chatWebSocket';
import {
  EllipsisVerticalIcon,
  ArrowUturnLeftIcon,
  ForwardIcon,
  FlagIcon,
  TrashIcon,
  LanguageIcon,
  DocumentDuplicateIcon,
  MapPinIcon,
  DocumentIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface MessageProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  isGrouped: boolean;
  isSelected: boolean;
  onSelect: () => void;
  showTranslation?: boolean;
  targetLanguage?: string;
}

export const Message: React.FC<MessageProps> = ({
  message,
  isOwnMessage,
  isGrouped,
  isSelected,
  onSelect,
  showTranslation = false,
  targetLanguage = 'en',
}) => {
  const { t } = useTranslation();
  
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const handleTranslate = async () => {
    if (isTranslated) {
      setIsTranslated(false);
      return;
    }

    setIsTranslating(true);
    try {
      const result = await chatWebSocketService.translateMessage(message.id, targetLanguage);
      setTranslatedText(result.translatedText);
      setIsTranslated(true);
    } catch (error) {
      console.error('Translation failed:', error);
      // Show error toast
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    // Show success toast
  };

  const handleReplyToMessage = () => {
    // Implementation for replying to message
    console.log('Reply to message:', message.id);
  };

  const handleForwardMessage = () => {
    // Implementation for forwarding message
    console.log('Forward message:', message.id);
  };

  const handleFlagMessage = () => {
    chatWebSocketService.flagMessage(message.id, 'inappropriate');
    // Show success toast
  };

  const handleDeleteMessage = () => {
    chatWebSocketService.deleteMessage(message.id);
    // Show success toast
  };

  const toggleVoicePlayback = () => {
    setIsPlayingVoice(!isPlayingVoice);
    // Implementation for voice playback
  };

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return (
          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
        );
      case 'sent':
        return (
          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'delivered':
        return (
          <div className="flex">
            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-3 h-3 text-gray-400 -ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'read':
        return (
          <div className="flex">
            <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-3 h-3 text-emerald-500 -ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'failed':
        return (
          <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <div className="space-y-1">
            <p className="text-sm break-words whitespace-pre-wrap">
              {isTranslated ? translatedText : message.content}
            </p>
            {isTranslated && (
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                {t('chat.translatedFrom')} {message.metadata?.translated?.from || 'auto'}
              </p>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex-shrink-0">
              <DocumentIcon className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {message.metadata?.fileName || 'Unknown file'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {message.metadata?.fileSize ? 
                  `${(message.metadata.fileSize / 1024 / 1024).toFixed(2)} MB` : 
                  'Unknown size'
                }
              </p>
            </div>
            <a
              href={message.metadata?.fileUrl}
              download={message.metadata?.fileName}
              className="flex-shrink-0 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              Download
            </a>
          </div>
        );

      case 'voice':
        return (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <button
              onClick={toggleVoicePlayback}
              className="flex-shrink-0 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors"
            >
              {isPlayingVoice ? (
                <PauseIcon className="w-4 h-4" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )}
            </button>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center px-2">
                <div className="w-full h-1 bg-gray-300 dark:bg-gray-500 rounded-full">
                  <div className="h-1 bg-emerald-600 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {message.metadata?.voiceDuration?.toFixed(1) || '0.0'}s
            </span>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
              <MapPinIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Location shared</span>
            </div>
            {message.metadata?.location?.address && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {message.metadata.location.address}
              </p>
            )}
            <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                Map view would be here
              </span>
            </div>
          </div>
        );

      default:
        return (
          <p className="text-sm break-words">
            {message.content}
          </p>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-1' : 'mt-4'}`}
    >
      <div className={`flex max-w-xs lg:max-w-md xl:max-w-lg ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} group`}>
        {/* Avatar */}
        {!isOwnMessage && !isGrouped && (
          <div className="flex-shrink-0 mr-3">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {message.senderName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Spacer for grouped messages */}
        {!isOwnMessage && isGrouped && (
          <div className="w-8 mr-3" />
        )}

        {/* Message bubble */}
        <div className="flex flex-col">
          {/* Sender name (for non-own, non-grouped messages) */}
          {!isOwnMessage && !isGrouped && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-3">
              {message.senderName}
            </span>
          )}

          {/* Message content */}
          <div
            className={`relative px-4 py-2 rounded-2xl ${
              isOwnMessage
                ? 'bg-emerald-600 text-white rounded-br-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
            } ${isSelected ? 'ring-2 ring-emerald-500' : ''} ${
              message.metadata?.flagged ? 'ring-2 ring-red-500' : ''
            }`}
            onClick={onSelect}
          >
            {renderMessageContent()}

            {/* Message actions */}
            <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity`}>
              <Menu as="div" className="relative">
                <Menu.Button className="p-1 rounded-full bg-white dark:bg-gray-800 shadow-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <EllipsisVerticalIcon className="w-4 h-4" />
                </Menu.Button>
                
                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute z-10 mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleReplyToMessage}
                            className={`${active ? 'bg-gray-100 dark:bg-gray-600' : ''} flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 w-full text-left`}
                          >
                            <ArrowUturnLeftIcon className="w-4 h-4" />
                            <span>{t('chat.message.reply') || 'Reply'}</span>
                          </button>
                        )}
                      </Menu.Item>
                      
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleForwardMessage}
                            className={`${active ? 'bg-gray-100 dark:bg-gray-600' : ''} flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 w-full text-left`}
                          >
                            <ForwardIcon className="w-4 h-4" />
                            <span>{t('chat.message.forward') || 'Forward'}</span>
                          </button>
                        )}
                      </Menu.Item>
                      
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleCopyMessage}
                            className={`${active ? 'bg-gray-100 dark:bg-gray-600' : ''} flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 w-full text-left`}
                          >
                            <DocumentDuplicateIcon className="w-4 h-4" />
                            <span>{t('chat.message.copy') || 'Copy'}</span>
                          </button>
                        )}
                      </Menu.Item>

                      {message.type === 'text' && (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleTranslate}
                              disabled={isTranslating}
                              className={`${active ? 'bg-gray-100 dark:bg-gray-600' : ''} flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 w-full text-left disabled:opacity-50`}
                            >
                              <LanguageIcon className="w-4 h-4" />
                              <span>
                                {isTranslating 
                                  ? 'Translating...' 
                                  : isTranslated 
                                    ? 'Show original' 
                                    : t('chat.message.translate') || 'Translate'
                                }
                              </span>
                            </button>
                          )}
                        </Menu.Item>
                      )}
                      
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleFlagMessage}
                            className={`${active ? 'bg-gray-100 dark:bg-gray-600' : ''} flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 w-full text-left`}
                          >
                            <FlagIcon className="w-4 h-4" />
                            <span>{t('chat.message.flag') || 'Flag'}</span>
                          </button>
                        )}
                      </Menu.Item>
                      
                      {isOwnMessage && (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleDeleteMessage}
                              className={`${active ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : ''} flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 w-full text-left`}
                            >
                              <TrashIcon className="w-4 h-4" />
                              <span>{t('chat.message.delete') || 'Delete'}</span>
                            </button>
                          )}
                        </Menu.Item>
                      )}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>

          {/* Timestamp and status */}
          <div className={`flex items-center space-x-1 mt-1 px-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(message.timestamp)}
            </span>
            {isOwnMessage && (
              <div className="flex items-center">
                {getStatusIcon()}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
