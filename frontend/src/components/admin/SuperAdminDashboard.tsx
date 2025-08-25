import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { UserManagementTable } from './UserManagementTable';
import { RevenueChart } from './RevenueChart';
import { SystemHealthMonitor } from './SystemHealthMonitor';
import { SystemConfigPanel } from './SystemConfigPanel';

export function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Analytics cards, system stats here */}
            <SystemHealthMonitor />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <UserManagementTable />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <SystemConfigPanel />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
