'use client';

import { useEffect, useState } from 'react';
import type { User } from '../types/user';

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
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setAuthState({
          user: userData.user,
          loading: false,
          error: null
        });
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null
        });
      }
    } catch (error) {
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