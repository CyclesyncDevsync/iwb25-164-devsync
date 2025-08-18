'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { VerifyEmailForm } from '../../../components/forms/VerifyEmailForm';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get('email') || '';
  const token = searchParams?.get('token');
  
  const handleSuccess = () => {
    router.push('/login');
  };

  return (
    <div>
      <p className="mt-2 text-center text-gray-600 dark:text-gray-400 mb-6">
        Verify your email address
      </p>
      <VerifyEmailForm 
        token={token || undefined} 
        email={email || undefined}
        onSuccess={handleSuccess} 
      />
    </div>
  );
}
