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

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center" aria-label="MyLocalRIA home">
              <span className="text-2xl font-bold text-blue-600">MyLocalRIA</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => {
              if (item.requiresAuth && !user) return null;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none rounded-md"
                >
                  <item.icon className="h-5 w-5 mr-2" aria-hidden="true" />
                  {item.name}
                </Link>
              );
            })}
            {user && !user.isAdvisor && (
              <Link
                to="/advisor-registration"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none rounded-md"
              >
                Become an Advisor
              </Link>
            )}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <NotificationCenter />
                <Menu as="div" className="relative">
                  <Menu.Button 
                    className="flex items-center text-gray-600 hover:text-gray-900 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none rounded-md p-1"
                    aria-label="User settings menu"
                  >
                    <Cog6ToothIcon className="h-8 w-8" aria-hidden="true" />
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
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } block px-4 py-2 text-sm text-gray-700 focus:bg-gray-100 focus:outline-none`}
                          >
                            Profile Settings
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } block w-full text-left px-4 py-2 text-sm text-gray-700 focus:bg-gray-100 focus:outline-none`}
                          >
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
                {/* Generic user avatar icon */}
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 border border-gray-300 ml-2">
                  <UserCircleIcon className="h-7 w-7 text-gray-500" aria-hidden="true" />
                  <span className="sr-only">User avatar</span>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none rounded-md"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-700 text-white hover:bg-blue-800 px-4 py-2 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? "Close main menu" : "Open main menu"}
            >
              <span className="sr-only">{isMobileMenuOpen ? "Close main menu" : "Open main menu"}</span>
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <Transition
        show={isMobileMenuOpen}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
        className="md:hidden"
      >
        <div id="mobile-menu" className="px-2 pt-2 pb-3 space-y-1 sm:px-3" role="menu" aria-label="Mobile navigation menu">
          {navigation.map((item) => {
            if (item.requiresAuth && !user) return null;
            return (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium flex items-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(false)}
                role="menuitem"
              >
                <item.icon className="h-5 w-5 mr-2" aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
          {user && !user.isAdvisor && (
            <Link
              to="/advisor-registration"
              className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(false)}
              role="menuitem"
            >
              Become an Advisor
            </Link>
          )}
          {user && (
            <>
              <Link
                to="/profile"
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(false)}
                role="menuitem"
              >
                Profile Settings
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                role="menuitem"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </Transition>

      {/* Notification Center */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 z-50">
          <NotificationCenter onClose={() => setShowNotifications(false)} />
        </div>
      )}
    </header>
  );
};

export default Header; 