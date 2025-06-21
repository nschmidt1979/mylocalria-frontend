import { useState, useEffect } from 'react';
import {
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  StarIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  MapIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const SearchResultsTimeline = ({ searchHistory, onClose }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    const calculateTimelineData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Calculate time range
        const now = new Date();
        const startDate = new Date();
        switch (timeRange) {
          case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(now.getDate() - 90);
            break;
          case '1y':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          default:
            startDate.setDate(now.getDate() - 30);
        }

        // Filter and sort search history
        const filteredHistory = searchHistory
          .filter(search => new Date(search.timestamp) >= startDate)
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const data = {
          overview: calculateOverviewTimeline(filteredHistory),
          metrics: calculateMetricsTimeline(filteredHistory),
          distributions: calculateDistributionTimeline(filteredHistory),
          changes: calculateChangeTimeline(filteredHistory),
        };

        setTimelineData(data);
      } catch (err) {
        setError('Failed to calculate timeline data');
        console.error('Timeline calculation error:', err);
      } finally {
        setLoading(false);
      }
    };

    calculateTimelineData();
  }, [searchHistory, timeRange]);

  const calculateOverviewTimeline = (history) => {
    const timeline = [];
    const dateMap = new Map();

    // Group searches by date
    history.forEach(search => {
      const date = new Date(search.timestamp).toISOString().split('T')[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          searches: [],
          totalAdvisors: 0,
          uniqueAdvisors: new Set(),
          averageRating: 0,
          averageExperience: 0,
        });
      }

      const dayData = dateMap.get(date);
      dayData.searches.push(search);
      dayData.totalAdvisors += search.advisors.length;
      search.advisors.forEach(advisor => dayData.uniqueAdvisors.add(advisor.id));
      dayData.averageRating = search.advisors.reduce((sum, advisor) => sum + advisor.averageRating, 0) / search.advisors.length;
      dayData.averageExperience = search.advisors.reduce((sum, advisor) => sum + advisor.yearsOfExperience, 0) / search.advisors.length;
    });

    // Convert to array and calculate daily changes
    let prevDayData = null;
    for (const [date, dayData] of dateMap) {
      const changes = prevDayData ? {
        totalAdvisors: dayData.totalAdvisors - prevDayData.totalAdvisors,
        uniqueAdvisors: dayData.uniqueAdvisors.size - prevDayData.uniqueAdvisors.size,
        averageRating: dayData.averageRating - prevDayData.averageRating,
        averageExperience: dayData.averageExperience - prevDayData.averageExperience,
      } : null;

      timeline.push({
        date,
        ...dayData,
        uniqueAdvisors: dayData.uniqueAdvisors.size,
        changes,
      });

      prevDayData = dayData;
    }

    return timeline;
  };

  const calculateMetricsTimeline = (history) => {
    const timeline = [];
    const dateMap = new Map();

    // Group searches by date
    history.forEach(search => {
      const date = new Date(search.timestamp).toISOString().split('T')[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          metrics: {
            totalSearches: 0,
            uniqueSearchers: new Set(),
            averageResultsPerSearch: 0,
            totalResults: 0,
            averageFiltersPerSearch: 0,
            totalFilters: 0,
          },
        });
      }

      const dayData = dateMap.get(date);
      dayData.metrics.totalSearches++;
      dayData.metrics.uniqueSearchers.add(search.userId);
      dayData.metrics.totalResults += search.advisors.length;
      dayData.metrics.totalFilters += Object.keys(search.filters).length;
    });

    // Calculate averages and convert to array
    for (const [date, dayData] of dateMap) {
      const metrics = dayData.metrics;
      timeline.push({
        date,
        metrics: {
          ...metrics,
          uniqueSearchers: metrics.uniqueSearchers.size,
          averageResultsPerSearch: metrics.totalResults / metrics.totalSearches,
          averageFiltersPerSearch: metrics.totalFilters / metrics.totalSearches,
        },
      });
    }

    return timeline;
  };

  const calculateDistributionTimeline = (history) => {
    const timeline = [];
    const dateMap = new Map();

    // Group searches by date
    history.forEach(search => {
      const date = new Date(search.timestamp).toISOString().split('T')[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          distributions: {
            locations: {},
            specializations: {},
            certifications: {},
            feeStructures: {},
            ratings: {
              '1-2': 0,
              '2-3': 0,
              '3-4': 0,
              '4-5': 0,
            },
            experience: {
              '0-5': 0,
              '5-10': 0,
              '10-15': 0,
              '15-20': 0,
              '20+': 0,
            },
          },
        });
      }

      const dayData = dateMap.get(date);
      search.advisors.forEach(advisor => {
        // Location distribution
        dayData.distributions.locations[advisor.location] = (dayData.distributions.locations[advisor.location] || 0) + 1;

        // Specialization distribution
        advisor.specializations?.forEach(spec => {
          dayData.distributions.specializations[spec] = (dayData.distributions.specializations[spec] || 0) + 1;
        });

        // Certification distribution
        advisor.certifications?.forEach(cert => {
          dayData.distributions.certifications[cert] = (dayData.distributions.certifications[cert] || 0) + 1;
        });

        // Fee structure distribution
        dayData.distributions.feeStructures[advisor.feeStructure] = (dayData.distributions.feeStructures[advisor.feeStructure] || 0) + 1;

        // Rating distribution
        const rating = advisor.averageRating;
        if (rating >= 1 && rating < 2) dayData.distributions.ratings['1-2']++;
        else if (rating >= 2 && rating < 3) dayData.distributions.ratings['2-3']++;
        else if (rating >= 3 && rating < 4) dayData.distributions.ratings['3-4']++;
        else if (rating >= 4 && rating <= 5) dayData.distributions.ratings['4-5']++;

        // Experience distribution
        const experience = advisor.yearsOfExperience;
        if (experience < 5) dayData.distributions.experience['0-5']++;
        else if (experience < 10) dayData.distributions.experience['5-10']++;
        else if (experience < 15) dayData.distributions.experience['10-15']++;
        else if (experience < 20) dayData.distributions.experience['15-20']++;
        else dayData.distributions.experience['20+']++;
      });
    });

    // Convert to array
    for (const [date, dayData] of dateMap) {
      timeline.push(dayData);
    }

    return timeline;
  };

  const calculateChangeTimeline = (history) => {
    const timeline = [];
    let prevSearch = null;

    history.forEach(search => {
      if (prevSearch) {
        const changes = {
          date: new Date(search.timestamp).toISOString().split('T')[0],
          addedAdvisors: search.advisors.filter(a => !prevSearch.advisors.some(pa => pa.id === a.id)),
          removedAdvisors: prevSearch.advisors.filter(a => !search.advisors.some(sa => sa.id === a.id)),
          changedFilters: Object.entries(search.filters).filter(([key, value]) => prevSearch.filters[key] !== value),
          metricChanges: {
            totalAdvisors: search.advisors.length - prevSearch.advisors.length,
            averageRating: calculateAverageRating(search.advisors) - calculateAverageRating(prevSearch.advisors),
            averageExperience: calculateAverageExperience(search.advisors) - calculateAverageExperience(prevSearch.advisors),
          },
        };

        timeline.push(changes);
      }

      prevSearch = search;
    });

    return timeline;
  };

  const calculateAverageRating = (advisors) => {
    return advisors.reduce((sum, advisor) => sum + advisor.averageRating, 0) / advisors.length;
  };

  const calculateAverageExperience = (advisors) => {
    return advisors.reduce((sum, advisor) => sum + advisor.yearsOfExperience, 0) / advisors.length;
  };

  const renderMetricCard = (title, value, icon, trend = null) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon}
          <h3 className="ml-2 text-sm font-medium text-gray-900">{title}</h3>
        </div>
        {trend !== null && (
          <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );

  const renderTimelineChart = (data, title, icon) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="ml-2 text-sm font-medium text-gray-900">{title}</h3>
      </div>
      <div className="h-64">
        {/* In a real implementation, this would be a line chart */}
        <div className="text-center text-gray-500">Timeline chart visualization</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Search Results Timeline</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Time Range Selection */}
      <div className="flex space-x-4">
        {[
          { value: '7d', label: 'Last 7 Days' },
          { value: '30d', label: 'Last 30 Days' },
          { value: '90d', label: 'Last 90 Days' },
          { value: '1y', label: 'Last Year' },
        ].map(range => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value)}
            className={`${
              timeRange === range.value
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } px-3 py-2 rounded-md text-sm font-medium`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Metric Selection */}
      <div className="flex space-x-4">
        {[
          { id: 'overview', label: 'Overview', icon: ChartBarIcon },
          { id: 'metrics', label: 'Metrics', icon: ChartBarIcon },
          { id: 'distributions', label: 'Distributions', icon: ChartBarIcon },
          { id: 'changes', label: 'Changes', icon: ArrowTrendingUpIcon },
        ].map(metric => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`${
              selectedMetric === metric.id
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } px-3 py-2 rounded-md text-sm font-medium flex items-center`}
          >
            <metric.icon className="h-5 w-5 mr-2" />
            {metric.label}
          </button>
        ))}
      </div>

      {/* Overview Timeline */}
      {selectedMetric === 'overview' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Overview Timeline</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderTimelineChart(
              timelineData.overview.map(day => ({
                date: day.date,
                value: day.totalAdvisors,
              })),
              'Total Advisors Over Time',
              <UserGroupIcon className="h-5 w-5 text-blue-500" />
            )}
            {renderTimelineChart(
              timelineData.overview.map(day => ({
                date: day.date,
                value: day.averageRating,
              })),
              'Average Rating Over Time',
              <StarIcon className="h-5 w-5 text-blue-500" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {timelineData.overview.slice(-1)[0] && (
              <>
                {renderMetricCard(
                  'Total Advisors',
                  timelineData.overview.slice(-1)[0].totalAdvisors,
                  <UserGroupIcon className="h-5 w-5 text-blue-500" />,
                  timelineData.overview.slice(-1)[0].changes?.totalAdvisors
                )}
                {renderMetricCard(
                  'Unique Advisors',
                  timelineData.overview.slice(-1)[0].uniqueAdvisors,
                  <UserGroupIcon className="h-5 w-5 text-blue-500" />,
                  timelineData.overview.slice(-1)[0].changes?.uniqueAdvisors
                )}
                {renderMetricCard(
                  'Average Rating',
                  timelineData.overview.slice(-1)[0].averageRating.toFixed(1),
                  <StarIcon className="h-5 w-5 text-blue-500" />,
                  timelineData.overview.slice(-1)[0].changes?.averageRating
                )}
                {renderMetricCard(
                  'Average Experience',
                  `${timelineData.overview.slice(-1)[0].averageExperience.toFixed(1)} years`,
                  <AcademicCapIcon className="h-5 w-5 text-blue-500" />,
                  timelineData.overview.slice(-1)[0].changes?.averageExperience
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Metrics Timeline */}
      {selectedMetric === 'metrics' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Metrics Timeline</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderTimelineChart(
              timelineData.metrics.map(day => ({
                date: day.date,
                value: day.metrics.totalSearches,
              })),
              'Search Volume Over Time',
              <ChartBarIcon className="h-5 w-5 text-blue-500" />
            )}
            {renderTimelineChart(
              timelineData.metrics.map(day => ({
                date: day.date,
                value: day.metrics.uniqueSearchers,
              })),
              'Unique Searchers Over Time',
              <UserGroupIcon className="h-5 w-5 text-blue-500" />
            )}
            {renderTimelineChart(
              timelineData.metrics.map(day => ({
                date: day.date,
                value: day.metrics.averageResultsPerSearch,
              })),
              'Average Results Per Search',
              <ChartBarIcon className="h-5 w-5 text-blue-500" />
            )}
            {renderTimelineChart(
              timelineData.metrics.map(day => ({
                date: day.date,
                value: day.metrics.averageFiltersPerSearch,
              })),
              'Average Filters Per Search',
              <ChartBarIcon className="h-5 w-5 text-blue-500" />
            )}
          </div>
        </div>
      )}

      {/* Distribution Timeline */}
      {selectedMetric === 'distributions' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Distribution Timeline</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderTimelineChart(
              timelineData.distributions.map(day => ({
                date: day.date,
                value: Object.values(day.distributions.locations).reduce((sum, count) => sum + count, 0),
              })),
              'Location Distribution Over Time',
              <MapIcon className="h-5 w-5 text-blue-500" />
            )}
            {renderTimelineChart(
              timelineData.distributions.map(day => ({
                date: day.date,
                value: Object.values(day.distributions.specializations).reduce((sum, count) => sum + count, 0),
              })),
              'Specialization Distribution Over Time',
              <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />
            )}
            {renderTimelineChart(
              timelineData.distributions.map(day => ({
                date: day.date,
                value: Object.values(day.distributions.certifications).reduce((sum, count) => sum + count, 0),
              })),
              'Certification Distribution Over Time',
              <AcademicCapIcon className="h-5 w-5 text-blue-500" />
            )}
            {renderTimelineChart(
              timelineData.distributions.map(day => ({
                date: day.date,
                value: Object.values(day.distributions.feeStructures).reduce((sum, count) => sum + count, 0),
              })),
              'Fee Structure Distribution Over Time',
              <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />
            )}
          </div>
        </div>
      )}

      {/* Changes Timeline */}
      {selectedMetric === 'changes' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Changes Timeline</h3>
          <div className="space-y-4">
            {timelineData.changes.map((change, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">{change.date}</h4>
                  <div className="flex space-x-2">
                    <span className={`text-sm ${change.metricChanges.totalAdvisors > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {change.metricChanges.totalAdvisors > 0 ? '+' : ''}{change.metricChanges.totalAdvisors} advisors
                    </span>
                    <span className={`text-sm ${change.metricChanges.averageRating > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {change.metricChanges.averageRating > 0 ? '+' : ''}{change.metricChanges.averageRating.toFixed(1)} rating
                    </span>
                    <span className={`text-sm ${change.metricChanges.averageExperience > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {change.metricChanges.averageExperience > 0 ? '+' : ''}{change.metricChanges.averageExperience.toFixed(1)} years
                    </span>
                  </div>
                </div>

                {change.addedAdvisors.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Added Advisors</h5>
                    <div className="space-y-1">
                      {change.addedAdvisors.map(advisor => (
                        <div key={advisor.id} className="text-sm text-gray-600">
                          {advisor.name} - {advisor.location}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {change.removedAdvisors.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Removed Advisors</h5>
                    <div className="space-y-1">
                      {change.removedAdvisors.map(advisor => (
                        <div key={advisor.id} className="text-sm text-gray-600">
                          {advisor.name} - {advisor.location}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {change.changedFilters.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Changed Filters</h5>
                    <div className="space-y-1">
                      {change.changedFilters.map(([key, value]) => (
                        <div key={key} className="text-sm text-gray-600">
                          {key}: {value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsTimeline; 