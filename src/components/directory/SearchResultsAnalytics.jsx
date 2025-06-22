import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ChartPieIcon,
  ChartBarSquareIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

const SearchResultsAnalytics = ({ advisors = [], filters = {}, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    trends: true,
    distributions: true,
    correlations: true,
    predictions: true,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await generateMockAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
    // eslint-disable-next-line
  }, [advisors, filters]);

  const generateMockAnalytics = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const totalAdvisors = advisors.length || 1;
    const averageRating = advisors.reduce((sum, a) => sum + (a.averageRating || 0), 0) / totalAdvisors;
    const averageExperience = advisors.reduce((sum, a) => sum + (a.yearsOfExperience || 0), 0) / totalAdvisors;
    const averageFee = advisors.reduce((sum, a) => sum + ((a.minFee || 0) + (a.maxFee || 0)) / 2, 0) / totalAdvisors;
    const ratingDistribution = Array.from({ length: 5 }, (_, i) => ({
      rating: i + 1,
      count: advisors.filter(a => Math.round(a.averageRating) === i + 1).length,
    }));
    const experienceDistribution = [
      { range: '0-5 years', count: advisors.filter(a => (a.yearsOfExperience || 0) <= 5).length },
      { range: '6-10 years', count: advisors.filter(a => (a.yearsOfExperience || 0) > 5 && (a.yearsOfExperience || 0) <= 10).length },
      { range: '11-15 years', count: advisors.filter(a => (a.yearsOfExperience || 0) > 10 && (a.yearsOfExperience || 0) <= 15).length },
      { range: '16-20 years', count: advisors.filter(a => (a.yearsOfExperience || 0) > 15 && (a.yearsOfExperience || 0) <= 20).length },
      { range: '20+ years', count: advisors.filter(a => (a.yearsOfExperience || 0) > 20).length },
    ];
    const feeDistribution = [
      { range: '$0-$100', count: advisors.filter(a => (a.minFee || 0) <= 100).length },
      { range: '$101-$200', count: advisors.filter(a => (a.minFee || 0) > 100 && (a.minFee || 0) <= 200).length },
      { range: '$201-$300', count: advisors.filter(a => (a.minFee || 0) > 200 && (a.minFee || 0) <= 300).length },
      { range: '$301-$400', count: advisors.filter(a => (a.minFee || 0) > 300 && (a.minFee || 0) <= 400).length },
      { range: '$400+', count: advisors.filter(a => (a.minFee || 0) > 400).length },
    ];
    const trends = {
      ratingTrend: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
        average: averageRating + (Math.random() - 0.5) * 0.5,
      })),
      experienceTrend: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
        average: averageExperience + (Math.random() - 0.5) * 2,
      })),
      feeTrend: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
        average: averageFee + (Math.random() - 0.5) * 50,
      })),
    };
    const correlations = {
      ratingExperience: calculateCorrelation(
        advisors.map(a => a.averageRating || 0),
        advisors.map(a => a.yearsOfExperience || 0)
      ),
      ratingFee: calculateCorrelation(
        advisors.map(a => a.averageRating || 0),
        advisors.map(a => ((a.minFee || 0) + (a.maxFee || 0)) / 2)
      ),
      experienceFee: calculateCorrelation(
        advisors.map(a => a.yearsOfExperience || 0),
        advisors.map(a => ((a.minFee || 0) + (a.maxFee || 0)) / 2)
      ),
    };
    const predictions = {
      ratingPrediction: {
        nextMonth: averageRating + (Math.random() - 0.5) * 0.2,
        nextQuarter: averageRating + (Math.random() - 0.5) * 0.4,
        nextYear: averageRating + (Math.random() - 0.5) * 0.8,
      },
      feePrediction: {
        nextMonth: averageFee + (Math.random() - 0.5) * 20,
        nextQuarter: averageFee + (Math.random() - 0.5) * 40,
        nextYear: averageFee + (Math.random() - 0.5) * 80,
      },
      demandPrediction: {
        nextMonth: totalAdvisors * (1 + (Math.random() - 0.5) * 0.1),
        nextQuarter: totalAdvisors * (1 + (Math.random() - 0.5) * 0.2),
        nextYear: totalAdvisors * (1 + (Math.random() - 0.5) * 0.4),
      },
    };
    return {
      overview: {
        totalAdvisors,
        averageRating,
        averageExperience,
        averageFee,
        topSpecializations: getTopItems(advisors.flatMap(a => a.specialization || []), 5),
        topCertifications: getTopItems(advisors.flatMap(a => a.certifications || []), 5),
        topLocations: getTopItems(advisors.map(a => a.location || 'Unknown'), 5),
      },
      distributions: {
        rating: ratingDistribution,
        experience: experienceDistribution,
        fee: feeDistribution,
      },
      trends,
      correlations,
      predictions,
    };
  };

  const calculateCorrelation = (x, y) => {
    const n = x.length;
    if (n !== y.length || n === 0) return 0;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const getTopItems = (items, count) => {
    const counts = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([item, count]) => ({ item, count }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderMetricCard = (title, value, change, icon) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <div className="mt-1 flex items-center">
              {change > 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>{Math.abs(change)}% from last period</span>
            </div>
          )}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </div>
  );

  const renderDistributionChart = (data, title, valueKey, labelKey) => (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{item[labelKey]}</span>
              <span className="text-gray-900">{item[valueKey]}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(item[valueKey] / Math.max(...data.map(d => d[valueKey]))) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTrendChart = (data, title, valueKey) => (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="h-48 flex items-end space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-blue-600 rounded-t"
              style={{
                height: `${(item[valueKey] / Math.max(...data.map(d => d[valueKey]))) * 100}%`,
              }}
            />
            <span className="text-xs text-gray-500 mt-1">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCorrelationCard = (title, value) => (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold text-gray-900">{value.toFixed(2)}</div>
        <div className="text-sm text-gray-500">
          {value > 0.7
            ? 'Strong positive correlation'
            : value > 0.3
            ? 'Moderate positive correlation'
            : value > -0.3
            ? 'Weak correlation'
            : value > -0.7
            ? 'Moderate negative correlation'
            : 'Strong negative correlation'}
        </div>
      </div>
    </div>
  );

  const renderPredictionCard = (title, data) => (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {Object.entries(data).map(([period, value]) => (
          <div key={period} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {period.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </span>
            <span className="text-lg font-semibold text-gray-900">
              {typeof value === 'number' ? value.toFixed(2) : Math.round(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }
  if (!analytics) return null;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Search Results Analytics</h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      {/* Content */}
      <div className="px-4 pb-5 sm:px-6">
        {/* Overview Section */}
        <div className="mb-6">
          <button onClick={() => toggleSection('overview')} className="flex items-center justify-between w-full text-left mb-4">
            <h3 className="text-lg font-medium text-gray-900">Overview</h3>
            {expandedSections.overview ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
          {expandedSections.overview && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {renderMetricCard('Total Advisors', analytics.overview.totalAdvisors, null, <ChartBarIcon className="h-6 w-6" />)}
              {renderMetricCard('Average Rating', analytics.overview.averageRating.toFixed(1), 5.2, <ChartPieIcon className="h-6 w-6" />)}
              {renderMetricCard('Average Experience', `${analytics.overview.averageExperience.toFixed(1)} years`, -2.1, <ChartBarSquareIcon className="h-6 w-6" />)}
              {renderMetricCard('Average Fee', `$${analytics.overview.averageFee.toFixed(0)}`, 3.8, <ArrowTrendingUpIcon className="h-6 w-6" />)}
            </div>
          )}
        </div>
        {/* Distributions Section */}
        <div className="mb-6">
          <button onClick={() => toggleSection('distributions')} className="flex items-center justify-between w-full text-left mb-4">
            <h3 className="text-lg font-medium text-gray-900">Distributions</h3>
            {expandedSections.distributions ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
          {expandedSections.distributions && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {renderDistributionChart(analytics.distributions.rating, 'Rating Distribution', 'count', 'rating')}
              {renderDistributionChart(analytics.distributions.experience, 'Experience Distribution', 'count', 'range')}
              {renderDistributionChart(analytics.distributions.fee, 'Fee Distribution', 'count', 'range')}
            </div>
          )}
        </div>
        {/* Trends Section */}
        <div className="mb-6">
          <button onClick={() => toggleSection('trends')} className="flex items-center justify-between w-full text-left mb-4">
            <h3 className="text-lg font-medium text-gray-900">Trends</h3>
            {expandedSections.trends ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
          {expandedSections.trends && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {renderTrendChart(analytics.trends.ratingTrend, 'Rating Trend', 'average')}
              {renderTrendChart(analytics.trends.experienceTrend, 'Experience Trend', 'average')}
              {renderTrendChart(analytics.trends.feeTrend, 'Fee Trend', 'average')}
            </div>
          )}
        </div>
        {/* Correlations Section */}
        <div className="mb-6">
          <button onClick={() => toggleSection('correlations')} className="flex items-center justify-between w-full text-left mb-4">
            <h3 className="text-lg font-medium text-gray-900">Correlations</h3>
            {expandedSections.correlations ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
          {expandedSections.correlations && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {renderCorrelationCard('Rating vs Experience', analytics.correlations.ratingExperience)}
              {renderCorrelationCard('Rating vs Fee', analytics.correlations.ratingFee)}
              {renderCorrelationCard('Experience vs Fee', analytics.correlations.experienceFee)}
            </div>
          )}
        </div>
        {/* Predictions Section */}
        <div className="mb-6">
          <button onClick={() => toggleSection('predictions')} className="flex items-center justify-between w-full text-left mb-4">
            <h3 className="text-lg font-medium text-gray-900">Predictions</h3>
            {expandedSections.predictions ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
          {expandedSections.predictions && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {renderPredictionCard('Rating Predictions', analytics.predictions.ratingPrediction)}
              {renderPredictionCard('Fee Predictions', analytics.predictions.feePrediction)}
              {renderPredictionCard('Demand Predictions', analytics.predictions.demandPrediction)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsAnalytics;