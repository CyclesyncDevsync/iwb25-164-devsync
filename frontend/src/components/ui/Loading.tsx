import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'admin' | 'agent' | 'supplier' | 'buyer';
}

export function Spinner({ className, size = 'md', variant = 'default' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  const variantClasses = {
    default: 'border-primary dark:border-primary-light',
    admin: 'border-admin dark:border-admin-dark',
    agent: 'border-agent dark:border-agent-dark',
    supplier: 'border-supplier dark:border-supplier-dark',
    buyer: 'border-buyer dark:border-buyer-dark',
  };

  return (
    <motion.div
      className={cn(
        'animate-spin rounded-full border-solid border-t-transparent border-gray-200 dark:border-gray-700',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
}

interface LoadingProps {
  text?: string;
  className?: string;
  spinnerSize?: SpinnerProps['size'];
  variant?: SpinnerProps['variant'];
  fullScreen?: boolean;
}

export function Loading({ text, className, spinnerSize, variant, fullScreen = false }: LoadingProps) {
  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm z-50'
    : 'flex flex-col items-center justify-center p-4';

  return (
    <div className={cn(containerClasses, className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center space-y-3"
      >
        <Spinner size={spinnerSize} variant={variant} />
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center"
          >
            {text}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

// Enhanced skeleton loaders
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse p-6 bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex space-x-4">
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-lg loading-shimmer"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 loading-shimmer"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 loading-shimmer"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3 loading-shimmer"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse flex items-center space-x-3 p-3 bg-white dark:bg-dark-surface rounded-lg">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full loading-shimmer"></div>
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4 loading-shimmer"></div>
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-3/4 loading-shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
