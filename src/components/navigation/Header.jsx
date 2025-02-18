import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const displayName = user?.name || user?.organizationName || 'Guest';
  const role = user?.role === 'organizer' ? 'Organizer' : 'User';

  return (
    <header className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex items-center">
          <button
            type="button"
            className="lg:hidden px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            {isSidebarOpen ? (
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
          <h1 className="text-xl font-semibold text-gray-900 ml-2 lg:ml-0">Dashboard</h1>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6">
          <div className="hidden sm:flex items-center space-x-4">
            <span className="text-sm text-gray-500">{role}</span>
            <span className="text-sm text-gray-700">{displayName}</span>
          </div>
          <div className="ml-3">
            <button
              onClick={logout}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 