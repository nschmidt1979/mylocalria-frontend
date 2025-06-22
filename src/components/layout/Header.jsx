import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  BellIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Find Advisor', href: '/directory', icon: MagnifyingGlassIcon },
    { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon, requiresAuth: true },
    ...(user?.isAdvisor ? [{ name: 'My Profile', href: '/advisor/' + user.uid }] : []),
    ...(user?.isAdmin ? [{ name: 'Admin', href: '/admin' }] : []),
  ];

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
              <span className="text-xl sm:text-2xl font-bold text-blue-600 truncate">
                MyLocalRIA
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            {navigation.map((item) => {
              if (item.requiresAuth && !user) return null;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center transition-colors min-h-[44px] rounded-md hover:bg-gray-50"
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              );
            })}
            {user && !user.isAdvisor && (
              <Link
                to="/advisor-registration"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors min-h-[44px] flex items-center rounded-md hover:bg-gray-50"
              >
                Become an Advisor
              </Link>
            )}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                {/* Notifications - Hidden on small screens */}
                <div className="hidden sm:block">
                  <NotificationCenter />
                </div>
                
                {/* Settings Menu */}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-50 transition-colors min-h-[44px] min-w-[44px] justify-center focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <Cog6ToothIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors min-h-[44px] flex items-center`}
                          >
                            Profile Settings
                          </Link>
                        )}
                      </Menu.Item>
                      {/* Mobile notifications in dropdown */}
                      <div className="sm:hidden">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setShowNotifications(!showNotifications)}
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors min-h-[44px] flex items-center`}
                            >
                              <BellIcon className="h-5 w-5 mr-3" />
                              Notifications
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors min-h-[44px] flex items-center`}
                          >
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
                
                {/* User Avatar */}
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 border border-gray-300">
                  <UserCircleIcon className="h-6 w-6 sm:h-7 sm:w-7 text-gray-500" />
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors min-h-[44px] flex items-center rounded-md hover:bg-gray-50"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 min-h-[44px] min-w-[44px] transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <Transition
        show={isMobileMenuOpen}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 -translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-1"
        className="lg:hidden"
      >
        <div className="bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              if (item.requiresAuth && !user) return null;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-4 py-3 rounded-md text-base font-medium flex items-center transition-colors min-h-[44px]"
                  onClick={closeMobileMenu}
                >
                  <item.icon className="h-6 w-6 mr-3" />
                  {item.name}
                </Link>
              );
            })}
            {user && !user.isAdvisor && (
              <Link
                to="/advisor-registration"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-4 py-3 rounded-md text-base font-medium transition-colors min-h-[44px] flex items-center"
                onClick={closeMobileMenu}
              >
                Become an Advisor
              </Link>
            )}
            {user && (
              <>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <Link
                    to="/profile"
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-4 py-3 rounded-md text-base font-medium transition-colors min-h-[44px] flex items-center"
                    onClick={closeMobileMenu}
                  >
                    <UserCircleIcon className="h-6 w-6 mr-3" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="w-full text-left text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-4 py-3 rounded-md text-base font-medium transition-colors min-h-[44px] flex items-center"
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}
            {!user && (
              <div className="border-t border-gray-200 pt-3 mt-3 space-y-1">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-4 py-3 rounded-md text-base font-medium transition-colors min-h-[44px] flex items-center"
                  onClick={closeMobileMenu}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 block px-4 py-3 rounded-md text-base font-medium transition-colors min-h-[44px] flex items-center mx-4"
                  onClick={closeMobileMenu}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </Transition>

      {/* Notification Center */}
      {showNotifications && (
        <div className="absolute right-4 mt-2 w-80 sm:w-96 z-50">
          <NotificationCenter onClose={() => setShowNotifications(false)} />
        </div>
      )}
    </header>
  );
};

export default Header; 