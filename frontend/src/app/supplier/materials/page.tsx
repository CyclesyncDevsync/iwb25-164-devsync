'use client';

import SupplierLayout from '../../../components/layout/SupplierLayout';
import MaterialManagement from '../../../components/supplier/MaterialManagement';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';

export default function MaterialsPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPPLIER']}>
      <SupplierLayout>
        <MaterialManagement />
      </SupplierLayout>
    </ProtectedRoute>
  );
}
