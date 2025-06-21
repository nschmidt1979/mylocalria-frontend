import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';
import { useAuth } from '../../../contexts/AuthContext';

// Mock useAuth hook
jest.mock('../../../contexts/AuthContext');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to, replace }) => <div data-testid="navigate" data-to={to} data-replace={replace.toString()} />,
  Outlet: () => <div data-testid="outlet">Protected Content</div>,
}));

const renderPrivateRoute = () => {
  return render(
    <MemoryRouter>
      <PrivateRoute />
    </MemoryRouter>
  );
};

describe('PrivateRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Outlet when user is authenticated', () => {
    useAuth.mockReturnValue({
      currentUser: { uid: '123', email: 'test@example.com' }
    });

    renderPrivateRoute();

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  test('redirects to login when user is not authenticated', () => {
    useAuth.mockReturnValue({
      currentUser: null
    });

    renderPrivateRoute();

    const navigateElement = screen.getByTestId('navigate');
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement).toHaveAttribute('data-to', '/login');
    expect(navigateElement).toHaveAttribute('data-replace', 'true');
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
  });

  test('redirects to login when currentUser is undefined', () => {
    useAuth.mockReturnValue({
      currentUser: undefined
    });

    renderPrivateRoute();

    const navigateElement = screen.getByTestId('navigate');
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement).toHaveAttribute('data-to', '/login');
    expect(navigateElement).toHaveAttribute('data-replace', 'true');
  });

  test('redirects to login when currentUser is false', () => {
    useAuth.mockReturnValue({
      currentUser: false
    });

    renderPrivateRoute();

    const navigateElement = screen.getByTestId('navigate');
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement).toHaveAttribute('data-to', '/login');
    expect(navigateElement).toHaveAttribute('data-replace', 'true');
  });

  test('renders content when user object exists with basic properties', () => {
    useAuth.mockReturnValue({
      currentUser: { 
        uid: 'user123',
        email: 'user@test.com',
        displayName: 'Test User'
      }
    });

    renderPrivateRoute();

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  test('renders content when user object has minimal required properties', () => {
    useAuth.mockReturnValue({
      currentUser: { uid: 'minimal-user' }
    });

    renderPrivateRoute();

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  test('handles auth context loading state gracefully', () => {
    useAuth.mockReturnValue({
      currentUser: null,
      loading: true
    });

    renderPrivateRoute();

    // Should still redirect if currentUser is null, regardless of loading state
    const navigateElement = screen.getByTestId('navigate');
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement).toHaveAttribute('data-to', '/login');
  });

  test('handles auth context with empty object as currentUser', () => {
    useAuth.mockReturnValue({
      currentUser: {}
    });

    renderPrivateRoute();

    // Empty object is truthy, so should render content
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  test('handles auth context error state', () => {
    useAuth.mockReturnValue({
      currentUser: null,
      error: 'Authentication error'
    });

    renderPrivateRoute();

    // Should redirect to login on error
    const navigateElement = screen.getByTestId('navigate');
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement).toHaveAttribute('data-to', '/login');
  });
});