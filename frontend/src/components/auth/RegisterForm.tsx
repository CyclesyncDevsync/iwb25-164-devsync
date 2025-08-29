import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';

export default function RegisterForm() {
  const { register, loading, error, clearAuthError, isAuthenticated, user, getUserDashboardRoute } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardRoute = getUserDashboardRoute();
      router.push(dashboardRoute);
    }
  }, [isAuthenticated, user, router, getUserDashboardRoute]);

  const handleSubmit = async () => {
    clearAuthError();
    setMessage('');
    
    console.log('Register button clicked - starting Asgardeo authentication');
    const result = await register();
    
    if (result && !result.success) {
      setMessage(result.message || 'Registration failed');
    }
    // Success will be handled by redirect to Asgardeo
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-6">
        {/* Success Message */}
        {message && !error && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Create Your CycleSync Account
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Join our sustainable marketplace. After creating your account, you'll choose whether you're a buyer or supplier.
          </p>
        </div>

        {/* Register Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redirecting...
            </div>
          ) : (
            <>
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 6l-6 6-3-3 1.41-1.41L11 11.17l4.59-4.58L17 8z" fill="currentColor"/>
              </svg>
              Create Account with Asgardeo
            </>
          )}
        </button>

        {/* Info Message */}
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z"/>
            </svg>
            <div>
              <p><strong>How it works:</strong></p>
              <p>1. Create your account securely with Asgardeo</p>
              <p>2. Choose if you're a buyer or supplier</p>
              <p>3. Start using CycleSync immediately!</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Already have an account?</span>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <Link 
            href="/auth/login" 
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Sign in to your account
          </Link>
        </div>

        {/* Support Contact */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Need help? Contact us at{' '}
            <Link 
              href="mailto:support@cyclesync.com" 
              className="text-blue-600 hover:text-blue-500"
            >
              support@cyclesync.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
