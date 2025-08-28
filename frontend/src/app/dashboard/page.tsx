'use client';

import { useAuth } from '../../hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/Button';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';

export default function Dashboard() {
  const { user, loading, isAuthenticated, logout, getUserDashboardRoute } = useAuth();
  const router = useRouter();

  // Redirect users to their role-specific dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const roleBasedRoute = getUserDashboardRoute();
      if (roleBasedRoute !== '/dashboard') {
        console.log('Redirecting user to role-specific dashboard:', roleBasedRoute);
        router.push(roleBasedRoute);
        return;
      }
    }
  }, [loading, isAuthenticated, user, router, getUserDashboardRoute]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to home');
      router.push('/');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <Loading text="Loading dashboard..." />;
  }

  // If not authenticated, show loading until redirect happens
  if (!isAuthenticated) {
    return <Loading text="Please login to access the dashboard..." />;
  }

  // Original dashboard content for authenticated users
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* User Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {user?.name || 'Not provided'}</p>
              <p><strong>Email:</strong> {user?.email || 'Not provided'}</p>
              <p><strong>First Name:</strong> {user?.given_name || 'Not provided'}</p>
              <p><strong>Last Name:</strong> {user?.family_name || 'Not provided'}</p>
              <p><strong>User ID:</strong> {user?.id || 'Not provided'}</p>
            </div>
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
              <strong>Raw User Object:</strong>
              <pre className="mt-2 text-xs overflow-auto max-h-40">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Profile from Asgardeo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This shows the detailed user profile fetched from Asgardeo's SCIM API:
            </p>
            <div className="space-x-2 mb-4">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/auth/me');
                    const data = await response.json();
                    console.log('Full session data:', data);
                    alert('Check browser console for full session data');
                  } catch (error) {
                    console.error('Error fetching session data:', error);
                  }
                }}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Log Session Data
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/auth/profile');
                    const data = await response.json();
                    console.log('Fresh profile data:', data);
                    alert('Check browser console for fresh profile data');
                  } catch (error) {
                    console.error('Error fetching fresh profile:', error);
                  }
                }}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                Fetch Fresh Profile
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/auth/test');
                    const data = await response.json();
                    console.log('Test results:', data);
                    alert('Check browser console for test results');
                  } catch (error) {
                    console.error('Error running test:', error);
                  }
                }}
                className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
              >
                Run Auth Test
              </button>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
              <strong>Current User Data:</strong>
              <pre className="mt-2 text-xs overflow-auto max-h-60">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Materials"
            value="128"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Active Auctions"
            value="24"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Materials Pending Verification"
            value="32"
            trend={{ value: 5, isPositive: false }}
          />
          <StatCard
            title="Completed Transactions"
            value="84"
            trend={{ value: 16, isPositive: true }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-status-verified"></div>
                  <div>
                    <p className="text-sm font-medium">Material #M-7823 verified</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-status-auction"></div>
                  <div>
                    <p className="text-sm font-medium">Auction #A-5421 started</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-status-completed"></div>
                  <div>
                    <p className="text-sm font-medium">Transaction #T-9012 completed</p>
                    <p className="text-xs text-gray-500">Yesterday</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>ID:</strong> {user?.id}</p>
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                {user?.given_name && (
                  <p><strong>Given Name:</strong> {user.given_name}</p>
                )}
                {user?.family_name && (
                  <p><strong>Family Name:</strong> {user.family_name}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}