'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { AdminChatInterface } from '../../components/chat/AdminChatInterface';

export default function ChatPage() {
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Messages
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Communicate with users, agents, and system notifications
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <AdminChatInterface />
        </div>
      </div>
    </DashboardLayout>
  );
}
