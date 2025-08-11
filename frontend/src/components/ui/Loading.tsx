import React from 'react';
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
    default: 'border-primary',
    admin: 'border-admin',
    agent: 'border-agent',
    supplier: 'border-supplier',
    buyer: 'border-buyer',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-solid border-t-transparent',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  );
}

interface LoadingProps {
  text?: string;
  className?: string;
  spinnerSize?: SpinnerProps['size'];
  variant?: SpinnerProps['variant'];
}

export function Loading({ text, className, spinnerSize, variant }: LoadingProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-4', className)}>
      <Spinner size={spinnerSize} variant={variant} />
      {text && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{text}</p>}
    </div>
  );
}
