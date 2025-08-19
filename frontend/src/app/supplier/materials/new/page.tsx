'use client';

import SupplierLayout from '../../../../components/layout/SupplierLayout';
import MaterialRegistration from '../../../../components/supplier/MaterialRegistration';

export default function NewMaterialPage() {
  const handleMaterialCreated = (material: any) => {
    // Redirect to materials list or show success message
    console.log('Material created:', material);
    window.location.href = '/supplier/materials';
  };

  return (
    <SupplierLayout>
      <MaterialRegistration onComplete={handleMaterialCreated} />
    </SupplierLayout>
  );
}
