import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ChartPieIcon,
  MapIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

const SearchInsightsDashboard = ({ advisors, filters, searchHistory, timeRange = '30d' }) => {
  const [metrics, setMetrics] = useState({
    overview: {},
    trends: {},
    distributions: {},
    comparisons: {},
    predictions: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    const calculateMetrics = async () => {
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

        // Filter search history by time range
        const filteredHistory = searchHistory.filter(
          search => new Date(search.timestamp) >= startDate
        );

        // Calculate metrics
        const newMetrics = {
          overview: calculateOverviewMetrics(advisors, filteredHistory),
          trends: calculateTrendMetrics(filteredHistory),
          distributions: calculateDistributionMetrics(advisors),
          comparisons: calculateComparisonMetrics(advisors, filteredHistory),
          predictions: calculatePredictionMetrics(advisors, filteredHistory),
        };

        setMetrics(newMetrics);
      } catch (err) {
        setError('Failed to calculate metrics');
        console.error('Metrics calculation error:', err);
      } finally {
        setLoading(false);
      }
    };

    calculateMetrics();
  }, [advisors, filters, searchHistory, timeRange]);

  const calculateOverviewMetrics = (advisors, history) => {
    const totalSearches = history.length;
    const uniqueSearchers = new Set(history.map(search => search.userId)).size;
    const averageResultsPerSearch = history.reduce((sum, search) => sum + search.results, 0) / totalSearches;

    const advisorMetrics = {
      total: advisors.length,
      averageRating: advisors.reduce((sum, advisor) => sum + advisor.averageRating, 0) / advisors.length,
      averageExperience: advisors.reduce((sum, advisor) => sum + advisor.yearsOfExperience, 0) / advisors.length,
      averageResponseTime: advisors.reduce((sum, advisor) => sum + advisor.responseTime, 0) / advisors.length,
    };

    const filterMetrics = {
      averageFiltersPerSearch: history.reduce((sum, search) => {
        return sum + Object.keys(search.filters).length;
      }, 0) / totalSearches,
      mostCommonFilters: calculateMostCommonFilters(history),
    };

    return {
      totalSearches,
      uniqueSearchers,
      averageResultsPerSearch,
      advisorMetrics,
      filterMetrics,
    };
  };

  const calculateTrendMetrics = (history) => {
    const searchVolumeByDay = {};
    const searchVolumeByHour = {};
    const filterTrends = {
      locations: {},
      specializations: {},
      certifications: {},
      feeStructures: {},
    };

    history.forEach(search => {
      // Search volume by day
      const date = new Date(search.timestamp).toISOString().split('T')[0];
      searchVolumeByDay[date] = (searchVolumeByDay[date] || 0) + 1;

      // Search volume by hour
      const hour = new Date(search.timestamp).getHours();
      searchVolumeByHour[hour] = (searchVolumeByHour[hour] || 0) + 1;

      // Filter trends
      if (search.filters.location) {
        filterTrends.locations[search.filters.location] = (filterTrends.locations[search.filters.location] || 0) + 1;
      }
      if (search.filters.specializations) {
        search.filters.specializations.forEach(spec => {
          filterTrends.specializations[spec] = (filterTrends.specializations[spec] || 0) + 1;
        });
      }
      if (search.filters.certifications) {
        search.filters.certifications.forEach(cert => {
          filterTrends.certifications[cert] = (filterTrends.certifications[cert] || 0) + 1;
        });
      }
      if (search.filters.feeStructure) {
        filterTrends.feeStructures[search.filters.feeStructure] = (filterTrends.feeStructures[search.filters.feeStructure] || 0) + 1;
      }
    });

    return {
      searchVolumeByDay,
      searchVolumeByHour,
      filterTrends,
    };
  };

  const calculateDistributionMetrics = (advisors) => {
    const distributions = {
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
      responseTime: {
        '0-1': 0,
        '1-4': 0,
        '4-8': 0,
        '8-24': 0,
        '24+': 0,
      },
    };

    advisors.forEach(advisor => {
      // Location distribution
      distributions.locations[advisor.location] = (distributions.locations[advisor.location] || 0) + 1;

      // Specialization distribution
      advisor.specializations?.forEach(spec => {
        distributions.specializations[spec] = (distributions.specializations[spec] || 0) + 1;
      });

      // Certification distribution
      advisor.certifications?.forEach(cert => {
        distributions.certifications[cert] = (distributions.certifications[cert] || 0) + 1;
      });

      // Fee structure distribution
      distributions.feeStructures[advisor.feeStructure] = (distributions.feeStructures[advisor.feeStructure] || 0) + 1;

      // Rating distribution
      const rating = advisor.averageRating;
      if (rating >= 1 && rating < 2) distributions.ratings['1-2']++;
      else if (rating >= 2 && rating < 3) distributions.ratings['2-3']++;
      else if (rating >= 3 && rating < 4) distributions.ratings['3-4']++;
      else if (rating >= 4 && rating <= 5) distributions.ratings['4-5']++;

      // Experience distribution
      const experience = advisor.yearsOfExperience;
      if (experience < 5) distributions.experience['0-5']++;
      else if (experience < 10) distributions.experience['5-10']++;
      else if (experience < 15) distributions.experience['10-15']++;
      else if (experience < 20) distributions.experience['15-20']++;
      else distributions.experience['20+']++;

      // Response time distribution
      const responseTime = advisor.responseTime;
      if (responseTime < 1) distributions.responseTime['0-1']++;
      else if (responseTime < 4) distributions.responseTime['1-4']++;
      else if (responseTime < 8) distributions.responseTime['4-8']++;
      else if (responseTime < 24) distributions.responseTime['8-24']++;
      else distributions.responseTime['24+']++;
    });

    return distributions;
  };

  const calculateComparisonMetrics = (advisors, history) => {
    const comparisons = {
      ratingVsExperience: [],
      ratingVsResponseTime: [],
      experienceVsFeeStructure: [],
      specializationVsCertification: {},
    };

    // Rating vs Experience correlation
    advisors.forEach(advisor => {
      comparisons.ratingVsExperience.push({
        rating: advisor.averageRating,
        experience: advisor.yearsOfExperience,
      });
    });

    // Rating vs Response Time correlation
    advisors.forEach(advisor => {
      comparisons.ratingVsResponseTime.push({
        rating: advisor.averageRating,
        responseTime: advisor.responseTime,
      });
    });

    // Experience vs Fee Structure correlation
    advisors.forEach(advisor => {
      comparisons.experienceVsFeeStructure.push({
        experience: advisor.yearsOfExperience,
        feeStructure: advisor.feeStructure,
      });
    });

    // Specialization vs Certification correlation
    advisors.forEach(advisor => {
      advisor.specializations?.forEach(spec => {
        if (!comparisons.specializationVsCertification[spec]) {
          comparisons.specializationVsCertification[spec] = {};
        }
        advisor.certifications?.forEach(cert => {
          comparisons.specializationVsCertification[spec][cert] = (comparisons.specializationVsCertification[spec][cert] || 0) + 1;
        });
      });
    });

    return comparisons;
  };

  const calculatePredictionMetrics = (advisors, history) => {
    const predictions = {
      advisorGrowth: calculateAdvisorGrowth(advisors, history),
      specializationTrends: calculateSpecializationTrends(advisors, history),
      certificationDemand: calculateCertificationDemand(advisors, history),
      feeStructureTrends: calculateFeeStructureTrends(advisors, history),
    };

    return predictions;
  };

  const calculateAdvisorGrowth = (advisors, history) => {
    // Simple linear regression for advisor growth prediction
    const dates = history.map(search => new Date(search.timestamp).getTime());
    const counts = history.map(search => search.results);
    const slope = calculateSlope(dates, counts);
    const growthRate = (slope * 30) / counts[counts.length - 1] * 100; // Monthly growth rate

    return {
      currentCount: advisors.length,
      predictedGrowth: growthRate,
      confidence: 0.85, // This would be calculated based on data quality
    };
  };

  const calculateSpecializationTrends = (advisors, history) => {
    const trends = {};
    const currentDistribution = {};
    const historicalDistribution = {};

    // Current distribution
    advisors.forEach(advisor => {
      advisor.specializations?.forEach(spec => {
        currentDistribution[spec] = (currentDistribution[spec] || 0) + 1;
      });
    });

    // Historical distribution
    history.forEach(search => {
      if (search.filters.specializations) {
        search.filters.specializations.forEach(spec => {
          historicalDistribution[spec] = (historicalDistribution[spec] || 0) + 1;
        });
      }
    });

    // Calculate trends
    Object.keys(currentDistribution).forEach(spec => {
      const current = currentDistribution[spec];
      const historical = historicalDistribution[spec] || 0;
      const growth = ((current - historical) / historical) * 100;
      trends[spec] = {
        current,
        historical,
        growth,
        trend: growth > 0 ? 'up' : 'down',
      };
    });

    return trends;
  };

  const calculateCertificationDemand = (advisors, history) => {
    const demand = {};
    const currentDistribution = {};
    const searchDistribution = {};

    // Current distribution
    advisors.forEach(advisor => {
      advisor.certifications?.forEach(cert => {
        currentDistribution[cert] = (currentDistribution[cert] || 0) + 1;
      });
    });

    // Search distribution
    history.forEach(search => {
      if (search.filters.certifications) {
        search.filters.certifications.forEach(cert => {
          searchDistribution[cert] = (searchDistribution[cert] || 0) + 1;
        });
      }
    });

    // Calculate demand
    Object.keys(currentDistribution).forEach(cert => {
      const current = currentDistribution[cert];
      const searches = searchDistribution[cert] || 0;
      const demandRatio = searches / current;
      demand[cert] = {
        current,
        searches,
        demandRatio,
        status: demandRatio > 1 ? 'high' : demandRatio > 0.5 ? 'medium' : 'low',
      };
    });

    return demand;
  };

  const calculateFeeStructureTrends = (advisors, history) => {
    const trends = {};
    const currentDistribution = {};
    const historicalDistribution = {};

    // Current distribution
    advisors.forEach(advisor => {
      currentDistribution[advisor.feeStructure] = (currentDistribution[advisor.feeStructure] || 0) + 1;
    });

    // Historical distribution
    history.forEach(search => {
      if (search.filters.feeStructure) {
        historicalDistribution[search.filters.feeStructure] = (historicalDistribution[search.filters.feeStructure] || 0) + 1;
      }
    });

    // Calculate trends
    Object.keys(currentDistribution).forEach(structure => {
      const current = currentDistribution[structure];
      const historical = historicalDistribution[structure] || 0;
      const growth = ((current - historical) / historical) * 100;
      trends[structure] = {
        current,
        historical,
        growth,
        trend: growth > 0 ? 'up' : 'down',
      };
    });

    return trends;
  };

  const calculateSlope = (x, y) => {
    const n = x.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumXX += x[i] * x[i];
    }

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  };

  const calculateMostCommonFilters = (history) => {
    const filterCounts = {
      locations: {},
      specializations: {},
      certifications: {},
      feeStructures: {},
    };

    history.forEach(search => {
      if (search.filters.location) {
        filterCounts.locations[search.filters.location] = (filterCounts.locations[search.filters.location] || 0) + 1;
      }
      if (search.filters.specializations) {
        search.filters.specializations.forEach(spec => {
          filterCounts.specializations[spec] = (filterCounts.specializations[spec] || 0) + 1;
        });
      }
      if (search.filters.certifications) {
        search.filters.certifications.forEach(cert => {
          filterCounts.certifications[cert] = (filterCounts.certifications[cert] || 0) + 1;
        });
      }
      if (search.filters.feeStructure) {
        filterCounts.feeStructures[search.filters.feeStructure] = (filterCounts.feeStructures[search.filters.feeStructure] || 0) + 1;
      }
    });

    return Object.entries(filterCounts).reduce((acc, [key, counts]) => {
      acc[key] = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([value, count]) => ({ value, count }));
      return acc;
    }, {});
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
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'trends', label: 'Trends', icon: ChartBarIcon },
            { id: 'distributions', label: 'Distributions', icon: ChartPieIcon },
            { id: 'comparisons', label: 'Comparisons', icon: ArrowTrendingUpIcon },
            { id: 'predictions', label: 'Predictions', icon: ArrowTrendingUpIcon },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedMetric(tab.id)}
              className={`${
                selectedMetric === tab.id
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

      {/* Overview Metrics */}
      {selectedMetric === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderMetricCard(
              'Total Searches',
              metrics.overview.totalSearches,
              <ChartBarIcon className="h-5 w-5 text-blue-500" />
            )}
            {renderMetricCard(
              'Unique Searchers',
              metrics.overview.uniqueSearchers,
              <UserGroupIcon className="h-5 w-5 text-blue-500" />
            )}
            {renderMetricCard(
              'Average Results',
              metrics.overview.averageResultsPerSearch.toFixed(1),
              <ChartPieIcon className="h-5 w-5 text-blue-500" />
            )}
            {renderMetricCard(
              'Average Rating',
              metrics.overview.advisorMetrics.averageRating.toFixed(1),
              <StarIcon className="h-5 w-5 text-blue-500" />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderDistributionChart(
              metrics.overview.filterMetrics.mostCommonFilters.locations,
              'Popular Locations',
              <MapIcon className="h-5 w-5 text-blue-500" />
            )}
            {renderDistributionChart(
              metrics.overview.filterMetrics.mostCommonFilters.specializations,
              'Popular Specializations',
              <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />
            )}
          </div>
        </div>
      )}

      {/* Trends Metrics */}
      {selectedMetric === 'trends' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderDistributionChart(
              metrics.trends.filterTrends.locations,
              'Location Trends',
              <MapIcon className="h-5 w-5 text-blue-500" />
            )}
            {renderDistributionChart(
              metrics.trends.filterTrends.specializations,
              'Specialization Trends',
              <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />
            )}
            {renderDistributionChart(
              metrics.trends.filterTrends.certifications,
              'Certification Trends',
              <AcademicCapIcon className="h-5 w-5 text-blue-500" />
            )}
            {renderDistributionChart(
              metrics.trends.filterTrends.feeStructures,
              'Fee Structure Trends',
              <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />
            )}
          </div>

          {/* Search Volume by Hour */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center mb-4">
              <ClockIcon className="h-5 w-5 text-blue-500" />
              <h3 className="ml-2 text-sm font-medium text-gray-900">Search Volume by Hour</h3>
            </div>
            <div className="grid grid-cols-24 gap-1">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{
                      height: `${(metrics.trends.searchVolumeByHour[i] || 0) / Math.max(...Object.values(metrics.trends.searchVolumeByHour)) * 100}%`,
                    }}
                  />
                  <span className="text-xs text-gray-500 mt-1">{i}:00</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Distribution Metrics */}
      {selectedMetric === 'distributions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderDistributionChart(
              metrics.distributions.locations,
              'Location Distribution',
              <MapIcon className="h-5 w-5 text-blue-500" />
            )}
            {renderDistributionChart(
              metrics.distributions.specializations,
              'Specialization Distribution',
              <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />
            )}
            {renderDistributionChart(
              metrics.distributions.certifications,
              'Certification Distribution',
              <AcademicCapIcon className="h-5 w-5 text-blue-500" />
            )}
            {renderDistributionChart(
              metrics.distributions.feeStructures,
              'Fee Structure Distribution',
              <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />
            )}
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center mb-4">
              <StarIcon className="h-5 w-5 text-blue-500" />
              <h3 className="ml-2 text-sm font-medium text-gray-900">Rating Distribution</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(metrics.distributions.ratings).map(([range, count]) => (
                <div key={range} className="flex items-center">
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">{range} Stars</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(count / Math.max(...Object.values(metrics.distributions.ratings))) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-2 text-sm text-gray-600">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comparison Metrics */}
      {selectedMetric === 'comparisons' && (
        <div className="space-y-6">
          {/* Rating vs Experience Correlation */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Rating vs Experience Correlation</h3>
            <div className="h-64">
              {/* In a real implementation, this would be a scatter plot */}
              <div className="text-center text-gray-500">Scatter plot visualization</div>
            </div>
          </div>

          {/* Specialization vs Certification Correlation */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Specialization vs Certification Correlation</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Certifications
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(metrics.comparisons.specializationVsCertification)
                    .flatMap(([spec, certs]) =>
                      Object.entries(certs).map(([cert, count]) => ({
                        specialization: spec,
                        certification: cert,
                        count,
                      }))
                    )
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
                    .map(({ specialization, certification, count }) => (
                      <tr key={`${specialization}-${certification}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{specialization}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{certification}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{count}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Prediction Metrics */}
      {selectedMetric === 'predictions' && (
        <div className="space-y-6">
          {/* Advisor Growth Prediction */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <UserGroupIcon className="h-5 w-5 text-blue-500" />
                <h3 className="ml-2 text-sm font-medium text-gray-900">Advisor Growth Prediction</h3>
              </div>
              <span className={`text-sm ${metrics.predictions.advisorGrowth.predictedGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.predictions.advisorGrowth.predictedGrowth > 0 ? '+' : ''}
                {metrics.predictions.advisorGrowth.predictedGrowth.toFixed(1)}% monthly
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Current count: {metrics.predictions.advisorGrowth.currentCount} advisors
            </p>
            <p className="text-sm text-gray-600">
              Confidence: {(metrics.predictions.advisorGrowth.confidence * 100).toFixed(0)}%
            </p>
          </div>

          {/* Specialization Trends */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Specialization Trends</h3>
            <div className="space-y-4">
              {Object.entries(metrics.predictions.specializationTrends)
                .sort(([, a], [, b]) => b.growth - a.growth)
                .slice(0, 5)
                .map(([spec, data]) => (
                  <div key={spec} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{spec}</p>
                      <p className="text-sm text-gray-600">
                        Current: {data.current} | Historical: {data.historical}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        data.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {data.trend === 'up' ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(data.growth).toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Certification Demand */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Certification Demand</h3>
            <div className="space-y-4">
              {Object.entries(metrics.predictions.certificationDemand)
                .sort(([, a], [, b]) => b.demandRatio - a.demandRatio)
                .slice(0, 5)
                .map(([cert, data]) => (
                  <div key={cert} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cert}</p>
                      <p className="text-sm text-gray-600">
                        Current: {data.current} | Searches: {data.searches}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        data.status === 'high'
                          ? 'bg-green-100 text-green-800'
                          : data.status === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {data.status.toUpperCase()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInsightsDashboard; 