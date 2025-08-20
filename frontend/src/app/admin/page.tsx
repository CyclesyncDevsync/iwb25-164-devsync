'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { AdminOverview } from '../../components/admin/AdminOverview';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '../../components/ui/Loading';
import { AdminFAB } from '../../components/ui/FloatingActionButton';
import { enhancedToast } from '../../components/ui/EnhancedToast';

export default function AdminDashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        enhancedToast.warning('Please log in to access the admin dashboard.');
        router.push('/auth/login?redirect=/admin');
        return;
      }
      
      if (user?.role !== 'admin') {
        enhancedToast.error('Access denied. Admin privileges required.');
        router.push('/dashboard');
        return;
      }
      
      // Welcome message for admin
      if (user?.role === 'admin') {
        enhancedToast.admin(`Welcome back, ${user.name || 'Admin'}!`);
      }
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading) {
    return <Loading text="Loading admin dashboard..." fullScreen />;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Loading text="Verifying admin credentials..." fullScreen />;
  }

  return (
    <DashboardLayout>
      <div className="h-full p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor and manage your CircularSync platform
          </p>
        </div>
        <AdminOverview />
        <AdminFAB />
      </div>
    </DashboardLayout>
  );
}
