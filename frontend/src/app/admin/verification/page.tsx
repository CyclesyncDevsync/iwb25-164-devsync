'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Loading } from '../../../components/ui/Loading';
import { MaterialVerification } from '../../../components/admin/MaterialVerification';
import { enhancedToast } from '../../../components/ui/EnhancedToast';

export default function MaterialVerificationPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Protect the route - redirect if not admin
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        enhancedToast.warning('Authentication required.');
        router.push('/auth/login?redirect=/admin/verification');
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
    return <Loading text="Loading material verification..." fullScreen />;
  }

  // If not authenticated or not admin/super admin, show loading until redirect happens
  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
    return <Loading text="Verifying admin credentials..." fullScreen />;
  }

  return (
    <DashboardLayout>
      <div className="p-6 pt-20">
        <MaterialVerification />
      </div>
    </DashboardLayout>
  );
}