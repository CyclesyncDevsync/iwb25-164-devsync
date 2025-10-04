'use client';

import React, { useState, useEffect } from 'react';
import { WalletIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface WalletBalanceProps {
  className?: string;
  showQuickActions?: boolean;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ 
  className = '', 
  showQuickActions = true 
}) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();

    // Listen for wallet balance update events
    const handleWalletUpdate = () => {
      fetchBalance();
    };

    window.addEventListener('walletBalanceUpdate', handleWalletUpdate);

    return () => {
      window.removeEventListener('walletBalanceUpdate', handleWalletUpdate);
    };
  }, []);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wallet/balance', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data && data.data.available_balance !== undefined) {
          setBalance(data.data.available_balance);
        } else {
          setBalance(null);
        }
      } else {
        // Handle user not found error gracefully
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message && errorData.message.includes('not present in table "users"')) {
          setBalance(null); // Show as no balance instead of error
        } else {
          setBalance(null);
        }
      }
    } catch (error) {
      console.log('Failed to fetch wallet balance:', error);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <WalletIcon className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Wallet Balance</h3>
        </div>
        <button
          onClick={fetchBalance}
          className="p-1 text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold text-indigo-600">
          {loading ? 'Loading...' : 
           balance !== null ? `Rs.${balance.toLocaleString()}` : 'Rs.0'}
        </p>
        <p className="text-sm text-gray-500">Available balance</p>
      </div>

      {showQuickActions && (
        <div className="space-y-2">
          <Link 
            href="/wallet"
            className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center font-medium"
          >
            Manage Wallet
          </Link>
        </div>
      )}
    </div>
  );
};

export default WalletBalance;