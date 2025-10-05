'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WalletIcon,
  PlusIcon,
  MinusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { DepositModal } from './index';
import { WalletType } from '../../types/wallet';

interface WalletData {
  wallet_id: string;
  user_id: number;
  available_balance: number;
  frozen_balance: number;
  total_balance: number;
  daily_withdrawal_limit: number;
  daily_withdrawal_used: number;
}

interface Transaction {
  transaction_id: string;
  type: 'deposit' | 'withdrawal' | 'bid_freeze' | 'bid_refund' | 'auction_payment' | 'commission_payment' | 'agent_fee';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'processing';
  description: string;
  created_at: string;
  balance_after: number;
}

const WalletManagement: React.FC = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  // Mock user role - in real app, get from auth context
  const [userRole] = useState<'buyer' | 'supplier' | 'agent' | 'admin' | 'super_admin'>('buyer');

  // Check if user has wallet access (all authenticated users)
  const hasWalletAccess = ['buyer', 'supplier', 'agent', 'admin', 'super_admin'].includes(userRole);
  
  // Check if user is admin (different wallet handling)
  const isAdmin = ['admin', 'super_admin'].includes(userRole);

  useEffect(() => {
    if (hasWalletAccess) {
      fetchWalletData();
      fetchTransactions();
    }
  }, [hasWalletAccess]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/wallet/balance', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data) {
          setWallet(data.data);
        } else {
          setError('Invalid wallet data received');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message && errorData.message.includes('not present in table "users"')) {
          setError('User account not found. Please login or register first.');
        } else {
          setError(errorData.message || 'Failed to fetch wallet data');
        }
      }
    } catch (error) {
      setError('Unable to connect to wallet service. Please try again later.');
      console.error('Wallet fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/wallet/transactions?page=1&limit=20', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && Array.isArray(data.data)) {
          setTransactions(data.data);
        } else {
          setTransactions([]);
        }
      } else {
        setTransactions([]);
        console.warn('Failed to fetch transactions');
      }
    } catch (error) {
      setTransactions([]);
      console.error('Transactions fetch error:', error);
    }
  };

  // Convert wallet data to format expected by DepositModal
  const getWalletForModal = () => {
    if (!wallet) return null;
    
    let walletType: WalletType;
    if (isAdmin) {
      walletType = WalletType.ADMIN;
    } else if (userRole === 'supplier') {
      walletType = WalletType.SUPPLIER;
    } else {
      walletType = WalletType.BUYER;
    }
    
    return {
      id: wallet.wallet_id,
      userId: wallet.user_id.toString(),
      type: walletType,
      balance: wallet.available_balance,
      currency: 'LKR',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const handleDeposit = async (data: { amount: number; paymentMethodId: string; note?: string }) => {
    setProcessing(true);
    try {
      // If using non-Stripe payment method, use the old recharge API
      if (data.paymentMethodId !== 'stripe') {
        const response = await fetch('/api/wallet/recharge', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: data.amount,
            payment_method: data.paymentMethodId,
            note: data.note
          })
        });

        if (response.ok) {
          fetchWalletData();
          fetchTransactions();
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Deposit failed');
        }
      }
      // Stripe payments are handled within the DepositModal component
    } catch (err) {
      setError('Network error during deposit');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    
    const amount = parseFloat(withdrawAmount);
    if (wallet && amount > wallet.available_balance) {
      setError('Insufficient balance');
      return;
    }
    
    if (wallet && amount > (wallet.daily_withdrawal_limit - wallet.daily_withdrawal_used)) {
      setError('Daily withdrawal limit exceeded');
      return;
    }
    
    setProcessing(true);
    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          withdrawal_method: 'bank_transfer'
        })
      });

      if (response.ok) {
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        fetchWalletData();
        fetchTransactions();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Withdrawal failed');
      }
    } catch (err) {
      setError('Network error during withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownIcon className="h-5 w-5 text-green-600" />;
      case 'withdrawal': return <ArrowUpIcon className="h-5 w-5 text-red-600" />;
      case 'bid_freeze': return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'bid_refund': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'auction_payment': return <MinusIcon className="h-5 w-5 text-red-600" />;
      case 'commission_payment': return <PlusIcon className="h-5 w-5 text-green-600" />;
      default: return <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'bid_refund':
      case 'commission_payment': return 'text-green-600';
      case 'withdrawal':
      case 'auction_payment': return 'text-red-600';
      case 'bid_freeze': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const formatTransactionType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (!hasWalletAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Access Restricted</h3>
          <p className="mt-2 text-sm text-gray-600">
            Please login to access wallet features.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <WalletIcon className="h-8 w-8 text-emerald-600" />
                Wallet Management
              </h1>
              <p className="text-gray-600">Manage your balance and transactions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Admin Notice */}
        {isAdmin && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <p className="text-blue-700">
                  <strong>Admin Wallet Access:</strong> You are using the wallet system in admin mode. All wallet operations are available.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Balance Overview</h2>
              <button
                onClick={fetchWalletData}
                className="text-emerald-600 hover:text-emerald-700"
              >
                Refresh
              </button>
            </div>
            
            {wallet && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800">Available Balance</h3>
                  <p className="text-2xl font-bold text-green-600">
                    Rs.{wallet.available_balance.toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-yellow-800">Frozen Balance</h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    Rs.{wallet.frozen_balance.toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800">Total Balance</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    Rs.{wallet.total_balance.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Panel */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowDepositModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                <PlusIcon className="h-5 w-5" />
                Recharge Wallet
              </button>
              
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <MinusIcon className="h-5 w-5" />
                Withdraw Funds
              </button>
            </div>

            {wallet && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Daily Withdrawal Limit: Rs.{wallet.daily_withdrawal_limit.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Used Today: Rs.{wallet.daily_withdrawal_used.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
          </div>
          
          <div className="overflow-x-auto">
            {transactions.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.transaction_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTransactionIcon(transaction.type)}
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {formatTransactionType(transaction.type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${getTransactionColor(transaction.type)}`}>
                          {transaction.type.includes('deposit') || transaction.type.includes('refund') || transaction.type.includes('commission') ? '+' : '-'}
                          Rs.{transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description || 'No description'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                <p className="mt-1 text-sm text-gray-500">Your transaction history will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && wallet && (
        <DepositModal
          wallet={getWalletForModal()!}
          paymentMethods={[]} // Empty for now - could add saved payment methods later
          onClose={() => setShowDepositModal(false)}
          onDeposit={handleDeposit}
          onRefresh={() => {
            fetchWalletData();
            fetchTransactions();
          }}
        />
      )}

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowWithdrawModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Withdraw Funds</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (Rs.)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter amount"
                  min="1"
                  max={wallet?.available_balance}
                />
                {wallet && (
                  <p className="text-sm text-gray-500 mt-1">
                    Available: Rs.{wallet.available_balance.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={processing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletManagement;