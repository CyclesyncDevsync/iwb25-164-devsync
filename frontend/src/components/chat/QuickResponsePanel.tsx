'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftEllipsisIcon,
  XMarkIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

interface QuickResponse {
  id: string;
  text: string;
  category: string;
}

interface QuickResponsePanelProps {
  onSendResponse: (text: string) => void;
  onCancel: () => void;
  isOpen: boolean;
  userRole?: string;
}

export const QuickResponsePanel: React.FC<QuickResponsePanelProps> = ({
  onSendResponse,
  onCancel,
  isOpen,
  userRole = 'buyer',
}) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('greeting');
  const [customText, setCustomText] = useState('');

  // Role-based quick responses
  const getQuickResponses = (): Record<string, QuickResponse[]> => {
    const commonResponses = {
      greeting: [
        { id: '1', text: t('chat.quickResponse.hello') || 'Hello! How can I help you?', category: 'greeting' },
        { id: '2', text: t('chat.quickResponse.goodMorning') || 'Good morning!', category: 'greeting' },
        { id: '3', text: t('chat.quickResponse.goodAfternoon') || 'Good afternoon!', category: 'greeting' },
        { id: '4', text: t('chat.quickResponse.goodEvening') || 'Good evening!', category: 'greeting' },
      ],
      confirmation: [
        { id: '5', text: t('chat.quickResponse.understood') || 'Understood', category: 'confirmation' },
        { id: '6', text: t('chat.quickResponse.confirmed') || 'Confirmed', category: 'confirmation' },
        { id: '7', text: t('chat.quickResponse.agreed') || 'Agreed', category: 'confirmation' },
        { id: '8', text: t('chat.quickResponse.noted') || 'Noted', category: 'confirmation' },
      ],
      closure: [
        { id: '9', text: t('chat.quickResponse.thankYou') || 'Thank you!', category: 'closure' },
        { id: '10', text: t('chat.quickResponse.youreWelcome') || "You're welcome!", category: 'closure' },
        { id: '11', text: t('chat.quickResponse.goodBye') || 'Goodbye!', category: 'closure' },
        { id: '12', text: t('chat.quickResponse.talkSoon') || 'Talk to you soon!', category: 'closure' },
      ],
    };

    if (userRole === 'supplier') {
      return {
        ...commonResponses,
        business: [
          { id: '13', text: t('chat.quickResponse.available') || 'Available for delivery', category: 'business' },
          { id: '14', text: t('chat.quickResponse.qualityGuaranteed') || 'Quality guaranteed', category: 'business' },
          { id: '15', text: t('chat.quickResponse.priceNegotiable') || 'Price is negotiable', category: 'business' },
          { id: '16', text: t('chat.quickResponse.fastDelivery') || 'Fast delivery available', category: 'business' },
        ],
        pricing: [
          { id: '17', text: t('chat.quickResponse.competitivePrice') || 'Competitive pricing', category: 'pricing' },
          { id: '18', text: t('chat.quickResponse.bulkDiscount') || 'Bulk discount available', category: 'pricing' },
          { id: '19', text: t('chat.quickResponse.quotationReady') || 'Quotation ready', category: 'pricing' },
          { id: '20', text: t('chat.quickResponse.priceInclusive') || 'Price includes delivery', category: 'pricing' },
        ],
      };
    } else if (userRole === 'buyer') {
      return {
        ...commonResponses,
        inquiry: [
          { id: '21', text: t('chat.quickResponse.interested') || 'Interested in your offer', category: 'inquiry' },
          { id: '22', text: t('chat.quickResponse.moreInfo') || 'Can you provide more information?', category: 'inquiry' },
          { id: '23', text: t('chat.quickResponse.specifications') || 'What are the specifications?', category: 'inquiry' },
          { id: '24', text: t('chat.quickResponse.samples') || 'Can I get samples?', category: 'inquiry' },
        ],
        logistics: [
          { id: '25', text: t('chat.quickResponse.deliveryTime') || 'What is the delivery time?', category: 'logistics' },
          { id: '26', text: t('chat.quickResponse.deliveryLocation') || 'Can you deliver to my location?', category: 'logistics' },
          { id: '27', text: t('chat.quickResponse.pickupOption') || 'Is pickup available?', category: 'logistics' },
          { id: '28', text: t('chat.quickResponse.urgentOrder') || 'This is an urgent order', category: 'logistics' },
        ],
      };
    } else if (userRole === 'admin') {
      return {
        ...commonResponses,
        support: [
          { id: '29', text: t('chat.quickResponse.investigating') || 'Investigating your issue', category: 'support' },
          { id: '30', text: t('chat.quickResponse.updateSoon') || 'Will update you soon', category: 'support' },
          { id: '31', text: t('chat.quickResponse.escalated') || 'Issue has been escalated', category: 'support' },
          { id: '32', text: t('chat.quickResponse.resolved') || 'Issue has been resolved', category: 'support' },
        ],
        moderation: [
          { id: '33', text: t('chat.quickResponse.warningIssued') || 'Warning issued', category: 'moderation' },
          { id: '34', text: t('chat.quickResponse.reviewingContent') || 'Reviewing content', category: 'moderation' },
          { id: '35', text: t('chat.quickResponse.violationFound') || 'Violation found', category: 'moderation' },
          { id: '36', text: t('chat.quickResponse.accountSuspended') || 'Account suspended', category: 'moderation' },
        ],
      };
    }

    return commonResponses;
  };

  const responses = getQuickResponses();
  const categories = Object.keys(responses);

  const handleSendQuickResponse = (text: string) => {
    onSendResponse(text);
    onCancel();
  };

  const handleSendCustom = () => {
    if (customText.trim()) {
      onSendResponse(customText.trim());
      setCustomText('');
      onCancel();
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryNames: Record<string, string> = {
      greeting: t('chat.category.greeting') || 'Greeting',
      confirmation: t('chat.category.confirmation') || 'Confirmation',
      closure: t('chat.category.closure') || 'Closure',
      business: t('chat.category.business') || 'Business',
      pricing: t('chat.category.pricing') || 'Pricing',
      inquiry: t('chat.category.inquiry') || 'Inquiry',
      logistics: t('chat.category.logistics') || 'Logistics',
      support: t('chat.category.support') || 'Support',
      moderation: t('chat.category.moderation') || 'Moderation',
    };
    return categoryNames[category] || category;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 mb-2 max-h-96 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {t('chat.quickResponses') || 'Quick Responses'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-200 dark:border-gray-700">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${
                  selectedCategory === category
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {getCategoryDisplayName(category)}
              </button>
            ))}
          </div>

          {/* Quick Response Buttons */}
          <div className="max-h-48 overflow-y-auto mb-4">
            <div className="grid grid-cols-1 gap-2">
              {responses[selectedCategory]?.map((response) => (
                <motion.button
                  key={response.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSendQuickResponse(response.text)}
                  className="p-3 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <div className="flex items-start space-x-2">
                    <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {response.text}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom Response */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('chat.customResponse') || 'Custom Response'}
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendCustom()}
                placeholder={t('chat.typeCustomResponse') || 'Type a custom response...'}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendCustom}
                disabled={!customText.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
