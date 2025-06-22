import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  BookmarkIcon,
  BellIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const SavedSearches = () => {
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedSearches = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const savedSearchesQuery = query(
          collection(db, 'savedSearches'),
          where('userId', '==', currentUser.uid),
          where('isDeleted', '==', false)
        );
        const snapshot = await getDocs(savedSearchesQuery);
        const searches = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSavedSearches(searches);
      } catch (err) {
        console.error('Error fetching saved searches:', err);
        setError('Failed to load saved searches');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedSearches();
  }, [currentUser]);

  const handleDelete = async (searchId) => {
    try {
      await updateDoc(doc(db, 'savedSearches', searchId), {
        isDeleted: true,
        deletedAt: new Date(),
      });
      setSavedSearches(prev => prev.filter(search => search.id !== searchId));
    } catch (err) {
      console.error('Error deleting saved search:', err);
      setError('Failed to delete saved search');
    }
  };

  const handleEdit = (search) => {
    setEditingId(search.id);
    setEditName(search.name);
  };

  const handleSaveEdit = async (searchId) => {
    try {
      await updateDoc(doc(db, 'savedSearches', searchId), {
        name: editName,
        updatedAt: new Date(),
      });
      setSavedSearches(prev =>
        prev.map(search =>
          search.id === searchId ? { ...search, name: editName } : search
        )
      );
      setEditingId(null);
    } catch (err) {
      console.error('Error updating saved search:', err);
      setError('Failed to update saved search');
    }
  };

  const handleToggleNotifications = async (search) => {
    try {
      await updateDoc(doc(db, 'savedSearches', search.id), {
        notificationsEnabled: !search.notificationsEnabled,
        updatedAt: new Date(),
      });
      setSavedSearches(prev =>
        prev.map(s =>
          s.id === search.id
            ? { ...s, notificationsEnabled: !s.notificationsEnabled }
            : s
        )
      );
    } catch (err) {
      console.error('Error toggling notifications:', err);
      setError('Failed to update notification settings');
    }
  };

  const handleSearch = (search) => {
    const searchParams = new URLSearchParams();
    Object.entries(search.criteria).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        searchParams.set(key, value.join(','));
      } else if (value) {
        searchParams.set(key, value);
      }
    });
    navigate(`/directory?${searchParams.toString()}`);
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (savedSearches.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Saved Searches</h3>
        <p className="text-gray-500 text-sm">
          You haven't saved any searches yet. Save your search criteria to quickly find advisors that match your requirements.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Saved Searches</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {savedSearches.map((search) => (
          <div key={search.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              {editingId === search.id ? (
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search name"
                  />
                  <button
                    onClick={() => handleSaveEdit(search.id)}
                    className="p-1 text-green-600 hover:text-green-800"
                  >
                    <CheckIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1 text-gray-600 hover:text-gray-800"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <button
                      onClick={() => handleSearch(search)}
                      className="text-left group"
                    >
                      <div className="flex items-center">
                        <BookmarkIcon className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                          {search.name}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {Object.entries(search.criteria)
                          .filter(([_, value]) => value)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(' • ')}
                      </p>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleNotifications(search)}
                      className={`p-1 rounded-full ${
                        search.notificationsEnabled
                          ? 'text-blue-600 hover:text-blue-800'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={
                        search.notificationsEnabled
                          ? 'Disable notifications'
                          : 'Enable notifications'
                      }
                    >
                      <BellIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(search)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(search.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedSearches; 