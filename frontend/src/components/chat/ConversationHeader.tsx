'use client';

import React from 'react';
import { Conversation } from '../../services/chatWebSocket';
import {
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon,
  UserIcon,
  UsersIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface ConversationHeaderProps {
  conversation: Conversation;
  onToggleTranslation: () => void;
  showTranslation: boolean;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  onToggleTranslation,
  showTranslation,
}) => {

  const getOnlineParticipants = () => {
    return conversation.participants.filter(p => p.isOnline);
  };

  const renderParticipantInfo = () => {
    if (conversation.type === 'direct') {
      const otherParticipant = conversation.participants.find(p => p.id !== 'current-user');
      if (!otherParticipant) return null;

      return (
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              {otherParticipant.avatar ? (
                <img
                  src={otherParticipant.avatar}
                  alt={otherParticipant.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
              otherParticipant.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {otherParticipant.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {otherParticipant.isOnline 
                ? 'Online' 
                : otherParticipant.lastSeen 
                  ? `Last seen ${otherParticipant.lastSeen}`
                  : 'Offline'
              }
            </p>
          </div>
        </div>
      );
    } else {
      const onlineCount = getOnlineParticipants().length;
      
      return (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {conversation.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {conversation.participants.length} members, {onlineCount} online
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Participant Info */}
        {renderParticipantInfo()}

        {/* Right: Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Translation Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleTranslation}
            className={`p-2 rounded-full transition-colors ${
              showTranslation
                ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700'
            }`}
            title="Toggle translation"
          >
            <LanguageIcon className="w-5 h-5" />
          </motion.button>

          {/* Video Call (for direct conversations) */}
          {conversation.type === 'direct' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              title="Video call"
            >
              <VideoCameraIcon className="w-5 h-5" />
            </motion.button>
          )}

          {/* Audio Call (for direct conversations) */}
          {conversation.type === 'direct' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              title="Voice call"
            >
              <PhoneIcon className="w-5 h-5" />
            </motion.button>
          )}

          {/* Conversation Info */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            title="Conversation info"
          >
            <InformationCircleIcon className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
