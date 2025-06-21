import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ClockIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

const SearchAnalytics = ({ advisors, filters, searchHistory }) => {
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, 1y
  const [analytics, setAnalytics] = useState({
    searchVolume: [],
    popularFilters: {},
    userBehavior: {},
    advisorMetrics: {},
    locationDistribution: {},
    specializationTrends: {},
    certificationGrowth: {},
    feeStructureAnalysis: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
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
            startDate.setDate(now.getDate() - 7);
        }

        // Filter search history by time range
        const filteredHistory = searchHistory.filter(
          search => new Date(search.timestamp) >= startDate
        );

        // Calculate analytics
        const newAnalytics = calculateAnalytics(filteredHistory, advisors);
        setAnalytics(newAnalytics);
      } catch (err) {
        setError('Failed to load analytics. Please try again.');
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange, searchHistory, advisors]);

  const calculateAnalytics = (history, advisors) => {
    // Search Volume Over Time
    const searchVolume = calculateSearchVolume(history);

    // Popular Filters
    const popularFilters = calculatePopularFilters(history);

    // User Behavior
    const userBehavior = calculateUserBehavior(history);

    // Advisor Metrics
    const advisorMetrics = calculateAdvisorMetrics(advisors);

    // Location Distribution
    const locationDistribution = calculateLocationDistribution(advisors);

    // Specialization Trends
    const specializationTrends = calculateSpecializationTrends(history, advisors);

    // Certification Growth
    const certificationGrowth = calculateCertificationGrowth(history, advisors);

    // Fee Structure Analysis
    const feeStructureAnalysis = calculateFeeStructureAnalysis(advisors);

    return {
      searchVolume,
      popularFilters,
      userBehavior,
      advisorMetrics,
      locationDistribution,
      specializationTrends,
      certificationGrowth,
      feeStructureAnalysis,
    };
  };

  const calculateSearchVolume = (history) => {
    const volume = {};
    history.forEach(search => {
      const date = new Date(search.timestamp).toISOString().split('T')[0];
      volume[date] = (volume[date] || 0) + 1;
    });
    return Object.entries(volume).map(([date, count]) => ({ date, count }));
  };

  const calculatePopularFilters = (history) => {
    const filters = {
      locations: {},
      specializations: {},
      certifications: {},
      feeStructures: {},
    };

    history.forEach(search => {
      // Count locations
      if (search.filters.location) {
        filters.locations[search.filters.location] = (filters.locations[search.filters.location] || 0) + 1;
      }

      // Count specializations
      if (search.filters.specializations) {
        search.filters.specializations.forEach(spec => {
          filters.specializations[spec] = (filters.specializations[spec] || 0) + 1;
        });
      }

      // Count certifications
      if (search.filters.certifications) {
        search.filters.certifications.forEach(cert => {
          filters.certifications[cert] = (filters.certifications[cert] || 0) + 1;
        });
      }

      // Count fee structures
      if (search.filters.feeStructure) {
        filters.feeStructures[search.filters.feeStructure] = (filters.feeStructures[search.filters.feeStructure] || 0) + 1;
      }
    });

    return filters;
  };

  const calculateUserBehavior = (history) => {
    const behavior = {
      averageFiltersPerSearch: 0,
      commonFilterCombinations: [],
      searchTimeDistribution: {},
      resultRefinement: 0,
    };

    // Calculate average filters per search
    const totalFilters = history.reduce((sum, search) => {
      return sum + Object.keys(search.filters).length;
    }, 0);
    behavior.averageFiltersPerSearch = totalFilters / history.length;

    // Calculate search time distribution
    history.forEach(search => {
      const hour = new Date(search.timestamp).getHours();
      behavior.searchTimeDistribution[hour] = (behavior.searchTimeDistribution[hour] || 0) + 1;
    });

    // Calculate result refinement (searches that were modified)
    const refinedSearches = history.filter((search, index) => {
      if (index === 0) return false;
      const prevSearch = history[index - 1];
      return JSON.stringify(search.filters) !== JSON.stringify(prevSearch.filters);
    });
    behavior.resultRefinement = refinedSearches.length / history.length;

    return behavior;
  };

  const calculateAdvisorMetrics = (advisors) => {
    return {
      totalAdvisors: advisors.length,
      averageRating: advisors.reduce((sum, advisor) => sum + advisor.averageRating, 0) / advisors.length,
      averageExperience: advisors.reduce((sum, advisor) => sum + advisor.yearsOfExperience, 0) / advisors.length,
      averageResponseTime: advisors.reduce((sum, advisor) => sum + advisor.responseTime, 0) / advisors.length,
      topRatedAdvisors: advisors
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 5)
        .map(advisor => ({
          id: advisor.id,
          name: advisor.name,
          rating: advisor.averageRating,
        })),
    };
  };

  const calculateLocationDistribution = (advisors) => {
    const distribution = {};
    advisors.forEach(advisor => {
      distribution[advisor.location] = (distribution[advisor.location] || 0) + 1;
    });
    return distribution;
  };

  const calculateSpecializationTrends = (history, advisors) => {
    const trends = {
      current: {},
      historical: {},
      growth: {},
    };

    // Current distribution
    advisors.forEach(advisor => {
      advisor.specializations?.forEach(spec => {
        trends.current[spec] = (trends.current[spec] || 0) + 1;
      });
    });

    // Historical trends
    history.forEach(search => {
      if (search.filters.specializations) {
        search.filters.specializations.forEach(spec => {
          trends.historical[spec] = (trends.historical[spec] || 0) + 1;
        });
      }
    });

    // Calculate growth
    Object.keys(trends.current).forEach(spec => {
      const current = trends.current[spec];
      const historical = trends.historical[spec] || 0;
      trends.growth[spec] = ((current - historical) / historical) * 100;
    });

    return trends;
  };

  const calculateCertificationGrowth = (history, advisors) => {
    const growth = {
      current: {},
      historical: {},
      growth: {},
    };

    // Current distribution
    advisors.forEach(advisor => {
      advisor.certifications?.forEach(cert => {
        growth.current[cert] = (growth.current[cert] || 0) + 1;
      });
    });

    // Historical trends
    history.forEach(search => {
      if (search.filters.certifications) {
        search.filters.certifications.forEach(cert => {
          growth.historical[cert] = (growth.historical[cert] || 0) + 1;
        });
      }
    });

    // Calculate growth
    Object.keys(growth.current).forEach(cert => {
      const current = growth.current[cert];
      const historical = growth.historical[cert] || 0;
      growth.growth[cert] = ((current - historical) / historical) * 100;
    });

    return growth;
  };

  const calculateFeeStructureAnalysis = (advisors) => {
    const analysis = {
      distribution: {},
      averageFees: {},
      trends: {},
    };

    // Calculate distribution and average fees
    advisors.forEach(advisor => {
      const structure = advisor.feeStructure;
      analysis.distribution[structure] = (analysis.distribution[structure] || 0) + 1;

      if (advisor.feeDetails) {
        if (!analysis.averageFees[structure]) {
          analysis.averageFees[structure] = {
            sum: 0,
            count: 0,
          };
        }
        analysis.averageFees[structure].sum += advisor.feeDetails.average || 0;
        analysis.averageFees[structure].count += 1;
      }
    });

    // Calculate averages
    Object.keys(analysis.averageFees).forEach(structure => {
      const { sum, count } = analysis.averageFees[structure];
      analysis.averageFees[structure] = sum / count;
    });

    return analysis;
  };

  const renderMetricCard = (title, value, icon, trend = null) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon}
          <h3 className="ml-2 text-sm font-medium text-gray-900">{title}</h3>
        </div>
        {trend && (
          <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );

  const renderDistributionChart = (data, title, icon) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="ml-2 text-sm font-medium text-gray-900">{title}</h3>
      </div>
      <div className="space-y-2">
        {Object.entries(data)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([key, value]) => (
            <div key={key} className="flex items-center">
              <div className="flex-1">
                <div className="text-sm text-gray-600">{key}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(value / Math.max(...Object.values(data))) * 100}%` }}
                  />
                </div>
              </div>
              <div className="ml-2 text-sm text-gray-600">{value}</div>
            </div>
          ))}
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
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderMetricCard(
          'Total Searches',
          analytics.searchVolume.reduce((sum, { count }) => sum + count, 0),
          <ChartBarIcon className="h-5 w-5 text-blue-500" />
        )}
        {renderMetricCard(
          'Average Filters',
          analytics.userBehavior.averageFiltersPerSearch.toFixed(1),
          <FilterIcon className="h-5 w-5 text-blue-500" />
        )}
        {renderMetricCard(
          'Refinement Rate',
          `${(analytics.userBehavior.resultRefinement * 100).toFixed(1)}%`,
          <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500" />
        )}
        {renderMetricCard(
          'Active Advisors',
          analytics.advisorMetrics.totalAdvisors,
          <UserGroupIcon className="h-5 w-5 text-blue-500" />
        )}
      </div>

      {/* Popular Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {renderDistributionChart(
          analytics.popularFilters.locations,
          'Popular Locations',
          <MapPinIcon className="h-5 w-5 text-blue-500" />
        )}
        {renderDistributionChart(
          analytics.popularFilters.specializations,
          'Popular Specializations',
          <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />
        )}
        {renderDistributionChart(
          analytics.popularFilters.certifications,
          'Popular Certifications',
          <AcademicCapIcon className="h-5 w-5 text-blue-500" />
        )}
        {renderDistributionChart(
          analytics.popularFilters.feeStructures,
          'Popular Fee Structures',
          <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />
        )}
      </div>

      {/* Search Time Distribution */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center mb-4">
          <ClockIcon className="h-5 w-5 text-blue-500" />
          <h3 className="ml-2 text-sm font-medium text-gray-900">Search Time Distribution</h3>
        </div>
        <div className="grid grid-cols-24 gap-1">
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{
                  height: `${(analytics.userBehavior.searchTimeDistribution[i] || 0) / Math.max(...Object.values(analytics.userBehavior.searchTimeDistribution)) * 100}%`,
                }}
              />
              <span className="text-xs text-gray-500 mt-1">{i}:00</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Rated Advisors */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Top Rated Advisors</h3>
        <div className="space-y-4">
          {analytics.advisorMetrics.topRatedAdvisors.map(advisor => (
            <div key={advisor.id} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{advisor.name}</span>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">{advisor.rating.toFixed(1)}</span>
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(advisor.rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchAnalytics; 