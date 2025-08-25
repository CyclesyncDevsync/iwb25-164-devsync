'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '../../../components/forms/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  
  const handleSuccess = () => {
    router.push('/dashboard');
  };

  return (
    <div>
      <p className="mt-2 text-center text-gray-600 dark:text-gray-400 mb-6">
        Sign in to your account
      </p>
      <LoginForm onSuccess={handleSuccess} />
    </div>
  );
}
