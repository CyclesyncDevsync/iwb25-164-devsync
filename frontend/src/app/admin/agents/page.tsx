'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Loading } from '../../../components/ui/Loading';
import { AgentsManagement } from '../../../components/admin/AgentsManagement';
import { enhancedToast } from '../../../components/ui/EnhancedToast';

export default function AgentsPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Protect the route - redirect if not admin or super admin
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        enhancedToast.warning('Authentication required.');
        router.push('/auth/login?redirect=/admin/agents');
        return;
      }
      
      if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        enhancedToast.error('Admin access required.');
        router.push('/dashboard');
        return;
      }
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading) {
    return <Loading text="Loading agents management..." fullScreen />;
  }

  // If not authenticated or not admin/super admin, show loading until redirect happens
  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
    return <Loading text="Verifying admin credentials..." fullScreen />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Agent Management
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage field agents, their assignments, and performance metrics
          </p>
        </div>
        <AgentsManagement />
      </div>
    </DashboardLayout>
  );
}