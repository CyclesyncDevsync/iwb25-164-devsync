import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

interface PasswordChangeFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PasswordChangeForm({ onSuccess, onError }: PasswordChangeFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  const onSubmit = async (data: PasswordChangeFormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulating API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the actual API endpoint when implemented
      // const response = await fetch('/api/auth/change-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     currentPassword: data.currentPassword,
      //     newPassword: data.newPassword
      //   })
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to change password');
      // }

      setSuccess(true);
      reset();
      if (onSuccess) onSuccess();
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your account password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Current Password
            </label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.currentPassword?.message}
                {...register('currentPassword')}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
              >
                {showCurrentPassword ? (
                  <span className="text-xs">Hide</span>
                ) : (
                  <span className="text-xs">Show</span>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              New Password
            </label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
              >
                {showNewPassword ? (
                  <span className="text-xs">Hide</span>
                ) : (
                  <span className="text-xs">Show</span>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
              >
                {showConfirmPassword ? (
                  <span className="text-xs">Hide</span>
                ) : (
                  <span className="text-xs">Show</span>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Password changed successfully
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Changing...' : 'Change password'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
