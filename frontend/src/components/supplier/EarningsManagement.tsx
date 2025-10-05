 'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  CreditCardIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

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

  const [earningsData] = useState<EarningsData>({
    totalEarnings: 450000,
    monthlyEarnings: 75000,
    pendingPayments: 25000,
    availableBalance: 425000,
    transactions: [
      { id: '1', type: 'credit', amount: 15000, description: 'Payment for Aluminum Sheets', materialTitle: 'High Quality Aluminum Sheets', buyerName: 'ABC Manufacturing', date: new Date('2024-08-18'), status: 'completed', transactionId: 'TXN_001', paymentMethod: 'Bank Transfer' },
      { id: '2', type: 'credit', amount: 8500, description: 'Payment for Plastic Bottles', materialTitle: 'PET Plastic Bottles', buyerName: 'Green Recycling Co.', date: new Date('2024-08-17'), status: 'completed', transactionId: 'TXN_002', paymentMethod: 'Digital Wallet' },
      { id: '3', type: 'debit', amount: 500, description: 'Platform fee', date: new Date('2024-08-16'), status: 'completed', transactionId: 'TXN_003', paymentMethod: 'Auto-deduction' },
      { id: '4', type: 'credit', amount: 12000, description: 'Payment for Cardboard', materialTitle: 'Corrugated Cardboard Boxes', buyerName: 'Packaging Solutions Ltd', date: new Date('2024-08-15'), status: 'pending', transactionId: 'TXN_004', paymentMethod: 'Bank Transfer' }
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

  const handleWithdraw = () => console.log('Withdraw funds');
  const handleExportStatement = () => console.log('Export statement');

  return (
    <div className="space-y-6 p-6 md:p-8 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Earnings</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xl">Track your earnings, withdrawals and payment activity. This dashboard gives you an overview and quick actions.</p>
        </div>

        <div className="mt-6 md:mt-0 flex items-center space-x-3">
                    <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'quarter' | 'year')} className="rounded-lg border-gray-200 bg-white text-sm py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 3 months</option>
            <option value="year">Last 12 months</option>
          </select>

          <button onClick={handleExportStatement} className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:shadow focus:outline-none focus:ring-2 focus:ring-emerald-300">
            <DocumentArrowDownIcon className="h-4 w-4 mr-2 text-gray-600" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EarningsCard title="Total Earnings" value={`LKR ${earningsData.totalEarnings.toLocaleString()}`} change={12.5} changeLabel="vs last month" icon={CurrencyDollarIcon} color="emerald" />
        <EarningsCard title="This Month" value={`LKR ${earningsData.monthlyEarnings.toLocaleString()}`} change={8.3} changeLabel="vs last month" icon={BanknotesIcon} color="blue" />
        <EarningsCard title="Available Balance" value={`LKR ${earningsData.availableBalance.toLocaleString()}`} change={5.2} changeLabel="withdrawable" icon={CreditCardIcon} color="purple" action={{ label: 'Withdraw', onClick: handleWithdraw }} />
        <EarningsCard title="Pending Payments" value={`LKR ${earningsData.pendingPayments.toLocaleString()}`} change={-2.1} changeLabel="vs last week" icon={CalendarIcon} color="yellow" />
      </div>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Earnings Trend</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your earnings over time</p>
        </div>
        <div className="p-6 md:p-8">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={earningsData.earningsHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} formatter={(value: number) => [`LKR ${value.toLocaleString()}`, 'Earnings']} />
              <Area type="monotone" dataKey="amount" stroke="#10B981" fill="#10B981" fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Methods</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">How you receive payments</p>
        </div>
        <div className="p-6 md:p-8">
          <div className="space-y-4">
            {earningsData.paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{method.method}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-36 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full" style={{ width: `${method.percentage}%`, background: 'linear-gradient(90deg, #10B981, #34D399)' }} />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">{method.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h3>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search transactions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>
              <select value={transactionFilter} onChange={(e) => setTransactionFilter(e.target.value as 'all' | 'credit' | 'debit')} className="rounded-lg border-gray-200 bg-white text-sm py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
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
                <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Transaction</th>
                <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Method</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className={`rounded-full p-2 ${transaction.type === 'credit' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                        {transaction.type === 'credit' ? <ArrowDownIcon className="h-4 w-4" /> : <ArrowUpIcon className="h-4 w-4" />}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.description}</div>
                        {transaction.materialTitle && <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.materialTitle}</div>}
                        {transaction.buyerName && <div className="text-xs text-gray-400 dark:text-gray-500">From: {transaction.buyerName}</div>}
                        <div className="text-xs text-gray-400 dark:text-gray-500">ID: {transaction.transactionId}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className={`text-sm font-medium ${transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{transaction.type === 'credit' ? '+' : '-'}LKR {transaction.amount.toLocaleString()}</div>
                  </td>

                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>{transaction.status}</span>
                  </td>

                  <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{transaction.date.toLocaleDateString()}</td>

                  <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{transaction.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No transactions found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{searchTerm ? 'Try adjusting your search terms.' : 'Your transactions will appear here.'}</p>
          </div>
        )}
      </section>
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
  const isPositive = change > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ translateY: -6, boxShadow: '0 10px 20px rgba(16,185,129,0.08)' }} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
      <div className="flex items-center">
        <div className={`rounded-lg p-3 mr-3`} style={{ background: getIconBg(color) }}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center text-sm">
          {isPositive ? <ArrowUpIcon className="h-4 w-4 text-green-400 mr-1" /> : <ArrowDownIcon className="h-4 w-4 text-red-400 mr-1" />}
          <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>{isPositive ? '+' : ''}{change}%</span>
          <span className="text-gray-500 dark:text-gray-400 ml-2">{changeLabel}</span>
        </div>

        {action && <button onClick={action.onClick} className="text-sm font-medium text-emerald-600 hover:text-emerald-500">{action.label}</button>}
      </div>
    </motion.div>
  );
}

function getIconBg(color: EarningsCardProps['color']) {
  switch (color) {
    case 'emerald':
      return 'linear-gradient(90deg,#10B981,#34D399)';
    case 'blue':
      return 'linear-gradient(90deg,#3B82F6,#60A5FA)';
    case 'purple':
      return 'linear-gradient(90deg,#8B5CF6,#A78BFA)';
    case 'yellow':
      return 'linear-gradient(90deg,#F59E0B,#FBBF24)';
    default:
      return '#E5E7EB';
  }
}
