import React from 'react';
import Link from 'next/link';
import { StatCard } from '../dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ROUTES } from '../../constants';
import WalletBalance from '../shared/WalletBalance';
export function AdminOverview() {
  // Normally, these would be fetched from an API
  const stats = {
    users: {
      total: 256,
      trend: { value: 12, isPositive: true }
    },
    materials: {
      total: 178,
      trend: { value: 8, isPositive: true }
    },
    auctions: {
      active: 42,
      trend: { value: 5, isPositive: true }
    },
    transactions: {
      total: 128,
      trend: { value: 20, isPositive: true }
    },
    revenue: {
      total: '$12,540',
      trend: { value: 15, isPositive: true }
    },
    verificationPending: {
      total: 28,
      trend: { value: 5, isPositive: false }
    },
    disputes: {
      total: 4,
      trend: { value: 2, isPositive: false }
    },
    systemHealth: {
      uptime: '99.8%',
      trend: { value: 0.2, isPositive: true }
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href={ROUTES.ADMIN.USERS} className="block transition-transform hover:scale-105">
          <StatCard
            title="Total Users"
            value={stats.users.total}
            trend={stats.users.trend}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
        </Link>
        
        <Link href={ROUTES.ADMIN.MATERIALS} className="block transition-transform hover:scale-105">
          <StatCard
            title="Total Materials"
            value={stats.materials.total}
            trend={stats.materials.trend}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            }
          />
        </Link>
        
        <Link href={ROUTES.ADMIN.AUCTIONS} className="block transition-transform hover:scale-105">
          <StatCard
            title="Active Auctions"
            value={stats.auctions.active}
            trend={stats.auctions.trend}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20V10" />
                <path d="M18 20V4" />
                <path d="M6 20v-6" />
              </svg>
            }
          />
        </Link>
        
        <Link href={ROUTES.ADMIN.TRANSACTIONS} className="block transition-transform hover:scale-105">
          <StatCard
            title="Total Transactions"
            value={stats.transactions.total}
            trend={stats.transactions.trend}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />
        </Link>
      </div>

      {/* Revenue & Health */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{stats.revenue.total}</div>
            <p className={`text-sm ${stats.revenue.trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {stats.revenue.trend.isPositive ? '↑' : '↓'} {stats.revenue.trend.value}% from last month
            </p>
            <div className="mt-4 h-40 w-full bg-gray-100 dark:bg-gray-800 rounded flex items-end justify-between p-2">
              {/* Mock chart bars */}
              {[35, 55, 25, 45, 65, 75, 45].map((height, i) => (
                <div 
                  key={i} 
                  className="w-8 bg-primary dark:bg-primary-light rounded-t"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 grid-rows-2">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">{stats.systemHealth.uptime}</div>
                  <p className="text-sm text-gray-500">System Uptime</p>
                </div>
                <div className="h-16 w-16 rounded-full border-4 border-green-500 flex items-center justify-center">
                  <span className="text-green-500 text-sm font-bold">Healthy</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <div className="text-green-500">✓</div>
                  <div className="text-xs">API</div>
                </div>
                <div className="text-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <div className="text-green-500">✓</div>
                  <div className="text-xs">Database</div>
                </div>
                <div className="text-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <div className="text-green-500">✓</div>
                  <div className="text-xs">Storage</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-amber-500">{stats.verificationPending.total}</div>
                  <p className="text-sm text-gray-500">Verifications</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">{stats.disputes.total}</div>
                  <p className="text-sm text-gray-500">Disputes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'user', action: 'registered', name: 'John Doe', time: '5 minutes ago' },
              { type: 'material', action: 'verified', name: 'Recycled Aluminum', time: '25 minutes ago' },
              { type: 'auction', action: 'completed', name: 'Batch #45892', time: '1 hour ago' },
              { type: 'transaction', action: 'processed', name: '$2,450.00', time: '3 hours ago' },
              { type: 'dispute', action: 'resolved', name: 'Ticket #9872', time: '5 hours ago' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start">
                <div className={`mr-3 mt-0.5 p-1.5 rounded-full 
                  ${activity.type === 'user' ? 'bg-blue-100 text-blue-500' : 
                    activity.type === 'material' ? 'bg-green-100 text-green-500' : 
                    activity.type === 'auction' ? 'bg-purple-100 text-purple-500' : 
                    activity.type === 'transaction' ? 'bg-amber-100 text-amber-500' : 
                    'bg-red-100 text-red-500'}`}
                >
                  {activity.type === 'user' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  ) : activity.type === 'material' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                  ) : activity.type === 'auction' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20V10" />
                      <path d="M18 20V4" />
                      <path d="M6 20v-6" />
                    </svg>
                  ) : activity.type === 'transaction' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.name}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="font-medium">Add New Admin</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">Create a new administrator account with system privileges</p>
            <Link href={ROUTES.ADMIN.USERS} className="text-primary text-sm font-medium hover:underline">
              Manage Users →
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-amber-100 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="font-medium">Resolve Disputes</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">Review and resolve pending disputes between users</p>
            <Link href={ROUTES.ADMIN.DISPUTES} className="text-primary text-sm font-medium hover:underline">
              View Disputes →
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <line x1="18" y1="12" x2="18" y2="12.01" />
                  <line x1="18" y1="16" x2="18" y2="16.01" />
                  <line x1="6" y1="12" x2="15" y2="12" />
                  <line x1="6" y1="16" x2="15" y2="16" />
                </svg>
              </div>
              <h3 className="font-medium">System Reports</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">Generate and download system reports and analytics</p>
            <Link href={ROUTES.ADMIN.REPORTS} className="text-primary text-sm font-medium hover:underline">
              View Reports →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
