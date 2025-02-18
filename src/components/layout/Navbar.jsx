import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug log to check user data
  console.log('Current user data:', user);

  // Check if we're on a dashboard page
  const isDashboardPage = location.pathname.includes('/dashboard') ||
                         location.pathname.includes('/organizer') ||
                         location.pathname.includes('/user');

  useEffect(() => {
    if (!isDashboardPage) {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 20);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setIsScrolled(true);
    }
  }, [isDashboardPage]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Don't show navbar on login/register pages
  if (location.pathname.includes('/login/') || location.pathname.includes('/register/')) {
    return null;
  }

  // Different navigation items based on user role
  const getNavigationItems = () => {
    if (!user) {
      return [
        { name: 'Events', path: '/events' },
        { name: 'About', path: '/about' },
        { name: 'Calendar', path: '/calendar' },
        { name: 'Budget Calculator', path: '/budget-calculator' },
      ];
    }

    if (user.role === 'organizer') {
      return [
        { name: 'Dashboard', path: '/organizer/dashboard' },
        { name: 'Events', path: '/organizer/events' },
        { name: 'Analytics', path: '/organizer/analytics' },
      ];
    }

    return [
      { name: 'Events', path: '/user/events' },
      { name: 'My Tickets', path: '/user/tickets' },
      { name: 'Favorites', path: '/user/favorites' },
    ];
  };

  const navigationItems = getNavigationItems();

  // Get dropdown menu items based on user role
  const getDropdownItems = () => {
    if (user?.role === 'organizer') {
      return [
        { name: 'Organization Profile', path: '/organizer/profile' },
        { name: 'Settings', path: '/organizer/settings' },
        { name: 'Team Management', path: '/organizer/team' },
        { name: 'Billing', path: '/organizer/billing' },
      ];
    }
    
    return [
      { name: 'My Profile', path: '/user/profile' },
      { name: 'My Tickets', path: '/user/tickets' },
      { name: 'Favorites', path: '/user/favorites' },
      { name: 'Settings', path: '/user/settings' },
    ];
  };

  // User Menu Dropdown Component
  const UserDropdown = () => {
    const dropdownItems = getDropdownItems();
    
    // Get display name based on user role
    const displayName = user?.name || user?.organizationName || 'User';
    const userInitial = displayName.charAt(0).toUpperCase();
    
    return (
      <div className="relative group">
        <button 
          className={`flex items-center space-x-2 transition-colors ${
            isScrolled || isDashboardPage
              ? 'text-gray-700 hover:text-indigo-600'
              : 'text-white hover:text-indigo-400'
          }`}
        >
          <div className="flex items-center space-x-3">
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-sm">
                {userInitial}
              </span>
            </div>
            <span className="font-medium">{displayName}</span>
          </div>
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </button>
        
        {/* Dropdown Menu */}
        <div className="absolute right-0 w-56 mt-2 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm leading-5 text-gray-900 font-medium truncate">
              {user?.email}
            </p>
            <p className="text-xs leading-4 text-gray-500 mt-1">
              {user?.role === 'organizer' ? 'Organization Account' : 'User Account'}
            </p>
          </div>
          
          {/* Dropdown Items */}
          <div className="py-1">
            {dropdownItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
              >
                {item.name}
              </Link>
            ))}
            
            <div className="border-t border-gray-100 my-1"></div>
            
            <Link
              to={user?.role === 'organizer' ? '/organizer/dashboard' : '/user/dashboard'}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              Dashboard
            </Link>
            
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled || isDashboardPage
          ? 'bg-white shadow-lg text-gray-700' 
          : 'bg-transparent text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-white bg-indigo-600 px-3 py-1 rounded">
              EventHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`transition-colors ${
                  isScrolled || isDashboardPage
                    ? 'text-gray-700 hover:text-indigo-600'
                    : 'text-white hover:text-indigo-400'
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* User Menu or Auth Buttons */}
            {user ? (
              <UserDropdown />
            ) : (
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <button className={`flex items-center space-x-2 transition-colors ${
                    isScrolled || isDashboardPage
                      ? 'text-gray-700 hover:text-indigo-600'
                      : 'text-white hover:text-indigo-400'
                  }`}>
                    <span>Sign In</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Login Options Dropdown */}
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <Link
                      to="/login/user"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      User Login
                    </Link>
                    <Link
                      to="/login/organizer"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      Organizer Login
                    </Link>
                  </div>
                </div>

                <div className="relative group">
                  <Link
                    to="/register/user"
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
                  >
                    Get Started
                  </Link>
                  
                  {/* Register Options Dropdown */}
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <Link
                      to="/register/user"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      As User
                    </Link>
                    <Link
                      to="/register/organizer"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      As Organizer
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md focus:outline-none"
          >
            <svg
              className={`h-6 w-6 ${
                isScrolled || isDashboardPage ? 'text-gray-700' : 'text-white'
              }`}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {!user && (
                  <>
                    <Link
                      to="/login/user"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      User Login
                    </Link>
                    <Link
                      to="/login/organizer"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      Organizer Login
                    </Link>
                  </>
                )}
                {user && (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar; 