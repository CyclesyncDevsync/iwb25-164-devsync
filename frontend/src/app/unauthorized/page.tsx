'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          Unauthorized Access
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          You don't have permission to access this page.
        </p>
        <div className="mt-6 space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Go Back
          </button>
          <Link
            href="/"
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}