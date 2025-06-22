import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { db } from '../../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const SearchTrends = () => {
  const [trends, setTrends] = useState({
    popularSearches: [],
    popularLocations: [],
    popularSpecializations: [],
    popularCertifications: [],
    trendingAdvisors: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch popular searches from the last 7 days
        const searchQuery = query(
          collection(db, 'searchHistory'),
          where('timestamp', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
          orderBy('timestamp', 'desc'),
          limit(100)
        );

        const searchSnapshot = await getDocs(searchQuery);
        const searches = searchSnapshot.docs.map(doc => doc.data());

        // Process search data to find trends
        const searchCounts = {};
        const locationCounts = {};
        const specializationCounts = {};
        const certificationCounts = {};
        const advisorViews = {};

        searches.forEach(search => {
          // Count search queries
          if (search.query) {
            searchCounts[search.query] = (searchCounts[search.query] || 0) + 1;
          }

          // Count locations
          if (search.filters?.location) {
            locationCounts[search.filters.location] = (locationCounts[search.filters.location] || 0) + 1;
          }

          // Count specializations
          search.filters?.specializations?.forEach(spec => {
            specializationCounts[spec] = (specializationCounts[spec] || 0) + 1;
          });

          // Count certifications
          search.filters?.certifications?.forEach(cert => {
            certificationCounts[cert] = (certificationCounts[cert] || 0) + 1;
          });

          // Count advisor views
          if (search.viewedAdvisor) {
            advisorViews[search.viewedAdvisor] = (advisorViews[search.viewedAdvisor] || 0) + 1;
          }
        });

        // Sort and get top items
        const getTopItems = (counts, limit = 5) => {
          return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([item, count]) => ({ item, count }));
        };

        setTrends({
          popularSearches: getTopItems(searchCounts),
          popularLocations: getTopItems(locationCounts),
          popularSpecializations: getTopItems(specializationCounts),
          popularCertifications: getTopItems(certificationCounts),
          trendingAdvisors: getTopItems(advisorViews),
        });
      } catch (err) {
        console.error('Error fetching trends:', err);
        setError('Failed to load search trends. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrends();
  }, []);

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

  const renderTrendList = (items, icon) => (
    <div className="space-y-2">
      {items.map(({ item, count }) => (
        <div key={item} className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            {icon}
            <span className="ml-2 text-gray-600 truncate">{item}</span>
          </div>
          <span className="text-gray-900 font-medium">{count}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Search Trends</h3>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Popular Searches */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Popular Searches</h4>
          {renderTrendList(
            trends.popularSearches,
            <ChartBarIcon className="h-4 w-4 text-blue-500" />
          )}
        </div>

        {/* Popular Locations */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Popular Locations</h4>
          {renderTrendList(
            trends.popularLocations,
            <MapPinIcon className="h-4 w-4 text-blue-500" />
          )}
        </div>

        {/* Popular Specializations */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Popular Specializations</h4>
          {renderTrendList(
            trends.popularSpecializations,
            <BuildingOfficeIcon className="h-4 w-4 text-blue-500" />
          )}
        </div>

        {/* Popular Certifications */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Popular Certifications</h4>
          {renderTrendList(
            trends.popularCertifications,
            <AcademicCapIcon className="h-4 w-4 text-blue-500" />
          )}
        </div>

        <div className="text-xs text-gray-500 text-center">
          Based on search activity in the last 7 days
        </div>
      </div>
    </div>
  );
};

export default SearchTrends; 