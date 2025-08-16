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

  const handleResendEmail = async () => {
    setError('');
    
    try {
      // In a real app, you would call an API endpoint here to resend verification email
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setCountdown(60); // Set 60 second cooldown
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
      console.error('Resend verification email failed:', err);
    }
  };

  if (isVerified) {
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

          <Card>
            <CardHeader>
              <CardTitle>Email Verified!</CardTitle>
              <CardDescription>
                Your email has been successfully verified
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Thank you for verifying your email address. Your account is now fully activated.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => router.push('/login')}
              >
                Continue to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

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
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Email Verification
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>
              {email 
                ? `We've sent a verification link to ${email}` 
                : 'Please check your email for a verification link'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-4 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary/80 dark:text-primary-light/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please check your inbox and click the verification link to complete your registration.
            </p>
            
            {isVerifying && (
              <div className="text-primary dark:text-primary-light">
                Verifying your email...
              </div>
            )}
            
            {error && (
              <div className="text-sm text-red-500 dark:text-red-400 mb-4">
                {error}
              </div>
            )}
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Didn't receive the email?{' '}
              {countdown > 0 ? (
                <span>Resend in {countdown}s</span>
              ) : (
                <button 
                  onClick={handleResendEmail}
                  className="text-primary hover:text-primary/80 dark:text-primary-light"
                >
                  Click to resend
                </button>
              )}
            </p>
          </CardContent>
          <CardFooter>
            <div className="w-full">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/login')}
              >
                Back to login
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
