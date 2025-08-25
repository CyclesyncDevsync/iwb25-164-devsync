'use client';

import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';
import Link from 'next/link';

export default function LoginButton() {
  const { logout, user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {isAuthenticated ? (
        <div className="flex items-center space-x-4">
          <span>Welcome, {user?.name}!</span>
          <button
            onClick={() => logout()}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/auth/login">
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white">
              Login
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" className="w-full sm:w-auto">
              Sign Up
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}