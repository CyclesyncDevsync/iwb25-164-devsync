'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loading } from '../../components/ui/Loading';
import { Button } from '../../components/ui/Button';

// Redirect page that automatically triggers direct Asgardeo registration
export default function RegisterRedirectPage() {
  const { register, isAuthenticated, getUserDashboardRoute } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const dashboardRoute = getUserDashboardRoute();
      router.push(dashboardRoute);
    }
  }, [isAuthenticated, router, getUserDashboardRoute]);

  useEffect(() => {
    // Automatically trigger registration when this page loads
    const handleRegister = async () => {
      try {
        const result = await register();
        if (!result.success) {
          setError(result.message || 'Registration failed');
        }
      } catch {
        setError('Failed to initiate registration');
      }
    };

    if (!isAuthenticated) {
      handleRegister();
    }
  }, [register, isAuthenticated]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-800">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4 text-red-600 dark:text-red-400">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-lg font-semibold">Registration Error</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-800">
      <div className="text-center">
        <Loading text="Redirecting to Asgardeo..." fullScreen={false} />
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          If you are not redirected automatically, please wait a moment or refresh the page.
        </p>
      </div>
    </div>
  );
}