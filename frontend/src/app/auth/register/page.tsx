'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '../../../components/forms/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/verify-email');
  };

  return (
    <div>
      <p className="mt-2 text-center text-gray-600 dark:text-gray-400 mb-6">
        Create your account
      </p>
      <RegisterForm onSuccess={handleSuccess} />
    </div>
  );
}
