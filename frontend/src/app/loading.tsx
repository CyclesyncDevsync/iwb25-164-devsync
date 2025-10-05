'use client';

import React from 'react';

interface LoadingProps {
  progress: number;
}

export default function Loading({ progress = 0 }: LoadingProps) {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const validProgress = typeof progress === 'number' && !isNaN(progress) ? progress : 0;
  const strokeDashoffset = circumference - (validProgress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="flex flex-col items-center space-y-6 max-w-sm mx-auto px-4">
        {/* Progress Circle */}
        <div className="relative">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-gray-200 dark:text-slate-700"
            />
            {/* Progress circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-green-500 transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold text-green-600 dark:text-green-400">
              {Math.round(validProgress)}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${validProgress}%` }}
          ></div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading CircularSync
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please wait while we prepare your experience...
          </p>
        </div>
      </div>
    </div>
  );
}