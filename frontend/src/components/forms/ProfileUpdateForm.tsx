import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';

const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;

interface ProfileUpdateFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function ProfileUpdateForm({ onSuccess, onError }: ProfileUpdateFormProps) {
  const { user, updateProfile, loading, error: authError } = useAuth();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    }
  });

  const onSubmit = async (data: ProfileUpdateFormValues) => {
    try {
      await updateProfile(data);
      setSuccess(true);
      if (onSuccess) onSuccess();
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (onError) onError(authError || 'Profile update failed');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your account profile information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          {authError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{authError}</p>
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
                    Profile updated successfully
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update profile'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
