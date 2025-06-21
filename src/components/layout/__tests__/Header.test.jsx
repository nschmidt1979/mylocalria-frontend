import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '../Header';
import { useAuth } from '../../../contexts/AuthContext';

// Mock dependencies
jest.mock('../../../contexts/AuthContext');
jest.mock('../../notifications/NotificationCenter', () => {
  return function MockNotificationCenter({ onClose }) {
    return (
      <div data-testid="notification-center">
        <button onClick={onClose}>Close Notifications</button>
      </div>
    );
  };
});

// Mock Headless UI
jest.mock('@headlessui/react', () => ({
  Menu: {
    Button: ({ children, className }) => <button className={className}>{children}</button>,
    Items: ({ children, className }) => <div className={className}>{children}</div>,
    Item: ({ children }) => <div>{children({ active: false })}</div>,
  },
  Transition: ({ children, show }) => show ? <div>{children}</div> : null,
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  Bars3Icon: ({ className }) => <svg className={className} data-testid="bars3-icon" />,
  XMarkIcon: ({ className }) => <svg className={className} data-testid="xmark-icon" />,
  UserCircleIcon: ({ className }) => <svg className={className} data-testid="user-circle-icon" />,
  HomeIcon: ({ className }) => <svg className={className} data-testid="home-icon" />,
  MagnifyingGlassIcon: ({ className }) => <svg className={className} data-testid="search-icon" />,
  ChartBarIcon: ({ className }) => <svg className={className} data-testid="chart-icon" />,
  BellIcon: ({ className }) => <svg className={className} data-testid="bell-icon" />,
  Cog6ToothIcon: ({ className }) => <svg className={className} data-testid="cog-icon" />,
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, className, onClick }) => (
    <a href={to} className={className} onClick={onClick} data-testid={`link-${to}`}>
      {children}
    </a>
  ),
}));

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('When user is not authenticated', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: null,
        logout: jest.fn(),
      });
    });

    test('renders logo and brand name', () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      expect(screen.getByText('MyLocalRIA')).toBeInTheDocument();
      expect(screen.getByTestId('link-/')).toBeInTheDocument();
    });

    test('renders public navigation links', () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      expect(screen.getByTestId('link-/')).toHaveTextContent('Home');
      expect(screen.getByTestId('link-/directory')).toHaveTextContent('Find Advisor');
    });

    test('does not render authenticated navigation links', () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      expect(screen.queryByTestId('link-/dashboard')).not.toBeInTheDocument();
    });

    test('renders sign in and sign up buttons', () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      expect(screen.getByTestId('link-/login')).toHaveTextContent('Sign in');
      expect(screen.getByTestId('link-/register')).toHaveTextContent('Sign up');
    });

    test('renders mobile menu button', () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      const mobileMenuButton = screen.getByRole('button', { name: 'Open main menu' });
      expect(mobileMenuButton).toBeInTheDocument();
      expect(screen.getByTestId('bars3-icon')).toBeInTheDocument();
    });
  });

  describe('When user is authenticated', () => {
    const mockUser = {
      uid: 'user-123',
      email: 'user@example.com',
      displayName: 'Test User',
      isAdvisor: false,
      isAdmin: false,
    };

    beforeEach(() => {
      useAuth.mockReturnValue({
        user: mockUser,
        logout: jest.fn(),
      });
    });

    test('renders authenticated navigation links', () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      expect(screen.getByTestId('link-/')).toHaveTextContent('Home');
      expect(screen.getByTestId('link-/directory')).toHaveTextContent('Find Advisor');
      expect(screen.getByTestId('link-/dashboard')).toHaveTextContent('Dashboard');
    });

    test('renders NotificationCenter', () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      expect(screen.getByTestId('notification-center')).toBeInTheDocument();
    });

    test('renders user avatar and settings dropdown', () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      expect(screen.getByTestId('cog-icon')).toBeInTheDocument();
      expect(screen.getByTestId('user-circle-icon')).toBeInTheDocument();
    });

    test('renders become advisor link for non-advisor users', () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      expect(screen.getByTestId('link-/advisor-registration')).toHaveTextContent('Become an Advisor');
    });

    test('does not render sign in/up buttons', () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      expect(screen.queryByTestId('link-/login')).not.toBeInTheDocument();
      expect(screen.queryByTestId('link-/register')).not.toBeInTheDocument();
    });

    test('handles logout functionality', async () => {
      const mockLogout = jest.fn().mockResolvedValue();
      useAuth.mockReturnValue({
        user: mockUser,
        logout: mockLogout,
      });

      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      // Click settings dropdown to open menu
      const settingsButton = screen.getByTestId('cog-icon').closest('button');
      await user.click(settingsButton);

      // Find and click logout button
      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    test('navigates to profile settings', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      const profileSettingsLink = screen.getByTestId('link-/profile');
      expect(profileSettingsLink).toHaveTextContent('Profile Settings');
    });
  });

  describe('When user is an advisor', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: {
          uid: 'advisor-123',
          email: 'advisor@example.com',
          displayName: 'Test Advisor',
          isAdvisor: true,
          isAdmin: false,
        },
        logout: jest.fn(),
      });
    });

    test('renders advisor profile link', () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      expect(screen.getByTestId('link-/advisor/advisor-123')).toHaveTextContent('My Profile');
    });

    test('does not render become advisor link', () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      expect(screen.queryByTestId('link-/advisor-registration')).not.toBeInTheDocument();
    });
  });

  describe('When user is an admin', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: {
          uid: 'admin-123',
          email: 'admin@example.com',
          displayName: 'Test Admin',
          isAdvisor: false,
          isAdmin: true,
        },
        logout: jest.fn(),
      });
    });

    test('renders admin link', () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      expect(screen.getByTestId('link-/admin')).toHaveTextContent('Admin');
    });
  });

  describe('Mobile menu functionality', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: {
          uid: 'user-123',
          email: 'user@example.com',
          displayName: 'Test User',
          isAdvisor: false,
          isAdmin: false,
        },
        logout: jest.fn(),
      });
    });

    test('toggles mobile menu open and closed', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      const mobileMenuButton = screen.getByRole('button', { name: 'Open main menu' });
      
      // Open mobile menu
      await user.click(mobileMenuButton);
      expect(screen.getByTestId('xmark-icon')).toBeInTheDocument();

      // Close mobile menu
      await user.click(mobileMenuButton);
      expect(screen.getByTestId('bars3-icon')).toBeInTheDocument();
    });

    test('closes mobile menu when navigation link is clicked', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      const mobileMenuButton = screen.getByRole('button', { name: 'Open main menu' });
      await user.click(mobileMenuButton);

      // Click a navigation link in mobile menu
      const homeLink = screen.getAllByTestId('link-/')[1]; // Mobile menu version
      await user.click(homeLink);

      // Menu should close
      expect(screen.getByTestId('bars3-icon')).toBeInTheDocument();
    });

    test('renders mobile menu logout functionality', async () => {
      const mockLogout = jest.fn().mockResolvedValue();
      useAuth.mockReturnValue({
        user: {
          uid: 'user-123',
          email: 'user@example.com',
          displayName: 'Test User',
          isAdvisor: false,
          isAdmin: false,
        },
        logout: mockLogout,
      });

      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      const mobileMenuButton = screen.getByRole('button', { name: 'Open main menu' });
      await user.click(mobileMenuButton);

      const mobileLogoutButton = screen.getByText('Sign out');
      await user.click(mobileLogoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Error handling', () => {
    test('handles logout error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockLogout = jest.fn().mockRejectedValue(new Error('Logout failed'));
      
      useAuth.mockReturnValue({
        user: {
          uid: 'user-123',
          email: 'user@example.com',
          displayName: 'Test User',
          isAdvisor: false,
          isAdmin: false,
        },
        logout: mockLogout,
      });

      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      const settingsButton = screen.getByTestId('cog-icon').closest('button');
      await user.click(settingsButton);

      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to log out:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      const mobileMenuButton = screen.getByRole('button', { name: 'Open main menu' });
      expect(mobileMenuButton).toHaveAttribute('aria-label', undefined);
      expect(screen.getByText('Open main menu')).toBeInTheDocument();
    });

    test('has proper navigation structure', () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });
});