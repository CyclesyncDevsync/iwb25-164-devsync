'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store';
import {
  updateChatSettings,
  setSelectedLanguage,
  setAutoTranslate,
  updateQuickResponses,
} from '../../store/slices/chatSlice';
import { Dialog, Transition, Switch, Tab } from '@headlessui/react';
import {
  XMarkIcon,
  SpeakerWaveIcon,
  LanguageIcon,
  BellIcon,
  PaintBrushIcon,
  ChatBubbleBottomCenterTextIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatSettings: React.FC<ChatSettingsProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  
  const {
    chatSettings,
    selectedLanguage,
    autoTranslate,
    quickResponses,
  } = useSelector((state: RootState) => state.chat);

  const [localSettings, setLocalSettings] = useState(chatSettings);
  const [newQuickResponse, setNewQuickResponse] = useState('');

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  ];

  const themes = [
    { id: 'light', name: 'Light', description: 'Light theme' },
    { id: 'dark', name: 'Dark', description: 'Dark theme' },
    { id: 'system', name: 'System', description: 'Follow system preference' },
  ];

  const fontSizes = [
    { id: 'small', name: 'Small', description: '14px' },
    { id: 'medium', name: 'Medium', description: '16px' },
    { id: 'large', name: 'Large', description: '18px' },
  ];

  const handleSave = () => {
    dispatch(updateChatSettings(localSettings));
    onClose();
  };

  const handleLanguageChange = (languageCode: string) => {
    dispatch(setSelectedLanguage(languageCode));
    i18n.changeLanguage(languageCode);
  };

  const handleAutoTranslateChange = (enabled: boolean) => {
    dispatch(setAutoTranslate(enabled));
  };

  const handleAddQuickResponse = () => {
    if (newQuickResponse.trim()) {
      const updatedResponses = [...quickResponses, newQuickResponse.trim()];
      dispatch(updateQuickResponses(updatedResponses));
      setNewQuickResponse('');
    }
  };

  const handleRemoveQuickResponse = (index: number) => {
    const updatedResponses = quickResponses.filter((_, i) => i !== index);
    dispatch(updateQuickResponses(updatedResponses));
  };

  const updateLocalSetting = (key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateQuietHours = (key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [key]: value,
      },
    }));
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    {t('chat.settings.title') || 'Chat Settings'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <Tab.Group>
                    <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
                      {[
                        { id: 'general', icon: BellIcon, label: 'General' },
                        { id: 'language', icon: LanguageIcon, label: 'Language' },
                        { id: 'appearance', icon: PaintBrushIcon, label: 'Appearance' },
                        { id: 'responses', icon: ChatBubbleBottomCenterTextIcon, label: 'Quick Responses' },
                      ].map((tab) => (
                        <Tab
                          key={tab.id}
                          className={({ selected }) =>
                            `w-full rounded-lg py-2.5 px-3 text-sm font-medium leading-5 transition-all focus:outline-none ${
                              selected
                                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-white/[0.12] hover:text-gray-800 dark:hover:text-gray-200'
                            }`
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                          </div>
                        </Tab>
                      ))}
                    </Tab.List>

                    <Tab.Panels className="mt-6">
                      {/* General Settings */}
                      <Tab.Panel className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                            {t('chat.settings.notifications') || 'Notifications'}
                          </h4>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {t('chat.settings.soundNotifications') || 'Sound notifications'}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Play sound when receiving messages
                                </p>
                              </div>
                              <Switch
                                checked={localSettings.soundNotifications}
                                onChange={(checked) => updateLocalSetting('soundNotifications', checked)}
                                className={`${
                                  localSettings.soundNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                              >
                                <span
                                  className={`${
                                    localSettings.soundNotifications ? 'translate-x-6' : 'translate-x-1'
                                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                              </Switch>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Show typing indicators
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Show when others are typing
                                </p>
                              </div>
                              <Switch
                                checked={localSettings.showTypingIndicators}
                                onChange={(checked) => updateLocalSetting('showTypingIndicators', checked)}
                                className={`${
                                  localSettings.showTypingIndicators ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                              >
                                <span
                                  className={`${
                                    localSettings.showTypingIndicators ? 'translate-x-6' : 'translate-x-1'
                                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                              </Switch>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Show read receipts
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Show when messages are read
                                </p>
                              </div>
                              <Switch
                                checked={localSettings.showReadReceipts}
                                onChange={(checked) => updateLocalSetting('showReadReceipts', checked)}
                                className={`${
                                  localSettings.showReadReceipts ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                              >
                                <span
                                  className={`${
                                    localSettings.showReadReceipts ? 'translate-x-6' : 'translate-x-1'
                                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                              </Switch>
                            </div>
                          </div>
                        </div>

                        {/* Quiet Hours */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                            {t('chat.settings.quietHours') || 'Quiet Hours'}
                          </h4>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Enable quiet hours
                              </label>
                              <Switch
                                checked={localSettings.quietHours.enabled}
                                onChange={(checked) => updateQuietHours('enabled', checked)}
                                className={`${
                                  localSettings.quietHours.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                              >
                                <span
                                  className={`${
                                    localSettings.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                              </Switch>
                            </div>

                            {localSettings.quietHours.enabled && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Start time
                                  </label>
                                  <input
                                    type="time"
                                    value={localSettings.quietHours.start}
                                    onChange={(e) => updateQuietHours('start', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    End time
                                  </label>
                                  <input
                                    type="time"
                                    value={localSettings.quietHours.end}
                                    onChange={(e) => updateQuietHours('end', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Tab.Panel>

                      {/* Language Settings */}
                      <Tab.Panel className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                            {t('chat.settings.language') || 'Language'}
                          </h4>
                          
                          <div className="space-y-3">
                            {languages.map((language) => (
                              <label key={language.code} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name="language"
                                  value={language.code}
                                  checked={selectedLanguage === language.code}
                                  onChange={() => handleLanguageChange(language.code)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {language.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {language.nativeName}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                            Translation
                          </h4>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('chat.settings.autoTranslate') || 'Auto-translate messages'}
                              </label>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Automatically translate messages to your preferred language
                              </p>
                            </div>
                            <Switch
                              checked={autoTranslate}
                              onChange={handleAutoTranslateChange}
                              className={`${
                                autoTranslate ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                            >
                              <span
                                className={`${
                                  autoTranslate ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                              />
                            </Switch>
                          </div>
                        </div>
                      </Tab.Panel>

                      {/* Appearance Settings */}
                      <Tab.Panel className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                            {t('chat.settings.theme') || 'Theme'}
                          </h4>
                          
                          <div className="space-y-3">
                            {themes.map((theme) => (
                              <label key={theme.id} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name="theme"
                                  value={theme.id}
                                  checked={localSettings.theme === theme.id}
                                  onChange={() => updateLocalSetting('theme', theme.id)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {theme.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {theme.description}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                            Font Size
                          </h4>
                          
                          <div className="space-y-3">
                            {fontSizes.map((fontSize) => (
                              <label key={fontSize.id} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name="fontSize"
                                  value={fontSize.id}
                                  checked={localSettings.fontSize === fontSize.id}
                                  onChange={() => updateLocalSetting('fontSize', fontSize.id)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {fontSize.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {fontSize.description}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </Tab.Panel>

                      {/* Quick Responses */}
                      <Tab.Panel className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                            {t('chat.templates.title') || 'Quick Responses'}
                          </h4>
                          
                          <div className="space-y-3">
                            {quickResponses.map((response, index) => (
                              <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex-1 text-sm text-gray-900 dark:text-white">
                                  {response}
                                </div>
                                <button
                                  onClick={() => handleRemoveQuickResponse(index)}
                                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={newQuickResponse}
                              onChange={(e) => setNewQuickResponse(e.target.value)}
                              placeholder="Add new quick response..."
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                              onKeyPress={(e) => e.key === 'Enter' && handleAddQuickResponse()}
                            />
                            <button
                              onClick={handleAddQuickResponse}
                              disabled={!newQuickResponse.trim()}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </Tab.Panel>
                    </Tab.Panels>
                  </Tab.Group>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t('cancel') || 'Cancel'}
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {t('save') || 'Save'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
