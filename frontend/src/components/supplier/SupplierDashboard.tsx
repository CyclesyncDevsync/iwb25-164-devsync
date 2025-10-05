'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  PlusIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  MapPinIcon,
  CalendarIcon,
  WalletIcon
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
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import WalletBalance from '../shared/WalletBalance';
import {
  fetchSupplierProfile,
  fetchSupplierMaterials,
  fetchSupplierAnalytics
} from '../../store/slices/supplierSlice';
import {
  MaterialStatus,
  SupplierType,
  QualityGrade
} from '../../types/supplier';

export default function SupplierDashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { profile, materials, analytics, loading } = useAppSelector(state => state.supplier);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!profile) {
      dispatch(fetchSupplierProfile('current'));
    }
    dispatch(fetchSupplierMaterials({ page: 1, limit: 5 }));
    dispatch(fetchSupplierAnalytics('month'));
    fetchWalletBalance();
  }, [dispatch, profile]);

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
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
          setWalletBalance(data.data.available_balance);
        } else {
          setWalletBalance(null);
        }
      } else {
        setWalletBalance(null);
      }
    } catch (error) {
      console.log('Failed to fetch wallet balance:', error);
      setWalletBalance(null);
    }
  };

  if (loading.profile) {
    return <DashboardSkeleton />;
  }

  const isOrganization = profile?.type === SupplierType.ORGANIZATION;

  // Mock recent activity data
  const recentActivity = [
    {
      id: 1,
      type: 'material_added',
      title: 'New material added',
      description: 'Aluminum sheets listing created',
      time: '2 hours ago',
      icon: PlusIcon,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
    },
    {
      id: 2,
      type: 'bid_received',
      title: 'New bid received',
      description: 'Bid of LKR 25,000 on plastic bottles',
      time: '4 hours ago',
      icon: CurrencyDollarIcon,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
    },
    {
      id: 3,
      type: 'material_sold',
      title: 'Material sold',
      description: 'Cardboard boxes sold for LKR 15,000',
      time: '1 day ago',
      icon: CheckCircleIcon,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400'
    }
  ];

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner profile={profile} user={user} />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickStatCard
          title="Wallet Balance"
          value={walletBalance !== null ? `LKR ${walletBalance.toLocaleString()}` : 'Loading...'}
          change={0}
          changeLabel="Available balance"
          icon={WalletIcon}
          color="emerald"
        />
        
        <QuickStatCard
          title="Active Materials"
          value={materials.filter(m => m.status === MaterialStatus.APPROVED).length.toString()}
          change={-2.3}
          changeLabel="vs last week"
          icon={ShoppingBagIcon}
          color="blue"
        />
        
        <QuickStatCard
          title="Total Views"
          value="1,247"
          change={8.1}
          changeLabel="vs last week"
          icon={EyeIcon}
          color="purple"
        />
        
        <QuickStatCard
          title="Avg Rating"
          value={profile?.rating?.toFixed(1) || '0.0'}
          change={0.2}
          changeLabel="vs last month"
          icon={StarIcon}
          color="yellow"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Earnings Chart */}
          <EarningsChart analytics={analytics} />
          
          {/* Material Performance */}
          <MaterialPerformanceChart materials={materials} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Wallet Balance */}
          <WalletBalance />
          
          {/* Quick Actions */}
          <QuickActions />
          
          {/* Recent Activity */}
          <RecentActivity activities={recentActivity} />
          
          {/* Upcoming Tasks */}
          <UpcomingTasks />
        </div>
      </div>

      {/* Recent Materials */}
      <RecentMaterials materials={materials} />

      {/* Organization Dashboard Extensions */}
      {isOrganization && (
        <>
          <TeamOverview />
          <LocationOverview />
        </>
      )}
    </div>
  );
}

interface WelcomeBannerProps {
  profile: any; // TODO: Replace with proper profile type
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
  } | null;
}

function WelcomeBanner({ profile, user }: WelcomeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="px-8 py-10 sm:px-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Supplier'}!
            </h1>
            <p className="mt-3 text-emerald-100 text-lg">
              Manage your materials and track your earnings
            </p>
            <div className="mt-6 flex items-center text-emerald-100">
              <MapPinIcon className="h-5 w-5 mr-2" />
              <span className="text-base">
                {profile?.address?.city && profile?.address?.district 
                  ? `${profile.address.city}, ${profile.address.district}`
                  : 'Location not set'
                }
              </span>
            </div>
          </div>
          
          <div className="hidden sm:block">
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-emerald-100 text-sm">Verification Status</p>
                <div className="flex items-center mt-1">
                  {user?.status === 'approved' ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 text-white mr-1" />
                      <span className="text-white font-medium">Approved</span>
                    </>
                  ) : user?.status === 'rejected' ? (
                    <>
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-200 mr-1" />
                      <span className="text-red-200 font-medium">Rejected</span>
                    </>
                  ) : (
                    <>
                      <ClockIcon className="h-5 w-5 text-yellow-200 mr-1" />
                      <span className="text-yellow-200 font-medium">Pending</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface QuickStatCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'emerald' | 'blue' | 'purple' | 'yellow';
}

function QuickStatCard({ title, value, change, changeLabel, icon: Icon, color }: QuickStatCardProps) {
  const iconBgClasses = {
    emerald: 'linear-gradient(135deg,#10B981,#34D399)',
    blue: 'linear-gradient(135deg,#3B82F6,#60A5FA)',
    purple: 'linear-gradient(135deg,#8B5CF6,#A78BFA)',
    yellow: 'linear-gradient(135deg,#F59E0B,#FBBF24)'
  };

  const isPositive = change > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl p-6 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center">
        <div
          className="rounded-xl p-3"
          style={{ background: iconBgClasses[color] }}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center text-sm">
            {isPositive ? (
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
            )}
          <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">{changeLabel}</span>
        </div>
      </div>
    </motion.div>
  );
}

function QuickActions() {
  const actions = [
    {
      title: 'Add Material',
      description: 'List a new material for sale',
      href: '/supplier/materials/new',
      icon: PlusIcon,
      color: 'bg-emerald-600 hover:bg-emerald-700'
    },
    {
      title: 'My Wallet',
      description: 'Manage balance & transactions',
      href: '/wallet',
      icon: WalletIcon,
      color: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      title: 'View Analytics',
      description: 'Check your performance',
      href: '/supplier/analytics',
      icon: ChartBarIcon,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Manage Materials',
      description: 'Edit existing listings',
      href: '/supplier/materials',
      icon: ShoppingBagIcon,
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className={`rounded-lg p-2 text-white ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {action.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

interface RecentActivityProps {
  activities: any[];
}

function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <div className={`rounded-lg p-2 ${activity.color}`}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/supplier/activity"
            className="text-sm text-emerald-600 hover:text-emerald-500 font-medium"
          >
            View all activity →
          </Link>
        </div>
      </div>
    </div>
  );
}

function UpcomingTasks() {
  const tasks = [
    {
      id: 1,
      title: 'Review pending materials',
      description: '3 materials awaiting approval',
      dueDate: 'Today',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Update pricing',
      description: 'Market prices have changed',
      dueDate: 'Tomorrow',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Complete profile',
      description: 'Add missing business documents',
      dueDate: 'This week',
      priority: 'low'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Upcoming Tasks
        </h3>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {task.title}
                </p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {task.description}
              </p>
              <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {task.dueDate}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface EarningsChartProps {
  analytics: any;
}

function EarningsChart({ analytics }: EarningsChartProps) {
  const data = analytics?.earningsHistory || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Earnings Overview
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Your earnings over the last 30 days
        </p>
      </div>
      <div className="p-8">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="#10B981"
              fill="url(#earningsGradient)"
              fillOpacity={0.8}
              strokeWidth={3}
            />
            <defs>
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

interface MaterialPerformanceChartProps {
  materials: any[];
}

function MaterialPerformanceChart({ materials }: MaterialPerformanceChartProps) {
  // Mock performance data
  const performanceData = [
    { category: 'Plastic', views: 120, sales: 8 },
    { category: 'Metal', views: 85, sales: 12 },
    { category: 'Paper', views: 65, sales: 5 },
    { category: 'Glass', views: 45, sales: 3 },
    { category: 'Electronics', views: 95, sales: 7 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Material Performance
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Views vs sales by category
        </p>
      </div>
      <div className="p-8">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={performanceData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#6B7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar dataKey="views" fill="#3B82F6" name="Views" radius={[4, 4, 0, 0]} />
            <Bar dataKey="sales" fill="#10B981" name="Sales" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

interface RecentMaterialsProps {
  materials: any[];
}

function RecentMaterials({ materials }: RecentMaterialsProps) {
  const recentMaterials = materials.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Recent Materials
          </h3>
          <Link
            href="/supplier/materials"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
          >
            View all →
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
            <tr>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Material
              </th>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Price
              </th>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {recentMaterials.map((material) => (
              <motion.tr
                key={material.id}
                whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors"
              >
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0">
                      {material.photos?.[0] ? (
                        <img
                          className="h-12 w-12 rounded-xl object-cover shadow-sm"
                          src={material.photos[0].url}
                          alt={material.title}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                          <ShoppingBagIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {material.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {material.quantity} {material.unit}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {material.category}
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    material.status === MaterialStatus.APPROVED
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : material.status === MaterialStatus.PENDING_REVIEW
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {material.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  LKR {material.pricing?.expectedPrice?.toLocaleString() || '0'}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/supplier/materials/${material.id}`}
                    className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    View
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function TeamOverview() {
  // Mock team data
  const teamStats = {
    totalMembers: 8,
    activeMembers: 7,
    recentActivity: [
      { member: 'John Doe', action: 'Added 3 materials', time: '2h ago' },
      { member: 'Jane Smith', action: 'Updated pricing', time: '4h ago' }
    ]
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Team Overview
          </h3>
          <Link
            href="/supplier/team"
            className="text-sm text-emerald-600 hover:text-emerald-500 font-medium"
          >
            Manage team →
          </Link>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Members</span>
              <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                {teamStats.totalMembers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Active Today</span>
              <span className="text-lg font-medium text-green-600">
                {teamStats.activeMembers}
              </span>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Recent Activity
            </h4>
            <div className="space-y-2">
              {teamStats.recentActivity.map((activity, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {activity.member}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400"> {activity.action}</span>
                  <span className="text-gray-400 dark:text-gray-500 text-xs ml-2">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationOverview() {
  // Mock location data
  const locations = [
    { name: 'Main Office', materials: 45, earnings: 125000 },
    { name: 'Warehouse A', materials: 32, earnings: 89000 },
    { name: 'Branch Office', materials: 18, earnings: 54000 }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Location Performance
          </h3>
          <Link
            href="/supplier/locations"
            className="text-sm text-emerald-600 hover:text-emerald-500 font-medium"
          >
            Manage locations →
          </Link>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {locations.map((location, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {location.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {location.materials} materials
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  LKR {location.earnings.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This month
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner Skeleton */}
      <div className="bg-gray-300 dark:bg-gray-700 h-32 rounded-lg animate-pulse"></div>
      
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="h-48 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
