'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ShoppingBagIcon,
  StarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';
import { fetchSupplierAnalytics } from '../../store/slices/supplierSlice';
import { SupplierType } from '../../types/supplier';

const timeRangeOptions = [
  { value: 'week', label: '7 Days' },
  { value: 'month', label: '30 Days' },
  { value: 'quarter', label: '3 Months' },
  { value: 'year', label: '12 Months' }
];

const COLORS = {
  primary: '#10B981',
  secondary: '#3B82F6',
  accent: '#8B5CF6',
  warning: '#F59E0B',
  danger: '#EF4444',
  success: '#059669'
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.warning, COLORS.danger];

export default function SupplierAnalytics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const dispatch = useAppDispatch();
  const { analytics, loading, profile } = useAppSelector(state => state.supplier);

  useEffect(() => {
    dispatch(fetchSupplierAnalytics(timeRange));
  }, [dispatch, timeRange]);

  if (loading.analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No analytics data</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Analytics will appear here once you start selling materials.
        </p>
      </div>
    );
  }

  const isOrganization = profile?.type === SupplierType.ORGANIZATION;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track your performance and earnings over time
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Earnings"
          value={`LKR ${analytics.totalEarnings.toLocaleString()}`}
          change={analytics.monthlyEarnings}
          changeLabel="vs last month"
          icon={CurrencyDollarIcon}
          color="emerald"
        />
        
        <MetricCard
          title="Materials Sold"
          value={analytics.soldMaterials.toString()}
          change={analytics.soldMaterials - analytics.activeMaterials}
          changeLabel="vs active"
          icon={ShoppingBagIcon}
          color="blue"
        />
        
        <MetricCard
          title="Conversion Rate"
          value={`${(analytics.conversionRate * 100).toFixed(1)}%`}
          change={analytics.conversionRate * 100 - 50}
          changeLabel="vs average"
          icon={ArrowTrendingUpIcon}
          color="purple"
        />
        
        <MetricCard
          title="Average Rating"
          value={analytics.averageRating.toFixed(1)}
          change={analytics.averageRating - 4.0}
          changeLabel="vs 4.0"
          icon={StarIcon}
          color="yellow"
        />
      </div>

      {/* Earnings Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Earnings Overview
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track your earnings and transaction volume over time
          </p>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={analytics.earningsHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis tick={{ fontSize: 12 }} axisLine={{ stroke: '#E5E7EB' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="earnings"
                stackId="1"
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.6}
                name="Earnings (LKR)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Performance and Material Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Category Performance
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Sales distribution by material category
            </p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.topCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, totalSales }) => `${category}: ${totalSales}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalSales"
                >
                  {analytics.topCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Material Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Top Materials
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Best performing materials by final price
            </p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.materialPerformance.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="title" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="finalPrice" fill={COLORS.secondary} name="Final Price (LKR)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Market Insights
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Recommendations to improve your sales performance
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.marketInsights.map((insight, index) => (
              <MarketInsightCard key={index} insight={insight} />
            ))}
          </div>
        </div>
      </div>

      {/* Success Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Success Metrics
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Key performance indicators for your business
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analytics.successMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </span>
                  <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                    {metric.unit}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {metric.metric}
                </p>
                <div className={`flex items-center justify-center mt-1 text-xs ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 
                  'text-gray-500'
                }`}>
                  {metric.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                  ) : metric.trend === 'down' ? (
                    <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />
                  ) : null}
                  {metric.percentage > 0 ? '+' : ''}{metric.percentage.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Organization-specific Analytics */}
      {isOrganization && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Organization Analytics
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Advanced analytics for your organization
            </p>
          </div>
          <div className="p-6">
            <OrganizationAnalytics analytics={analytics} />
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'emerald' | 'blue' | 'purple' | 'yellow';
}

function MetricCard({ title, value, change, changeLabel, icon: Icon, color }: MetricCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
  };

  const isPositive = change > 0;
  const isNegative = change < 0;

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
      <div className="mt-4">
        <div className="flex items-center text-sm">
          {isPositive ? (
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
          ) : isNegative ? (
            <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
          ) : null}
          <span className={`font-medium ${
            isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
          }`}>
            {isPositive ? '+' : ''}{change.toFixed(1)}
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">{changeLabel}</span>
        </div>
      </div>
    </motion.div>
  );
}

interface MarketInsightCardProps {
  insight: {
    category: string;
    demandTrend: 'increasing' | 'stable' | 'decreasing';
    averagePrice: number;
    competitorCount: number;
    recommendation: string;
  };
}

function MarketInsightCard({ insight }: MarketInsightCardProps) {
  const trendColors = {
    increasing: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
    stable: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
    decreasing: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white capitalize">
          {insight.category}
        </h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${trendColors[insight.demandTrend]}`}>
          {insight.demandTrend}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex justify-between">
          <span>Avg Price:</span>
          <span className="font-medium">LKR {insight.averagePrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Competitors:</span>
          <span className="font-medium">{insight.competitorCount}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {insight.recommendation}
        </p>
      </div>
    </div>
  );
}

interface OrganizationAnalyticsProps {
  analytics: any;
}

function OrganizationAnalytics({ analytics }: OrganizationAnalyticsProps) {
  // Mock organization-specific data
  const teamPerformance = [
    { member: 'John Doe', materials: 45, earnings: 125000 },
    { member: 'Jane Smith', materials: 38, earnings: 98000 },
    { member: 'Bob Johnson', materials: 32, earnings: 87000 },
    { member: 'Alice Brown', materials: 28, earnings: 76000 }
  ];

  const locationPerformance = [
    { location: 'Colombo Office', materials: 78, earnings: 210000 },
    { location: 'Kandy Branch', materials: 45, earnings: 125000 },
    { location: 'Galle Branch', materials: 32, earnings: 89000 }
  ];

  return (
    <div className="space-y-6">
      {/* Team Performance */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Team Performance
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Team Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Materials
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Earnings
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {teamPerformance.map((member, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {member.member}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {member.materials}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    LKR {member.earnings.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Location Performance */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Location Performance
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={locationPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="location" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="materials" fill={COLORS.primary} name="Materials" />
            <Bar dataKey="earnings" fill={COLORS.secondary} name="Earnings (LKR)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
