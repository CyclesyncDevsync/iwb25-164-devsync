'use client';

import SupplierLayout from '../../../components/layout/SupplierLayout';
import OrderManagement from '../../../components/supplier/OrderManagement';

export default function OrdersPage() {
  return (
    <SupplierLayout>
      <OrderManagement />
    </SupplierLayout>
  );
}
