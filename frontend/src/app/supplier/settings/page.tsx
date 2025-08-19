'use client';

import SupplierLayout from '@/components/layout/SupplierLayout';
import { SupplierSettingsComponent } from '@/components/supplier/SupplierSettings';

export default function SettingsPage() {
  return (
    <SupplierLayout>
      <SupplierSettingsComponent />
    </SupplierLayout>
  );
}
