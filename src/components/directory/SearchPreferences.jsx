import { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  BellIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const SearchPreferences = ({ currentUser, onSavePreferences }) => {
  const [preferences, setPreferences] = useState({
    display: {
      showRatings: true,
      showReviews: true,
      showCertifications: true,
      showSpecializations: true,
      showFeeStructure: true,
      showAvailability: true,
      showContactInfo: true,
      showLocation: true,
      showExperience: true,
      showResponseTime: true,
    },
    notifications: {
      newAdvisors: true,
      priceChanges: true,
      availabilityUpdates: true,
      reviewUpdates: true,
      certificationUpdates: true,
      emailNotifications: true,
      pushNotifications: true,
    },
    search: {
      defaultSort: 'rating', // rating, experience, responseTime, price
      defaultView: 'list', // list, grid, map
      resultsPerPage: 10,
      autoSaveHistory: true,
      showTrendingSearches: true,
      showRecommendations: true,
      showAnalytics: true,
      showCollaboration: true,
    },
    filters: {
      defaultLocation: '',
      defaultSpecializations: [],
      defaultCertifications: [],
      defaultFeeStructure: '',
      defaultMinRating: 0,
      defaultMaxPrice: null,
      defaultMinExperience: 0,
      defaultMaxResponseTime: null,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('display');

  useEffect(() => {
    if (currentUser) {
      loadPreferences();
    }
  }, [currentUser]);

  const loadPreferences = async () => {
    try {
      // In a real implementation, this would fetch from your backend
      const mockPreferences = {
        display: {
          showRatings: true,
          showReviews: true,
          showCertifications: true,
          showSpecializations: true,
          showFeeStructure: true,
          showAvailability: true,
          showContactInfo: true,
          showLocation: true,
          showExperience: true,
          showResponseTime: true,
        },
        notifications: {
          newAdvisors: true,
          priceChanges: true,
          availabilityUpdates: true,
          reviewUpdates: true,
          certificationUpdates: true,
          emailNotifications: true,
          pushNotifications: true,
        },
        search: {
          defaultSort: 'rating',
          defaultView: 'list',
          resultsPerPage: 10,
          autoSaveHistory: true,
          showTrendingSearches: true,
          showRecommendations: true,
          showAnalytics: true,
          showCollaboration: true,
        },
        filters: {
          defaultLocation: '',
          defaultSpecializations: [],
          defaultCertifications: [],
          defaultFeeStructure: '',
          defaultMinRating: 0,
          defaultMaxPrice: null,
          defaultMinExperience: 0,
          defaultMaxResponseTime: null,
        },
      };
      setPreferences(mockPreferences);
    } catch (err) {
      setError('Failed to load preferences');
      console.error('Error loading preferences:', err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // In a real implementation, this would save to your backend
      await onSavePreferences(preferences);
      setSuccess('Preferences saved successfully');
    } catch (err) {
      setError('Failed to save preferences');
      console.error('Error saving preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all preferences to default values?')) {
      loadPreferences();
      setSuccess('Preferences reset to default values');
    }
  };

  const handleToggle = (category, key) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
      },
    }));
  };

  const handleChange = (category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const renderDisplayPreferences = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900">Display Options</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(preferences.display).map(([key, value]) => (
          <div key={key} className="flex items-center">
            <input
              type="checkbox"
              id={key}
              checked={value}
              onChange={() => handleToggle('display', key)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={key} className="ml-2 block text-sm text-gray-900">
              {key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .replace('Show ', '')}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotificationPreferences = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900">Notification Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(preferences.notifications).map(([key, value]) => (
          <div key={key} className="flex items-center">
            <input
              type="checkbox"
              id={key}
              checked={value}
              onChange={() => handleToggle('notifications', key)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={key} className="ml-2 block text-sm text-gray-900">
              {key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .replace('Notifications', '')}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSearchPreferences = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900">Search Settings</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="defaultSort" className="block text-sm font-medium text-gray-700">
            Default Sort Order
          </label>
          <select
            id="defaultSort"
            value={preferences.search.defaultSort}
            onChange={(e) => handleChange('search', 'defaultSort', e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="rating">Rating</option>
            <option value="experience">Experience</option>
            <option value="responseTime">Response Time</option>
            <option value="price">Price</option>
          </select>
        </div>

        <div>
          <label htmlFor="defaultView" className="block text-sm font-medium text-gray-700">
            Default View
          </label>
          <select
            id="defaultView"
            value={preferences.search.defaultView}
            onChange={(e) => handleChange('search', 'defaultView', e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="list">List</option>
            <option value="grid">Grid</option>
            <option value="map">Map</option>
          </select>
        </div>

        <div>
          <label htmlFor="resultsPerPage" className="block text-sm font-medium text-gray-700">
            Results Per Page
          </label>
          <select
            id="resultsPerPage"
            value={preferences.search.resultsPerPage}
            onChange={(e) => handleChange('search', 'resultsPerPage', parseInt(e.target.value))}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(preferences.search)
            .filter(([key]) => !['defaultSort', 'defaultView', 'resultsPerPage'].includes(key))
            .map(([key, value]) => (
              <div key={key} className="flex items-center">
                <input
                  type="checkbox"
                  id={key}
                  checked={value}
                  onChange={() => handleToggle('search', key)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={key} className="ml-2 block text-sm text-gray-900">
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .replace('Show ', '')}
                </label>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderFilterPreferences = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900">Default Filters</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="defaultLocation" className="block text-sm font-medium text-gray-700">
            Default Location
          </label>
          <input
            type="text"
            id="defaultLocation"
            value={preferences.filters.defaultLocation}
            onChange={(e) => handleChange('filters', 'defaultLocation', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter default location"
          />
        </div>

        <div>
          <label htmlFor="defaultMinRating" className="block text-sm font-medium text-gray-700">
            Minimum Rating
          </label>
          <input
            type="number"
            id="defaultMinRating"
            min="0"
            max="5"
            step="0.1"
            value={preferences.filters.defaultMinRating}
            onChange={(e) => handleChange('filters', 'defaultMinRating', parseFloat(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="defaultMaxPrice" className="block text-sm font-medium text-gray-700">
            Maximum Price
          </label>
          <input
            type="number"
            id="defaultMaxPrice"
            min="0"
            value={preferences.filters.defaultMaxPrice || ''}
            onChange={(e) => handleChange('filters', 'defaultMaxPrice', e.target.value ? parseFloat(e.target.value) : null)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter maximum price"
          />
        </div>

        <div>
          <label htmlFor="defaultMinExperience" className="block text-sm font-medium text-gray-700">
            Minimum Experience (years)
          </label>
          <input
            type="number"
            id="defaultMinExperience"
            min="0"
            value={preferences.filters.defaultMinExperience}
            onChange={(e) => handleChange('filters', 'defaultMinExperience', parseInt(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="defaultMaxResponseTime" className="block text-sm font-medium text-gray-700">
            Maximum Response Time (hours)
          </label>
          <input
            type="number"
            id="defaultMaxResponseTime"
            min="0"
            value={preferences.filters.defaultMaxResponseTime || ''}
            onChange={(e) => handleChange('filters', 'defaultMaxResponseTime', e.target.value ? parseInt(e.target.value) : null)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter maximum response time"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Cog6ToothIcon className="h-6 w-6 text-blue-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Search Preferences</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'display', label: 'Display', icon: EyeIcon },
            { id: 'notifications', label: 'Notifications', icon: BellIcon },
            { id: 'search', label: 'Search', icon: AdjustmentsHorizontalIcon },
            { id: 'filters', label: 'Filters', icon: AdjustmentsHorizontalIcon },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'display' && renderDisplayPreferences()}
        {activeTab === 'notifications' && renderNotificationPreferences()}
        {activeTab === 'search' && renderSearchPreferences()}
        {activeTab === 'filters' && renderFilterPreferences()}
      </div>
    </div>
  );
};

export default SearchPreferences; 