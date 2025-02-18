import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  TicketIcon, 
  CalendarIcon, 
  UserIcon, 
  ChartBarIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const userNavigation = [
    { name: 'Dashboard', href: '/user/dashboard', icon: HomeIcon },
    { name: 'My Tickets', href: '/user/tickets', icon: TicketIcon },
    { name: 'Events', href: '/user/events', icon: CalendarIcon },
    { name: 'Profile', href: '/user/profile', icon: UserIcon },
  ];

  const organizerNavigation = [
    { name: 'Dashboard', href: '/organizer/dashboard', icon: HomeIcon },
    { name: 'Events', href: '/organizer/events', icon: CalendarIcon },
    { name: 'Analytics', href: '/organizer/analytics', icon: ChartBarIcon },
    { name: 'Profile', href: '/organizer/profile', icon: UserIcon },
    { name: 'Attendance', href: '/organizer/attendance', icon: UserIcon },
  ];

  const navigation = user?.role === 'organizer' ? organizerNavigation : userNavigation;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar component */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col bg-white border-r border-gray-200">
          {/* Logo section */}
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
            <span className="text-xl font-bold">EventHub</span>
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              onClick={onClose}
            >
              <span className="sr-only">Close sidebar</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`${
                    location.pathname === item.href
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon
                    className={`${
                      location.pathname === item.href ? 'text-gray-500' : 'text-gray-400'
                    } mr-3 flex-shrink-0 h-5 w-5`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 