import React, { useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { Button } from '../components/common';
import { useToast } from '../components/common/useToast';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile(displayName);
      addToast('Profile updated successfully!', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">User Profile</h2>

          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {user?.photoURL ? (
                  <img
                    className="h-20 w-20 rounded-full"
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {user?.displayName?.charAt(0).toUpperCase() ||
                        user?.email?.charAt(0).toUpperCase() ||
                        'U'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {user?.displayName || 'No name set'}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter your display name"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 sm:text-sm cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">Email address cannot be changed.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <input
                type="text"
                value={user?.uid || ''}
                disabled
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 sm:text-sm cursor-not-allowed font-mono text-xs"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-6 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Account Status</dt>
              <dd className="text-sm text-gray-900">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Authentication Method</dt>
              <dd className="text-sm text-gray-900">
                {user?.providerId === 'google.com'
                  ? 'Google'
                  : user?.providerId === 'password'
                    ? 'Email/Password'
                    : user?.providerId || 'Unknown'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
