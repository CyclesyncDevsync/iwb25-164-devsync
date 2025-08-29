'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Loading } from '../../../components/ui/Loading';
import { MaterialsManagement } from '../../../components/admin/MaterialsManagement';
import { enhancedToast } from '../../../components/ui/EnhancedToast';

export default function MaterialsPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Protect the route - redirect if not admin
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        enhancedToast.warning('Authentication required.');
        router.push('/auth/login?redirect=/admin/materials');
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
    return <Loading text="Loading materials management..." fullScreen />;
  }

  // If not authenticated or not admin/super admin, show loading until redirect happens
  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
    return <Loading text="Verifying admin credentials..." fullScreen />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Materials Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage material listings and quality standards
          </p>
        </div>
        <MaterialsManagement />
      </div>
    </DashboardLayout>
  );
}
