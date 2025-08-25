'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LanguageIcon,
  XMarkIcon,
  ArrowPathIcon,
  SpeakerWaveIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';

interface TranslationPanelProps {
  message: string;
  onClose: () => void;
  isOpen: boolean;
  sourceLanguage?: string;
}

interface Translation {
  language: string;
  text: string;
  confidence: number;
}

export const TranslationPanel: React.FC<TranslationPanelProps> = ({
  message,
  onClose,
  isOpen,
  sourceLanguage = 'auto',
}) => {
  const { t, i18n } = useTranslation();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en', 'si', 'ta']);

  const availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  ];

  useEffect(() => {
    if (isOpen && message.trim()) {
      translateMessage();
    }
  }, [isOpen, message, selectedLanguages]);

  const translateMessage = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Filter out the source language if detected
      const targetLanguages = selectedLanguages.filter(lang => lang !== sourceLanguage);
      
      const translationPromises = targetLanguages.map(async (targetLang) => {
        // Mock translation API call - replace with real translation service
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: message,
            source: sourceLanguage,
            target: targetLang,
          }),
        });

        if (!response.ok) {
          throw new Error(`Translation failed for ${targetLang}`);
        }

        const data = await response.json();
        return {
          language: targetLang,
          text: data.translatedText || message,
          confidence: data.confidence || 0.95,
        };
      });

      const results = await Promise.allSettled(translationPromises);
      const successfulTranslations = results
        .filter((result): result is PromiseFulfilledResult<Translation> => result.status === 'fulfilled')
        .map(result => result.value);

      setTranslations(successfulTranslations);

      // Log any failed translations
      const failedTranslations = results
        .filter(result => result.status === 'rejected')
        .map(result => (result as PromiseRejectedResult).reason);
      
      if (failedTranslations.length > 0) {
        console.warn('Some translations failed:', failedTranslations);
      }
    } catch (error) {
      console.error('Translation error:', error);
      setError('Translation service unavailable. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageToggle = (languageCode: string) => {
    setSelectedLanguages(prev => {
      const isSelected = prev.includes(languageCode);
      if (isSelected) {
        return prev.filter(code => code !== languageCode);
      } else {
        return [...prev, languageCode];
      }
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You might want to show a toast notification here
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const speakText = (text: string, language: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      speechSynthesis.speak(utterance);
    }
  };

  const getLanguageName = (code: string) => {
    const language = availableLanguages.find(lang => lang.code === code);
    return language ? language.nativeName : code.toUpperCase();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
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
            <div className="flex items-center space-x-2">
              <LanguageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {t('chat.translations') || 'Translations'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Original Message */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('chat.originalMessage') || 'Original Message'}
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => speakText(message, sourceLanguage)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                >
                  <SpeakerWaveIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => copyToClipboard(message)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-900 dark:text-white">{message}</p>
          </div>

          {/* Language Selection */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
              {t('chat.selectLanguages') || 'Select Languages'}
            </label>
            <div className="flex flex-wrap gap-1">
              {availableLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageToggle(language.code)}
                  disabled={language.code === sourceLanguage}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    selectedLanguages.includes(language.code)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  } ${
                    language.code === sourceLanguage
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  {language.nativeName}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mb-4 flex items-center justify-center space-x-2 p-4">
              <ArrowPathIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('chat.translating') || 'Translating...'}
              </span>
            </div>
          )}

          {/* Translations */}
          {translations.length > 0 && (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {translations.map((translation) => (
                <motion.div
                  key={translation.language}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        {getLanguageName(translation.language)}
                      </span>
                      <span className={`text-xs ${getConfidenceColor(translation.confidence)}`}>
                        {Math.round(translation.confidence * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => speakText(translation.text, translation.language)}
                        className="p-1 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 rounded"
                      >
                        <SpeakerWaveIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(translation.text)}
                        className="p-1 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 rounded"
                      >
                        <ClipboardDocumentIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-blue-900 dark:text-blue-100">{translation.text}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
