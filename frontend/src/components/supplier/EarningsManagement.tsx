'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  CreditCardIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  materialTitle?: string;
  buyerName?: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  transactionId: string;
  paymentMethod: string;
}

interface EarningsData {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingPayments: number;
  availableBalance: number;
  transactions: Transaction[];
  earningsHistory: { date: string; amount: number }[];
  paymentMethods: { method: string; percentage: number }[];
}

export default function EarningsManagement() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const dispatch = useAppDispatch();
  const { analytics, loading } = useAppSelector(state => state.supplier);

  // Mock earnings data - replace with actual API calls
  const [earningsData, setEarningsData] = useState<EarningsData>({
    totalEarnings: 450000,
    monthlyEarnings: 75000,
    pendingPayments: 25000,
    availableBalance: 425000,
    transactions: [
      {
        id: '1',
        type: 'credit',
        amount: 15000,
        description: 'Payment for Aluminum Sheets',
        materialTitle: 'High Quality Aluminum Sheets',
        buyerName: 'ABC Manufacturing',
        date: new Date('2024-08-18'),
        status: 'completed',
        transactionId: 'TXN_001',
        paymentMethod: 'Bank Transfer'
      },
      {
        id: '2',
        type: 'credit',
        amount: 8500,
        description: 'Payment for Plastic Bottles',
        materialTitle: 'PET Plastic Bottles',
        buyerName: 'Green Recycling Co.',
        date: new Date('2024-08-17'),
        status: 'completed',
        transactionId: 'TXN_002',
        paymentMethod: 'Digital Wallet'
      },
      {
        id: '3',
        type: 'debit',
        amount: 500,
        description: 'Platform fee',
        date: new Date('2024-08-16'),
        status: 'completed',
        transactionId: 'TXN_003',
        paymentMethod: 'Auto-deduction'
      },
      {
        id: '4',
        type: 'credit',
        amount: 12000,
        description: 'Payment for Cardboard',
        materialTitle: 'Corrugated Cardboard Boxes',
        buyerName: 'Packaging Solutions Ltd',
        date: new Date('2024-08-15'),
        status: 'pending',
        transactionId: 'TXN_004',
        paymentMethod: 'Bank Transfer'
      }
    ],
    earningsHistory: [
      { date: '2024-07-01', amount: 45000 },
      { date: '2024-07-15', amount: 52000 },
      { date: '2024-08-01', amount: 48000 },
      { date: '2024-08-15', amount: 75000 }
    ],
    paymentMethods: [
      { method: 'Bank Transfer', percentage: 65 },
      { method: 'Digital Wallet', percentage: 25 },
      { method: 'Cash', percentage: 10 }
    ]
  });

  const filteredTransactions = earningsData.transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.materialTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.buyerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = transactionFilter === 'all' || transaction.type === transactionFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleWithdraw = () => {
    // Implement withdrawal logic
    console.log('Withdraw funds');
  };

  const handleExportStatement = () => {
    // Implement export functionality
    console.log('Export statement');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Earnings</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track your earnings and manage withdrawals
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 3 months</option>
            <option value="year">Last 12 months</option>
          </select>
          
          <button
            onClick={handleExportStatement}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EarningsCard
          title="Total Earnings"
          value={`LKR ${earningsData.totalEarnings.toLocaleString()}`}
          change={12.5}
          changeLabel="vs last month"
          icon={CurrencyDollarIcon}
          color="emerald"
        />
        
        <EarningsCard
          title="This Month"
          value={`LKR ${earningsData.monthlyEarnings.toLocaleString()}`}
          change={8.3}
          changeLabel="vs last month"
          icon={BanknotesIcon}
          color="blue"
        />
        
        <EarningsCard
          title="Available Balance"
          value={`LKR ${earningsData.availableBalance.toLocaleString()}`}
          change={5.2}
          changeLabel="withdrawable"
          icon={CreditCardIcon}
          color="purple"
          action={{
            label: "Withdraw",
            onClick: handleWithdraw
          }}
        />
        
        <EarningsCard
          title="Pending Payments"
          value={`LKR ${earningsData.pendingPayments.toLocaleString()}`}
          change={-2.1}
          changeLabel="vs last week"
          icon={CalendarIcon}
          color="yellow"
        />
      </div>

      {/* Earnings Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Earnings Trend
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your earnings over time
          </p>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={earningsData.earningsHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [`LKR ${value.toLocaleString()}`, 'Earnings']}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Methods Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Payment Methods
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            How you receive payments
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {earningsData.paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {method.method}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: `${method.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                    {method.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Transaction History
            </h3>
            
            {/* Search and Filters */}
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                />
              </div>
              
              <select
                value={transactionFilter}
                onChange={(e) => setTransactionFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              >
                <option value="all">All Transactions</option>
                <option value="credit">Credits Only</option>
                <option value="debit">Debits Only</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Method
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`rounded-full p-2 ${
                        transaction.type === 'credit' 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <ArrowDownIcon className="h-4 w-4" />
                        ) : (
                          <ArrowUpIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.description}
                        </div>
                        {transaction.materialTitle && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {transaction.materialTitle}
                          </div>
                        )}
                        {transaction.buyerName && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            From: {transaction.buyerName}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          ID: {transaction.transactionId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      transaction.type === 'credit' 
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}LKR {transaction.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.date.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.paymentMethod}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No transactions found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms.' : 'Your transactions will appear here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface EarningsCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'emerald' | 'blue' | 'purple' | 'yellow';
  action?: {
    label: string;
    onClick: () => void;
  };
}

function EarningsCard({ title, value, change, changeLabel, icon: Icon, color, action }: EarningsCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
  };

  const isPositive = change > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
    >
      <div className="flex items-center">
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center text-sm">
          {isPositive ? (
            <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">{changeLabel}</span>
        </div>
        
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            {action.label}
          </button>
        )}
      </div>
    </motion.div>
  );
}
