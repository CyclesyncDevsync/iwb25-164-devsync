import React from "react";

interface CacheIndicatorProps {
  fromCache: boolean;
  loading?: boolean;
  className?: string;
}

/**
 * Visual indicator showing if data is loaded from Redis cache
 * Useful for debugging and performance monitoring
 */
export function CacheIndicator({
  fromCache,
  loading = false,
  className = "",
}: CacheIndicatorProps) {
  if (loading) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs ${className}`}
      >
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" />
        <span className="text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    );
  }

  if (fromCache) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-xs ${className}`}
      >
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
        <span className="text-green-700 dark:text-green-300">Redis Cache</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-xs ${className}`}
    >
      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
      <span className="text-blue-700 dark:text-blue-300">Fresh Data</span>
    </div>
  );
}
