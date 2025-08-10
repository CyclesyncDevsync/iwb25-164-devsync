'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { UserType } from '@/types/auth';

// Validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  userType: z.nativeEnum(UserType).optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  userType?: UserType;
  isAdmin?: boolean;
}

export default function LoginForm({ userType, isAdmin = false }: LoginFormProps) {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      userType: userType || (isAdmin ? UserType.ADMIN : undefined),
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login({
        username: data.username,
        password: data.password,
        userType: data.userType,
      });

      toast.success('Login successful!');
      
      // Redirect based on user type
      if (isAdmin) {
        router.push('/admin/dashboard');
      } else {
        switch (data.userType) {
          case UserType.BUYER:
            router.push('/buyer/dashboard');
            break;
          case UserType.SUPPLIER_INDIVIDUAL:
          case UserType.SUPPLIER_ORGANIZATION:
            router.push('/supplier/dashboard');
            break;
          case UserType.ADMIN:
            router.push('/admin/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  const handleUserTypeChange = (type: UserType) => {
    setValue('userType', type);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isAdmin ? 'Admin Sign In' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {!isAdmin && !userType && (
              <>
                Or{' '}
                <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                  create a new account
                </Link>
              </>
            )}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                {...register('username')}
                type="text"
                autoComplete="username"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>
            
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="h-5 w-5 text-gray-400 cursor-pointer">
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* User Type Selection (if not preset) */}
          {!isAdmin && !userType && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Login as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleUserTypeChange(UserType.BUYER)}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="text-blue-600 font-medium">Buyer</div>
                  <div className="text-sm text-blue-500">Purchase products</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleUserTypeChange(UserType.SUPPLIER_INDIVIDUAL)}
                  className="bg-green-50 border border-green-200 rounded-lg p-3 text-center hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <div className="text-green-600 font-medium">Individual Supplier</div>
                  <div className="text-sm text-green-500">Sell as individual</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleUserTypeChange(UserType.SUPPLIER_ORGANIZATION)}
                  className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <div className="text-purple-600 font-medium">Organization</div>
                  <div className="text-sm text-purple-500">Business supplier</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleUserTypeChange(UserType.ADMIN)}
                  className="bg-red-50 border border-red-200 rounded-lg p-3 text-center hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <div className="text-red-600 font-medium">Admin</div>
                  <div className="text-sm text-red-500">System administrator</div>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {!isAdmin && (
            <div className="text-center">
              <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </div>
          )}

          {isAdmin && (
            <div className="text-center">
              <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
                Back to regular login
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
