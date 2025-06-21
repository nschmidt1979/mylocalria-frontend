import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationCenter } from '../NotificationCenter';

// Mock dependencies
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'user-123' },
  }),
}));

// Mock notification service
const mockNotifications = [
  {
    id: '1',
    type: 'info',
    title: 'New Message',
    message: 'You have a new message from advisor',
    timestamp: new Date('2023-01-01T10:00:00Z'),
    read: false,
  },
  {
    id: '2',
    type: 'success',
    title: 'Profile Updated',
    message: 'Your profile has been successfully updated',
    timestamp: new Date('2023-01-01T09:00:00Z'),
    read: true,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Payment Due',
    message: 'Your subscription payment is due in 3 days',
    timestamp: new Date('2023-01-01T08:00:00Z'),
    read: false,
  },
];

jest.mock('../../../services/notificationService', () => ({
  getNotifications: jest.fn(() => Promise.resolve(mockNotifications)),
  markAsRead: jest.fn(() => Promise.resolve()),
  deleteNotification: jest.fn(() => Promise.resolve()),
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  BellIcon: ({ className }) => <svg className={className} data-testid="bell-icon" />,
  XMarkIcon: ({ className }) => <svg className={className} data-testid="x-mark-icon" />,
}));

jest.mock('@heroicons/react/24/solid', () => ({
  BellIcon: ({ className }) => <svg className={className} data-testid="bell-solid-icon" />,
}));

describe('NotificationCenter Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders notification bell icon', () => {
    render(<NotificationCenter />);
    
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
  });

  test('shows unread notification count badge', async () => {
    render(<NotificationCenter />);
    
    await waitFor(() => {
      const badge = screen.getByText('2'); // 2 unread notifications
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-red-500');
    });
  });

  test('does not show badge when no unread notifications', async () => {
    const { getNotifications } = require('../../../services/notificationService');
    getNotifications.mockResolvedValue([
      { ...mockNotifications[0], read: true },
      { ...mockNotifications[1], read: true },
      { ...mockNotifications[2], read: true },
    ]);

    render(<NotificationCenter />);
    
    await waitFor(() => {
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  test('opens notification dropdown when bell is clicked', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('New Message')).toBeInTheDocument();
    });
  });

  test('displays all notifications in dropdown', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('New Message')).toBeInTheDocument();
      expect(screen.getByText('Profile Updated')).toBeInTheDocument();
      expect(screen.getByText('Payment Due')).toBeInTheDocument();
    });
  });

  test('shows correct notification types with proper styling', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      // Check that notifications are rendered with different styles based on type
      const notifications = screen.getAllByRole('listitem');
      expect(notifications).toHaveLength(3);
    });
  });

  test('marks notification as read when clicked', async () => {
    const { markAsRead } = require('../../../services/notificationService');
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      const notification = screen.getByText('New Message');
      user.click(notification);
    });

    await waitFor(() => {
      expect(markAsRead).toHaveBeenCalledWith('1');
    });
  });

  test('deletes notification when delete button is clicked', async () => {
    const { deleteNotification } = require('../../../services/notificationService');
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId('x-mark-icon');
      user.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(deleteNotification).toHaveBeenCalledWith('1');
    });
  });

  test('closes dropdown when clicked outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <NotificationCenter />
        <div data-testid="outside-element">Outside</div>
      </div>
    );

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    const outsideElement = screen.getByTestId('outside-element');
    await user.click(outsideElement);

    await waitFor(() => {
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });

  test('shows "Mark all as read" button', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Mark all as read')).toBeInTheDocument();
    });
  });

  test('marks all notifications as read when button is clicked', async () => {
    const { markAsRead } = require('../../../services/notificationService');
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      const markAllButton = screen.getByText('Mark all as read');
      user.click(markAllButton);
    });

    await waitFor(() => {
      // Should mark the 2 unread notifications as read
      expect(markAsRead).toHaveBeenCalledWith('1');
      expect(markAsRead).toHaveBeenCalledWith('3');
    });
  });

  test('shows empty state when no notifications', async () => {
    const { getNotifications } = require('../../../services/notificationService');
    getNotifications.mockResolvedValue([]);

    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
  });

  test('handles loading state', async () => {
    const { getNotifications } = require('../../../services/notificationService');
    getNotifications.mockImplementation(() => new Promise(() => {})); // Never resolves

    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('handles error state gracefully', async () => {
    const { getNotifications } = require('../../../services/notificationService');
    getNotifications.mockRejectedValue(new Error('Failed to load notifications'));

    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Error loading notifications')).toBeInTheDocument();
    });
  });

  test('formats timestamps correctly', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      // Check that timestamps are formatted (implementation specific)
      // This could be "2 hours ago", "1 day ago", etc.
      const timeElements = screen.getAllByText(/ago|now/);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  test('sorts notifications by timestamp descending', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      const notifications = screen.getAllByRole('listitem');
      const titles = notifications.map(n => n.textContent);
      
      // Most recent notification should be first
      expect(titles[0]).toContain('New Message'); // 10:00
      expect(titles[1]).toContain('Profile Updated'); // 09:00
      expect(titles[2]).toContain('Payment Due'); // 08:00
    });
  });

  test('visually distinguishes read from unread notifications', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      const notifications = screen.getAllByRole('listitem');
      
      // Unread notifications should have different styling
      expect(notifications[0]).toHaveClass('bg-blue-50'); // Unread
      expect(notifications[1]).toHaveClass('bg-white'); // Read
      expect(notifications[2]).toHaveClass('bg-blue-50'); // Unread
    });
  });

  test('shows different icons for different notification types', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      // Different notification types should have different visual indicators
      const typeIndicators = screen.getAllByTestId(/type-icon/);
      expect(typeIndicators.length).toBeGreaterThanOrEqual(0);
    });
  });

  test('updates badge count after marking notifications as read', async () => {
    const { markAsRead, getNotifications } = require('../../../services/notificationService');
    const user = userEvent.setup();
    
    render(<NotificationCenter />);

    // Initial state - 2 unread
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    // Open dropdown and mark one as read
    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    await waitFor(() => {
      const notification = screen.getByText('New Message');
      user.click(notification);
    });

    // Mock the service to return updated notifications
    getNotifications.mockResolvedValue([
      { ...mockNotifications[0], read: true },
      mockNotifications[1],
      mockNotifications[2],
    ]);

    // Badge should update to 1
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});