import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';

// Mock useAuth hook
jest.mock('../../../contexts/AuthContext');

// Mock LoadingSpinner
jest.mock('../../common/LoadingSpinner', () => {
  return function MockLoadingSpinner({ size }) {
    return <div data-testid="loading-spinner" data-size={size}>Loading...</div>;
  };
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to, replace, state }) => (
    <div data-testid="navigate" data-to={to} data-replace={replace?.toString()} data-state={JSON.stringify(state)} />
  ),
  useLocation: () => ({ pathname: '/test', search: '', hash: '', state: null }),
}));

const renderProtectedRoute = (children = <div>Protected Content</div>) => {
  return render(
    <MemoryRouter>
      <ProtectedRoute>{children}</ProtectedRoute>
    </MemoryRouter>
  );
};

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders children when user is authenticated', () => {
    useAuth.mockReturnValue({
      user: { uid: '123' },
      loading: false
    });

    renderProtectedRoute();

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  test('redirects to login when user is not authenticated', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false
    });

    renderProtectedRoute();

    const navigateElement = screen.getByTestId('navigate');
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement).toHaveAttribute('data-to', '/login');
    expect(navigateElement.getAttribute('data-state')).toContain('pathname');
  });

  test('shows loading spinner when loading', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true
    });

    renderProtectedRoute();

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  test('saves attempted URL when redirecting to login', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false
    });

    renderProtectedRoute();

    const navigateElement = screen.getByTestId('navigate');
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement).toHaveAttribute('data-to', '/login');
    expect(navigateElement).toHaveAttribute('data-replace', 'true');
    const stateString = navigateElement.getAttribute('data-state');
    const state = JSON.parse(stateString);
    expect(state.from.pathname).toBe('/test');
  });

  test('renders with different user types', () => {
    useAuth.mockReturnValue({
      user: { uid: '123', isAdmin: true, isAdvisor: false },
      loading: false
    });

    renderProtectedRoute(<div>Admin Content</div>);

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  test('handles undefined user gracefully', () => {
    useAuth.mockReturnValue({
      user: undefined,
      loading: false
    });

    renderProtectedRoute();

    const navigateElement = screen.getByTestId('navigate');
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement).toHaveAttribute('data-to', '/login');
  });
});