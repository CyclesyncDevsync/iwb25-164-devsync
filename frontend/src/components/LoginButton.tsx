'use client';

import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';

export default function LoginButton() {
  const { logout, user, loading, isAuthenticated, login, register } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {isAuthenticated ? (
        <div className="flex items-center space-x-4">
          <span>Welcome, {user?.email?.split('@')[0] || 'User'}!</span>
          <button
            onClick={() => logout()}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={login}
            disabled={loading}
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Login'}
          </Button>
          <Button 
            variant="outline" 
            onClick={register}
            disabled={loading}
            className="w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </Button>
        </div>
      )}
    </div>
  );
}