import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';

export const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && isOpen) {
      fetchNotifications();
    }
  }, [user, isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const unreadNotifications = await notificationService.getUnreadNotifications(user.uid);
      setNotifications(unreadNotifications);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getNotificationContent = (notification) => {
    switch (notification.type) {
      case 'new_review':
        return (
          <>
            <span className="font-medium">{notification.data.reviewerName}</span> left a new review
            <Link 
              to={`/advisor/${notification.advisorId}#review-${notification.reviewId}`}
              className="text-blue-600 hover:text-blue-800 ml-1"
            >
              "{notification.data.title}"
            </Link>
          </>
        );
      case 'review_update':
        return (
          <>
            <span className="font-medium">{notification.data.reviewerName}</span> updated their review
            <Link 
              to={`/advisor/${notification.advisorId}#review-${notification.reviewId}`}
              className="text-blue-600 hover:text-blue-800 ml-1"
            >
              "{notification.data.title}"
            </Link>
          </>
        );
      case 'new_advisor':
        return (
          <>
            New advisor <span className="font-medium">{notification.data.advisorName}</span> is now available in your area
            <Link 
              to={`/advisor/${notification.advisorId}`}
              className="text-blue-600 hover:text-blue-800 ml-1"
            >
              View Profile
            </Link>
          </>
        );
      default:
        return 'New notification';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <BellIcon className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading notifications...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No new notifications</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 text-sm text-gray-600">
                        {getNotificationContent(notification)}
                      </div>
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="ml-4 text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {new Date(notification.createdAt.toDate()).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  notifications.forEach(n => handleMarkAsRead(n.id));
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 