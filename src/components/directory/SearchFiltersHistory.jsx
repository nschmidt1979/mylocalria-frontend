import { useState, useEffect } from 'react';
import {
  ClockIcon,
  ArrowPathIcon,
  TrashIcon,
  StarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const SearchFiltersHistory = ({ onApplyFilters }) => {
  const [filterHistory, setFilterHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(null);

  useEffect(() => {
    // Load filter history and favorites from localStorage
    const loadFilterHistory = () => {
      const savedHistory = JSON.parse(localStorage.getItem('filterHistory') || '[]');
      const savedFavorites = JSON.parse(localStorage.getItem('favoriteFilters') || '[]');
      setFilterHistory(savedHistory);
      setFavorites(savedFavorites);
    };

    loadFilterHistory();
  }, []);

  const saveFilterHistory = (newHistory) => {
    localStorage.setItem('filterHistory', JSON.stringify(newHistory));
    setFilterHistory(newHistory);
  };

  const saveFavorites = (newFavorites) => {
    localStorage.setItem('favoriteFilters', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const addToHistory = (filters) => {
    const newFilterSet = {
      id: Date.now().toString(),
      filters,
      timestamp: new Date().toISOString(),
      isFavorite: false,
    };

    // Remove duplicate filters
    const uniqueHistory = filterHistory.filter(
      item => JSON.stringify(item.filters) !== JSON.stringify(filters)
    );

    // Add new filter set to the beginning
    saveFilterHistory([newFilterSet, ...uniqueHistory].slice(0, 10));
  };

  const toggleFavorite = (filterSet) => {
    const isFavorite = favorites.some(f => f.id === filterSet.id);
    let newFavorites;

    if (isFavorite) {
      newFavorites = favorites.filter(f => f.id !== filterSet.id);
    } else {
      newFavorites = [...favorites, { ...filterSet, isFavorite: true }];
    }

    saveFavorites(newFavorites);

    // Update history to reflect favorite status
    const updatedHistory = filterHistory.map(item =>
      item.id === filterSet.id
        ? { ...item, isFavorite: !isFavorite }
        : item
    );
    saveFilterHistory(updatedHistory);
  };

  const removeFromHistory = (filterId) => {
    const newHistory = filterHistory.filter(item => item.id !== filterId);
    saveFilterHistory(newHistory);

    // Also remove from favorites if present
    if (favorites.some(f => f.id === filterId)) {
      const newFavorites = favorites.filter(f => f.id !== filterId);
      saveFavorites(newFavorites);
    }
  };

  const formatFilterSet = (filters) => {
    const parts = [];

    if (filters.location) {
      parts.push(`Location: ${filters.location}`);
    }
    if (filters.specializations?.length) {
      parts.push(`Specializations: ${filters.specializations.join(', ')}`);
    }
    if (filters.certifications?.length) {
      parts.push(`Certifications: ${filters.certifications.join(', ')}`);
    }
    if (filters.feeStructure) {
      parts.push(`Fee Structure: ${filters.feeStructure}`);
    }
    if (filters.minRating) {
      parts.push(`Min Rating: ${filters.minRating}`);
    }
    if (filters.minExperience) {
      parts.push(`Min Experience: ${filters.minExperience} years`);
    }

    return parts.join(' • ');
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderFilterSet = (filterSet) => {
    const isSelected = selectedFilter?.id === filterSet.id;
    const isFavorite = favorites.some(f => f.id === filterSet.id);

    return (
      <div
        key={filterSet.id}
        className={`p-4 rounded-lg border ${
          isSelected
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-900 truncate">
                {formatFilterSet(filterSet.filters)}
              </p>
            </div>
            <div className="mt-1 flex items-center text-xs text-gray-500">
              <ClockIcon className="h-3 w-3 mr-1" />
              {formatTimestamp(filterSet.timestamp)}
            </div>
          </div>
          <div className="ml-4 flex items-center space-x-2">
            <button
              onClick={() => toggleFavorite(filterSet)}
              className={`p-1 rounded-full ${
                isFavorite
                  ? 'text-yellow-400 hover:text-yellow-500'
                  : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              <StarIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => removeFromHistory(filterSet.id)}
              className="p-1 text-gray-400 hover:text-red-500 rounded-full"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => {
              setSelectedFilter(filterSet);
              onApplyFilters(filterSet.filters);
            }}
            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="h-3 w-3 mr-1" />
            Apply Filters
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Filter History</h3>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Favorite Filters</h4>
            <div className="space-y-3">
              {favorites.map(filterSet => renderFilterSet(filterSet))}
            </div>
          </div>
        )}

        {/* Recent Filters */}
        {filterHistory.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Recent Filters</h4>
            <div className="space-y-3">
              {filterHistory
                .filter(item => !favorites.some(f => f.id === item.id))
                .map(filterSet => renderFilterSet(filterSet))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!favorites.length && !filterHistory.length && (
          <div className="text-center py-6">
            <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No filter history</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your filter combinations will appear here as you search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFiltersHistory; 