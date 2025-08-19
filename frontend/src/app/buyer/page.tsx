'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  ShoppingCartIcon, 
  ClockIcon,
  ChartBarIcon,
  HeartIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { 
  ShoppingBagIcon,
  TruckIcon,
  CreditCardIcon
} from '@heroicons/react/24/solid';

const BuyerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      title: 'Active Bids',
      value: '12',
      icon: ClockIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+2 from yesterday'
    },
    {
      title: 'Won Auctions',
      value: '8',
      icon: ShoppingBagIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+1 this week'
    },
    {
      title: 'Total Purchases',
      value: '₹45,320',
      icon: CreditCardIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+15% this month'
    },
    {
      title: 'Pending Deliveries',
      value: '3',
      icon: TruckIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '2 arriving today'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'bid',
      title: 'Bid placed on Plastic Bottles (5kg)',
      amount: '₹850',
      time: '2 minutes ago',
      status: 'leading'
    },
    {
      id: 2,
      type: 'won',
      title: 'Won auction for Cardboard Sheets',
      amount: '₹1,200',
      time: '1 hour ago',
      status: 'won'
    },
    {
      id: 3,
      type: 'delivery',
      title: 'Metal Scraps delivered',
      amount: '₹2,500',
      time: '3 hours ago',
      status: 'delivered'
    }
  ];

  const quickActions = [
    {
      title: 'Search Materials',
      description: 'Find and filter materials',
      icon: MagnifyingGlassIcon,
      href: '/buyer/search',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Live Auctions',
      description: 'Join ongoing auctions',
      icon: ClockIcon,
      href: '/buyer/auctions',
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      title: 'My Orders',
      description: 'Track your purchases',
      icon: ShoppingCartIcon,
      href: '/buyer/orders',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Analytics',
      description: 'View purchase insights',
      icon: ChartBarIcon,
      href: '/buyer/analytics',
      color: 'bg-blue-500 hover:bg-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Buyer Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's your procurement overview.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 bg-red-400 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-medium text-sm">JD</span>
                </div>
                <span className="text-gray-700 font-medium">John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <motion.a
                  key={action.title}
                  href={action.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="block"
                >
                  <div className="bg-white rounded-lg shadow-sm p-4 border hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between py-3 border-b last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900">{activity.amount}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          activity.status === 'leading' ? 'bg-blue-100 text-blue-800' :
                          activity.status === 'won' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Materials */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
            <a href="/buyer/search" className="text-purple-600 hover:text-purple-800 text-sm font-medium">
              View All →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: item * 0.1 }}
                className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Plastic Bottles</h3>
                    <button className="text-gray-400 hover:text-red-500">
                      <HeartIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">High quality PET bottles, 500ml</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-purple-600">₹12/kg</span>
                    <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200">
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
