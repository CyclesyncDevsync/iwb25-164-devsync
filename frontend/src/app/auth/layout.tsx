import Image from 'next/image';
import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/globe.svg"
            alt="CircularSync Logo"
            width={64}
            height={64}
            className="mx-auto"
          />
          <h1 className="mt-4 text-3xl font-bold text-primary dark:text-primary-light">
            CircularSync
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
