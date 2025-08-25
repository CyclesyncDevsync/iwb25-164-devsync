import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { SuperAdminDashboard } from '../../../components/admin/SuperAdminDashboard';
import { AdminOperationsDashboard } from '../../../components/admin/AdminOperationsDashboard';
import { AdminNotificationSystem } from '../../../components/admin/AdminNotificationSystem';

export default function AdminDashboardPage() {
  return (
    <DashboardLayout>
      <div className="h-full p-6 space-y-10">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <SuperAdminDashboard />
        <AdminOperationsDashboard />
        <AdminNotificationSystem />
      </div>
    </DashboardLayout>
  );
}
