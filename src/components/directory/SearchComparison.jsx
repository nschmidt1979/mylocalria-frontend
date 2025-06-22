import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowPathIcon,
  XMarkIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const SearchComparison = ({ currentSearch, onCompare }) => {
  const [savedSearches, setSavedSearches] = useState([]);
  const [selectedSearches, setSelectedSearches] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load saved searches from localStorage
    const loadSavedSearches = () => {
      const saved = JSON.parse(localStorage.getItem('savedSearches') || '[]');
      setSavedSearches(saved);
    };

    loadSavedSearches();
  }, []);

  const handleAddSearch = () => {
    if (currentSearch && !selectedSearches.find(s => s.id === currentSearch.id)) {
      setSelectedSearches([...selectedSearches, currentSearch]);
    }
  };

  const handleRemoveSearch = (searchId) => {
    setSelectedSearches(selectedSearches.filter(s => s.id !== searchId));
  };

  const handleCompare = async () => {
    if (selectedSearches.length < 2) {
      setError('Please select at least 2 searches to compare');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate comparison metrics
      const metrics = {
        totalAdvisors: selectedSearches.map(s => s.advisors.length),
        averageRating: selectedSearches.map(s => 
          s.advisors.reduce((sum, a) => sum + (a.averageRating || 0), 0) / s.advisors.length
        ),
        averageResponseTime: selectedSearches.map(s =>
          s.advisors.reduce((sum, a) => sum + (a.averageResponseTime || 0), 0) / s.advisors.length
        ),
        averageExperience: selectedSearches.map(s =>
          s.advisors.reduce((sum, a) => sum + (a.yearsOfExperience || 0), 0) / s.advisors.length
        ),
        feeStructureDistribution: selectedSearches.map(s => {
          const dist = {};
          s.advisors.forEach(a => {
            if (a.feeStructure) {
              dist[a.feeStructure] = (dist[a.feeStructure] || 0) + 1;
            }
          });
          return dist;
        }),
        specializationDistribution: selectedSearches.map(s => {
          const dist = {};
          s.advisors.forEach(a => {
            a.specializations?.forEach(spec => {
              dist[spec] = (dist[spec] || 0) + 1;
            });
          });
          return dist;
        }),
        certificationDistribution: selectedSearches.map(s => {
          const dist = {};
          s.advisors.forEach(a => {
            a.certifications?.forEach(cert => {
              dist[cert] = (dist[cert] || 0) + 1;
            });
          });
          return dist;
        }),
      };

      setComparison({
        searches: selectedSearches,
        metrics,
      });

      onCompare(metrics);
    } catch (err) {
      setError('Failed to compare searches. Please try again.');
      console.error('Comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderComparisonChart = (title, data, formatValue) => {
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <div className="space-y-4">
          {selectedSearches.map((search, index) => {
            const value = data[index];
            const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
            
            return (
              <div key={search.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 truncate">{search.name}</span>
                  <span className="text-gray-900 font-medium">{formatValue(value)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDistributionComparison = (title, distributions) => {
    // Get all unique keys across all distributions
    const allKeys = [...new Set(distributions.flatMap(d => Object.keys(d)))];

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <div className="space-y-4">
          {allKeys.map(key => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 truncate">{key}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {selectedSearches.map((search, index) => {
                  const count = distributions[index][key] || 0;
                  const total = Object.values(distributions[index]).reduce((sum, val) => sum + val, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;

                  return (
                    <div key={search.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 truncate">{search.name}</span>
                        <span className="text-gray-900">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ChartBarIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Search Comparison</h3>
          </div>
          <button
            onClick={handleAddSearch}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Current Search
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Selected Searches */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Selected Searches</h4>
          <div className="space-y-2">
            {selectedSearches.map(search => (
              <div
                key={search.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-600">{search.name}</span>
                <button
                  onClick={() => handleRemoveSearch(search.id)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Compare Button */}
        <div className="flex justify-center">
          <button
            onClick={handleCompare}
            disabled={loading || selectedSearches.length < 2}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Compare Searches
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-600 text-center">{error}</div>
        )}

        {/* Comparison Results */}
        {comparison && (
          <div className="space-y-8 pt-4 border-t border-gray-200">
            {/* Basic Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderComparisonChart(
                'Total Advisors',
                comparison.metrics.totalAdvisors,
                value => value
              )}
              {renderComparisonChart(
                'Average Rating',
                comparison.metrics.averageRating,
                value => value.toFixed(1)
              )}
              {renderComparisonChart(
                'Average Response Time',
                comparison.metrics.averageResponseTime,
                value => `${Math.round(value)} hours`
              )}
              {renderComparisonChart(
                'Average Experience',
                comparison.metrics.averageExperience,
                value => `${Math.round(value)} years`
              )}
            </div>

            {/* Distributions */}
            <div className="space-y-6">
              {renderDistributionComparison(
                'Fee Structure Distribution',
                comparison.metrics.feeStructureDistribution
              )}
              {renderDistributionComparison(
                'Specialization Distribution',
                comparison.metrics.specializationDistribution
              )}
              {renderDistributionComparison(
                'Certification Distribution',
                comparison.metrics.certificationDistribution
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchComparison; 