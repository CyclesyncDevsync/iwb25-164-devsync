'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
}) => {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        animate={{
          borderColor: isFocused 
            ? 'rgb(59, 130, 246)' // blue-500
            : 'rgb(209, 213, 219)', // gray-300
          boxShadow: isFocused
            ? '0 0 0 3px rgba(59, 130, 246, 0.1)'
            : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        }}
        className="relative flex items-center border rounded-xl bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm transition-all duration-200"
      >
        <div className="absolute left-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className={`w-5 h-5 transition-colors ${
            isFocused 
              ? 'text-blue-500 dark:text-blue-400' 
              : 'text-gray-400 dark:text-gray-500'
          }`} />
        </div>
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || t('chat.search.placeholder') || 'Search conversations...'}
          className="w-full pl-12 pr-12 py-3 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border-none outline-none text-sm font-medium"
        />
        
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClear}
              className="absolute right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <XMarkIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
