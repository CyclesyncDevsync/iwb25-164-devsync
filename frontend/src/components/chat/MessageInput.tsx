'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MessageInput = forwardRef<HTMLTextAreaElement, MessageInputProps>(
  ({ value, onChange, onKeyPress, placeholder, disabled }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
      
      // Auto-resize textarea
      e.target.style.height = 'auto';
      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    };

    return (
      <motion.textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        onKeyPress={onKeyPress}
        placeholder={placeholder || 'Type your message...'}
        disabled={disabled}
        rows={1}
  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent resize-none transition-all"
        style={{ minHeight: '48px', maxHeight: '120px' }}
      />
    );
  }
);

MessageInput.displayName = 'MessageInput';
