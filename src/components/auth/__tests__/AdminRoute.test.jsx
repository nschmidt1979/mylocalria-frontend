import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminRoute } from '../AdminRoute';
import { useAuth } from '../../../contexts/AuthContext';

// Mock useAuth hook
jest.mock('../../../contexts/AuthContext');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to, replace }) => <div data-testid="navigate" data-to={to} data-replace={replace?.toString()} />,
}));

const renderAdminRoute = (children = <div>Admin Content</div>) => {
  return render(
    <MemoryRouter>
      <AdminRoute>{children}</AdminRoute>
    </MemoryRouter>
  );
};

describe('AdminRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders children when user is authenticated admin', () => {
    useAuth.mockReturnValue({
      user: { isAdmin: true, uid: '123' },
      loading: false
    });

    renderAdminRoute();

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  test('redirects to home when user is not authenticated', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false
    });

    renderAdminRoute();

    const navigateElement = screen.getByTestId('navigate');
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement).toHaveAttribute('data-to', '/');
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  test('redirects to home when user is authenticated but not admin', () => {
    useAuth.mockReturnValue({
      user: { isAdmin: false, uid: '123' },
      loading: false
    });

    renderAdminRoute();

    const navigateElement = screen.getByTestId('navigate');
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement).toHaveAttribute('data-to', '/');
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  test('redirects to home when user exists but isAdmin is undefined', () => {
    useAuth.mockReturnValue({
      currentUser: { uid: '123', email: 'user@example.com' },
      user: { uid: '123' } // No isAdmin property
    });

    renderAdminRoute();

    const navigateElement = screen.getByTestId('navigate');
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement).toHaveAttribute('data-to', '/');
  });

  test('redirects to login when currentUser exists but user object is null', () => {
    useAuth.mockReturnValue({
      currentUser: { uid: '123', email: 'user@example.com' },
      user: null
    });

    renderAdminRoute();

    const navigateElement = screen.getByTestId('navigate');
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement).toHaveAttribute('data-to', '/login');
  });

  test('handles edge case where isAdmin is explicitly false', () => {
    useAuth.mockReturnValue({
      currentUser: { uid: '123', email: 'user@example.com' },
      user: { isAdmin: false, uid: '123' }
    });

    renderAdminRoute();

    const navigateElement = screen.getByTestId('navigate');
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement).toHaveAttribute('data-to', '/');
  });

  test('renders content when isAdmin is explicitly true', () => {
    useAuth.mockReturnValue({
      currentUser: { uid: '123', email: 'admin@example.com' },
      user: { isAdmin: true, uid: '123', role: 'admin' }
    });

    renderAdminRoute();

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  test('shows loading spinner when loading', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true
    });

    renderAdminRoute();

    expect(screen.getByRole('generic')).toHaveClass('animate-spin');
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  test('handles admin user with additional properties', () => {
    useAuth.mockReturnValue({
      currentUser: { uid: '123', email: 'admin@example.com' },
      user: { 
        isAdmin: true, 
        uid: '123',
        isAdvisor: false,
        displayName: 'Admin User',
        role: 'admin'
      }
    });

    renderAdminRoute();

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });
});