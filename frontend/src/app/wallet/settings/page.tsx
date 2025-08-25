'use client';

import React from 'react';
import WalletSettings from '../../../components/wallet/WalletSettings';

export default function WalletSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <WalletSettings />
      </div>
    </div>
  );
}
