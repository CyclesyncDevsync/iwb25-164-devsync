'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  ShoppingCartIcon, 
  ClockIcon,
  ChartBarIcon,
  HeartIcon,
  BellIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { 
  ShoppingBagIcon,
  TruckIcon,
  CreditCardIcon
} from '@heroicons/react/24/solid';
import { useAuth } from '@/hooks/useAuth';
import WalletBalance from '@/components/shared/WalletBalance';

const BuyerDashboard = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  // Debug logging
  console.log('=== BUYER DASHBOARD RENDER ===');
  console.log('User from useAuth:', user);
  console.log('Loading state:', loading);
  console.log('localStorage user:', typeof window !== 'undefined' ? localStorage.getItem('user') : 'SSR');

  // Show loading state while fetching user data
  if (loading) {
    console.log('Dashboard showing loading state');
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) {
      console.log('getUserInitials: No user data');
      return 'U';
    }
    const firstInitial = user.firstName?.charAt(0) || '';
    const lastInitial = user.lastName?.charAt(0) || '';
    const initials = (firstInitial + lastInitial).toUpperCase() || 'U';
    console.log('getUserInitials:', { firstName: user.firstName, lastName: user.lastName, initials });
    return initials;
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) {
      console.log('getUserDisplayName: No user data');
      return 'User';
    }
    const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';
    console.log('getUserDisplayName:', { firstName: user.firstName, lastName: user.lastName, email: user.email, displayName });
    return displayName;
  };

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
    },
    {
      title: 'My Wallet',
      description: 'Manage balance & transactions',
      icon: WalletIcon,
      href: '/wallet',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buyer Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.firstName || 'User'}! Here's your procurement overview.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2 w-2 bg-red-400 rounded-full"></span>
                </button>
                
                {/* Notification Panel */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-4 space-y-3">
                        <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">New auction started</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Plastic bottles auction is now live</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Bid accepted</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Your bid on cardboard sheets was accepted</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">1 hour ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Delivery scheduled</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Your order will be delivered tomorrow</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">3 hours ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                      <button className="w-full text-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
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
              className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stat.change}</p>
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
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
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
                  <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{action.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{activity.amount}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          activity.status === 'leading' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                          activity.status === 'won' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Wallet Balance at bottom of Recent Activity */}
            <div className="mt-6">
              <WalletBalance />
            </div>
          </div>
        </div>

        {/* Recommended Materials */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recommended for You</h2>
            <a href="/buyer/search" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-sm font-medium">
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
                className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">Plastic Bottles</h3>
                    <button className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400">
                      <HeartIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">High quality PET bottles, 500ml</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">₹12/kg</span>
                    <button className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-800/40">
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
