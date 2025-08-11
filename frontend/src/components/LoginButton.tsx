'use client';

import { useAuth } from '@/hooks/useAuth';

export default function LoginButton() {
  const { login, logout, user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {isAuthenticated ? (
        <div className="flex items-center space-x-4">
          <span>Welcome, {user?.name}!</span>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={login}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Login with Asgardeo
        </button>
      )}
    </div>
  );
}