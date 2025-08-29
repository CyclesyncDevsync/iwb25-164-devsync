'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';

export default function RoleSelectionPage() {
  const { completeRegistration, loading, error, clearAuthError } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'supplier' | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Clear any existing errors when component mounts
    clearAuthError();
  }, [clearAuthError]);

  const handleRoleSelect = (role: 'buyer' | 'supplier') => {
    setSelectedRole(role);
    clearAuthError();
    setMessage('');
  };

  const handleContinue = async () => {
    if (!selectedRole) {
      setMessage('Please select your role to continue');
      return;
    }

    clearAuthError();
    setMessage('');

    console.log('=== ROLE SELECTION PAGE: Starting registration ===');
    console.log('Selected role:', selectedRole);
    console.log('Calling completeRegistration...');
    
    const result = await completeRegistration(selectedRole);
    
    console.log('=== ROLE SELECTION PAGE: Registration result ===');
    console.log('Result:', JSON.stringify(result, null, 2));

    if (result && result.success) {
      console.log('Registration completed successfully');
      console.log('Redirect URL:', result.redirectUrl);
      if (result.redirectUrl) {
        console.log('Redirecting to:', result.redirectUrl);
        router.push(result.redirectUrl);
      }
    } else {
      console.log('Registration failed:', result?.message);
      setMessage(result?.message || 'Registration completion failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to CycleSync!
          </h1>
          <p className="mt-2 text-gray-600">
            To complete your registration, please select your role in our marketplace
          </p>
        </div>

        {/* Messages */}
        {message && !error && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Role Selection Cards */}
        <div className="space-y-4">
          {/* Buyer Card */}
          <div
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedRole === 'buyer'
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-300 hover:border-blue-300 hover:shadow-sm'
            }`}
            onClick={() => handleRoleSelect('buyer')}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                  selectedRole === 'buyer' ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {selectedRole === 'buyer' && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  🏢 I'm a Buyer
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  I represent a company that purchases recyclable materials, waste products, or sustainable goods for processing or resale.
                </p>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    <strong>Access to:</strong> Browse suppliers, place orders, participate in auctions, manage procurement
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Card */}
          <div
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedRole === 'supplier'
                ? 'border-green-500 bg-green-50 shadow-md'
                : 'border-gray-300 hover:border-green-300 hover:shadow-sm'
            }`}
            onClick={() => handleRoleSelect('supplier')}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                  selectedRole === 'supplier' ? 'border-green-500' : 'border-gray-300'
                }`}>
                  {selectedRole === 'supplier' && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  🏭 I'm a Supplier
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  I represent a company that provides recyclable materials, waste products, or sustainable goods to buyers in the circular economy.
                </p>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    <strong>Access to:</strong> List materials, manage inventory, respond to buyer requests, create auctions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedRole || loading}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 ${
            selectedRole && !loading
              ? selectedRole === 'buyer'
                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              : 'bg-gray-400 cursor-not-allowed'
          } focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Completing Registration...
            </div>
          ) : (
            <>
              Continue as {selectedRole ? (selectedRole === 'buyer' ? 'Buyer' : 'Supplier') : '...'}
              <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        {/* Info */}
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
          <div className="flex">
            <svg className="w-5 h-5 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z"/>
            </svg>
            <div>
              <p><strong>Note:</strong> Your role determines which features you can access. You can contact support later to change your role if needed.</p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Questions about roles? Contact us at{' '}
            <a 
              href="mailto:support@cyclesync.com" 
              className="text-blue-600 hover:text-blue-500"
            >
              support@cyclesync.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}