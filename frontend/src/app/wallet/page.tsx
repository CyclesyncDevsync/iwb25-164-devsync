'use client';

import React, { useState } from 'react';
import { 
  WalletIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { 
  WalletDashboard, 
  FinancialDashboard, 
  EscrowManagement 
} from '../../components/wallet';
import WalletSettings from '../../components/wallet/WalletSettings';

const WalletPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'escrow' | 'settings'>('dashboard');

  const tabs = [
    {
      key: 'dashboard' as const,
      label: 'Wallet Dashboard',
      icon: WalletIcon,
      component: WalletDashboard,
    },
    {
      key: 'analytics' as const,
      label: 'Financial Analytics',
      icon: ChartBarIcon,
      component: FinancialDashboard,
    },
    {
      key: 'escrow' as const,
      label: 'Escrow Management',
      icon: ShieldCheckIcon,
      component: EscrowManagement,
    },
    {
      key: 'settings' as const,
      label: 'Settings',
      icon: CogIcon,
      component: WalletSettings,
    },
  ];

  const ActiveComponent = tabs.find(tab => tab.key === activeTab)?.component || WalletDashboard;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Payment & Wallet System
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Comprehensive wallet management and financial analytics
              </p>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default WalletPage;
