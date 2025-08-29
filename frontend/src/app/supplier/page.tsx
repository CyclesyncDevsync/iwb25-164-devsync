'use client';

import SupplierLayout from '../../components/layout/SupplierLayout';
import SupplierDashboard from '../../components/supplier/SupplierDashboard';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function SupplierPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPPLIER']}>
      <SupplierLayout>
        <SupplierDashboard />
      </SupplierLayout>
    </ProtectedRoute>
  );
}
