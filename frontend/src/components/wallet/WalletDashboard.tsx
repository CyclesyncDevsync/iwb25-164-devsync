import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  WalletIcon, 
  CreditCardIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { 
  Wallet, 
  WalletType, 
  WALLET_THEMES 
} from '../../types/wallet';
import { RootState } from '../../store';
import {
  fetchWallets,
  setCurrentWallet,
  fetchTransactions,
} from '../../store/slices/walletSlice';
import { AppDispatch } from '../../store';
import { CURRENCY_SYMBOLS } from '../../constants/wallet';
import WalletCard from './WalletCard';
import TransactionHistory from './TransactionHistory';
import PaymentMethodManager from './PaymentMethodManager';
import QuickActions from './QuickActions';
import WalletSettings from './WalletSettings';

interface WalletDashboardProps {
  className?: string;
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ className = '' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    wallets, 
    currentWallet, 
    transactions, 
    loading, 
    error 
  } = useSelector((state: RootState) => state.wallet);

  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'methods' | 'settings'>('overview');

  useEffect(() => {
    dispatch(fetchWallets());
  }, [dispatch]);

  useEffect(() => {
    if (currentWallet) {
      dispatch(fetchTransactions({ walletId: currentWallet.id }));
    }
  }, [currentWallet, dispatch]);

  const handleWalletSelect = (wallet: Wallet) => {
    dispatch(setCurrentWallet(wallet));
  };

  const getWalletTypeLabel = (type: WalletType) => {
    const labels = {
      [WalletType.BUYER]: 'Buyer Wallet',
      [WalletType.SUPPLIER]: 'Supplier Wallet',
      [WalletType.AGENT]: 'Agent Wallet',
      [WalletType.ADMIN_SHARED]: 'Shared Admin Wallet',
    };
    return labels[type];
  };

  const formatCurrency = (amount: number, currency: string = 'LKR') => {
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency;
    return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  if (loading.wallets) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Wallet Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your wallets, transactions, and payment methods
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title={showBalance ? 'Hide balances' : 'Show balances'}
          >
            {showBalance ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <CogIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.map((wallet) => (
          <WalletCard
            key={wallet.id}
            wallet={wallet}
            isSelected={currentWallet?.id === wallet.id}
            showBalance={showBalance}
            onClick={() => handleWalletSelect(wallet)}
          />
        ))}
      </div>

      {/* Quick Actions */}
      {currentWallet && (
        <QuickActions 
          wallet={currentWallet} 
          onAction={(action) => console.log('Quick action:', action)}
        />
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: WalletIcon },
            { key: 'transactions', label: 'Transactions', icon: CreditCardIcon },
            { key: 'methods', label: 'Payment Methods', icon: CreditCardIcon },
            { key: 'settings', label: 'Settings', icon: CogIcon },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
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

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && currentWallet && (
          <div className="space-y-6">
            {/* Wallet Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {getWalletTypeLabel(currentWallet.type)} Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {showBalance ? formatCurrency(currentWallet.balance, currentWallet.currency) : '••••••'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Available Balance</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {transactions.filter(t => t.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Completed Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {showBalance ? formatCurrency(
                      transactions
                        .filter(t => t.type === 'deposit' && t.status === 'completed')
                        .reduce((sum, t) => sum + t.amount, 0)
                    ) : '••••••'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Deposits</div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Transactions
                </h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <TransactionHistory 
                transactions={transactions.slice(0, 5)} 
                showWallet={false}
                showBalance={showBalance}
              />
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <TransactionHistory 
              transactions={transactions} 
              showWallet={wallets.length > 1}
              showBalance={showBalance}
              loading={loading.transactions}
            />
          </div>
        )}

        {activeTab === 'methods' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <PaymentMethodManager />
          </div>
        )}

        {activeTab === 'settings' && (
          <WalletSettings />
        )}
      </div>
    </div>
  );
};

export default WalletDashboard;
