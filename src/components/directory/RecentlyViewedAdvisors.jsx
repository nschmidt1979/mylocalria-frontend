import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import AdvisorCard from '../advisors/AdvisorCard';

const RecentlyViewedAdvisors = ({ onAdvisorClick, onCompare, comparisonAdvisors }) => {
  const [recentAdvisors, setRecentAdvisors] = useState([]);
  const MAX_RECENT_ADVISORS = 10;

  useEffect(() => {
    // Load recently viewed advisors from localStorage
    const loadRecentAdvisors = () => {
      const stored = localStorage.getItem('recentlyViewedAdvisors');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setRecentAdvisors(parsed);
        } catch (err) {
          console.error('Error parsing recently viewed advisors:', err);
          localStorage.removeItem('recentlyViewedAdvisors');
        }
      }
    };

    loadRecentAdvisors();
  }, []);

  const addToRecentAdvisors = (advisor) => {
    setRecentAdvisors(prev => {
      // Remove the advisor if it already exists
      const filtered = prev.filter(a => a.id !== advisor.id);
      // Add the advisor to the beginning of the array
      const updated = [advisor, ...filtered].slice(0, MAX_RECENT_ADVISORS);
      // Save to localStorage
      localStorage.setItem('recentlyViewedAdvisors', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromRecentAdvisors = (advisorId) => {
    setRecentAdvisors(prev => {
      const updated = prev.filter(a => a.id !== advisorId);
      localStorage.setItem('recentlyViewedAdvisors', JSON.stringify(updated));
      return updated;
    });
  };

  if (recentAdvisors.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Recently Viewed</h2>
        </div>
        <button
          onClick={() => {
            setRecentAdvisors([]);
            localStorage.removeItem('recentlyViewedAdvisors');
          }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear all
        </button>
      </div>
      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {recentAdvisors.map((advisor) => (
            <div key={advisor.id} className="flex-none w-72 relative group">
              <button
                onClick={() => removeFromRecentAdvisors(advisor.id)}
                className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white/80 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4 text-gray-500" />
              </button>
              <div className="transform transition-transform hover:scale-[1.02]">
                <AdvisorCard
                  advisor={advisor}
                  onClick={() => {
                    onAdvisorClick(advisor);
                    addToRecentAdvisors(advisor);
                  }}
                  onCompare={() => onCompare(advisor)}
                  isInComparison={comparisonAdvisors.some(a => a.id === advisor.id)}
                  compact
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentlyViewedAdvisors; 