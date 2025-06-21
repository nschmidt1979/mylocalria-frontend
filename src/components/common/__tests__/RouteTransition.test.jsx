import { render, screen, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RouteTransition from '../RouteTransition';

// Mock LoadingSpinner
jest.mock('../LoadingSpinner', () => {
  return function MockLoadingSpinner({ size }) {
    return <div data-testid="loading-spinner" data-size={size}>Loading...</div>;
  };
});

// Mock useLocation to control location changes
const mockLocation = { pathname: '/', search: '', hash: '', state: null };
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
}));

describe('RouteTransition Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders children when not loading', () => {
    render(
      <MemoryRouter>
        <RouteTransition>
          <div>Test Content</div>
        </RouteTransition>
      </MemoryRouter>
    );

    // Initially shows loading, then content after timer
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  test('shows loading spinner with correct overlay styling', () => {
    const { container } = render(
      <MemoryRouter>
        <RouteTransition>
          <div>Test Content</div>
        </RouteTransition>
      </MemoryRouter>
    );

    const loadingOverlay = container.querySelector('.fixed.inset-0.bg-white.bg-opacity-75.z-50');
    expect(loadingOverlay).toBeInTheDocument();
    expect(loadingOverlay).toHaveClass('flex', 'items-center', 'justify-center');
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toHaveAttribute('data-size', 'lg');
  });

  test('loading state lasts for 300ms', async () => {
    render(
      <MemoryRouter>
        <RouteTransition>
          <div>Test Content</div>
        </RouteTransition>
      </MemoryRouter>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();

    // Advance time by less than 300ms
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    // Advance time to complete 300ms
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('shows loading when location changes', () => {
    const { rerender } = render(
      <MemoryRouter>
        <RouteTransition>
          <div>Original Content</div>
        </RouteTransition>
      </MemoryRouter>
    );

    // Complete initial loading
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByText('Original Content')).toBeInTheDocument();

    // Change location and rerender
    mockLocation.pathname = '/new-path';
    rerender(
      <MemoryRouter>
        <RouteTransition>
          <div>New Content</div>
        </RouteTransition>
      </MemoryRouter>
    );

    // Should show loading again
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByText('New Content')).not.toBeInTheDocument();
  });

  test('clears timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    const { unmount } = render(
      <MemoryRouter>
        <RouteTransition>
          <div>Test Content</div>
        </RouteTransition>
      </MemoryRouter>
    );

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  test('handles multiple rapid location changes', () => {
    const { rerender } = render(
      <MemoryRouter>
        <RouteTransition>
          <div>Content 1</div>
        </RouteTransition>
      </MemoryRouter>
    );

    // Change location rapidly multiple times
    mockLocation.pathname = '/path1';
    rerender(
      <MemoryRouter>
        <RouteTransition>
          <div>Content 2</div>
        </RouteTransition>
      </MemoryRouter>
    );

    mockLocation.pathname = '/path2';
    rerender(
      <MemoryRouter>
        <RouteTransition>
          <div>Content 3</div>
        </RouteTransition>
      </MemoryRouter>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    // Complete the loading
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByText('Content 3')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  test('renders different children after location change', () => {
    const { rerender } = render(
      <MemoryRouter>
        <RouteTransition>
          <div data-testid="content-1">Page 1</div>
        </RouteTransition>
      </MemoryRouter>
    );

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByTestId('content-1')).toBeInTheDocument();

    mockLocation.pathname = '/page2';
    rerender(
      <MemoryRouter>
        <RouteTransition>
          <div data-testid="content-2">Page 2</div>
        </RouteTransition>
      </MemoryRouter>
    );

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByTestId('content-2')).toBeInTheDocument();
    expect(screen.queryByTestId('content-1')).not.toBeInTheDocument();
  });

  test('loading overlay has correct z-index and positioning', () => {
    const { container } = render(
      <MemoryRouter>
        <RouteTransition>
          <div>Test Content</div>
        </RouteTransition>
      </MemoryRouter>
    );

    const overlay = container.querySelector('.fixed');
    expect(overlay).toHaveClass(
      'fixed',
      'inset-0',
      'bg-white',
      'bg-opacity-75',
      'z-50',
      'flex',
      'items-center',
      'justify-center'
    );
  });
});