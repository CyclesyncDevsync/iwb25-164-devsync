'use client';

import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

interface UserAvatarProps {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showEmail?: boolean;
  onClick?: () => void;
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base'
};

export function UserAvatar({ 
  user, 
  size = 'md', 
  showName = false, 
  showEmail = false, 
  onClick,
  className = ''
}: UserAvatarProps) {
  const getInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return names[0].charAt(0).toUpperCase();
  };

  const avatarContent = user?.avatar ? (
    <img
      src={user.avatar}
      alt={user.name || 'User avatar'}
      className={`${sizeClasses[size]} rounded-full object-cover`}
    />
  ) : (
    <div className={`
      ${sizeClasses[size]} 
      bg-gradient-to-r from-green-400 to-blue-500 
      rounded-full flex items-center justify-center 
      text-white font-medium
    `}>
      {getInitials()}
    </div>
  );

  if (showName || showEmail) {
    return (
      <div 
        className={`flex items-center space-x-3 ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
      >
        {avatarContent}
        <div className="flex-1 min-w-0">
          {showName && user?.name && (
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.name}
            </p>
          )}
          {showEmail && user?.email && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {avatarContent}
    </div>
  );
}

// Skeleton loader for user avatar
export function UserAvatarSkeleton({ size = 'md', showName = false, showEmail = false }: {
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showEmail?: boolean;
}) {
  return (
    <div className="flex items-center space-x-3 animate-pulse">
      <div className={`${sizeClasses[size]} bg-gray-300 dark:bg-gray-600 rounded-full`}></div>
      {(showName || showEmail) && (
        <div className="flex-1 min-w-0">
          {showName && (
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-1"></div>
          )}
          {showEmail && (
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          )}
        </div>
      )}
    </div>
  );
}
