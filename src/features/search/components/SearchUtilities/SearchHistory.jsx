import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/contexts/AuthContext';
import { ClockIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const SearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSearchHistory = () => {
      try {
        setLoading(true);
        const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        setSearchHistory(history);
      } catch (err) {
        console.error('Error loading search history:', err);
        setError('Failed to load search history');
      } finally {
        setLoading(false);
      }
    };

    loadSearchHistory();
  }, []);

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

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('searchHistory');
      setSearchHistory([]);
    } catch (err) {
      console.error('Error clearing search history:', err);
      setError('Failed to clear search history');
    }
  };

  const handleRemoveSearch = (index) => {
    try {
      const newHistory = searchHistory.filter((_, i) => i !== index);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      setSearchHistory(newHistory);
    } catch (err) {
      console.error('Error removing search from history:', err);
      setError('Failed to remove search from history');
    }
  };

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

  if (searchHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Recent Searches</h3>
        <p className="text-gray-500 text-sm">
          Your recent searches will appear here. Start searching to build your history.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Recent Searches</h3>
          <button
            onClick={handleClearHistory}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Clear history
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {searchHistory.map((search, index) => (
          <div key={index} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleSearch(search)}
                className="text-left group flex-1"
              >
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      {search.query || 'Search'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(search.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {Object.entries(search.criteria)
                  .filter(([_, value]) => value)
                  .length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    {Object.entries(search.criteria)
                      .filter(([_, value]) => value)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(' • ')}
                  </p>
                )}
              </button>
              <button
                onClick={() => handleRemoveSearch(index)}
                className="ml-4 p-1 text-gray-400 hover:text-red-600"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchHistory; 