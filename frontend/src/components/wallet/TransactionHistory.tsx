import React, { useState } from 'react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  CreditCardIcon,
  ArrowUturnLeftIcon,
  LockClosedIcon,
  LockOpenIcon,
  PauseIcon,
  PlayIcon,
  ReceiptPercentIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { Transaction, TransactionType, TransactionStatus } from '../../types/wallet';
import { CURRENCY_SYMBOLS } from '../../constants/wallet';

interface TransactionHistoryProps {
  transactions: Transaction[];
  showWallet?: boolean;
  showBalance?: boolean;
  loading?: boolean;
  className?: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  showWallet = false,
  showBalance = true,
  loading = false,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return ArrowDownIcon;
      case TransactionType.WITHDRAWAL:
        return ArrowUpIcon;
      case TransactionType.TRANSFER:
        return ArrowRightIcon;
      case TransactionType.PAYMENT:
        return CreditCardIcon;
      case TransactionType.REFUND:
        return ArrowUturnLeftIcon;
      case TransactionType.ESCROW_HOLD:
        return LockClosedIcon;
      case TransactionType.ESCROW_RELEASE:
        return LockOpenIcon;
      case TransactionType.BID_FREEZE:
        return PauseIcon;
      case TransactionType.BID_UNFREEZE:
        return PlayIcon;
      case TransactionType.FEE:
        return ReceiptPercentIcon;
      case TransactionType.COMMISSION:
        return BanknotesIcon;
      default:
        return CreditCardIcon;
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case TransactionStatus.PENDING:
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case TransactionStatus.PROCESSING:
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case TransactionStatus.FAILED:
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case TransactionStatus.CANCELLED:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
      case TransactionStatus.REFUNDED:
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getAmountColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
      case TransactionType.REFUND:
      case TransactionType.ESCROW_RELEASE:
      case TransactionType.BID_UNFREEZE:
        return 'text-green-600 dark:text-green-400';
      case TransactionType.WITHDRAWAL:
      case TransactionType.PAYMENT:
      case TransactionType.ESCROW_HOLD:
      case TransactionType.BID_FREEZE:
      case TransactionType.FEE:
      case TransactionType.COMMISSION:
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-900 dark:text-white';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'LKR') => {
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency;
    return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatAmount = (transaction: Transaction) => {
    const isPositive = [
      TransactionType.DEPOSIT,
      TransactionType.REFUND,
      TransactionType.ESCROW_RELEASE,
      TransactionType.BID_UNFREEZE,
    ].includes(transaction.type);
    
    const sign = isPositive ? '+' : '-';
    return `${sign}${formatCurrency(transaction.amount, transaction.currency)}`;
  };

  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || transaction.type === filterType;
      const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        comparison = a.amount - b.amount;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TransactionType | 'all')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value={TransactionType.DEPOSIT}>Deposit</option>
            <option value={TransactionType.WITHDRAWAL}>Withdrawal</option>
            <option value={TransactionType.PAYMENT}>Payment</option>
            <option value={TransactionType.REFUND}>Refund</option>
            <option value={TransactionType.ESCROW_HOLD}>Escrow Hold</option>
            <option value={TransactionType.ESCROW_RELEASE}>Escrow Release</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TransactionStatus | 'all')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value={TransactionStatus.COMPLETED}>Completed</option>
            <option value={TransactionStatus.PENDING}>Pending</option>
            <option value={TransactionStatus.PROCESSING}>Processing</option>
            <option value={TransactionStatus.FAILED}>Failed</option>
          </select>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
          <button
            onClick={() => setSortBy('date')}
            className={`px-3 py-1 rounded text-sm ${
              sortBy === 'date'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Date
          </button>
          <button
            onClick={() => setSortBy('amount')}
            className={`px-3 py-1 rounded text-sm ${
              sortBy === 'amount'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Amount
          </button>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 rounded text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-2">
              <CreditCardIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              No transactions found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Your transactions will appear here'
              }
            </p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => {
            const Icon = getTransactionIcon(transaction.type);
            
            return (
              <div
                key={transaction.id}
                className="flex items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {/* Icon */}
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {transaction.description}
                    </p>
                    <p className={`text-sm font-semibold ${getAmountColor(transaction.type)}`}>
                      {showBalance ? formatAmount(transaction) : '••••••'}
                    </p>
                  </div>
                  
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                      <span>{new Date(transaction.createdAt).toLocaleTimeString()}</span>
                      {transaction.reference && (
                        <>
                          <span>•</span>
                          <span>Ref: {transaction.reference}</span>
                        </>
                      )}
                    </div>
                    
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      {filteredTransactions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
