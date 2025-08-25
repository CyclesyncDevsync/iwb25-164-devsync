import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/Card';

interface VerifyEmailFormProps {
  token?: string;
  email?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function VerifyEmailForm({ token, email, onSuccess, onError }: VerifyEmailFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setVerifying(false);
    }
  }, [token]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const verifyToken = async (token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulating API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the actual API endpoint when implemented
      // const response = await fetch(`/api/auth/verify-email?token=${token}`, {
      //   method: 'GET'
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to verify email');
      // }

      setVerified(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify email';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  const resendVerification = async () => {
    if (!email) return;
    
    setLoading(true);
    setError(null);
    setResendDisabled(true);
    
    try {
      // Simulating API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the actual API endpoint when implemented
      // const response = await fetch('/api/auth/resend-verification', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to resend verification email');
      // }

      setCountdown(60); // 60 seconds cooldown
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend verification email';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
        <CardDescription className="text-center">
          {verifying 
            ? 'Verifying your email...'
            : verified
              ? 'Your email has been verified!'
              : 'Please verify your email address to continue'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {verifying ? (
          <div className="flex justify-center py-4">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : verified ? (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Your email has been successfully verified
                  </p>
                </div>
              </div>
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={() => router.push('/login')}
            >
              Continue to login
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              We've sent a verification email to <span className="font-semibold">{email || 'your email address'}</span>. 
              Please check your inbox and click on the verification link to continue.
            </p>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-2">
              <Button
                type="button"
                className="w-full"
                disabled={resendDisabled || loading}
                onClick={resendVerification}
              >
                {loading 
                  ? 'Sending...' 
                  : resendDisabled 
                    ? `Resend in ${countdown}s` 
                    : 'Resend verification email'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push('/login')}
              >
                Back to login
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          {!verified && 'If you did not receive an email, please check your spam folder.'}
        </div>
      </CardFooter>
    </Card>
  );
}
