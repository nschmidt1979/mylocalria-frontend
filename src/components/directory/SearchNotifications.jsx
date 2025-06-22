import { useState, useEffect } from 'react';
import {
  BellIcon,
  BellSlashIcon,
  BellAlertIcon,
  XMarkIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { db } from '../../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

const SearchNotifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingNotification, setEditingNotification] = useState(null);
  const [notificationFrequency, setNotificationFrequency] = useState('daily');

  useEffect(() => {
    if (!currentUser) return;

    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const notificationsQuery = query(
          collection(db, 'searchNotifications'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(notificationsQuery);
        const notificationsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotifications(notificationsList);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  const handleCreateNotification = async (searchData) => {
    if (!currentUser) return;

    try {
      const notificationData = {
        userId: currentUser.uid,
        searchQuery: searchData.query,
        filters: searchData.filters,
        frequency: notificationFrequency,
        isActive: true,
        createdAt: serverTimestamp(),
        lastNotified: null,
        nextNotification: calculateNextNotification(notificationFrequency),
      };

      const docRef = await addDoc(collection(db, 'searchNotifications'), notificationData);
      setNotifications(prev => [{
        id: docRef.id,
        ...notificationData,
      }, ...prev]);
    } catch (err) {
      console.error('Error creating notification:', err);
      setError('Failed to create notification. Please try again.');
    }
  };

  const handleUpdateNotification = async (notificationId, updates) => {
    try {
      const notificationRef = doc(db, 'searchNotifications', notificationId);
      await updateDoc(notificationRef, {
        ...updates,
        nextNotification: calculateNextNotification(updates.frequency || notificationFrequency),
      });

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, ...updates }
            : notification
        )
      );
    } catch (err) {
      console.error('Error updating notification:', err);
      setError('Failed to update notification. Please try again.');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, 'searchNotifications', notificationId));
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification. Please try again.');
    }
  };

  const calculateNextNotification = (frequency) => {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.setDate(now.getDate() + 1));
      case 'weekly':
        return new Date(now.setDate(now.getDate() + 7));
      case 'monthly':
        return new Date(now.setMonth(now.getMonth() + 1));
      default:
        return new Date(now.setDate(now.getDate() + 1));
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BellIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Search Notifications</h3>
          </div>
          <select
            value={notificationFrequency}
            onChange={(e) => setNotificationFrequency(e.target.value)}
            className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <BellSlashIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm">No active notifications</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div key={notification.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <BellAlertIcon className="h-5 w-5 text-blue-500 mr-2" />
                    <h4 className="text-sm font-medium text-gray-900">
                      {notification.searchQuery || 'Custom Search'}
                    </h4>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Frequency: {notification.frequency}</p>
                    {notification.filters && (
                      <div className="mt-1">
                        <p>Filters:</p>
                        <ul className="list-disc list-inside">
                          {notification.filters.location && (
                            <li>Location: {notification.filters.location}</li>
                          )}
                          {notification.filters.specializations?.length > 0 && (
                            <li>Specializations: {notification.filters.specializations.join(', ')}</li>
                          )}
                          {notification.filters.certifications?.length > 0 && (
                            <li>Certifications: {notification.filters.certifications.join(', ')}</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateNotification(notification.id, { isActive: !notification.isActive })}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    {notification.isActive ? (
                      <BellIcon className="h-5 w-5" />
                    ) : (
                      <BellSlashIcon className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingNotification(notification)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Notification Modal */}
      {editingNotification && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Edit Notification</h3>
                <button
                  onClick={() => setEditingNotification(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notification Frequency
                  </label>
                  <select
                    value={editingNotification.frequency}
                    onChange={(e) => setEditingNotification(prev => ({
                      ...prev,
                      frequency: e.target.value,
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setEditingNotification(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateNotification(editingNotification.id, {
                        frequency: editingNotification.frequency,
                      });
                      setEditingNotification(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchNotifications; 