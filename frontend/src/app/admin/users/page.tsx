'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Loading } from '../../../components/ui/Loading';
import { UsersManagement } from '../../../components/admin/UsersManagement';
import { enhancedToast } from '../../../components/ui/EnhancedToast';
import { redirectToAsgardeoLogin } from '../../../lib/auth-redirect';

export default function UsersPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Protect the route - redirect if not admin
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        enhancedToast.warning('Authentication required.');
        redirectToAsgardeoLogin('/admin/users');
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
    return <Loading text="Loading users management..." fullScreen />;
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
            Users Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <UsersManagement />
      </div>
    </DashboardLayout>
  );
}
