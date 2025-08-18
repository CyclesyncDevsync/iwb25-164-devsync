'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { USER_ROLES } from '../../constants';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { AdminOverview } from '../../components/admin/AdminOverview';
import { Loading } from '../../components/ui/Loading';

export default function AdminDashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Protect the route - redirect if not admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== USER_ROLES.ADMIN)) {
      router.push('/');
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading) {
    return <Loading text="Loading admin dashboard..." />;
  }

  // If not authenticated or not admin, show loading until redirect happens
  if (!isAuthenticated || user?.role !== USER_ROLES.ADMIN) {
    return <Loading text="Verifying admin credentials..." />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <AdminOverview />
      </div>
    </DashboardLayout>
  );
}
