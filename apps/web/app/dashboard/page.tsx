'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { user, logout, updateProfile, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage('');

    try {
      const updateData: any = {};
      if (name !== user?.name) updateData.name = name;
      if (avatar !== user?.avatar) updateData.avatar = avatar;

      if (Object.keys(updateData).length > 0) {
        await updateProfile(updateData);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('No changes to update.');
      }
    } catch (err: any) {
      setMessage(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err: any) {
      console.error('Logout failed:', err);
      // Still redirect even if logout fails
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">AI Developer OS Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Profile Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Profile Information
                </h3>
                
                {message && (
                  <div className={`mb-4 p-3 rounded-md text-sm ${
                    message.includes('success') 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div>
                    <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      id="avatar"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    {user?.avatar && (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="h-12 w-12 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    {!user?.avatar && (
                      <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {user?.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <a
                    href="/repo"
                    className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Manage Repositories
                  </a>
                  <a
                    href="/analytics"
                    className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Analytics
                  </a>
                  <a
                    href="/voice"
                    className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Voice Assistant
                  </a>
                  <a
                    href="/vision"
                    className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Vision Tools
                  </a>
                </div>
              </div>
            </div>

            {/* Account Info Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Account Details
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">User ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                    <dd className="mt-1">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* GitHub Integration Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Integrations
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="h-6 w-6 text-gray-600 mr-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      <span className="text-sm font-medium text-gray-900">GitHub</span>
                    </div>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      Not Connected
                    </span>
                  </div>
                  <button className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Connect GitHub Account
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Usage Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Repositories</span>
                    <span className="text-sm font-medium text-gray-900">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">API Calls</span>
                    <span className="text-sm font-medium text-gray-900">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Storage Used</span>
                    <span className="text-sm font-medium text-gray-900">0 MB</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
