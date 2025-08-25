'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { USER_ROLES } from '../../constants';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, updateProfile } = useAuth();

  // State for profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // State for password changing
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Populate form fields when user data loads
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      // Call updateProfile function from useAuth
      await updateProfile({ name, email });
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setPasswordError('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    // In a real app, you would call an API to change the password
    // For demo purposes, we'll just show success
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset form and show success message
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsChangingPassword(false);
    setSuccessMessage('Password changed successfully');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  // Function to get color class based on user role
  const getRoleColorClass = () => {
    switch (user.role) {
      case USER_ROLES.ADMIN:
        return 'bg-primary text-white';
      case USER_ROLES.AGENT:
        return 'bg-blue-500 text-white';
      case USER_ROLES.SUPPLIER:
        return 'bg-emerald-500 text-white';
      case USER_ROLES.BUYER:
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold uppercase text-gray-600">
                    {user.name ? user.name.charAt(0) : '?'}
                  </div>
                </div>
                <CardTitle className="mt-4">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
                <div className={`mt-2 px-3 py-1 rounded-full text-xs inline-block ${getRoleColorClass()}`}>
                  {user.role}
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-500">
                  Account created on {new Date().toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Edit Profile Form */}
          <div className="md:col-span-2">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium">
                        Name
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    {error && (
                      <div className="text-sm text-red-500">
                        {error}
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : isChangingPassword ? (
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="current-password" className="block text-sm font-medium">
                        Current Password
                      </label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="new-password" className="block text-sm font-medium">
                        New Password
                      </label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="confirm-password" className="block text-sm font-medium">
                        Confirm New Password
                      </label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    {passwordError && (
                      <div className="text-sm text-red-500">
                        {passwordError}
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setIsChangingPassword(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Changing...' : 'Change Password'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences and security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-1">Password & Security</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      It's a good idea to use a strong password that you don't use elsewhere
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsChangingPassword(true)}
                    >
                      Change Password
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-1">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Add an extra layer of security to your account
                    </p>
                    <Button variant="outline">Setup 2FA</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-1">Notification Settings</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Control how we communicate with you
                    </p>
                    <Button variant="outline">Manage Notifications</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
