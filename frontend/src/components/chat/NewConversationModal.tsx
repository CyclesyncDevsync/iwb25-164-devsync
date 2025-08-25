'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store';
import { XMarkIcon, MagnifyingGlassIcon, UserPlusIcon, UsersIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'conversation' | 'room';
}

interface Contact {
  id: string;
  name: string;
  role: 'admin' | 'agent' | 'supplier' | 'buyer';
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

// Mock contacts data
const mockContacts: Contact[] = [
  { id: '1', name: 'Sarah Johnson', role: 'admin', isOnline: true },
  { id: '2', name: 'Mike Chen', role: 'agent', isOnline: true },
  { id: '3', name: 'Emily Davis', role: 'supplier', isOnline: false, lastSeen: '2 hours ago' },
  { id: '4', name: 'John Smith', role: 'buyer', isOnline: true },
  { id: '5', name: 'Lisa Wong', role: 'agent', isOnline: false, lastSeen: '1 day ago' },
  { id: '6', name: 'David Brown', role: 'supplier', isOnline: true },
];

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  type
}) => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'agent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'supplier':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'buyer':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleContactSelect = (contactId: string) => {
    if (type === 'conversation') {
      // For direct conversation, start immediately
      console.log('Starting conversation with:', contactId);
      onClose();
    } else {
      // For rooms, allow multiple selection
      setSelectedContacts(prev =>
        prev.includes(contactId)
          ? prev.filter(id => id !== contactId)
          : [...prev, contactId]
      );
    }
  };

  const handleCreateRoom = () => {
    if (roomName.trim() && selectedContacts.length > 0) {
      console.log('Creating room:', { roomName, roomDescription, participants: selectedContacts });
      onClose();
      // Reset form
      setRoomName('');
      setRoomDescription('');
      setSelectedContacts([]);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                {type === 'conversation' ? (
                  <UserPlusIcon className="w-4 h-4 text-white" />
                ) : (
                  <UsersIcon className="w-4 h-4 text-white" />
                )}
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {type === 'conversation' ? 'Start New Chat' : 'Create New Room'}
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Room Details (for room creation) */}
            {type === 'room' && (
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Enter room name..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={roomDescription}
                    onChange={(e) => setRoomDescription(e.target.value)}
                    placeholder="Describe the room purpose..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredContacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleContactSelect(contact.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedContacts.includes(contact.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                        contact.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {contact.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(contact.role)}`}>
                          {contact.role}
                        </span>
                        {!contact.isOnline && contact.lastSeen && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {contact.lastSeen}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedContacts.includes(contact.id) && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            {type === 'room' && (
              <div className="mt-6 flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateRoom}
                  disabled={!roomName.trim() || selectedContacts.length === 0}
                  className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Create Room
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
