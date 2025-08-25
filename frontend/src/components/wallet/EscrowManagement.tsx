import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { EscrowTransaction, EscrowStatus } from '../../types/wallet';
import { CURRENCY_SYMBOLS } from '../../constants/wallet';

interface EscrowManagementProps {
  className?: string;
}

const EscrowManagement: React.FC<EscrowManagementProps> = ({ className = '' }) => {
  const [escrowTransactions, setEscrowTransactions] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EscrowStatus | 'all'>('all');

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockData: EscrowTransaction[] = [
      {
        id: 'escrow_1',
        auctionId: 'auction_123',
        buyerId: 'buyer_1',
        supplierId: 'supplier_1',
        amount: 15000,
        currency: 'LKR',
        status: EscrowStatus.HELD,
        holdExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        releaseConditions: ['Material delivery confirmed', 'Quality inspection passed'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'escrow_2',
        auctionId: 'auction_124',
        buyerId: 'buyer_2',
        supplierId: 'supplier_2',
        amount: 8500,
        currency: 'LKR',
        status: EscrowStatus.DISPUTED,
        holdExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        releaseConditions: ['Material delivery confirmed', 'Quality inspection passed'],
        disputeId: 'dispute_1',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'escrow_3',
        auctionId: 'auction_125',
        buyerId: 'buyer_3',
        supplierId: 'supplier_1',
        amount: 22000,
        currency: 'LKR',
        status: EscrowStatus.RELEASED,
        holdExpiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        releaseConditions: ['Material delivery confirmed', 'Quality inspection passed'],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    setTimeout(() => {
      setEscrowTransactions(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: EscrowStatus) => {
    switch (status) {
      case EscrowStatus.CREATED:
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case EscrowStatus.FUNDED:
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case EscrowStatus.HELD:
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case EscrowStatus.RELEASED:
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case EscrowStatus.DISPUTED:
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case EscrowStatus.REFUNDED:
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
      case EscrowStatus.EXPIRED:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: EscrowStatus) => {
    switch (status) {
      case EscrowStatus.HELD:
        return ShieldCheckIcon;
      case EscrowStatus.DISPUTED:
        return ExclamationTriangleIcon;
      case EscrowStatus.RELEASED:
        return CheckCircleIcon;
      case EscrowStatus.REFUNDED:
      case EscrowStatus.EXPIRED:
        return XCircleIcon;
      default:
        return ClockIcon;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'LKR') => {
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency;
    return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleRelease = (escrowId: string) => {
    console.log('Releasing escrow:', escrowId);
    // Implement release logic
  };

  const handleDispute = (escrowId: string) => {
    console.log('Disputing escrow:', escrowId);
    // Implement dispute logic
  };

  const handleRefund = (escrowId: string) => {
    console.log('Refunding escrow:', escrowId);
    // Implement refund logic
  };

  const filteredTransactions = escrowTransactions.filter(transaction => {
    const matchesSearch = transaction.auctionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalHeld = escrowTransactions
    .filter(t => t.status === EscrowStatus.HELD)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDisputed = escrowTransactions
    .filter(t => t.status === EscrowStatus.DISPUTED)
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
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
            Escrow Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage escrow transactions for secure payments
          </p>
        </div>
        <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Held</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatCurrency(totalHeld)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Under Dispute</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(totalDisputed)}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Escrows</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {escrowTransactions.filter(t => [EscrowStatus.HELD, EscrowStatus.DISPUTED].includes(t.status)).length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by auction ID or escrow ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EscrowStatus | 'all')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value={EscrowStatus.HELD}>Held</option>
          <option value={EscrowStatus.DISPUTED}>Disputed</option>
          <option value={EscrowStatus.RELEASED}>Released</option>
          <option value={EscrowStatus.REFUNDED}>Refunded</option>
          <option value={EscrowStatus.EXPIRED}>Expired</option>
        </select>
      </div>

      {/* Escrow Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No escrow transactions found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Escrow transactions will appear here when created'
              }
            </p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => {
            const StatusIcon = getStatusIcon(transaction.status);
            const daysUntilExpiry = getDaysUntilExpiry(transaction.holdExpiresAt);
            
            return (
              <div
                key={transaction.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <StatusIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Escrow #{transaction.id.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Auction: {transaction.auctionId}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Progress and Timeline */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Release Conditions</span>
                    {transaction.status === EscrowStatus.HELD && (
                      <span className={`font-medium ${daysUntilExpiry <= 3 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {daysUntilExpiry > 0 ? `${daysUntilExpiry} days remaining` : 'Expired'}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {transaction.releaseConditions.map((condition, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          transaction.status === EscrowStatus.RELEASED 
                            ? 'bg-green-100 dark:bg-green-900/20' 
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {transaction.status === EscrowStatus.RELEASED ? (
                            <CheckCircleIcon className="h-3 w-3 text-green-600 dark:text-green-400" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          )}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Created</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(transaction.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Buyer</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transaction.buyerId.slice(-8)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Supplier</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transaction.supplierId.slice(-8)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {transaction.status === EscrowStatus.HELD && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleRelease(transaction.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Release Funds
                    </button>
                    <button
                      onClick={() => handleDispute(transaction.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Open Dispute
                    </button>
                    <button
                      onClick={() => handleRefund(transaction.id)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Refund
                    </button>
                  </div>
                )}

                {transaction.status === EscrowStatus.DISPUTED && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-300">
                        Dispute ID: {transaction.disputeId}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EscrowManagement;
