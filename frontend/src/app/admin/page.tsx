'use client';

import DashboardLayout from '../../components/layout/DashboardLayout';
import { AdminOverview } from '../../components/admin/AdminOverview';

export default function AdminDashboard() {
  // Authentication disabled for development
  // TODO: Re-enable authentication checks before production

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <AdminOverview />
      </div>
    </DashboardLayout>
  );
}
