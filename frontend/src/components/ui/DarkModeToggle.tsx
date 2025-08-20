'use client';

import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { RootState } from '../../types/store';
import { toggleDarkMode } from '../../store/slices/themeSlice';

interface DarkModeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function DarkModeToggle({ 
  size = 'md', 
  showLabel = false, 
  className = '' 
}: DarkModeToggleProps) {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state: RootState) => state.theme);

  const handleToggle = () => {
    dispatch(toggleDarkMode());
  };

  const sizeClasses = {
    sm: 'w-10 h-6',
    md: 'w-12 h-7',
    lg: 'w-14 h-8'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {darkMode ? 'Dark' : 'Light'} Mode
        </span>
      )}
      
      <button
        onClick={handleToggle}
        className={`
          relative inline-flex items-center ${sizeClasses[size]} 
          bg-gray-200 dark:bg-gray-700 rounded-full p-1 
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          hover:bg-gray-300 dark:hover:bg-gray-600
          group
        `}
        aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
      >
        {/* Track */}
        <motion.div
          className={`
            absolute inset-0 rounded-full transition-all duration-300
            ${darkMode 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg' 
              : 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-md'
            }
          `}
          layout
        />
        
        {/* Thumb */}
        <motion.div
          className={`
            relative flex items-center justify-center
            bg-white dark:bg-gray-100 rounded-full shadow-lg
            ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'}
            transition-all duration-300 group-hover:scale-110
          `}
          animate={{
            x: darkMode 
              ? size === 'sm' ? 16 : size === 'md' ? 20 : 24
              : 0
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
          layout
        >
          {/* Icon */}
          <motion.div
            className="flex items-center justify-center"
            animate={{ rotate: darkMode ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {darkMode ? (
              <MoonIcon className={`${iconSizes[size]} text-blue-600`} />
            ) : (
              <SunIcon className={`${iconSizes[size]} text-yellow-600`} />
            )}
          </motion.div>
        </motion.div>
        
        {/* Background icons */}
        <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
          <SunIcon 
            className={`
              ${iconSizes[size]} transition-all duration-300
              ${darkMode ? 'text-white/30' : 'text-white/70'}
            `} 
          />
          <MoonIcon 
            className={`
              ${iconSizes[size]} transition-all duration-300
              ${darkMode ? 'text-white/70' : 'text-white/30'}
            `} 
          />
        </div>
      </button>
    </div>
  );
}

// Floating dark mode toggle for fixed positioning
export function FloatingDarkModeToggle() {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.5 
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="p-2 bg-white dark:bg-dark-surface rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
        <DarkModeToggle size="md" />
      </div>
    </motion.div>
  );
}

// Compact toggle for navigation
export function NavDarkModeToggle() {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state: RootState) => state.theme);

  return (
    <button
      onClick={() => dispatch(toggleDarkMode())}
      className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
      aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
    >
      <motion.div
        animate={{ rotate: darkMode ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {darkMode ? (
          <SunIcon className="w-5 h-5" />
        ) : (
          <MoonIcon className="w-5 h-5" />
        )}
      </motion.div>
    </button>
  );
}
