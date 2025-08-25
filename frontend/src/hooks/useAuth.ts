'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  picture?: string;
  email_verified?: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        console.log('Auth check successful, user data:', userData);
        setAuthState({
          user: userData.user,
          loading: false,
          error: null
        });
      } else {
        console.log('Auth check failed, response status:', response.status);
        setAuthState({
          user: null,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthState({
        user: null,
        loading: false,
        error: 'Failed to check authentication status'
      });
    }
  };

  // Login with email and password
  const login = async (email?: string, password?: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        await checkAuthStatus();
      } else {
        const data = await response.json();
        setAuthState(prev => ({ ...prev, loading: false, error: data.message || 'Login failed' }));
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: 'Login failed' }));
    }
  };

  // Register new user
  const register = async (name: string, email: string, password: string, role?: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      if (response.ok) {
        await checkAuthStatus();
      } else {
        const data = await response.json();
        setAuthState(prev => ({ ...prev, loading: false, error: data.message || 'Registration failed' }));
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: 'Registration failed' }));
    }
  };

  // Update user profile
  const updateProfile = async (profile: { name?: string; email?: string }) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (response.ok) {
        await checkAuthStatus();
      } else {
        const data = await response.json();
        setAuthState(prev => ({ ...prev, loading: false, error: data.message || 'Profile update failed' }));
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: 'Profile update failed' }));
    }
  };

  // Logout
  const logout = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setAuthState({ user: null, loading: false, error: null });
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: 'Logout failed' }));
    }
  };

  const user: User | null = authState.user;

  return {
    user,
    loading: authState.loading,
    error: authState.error,
    login,
    register,
    updateProfile,
    logout,
    isAuthenticated: !!authState.user
  };
}

// Redux hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;