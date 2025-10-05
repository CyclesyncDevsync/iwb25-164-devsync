'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  TruckIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const BuyerAnalyticsPage = () => {
  const [timeFilter, setTimeFilter] = useState('3months');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const spendingData = [
    { month: 'Oct', amount: 15000, orders: 8 },
    { month: 'Nov', amount: 22000, orders: 12 },
    { month: 'Dec', amount: 18000, orders: 10 },
    { month: 'Jan', amount: 28000, orders: 15 }
  ];

  const categoryData = [
    { name: 'Plastic', value: 35, amount: 25000, color: '#8B5CF6' },
    { name: 'Paper', value: 25, amount: 18000, color: '#10B981' },
    { name: 'Metal', value: 20, amount: 14000, color: '#F59E0B' },
    { name: 'Glass', value: 12, amount: 8500, color: '#3B82F6' },
    { name: 'Others', value: 8, amount: 5500, color: '#EF4444' }
  ];

  const savingsData = [
    { month: 'Oct', traditional: 18000, circular: 15000, savings: 3000 },
    { month: 'Nov', traditional: 26000, circular: 22000, savings: 4000 },
    { month: 'Dec', traditional: 22000, circular: 18000, savings: 4000 },
    { month: 'Jan', traditional: 33000, circular: 28000, savings: 5000 }
  ];

  const supplierData = [
    { name: 'EcoRecycle Ltd.', orders: 12, amount: 28000, rating: 4.8, category: 'Plastic' },
    { name: 'Paper Solutions', orders: 8, amount: 15000, rating: 4.2, category: 'Paper' },
    { name: 'Metro Metals', orders: 6, amount: 22000, rating: 4.6, category: 'Metal' },
    { name: 'Green Glass Co.', orders: 4, amount: 8500, rating: 4.4, category: 'Glass' },
    { name: 'Textile Recyclers', orders: 3, amount: 6500, rating: 4.1, category: 'Textile' }
  ];

  const stats = [
    {
      title: 'Total Spent',
      value: 'Rs83,000',
      change: '+23.5%',
      trend: 'up',
      icon: CurrencyRupeeIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Orders',
      value: '45',
      change: '+18.2%',
      trend: 'up',
      icon: ShoppingBagIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Avg Order Value',
      value: 'Rs1,844',
      change: '-5.3%',
      trend: 'down',
      icon: ChartBarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'On-time Deliveries',
      value: '94%',
      change: '+2.1%',
      trend: 'up',
      icon: TruckIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Purchase Analytics</h1>
              <p className="text-gray-600">Track your procurement insights and spending patterns</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Categories</option>
                <option value="plastic">Plastic</option>
                <option value="paper">Paper</option>
                <option value="metal">Metal</option>
                <option value="glass">Glass</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6 border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    {stat.trend === 'up' ? (
                      <ArrowUpIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ml-1 ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Spending Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6 border"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={spendingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'amount' ? `Rs${value.toLocaleString()}` : value,
                    name === 'amount' ? 'Amount' : 'Orders'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.1}
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#10B981" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6 border"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
            <div className="flex">
              <ResponsiveContainer width="60%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryData.map((category) => (
                  <div key={category.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span>{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">Rs{category.amount.toLocaleString()}</div>
                      <div className="text-gray-500">{category.value}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Cost Savings Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm p-6 border mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cost Savings vs Traditional Procurement</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span>Traditional Cost</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Circular Cost</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Savings</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={savingsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => `Rs${value.toLocaleString()}`}
              />
              <Bar dataKey="traditional" fill="#F87171" name="Traditional Cost" />
              <Bar dataKey="circular" fill="#10B981" name="Circular Cost" />
              <Bar dataKey="savings" fill="#3B82F6" name="Savings" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-green-800 font-medium">Total Savings This Quarter</span>
              <span className="text-2xl font-bold text-green-600">Rs16,000</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              You've saved 19.3% compared to traditional procurement methods
            </p>
          </div>
        </motion.div>

        {/* Top Suppliers Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-6 border"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Suppliers Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 text-sm font-medium text-gray-600">Supplier</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Category</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Orders</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Amount</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Rating</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {supplierData.map((supplier, index) => (
                  <tr key={supplier.name}>
                    <td className="py-3">
                      <div className="font-medium text-gray-900">{supplier.name}</div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                        {supplier.category}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">{supplier.orders}</td>
                    <td className="py-3 font-medium">Rs{supplier.amount.toLocaleString()}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span>{supplier.rating}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${supplier.rating * 20}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{Math.round(supplier.rating * 20)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white"
          >
            <h4 className="font-semibold mb-2">Best Purchase Month</h4>
            <p className="text-purple-100 text-sm mb-2">
              January had your highest volume and best deals
            </p>
            <div className="text-2xl font-bold">January 2024</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white"
          >
            <h4 className="font-semibold mb-2">Most Efficient Category</h4>
            <p className="text-green-100 text-sm mb-2">
              Plastic materials offer the best value for money
            </p>
            <div className="text-2xl font-bold">Plastic (Rs15/kg avg)</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white"
          >
            <h4 className="font-semibold mb-2">Recommendation</h4>
            <p className="text-blue-100 text-sm mb-2">
              Consider bulk orders in Q2 for better pricing
            </p>
            <div className="text-2xl font-bold">15-20% savings</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BuyerAnalyticsPage;
