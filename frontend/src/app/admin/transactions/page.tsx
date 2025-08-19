'use client';

// Authentication disabled for development
// TODO: Re-enable authentication checks before production
// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '../../../hooks/useAuth';
// import { USER_ROLES } from '../../../constants';
import DashboardLayout from '../../../components/layout/DashboardLayout';
// import { Loading } from '../../../components/common/Loading';
import { TransactionsManagement } from '../../../components/admin/TransactionsManagement';

export default function TransactionsPage() {
  // const { user, loading, isAuthenticated } = useAuth();
  // const router = useRouter();

  // Protect the route - redirect if not admin
  // useEffect(() => {
  //   if (!loading && (!isAuthenticated || user?.role !== USER_ROLES.ADMIN)) {
  //     router.push('/');
  //   }
  // }, [loading, isAuthenticated, user, router]);

  // if (loading) {
  //   return <Loading text="Loading transactions management..." />;
  // }

  // If not authenticated or not admin, show loading until redirect happens
  // if (!isAuthenticated || user?.role !== USER_ROLES.ADMIN) {
  //   return <Loading text="Verifying admin credentials..." />;
  // }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Transactions Management</h1>
        <TransactionsManagement />
      </div>
    </DashboardLayout>
  );
}
