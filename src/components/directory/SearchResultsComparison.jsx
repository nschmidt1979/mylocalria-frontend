import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ChartPieIcon,
  MapIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const SearchResultsComparison = ({ searchSets, onClose }) => {
  const [selectedMetrics, setSelectedMetrics] = useState(['overview', 'distributions', 'correlations']);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const calculateComparisonData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = {
          overview: calculateOverviewMetrics(searchSets),
          distributions: calculateDistributionMetrics(searchSets),
          correlations: calculateCorrelationMetrics(searchSets),
          differences: calculateDifferenceMetrics(searchSets),
        };

        setComparisonData(data);
      } catch (err) {
        setError('Failed to calculate comparison data');
        console.error('Comparison calculation error:', err);
      } finally {
        setLoading(false);
      }
    };

    calculateComparisonData();
  }, [searchSets]);

  const calculateOverviewMetrics = (sets) => {
    return sets.map(set => ({
      id: set.id,
      name: set.name,
      timestamp: set.timestamp,
      metrics: {
        totalAdvisors: set.advisors.length,
        averageRating: set.advisors.reduce((sum, advisor) => sum + advisor.averageRating, 0) / set.advisors.length,
        averageExperience: set.advisors.reduce((sum, advisor) => sum + advisor.yearsOfExperience, 0) / set.advisors.length,
        averageResponseTime: set.advisors.reduce((sum, advisor) => sum + advisor.responseTime, 0) / set.advisors.length,
        totalCertifications: set.advisors.reduce((sum, advisor) => sum + (advisor.certifications?.length || 0), 0),
        totalSpecializations: set.advisors.reduce((sum, advisor) => sum + (advisor.specializations?.length || 0), 0),
      },
    }));
  };

  const calculateDistributionMetrics = (sets) => {
    return sets.map(set => ({
      id: set.id,
      name: set.name,
      distributions: {
        locations: calculateDistribution(set.advisors, 'location'),
        specializations: calculateDistribution(set.advisors, 'specializations'),
        certifications: calculateDistribution(set.advisors, 'certifications'),
        feeStructures: calculateDistribution(set.advisors, 'feeStructure'),
        ratings: calculateRatingDistribution(set.advisors),
        experience: calculateExperienceDistribution(set.advisors),
      },
    }));
  };

  const calculateCorrelationMetrics = (sets) => {
    return sets.map(set => ({
      id: set.id,
      name: set.name,
      correlations: {
        ratingVsExperience: calculateCorrelation(
          set.advisors.map(a => a.averageRating),
          set.advisors.map(a => a.yearsOfExperience)
        ),
        ratingVsResponseTime: calculateCorrelation(
          set.advisors.map(a => a.averageRating),
          set.advisors.map(a => a.responseTime)
        ),
        experienceVsFeeStructure: calculateExperienceVsFeeStructure(set.advisors),
        specializationVsCertification: calculateSpecializationVsCertification(set.advisors),
      },
    }));
  };

  const calculateDifferenceMetrics = (sets) => {
    if (sets.length < 2) return null;

    const differences = [];
    for (let i = 0; i < sets.length; i++) {
      for (let j = i + 1; j < sets.length; j++) {
        differences.push({
          set1: sets[i].name,
          set2: sets[j].name,
          metrics: {
            advisorCount: sets[j].advisors.length - sets[i].advisors.length,
            averageRating: calculatePercentageDifference(
              sets[i].advisors.reduce((sum, advisor) => sum + advisor.averageRating, 0) / sets[i].advisors.length,
              sets[j].advisors.reduce((sum, advisor) => sum + advisor.averageRating, 0) / sets[j].advisors.length
            ),
            averageExperience: calculatePercentageDifference(
              sets[i].advisors.reduce((sum, advisor) => sum + advisor.yearsOfExperience, 0) / sets[i].advisors.length,
              sets[j].advisors.reduce((sum, advisor) => sum + advisor.yearsOfExperience, 0) / sets[j].advisors.length
            ),
            locationOverlap: calculateOverlap(
              sets[i].advisors.map(a => a.location),
              sets[j].advisors.map(a => a.location)
            ),
            specializationOverlap: calculateOverlap(
              sets[i].advisors.flatMap(a => a.specializations || []),
              sets[j].advisors.flatMap(a => a.specializations || [])
            ),
            certificationOverlap: calculateOverlap(
              sets[i].advisors.flatMap(a => a.certifications || []),
              sets[j].advisors.flatMap(a => a.certifications || [])
            ),
          },
        });
      }
    }

    return differences;
  };

  const calculateDistribution = (advisors, field) => {
    const distribution = {};
    advisors.forEach(advisor => {
      if (field === 'specializations' || field === 'certifications') {
        advisor[field]?.forEach(value => {
          distribution[value] = (distribution[value] || 0) + 1;
        });
      } else {
        const value = advisor[field];
        distribution[value] = (distribution[value] || 0) + 1;
      }
    });
    return distribution;
  };

  const calculateRatingDistribution = (advisors) => {
    const distribution = {
      '1-2': 0,
      '2-3': 0,
      '3-4': 0,
      '4-5': 0,
    };

    advisors.forEach(advisor => {
      const rating = advisor.averageRating;
      if (rating >= 1 && rating < 2) distribution['1-2']++;
      else if (rating >= 2 && rating < 3) distribution['2-3']++;
      else if (rating >= 3 && rating < 4) distribution['3-4']++;
      else if (rating >= 4 && rating <= 5) distribution['4-5']++;
    });

    return distribution;
  };

  const calculateExperienceDistribution = (advisors) => {
    const distribution = {
      '0-5': 0,
      '5-10': 0,
      '10-15': 0,
      '15-20': 0,
      '20+': 0,
    };

    advisors.forEach(advisor => {
      const experience = advisor.yearsOfExperience;
      if (experience < 5) distribution['0-5']++;
      else if (experience < 10) distribution['5-10']++;
      else if (experience < 15) distribution['10-15']++;
      else if (experience < 20) distribution['15-20']++;
      else distribution['20+']++;
    });

    return distribution;
  };

  const calculateCorrelation = (x, y) => {
    const n = x.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    let sumYY = 0;

    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumXX += x[i] * x[i];
      sumYY += y[i] * y[i];
    }

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  };

  const calculateExperienceVsFeeStructure = (advisors) => {
    const correlation = {};
    const feeStructures = [...new Set(advisors.map(a => a.feeStructure))];

    feeStructures.forEach(structure => {
      const structureAdvisors = advisors.filter(a => a.feeStructure === structure);
      const avgExperience = structureAdvisors.reduce((sum, a) => sum + a.yearsOfExperience, 0) / structureAdvisors.length;
      correlation[structure] = avgExperience;
    });

    return correlation;
  };

  const calculateSpecializationVsCertification = (advisors) => {
    const correlation = {};
    const specializations = [...new Set(advisors.flatMap(a => a.specializations || []))];

    specializations.forEach(spec => {
      const specAdvisors = advisors.filter(a => a.specializations?.includes(spec));
      const avgCertifications = specAdvisors.reduce((sum, a) => sum + (a.certifications?.length || 0), 0) / specAdvisors.length;
      correlation[spec] = avgCertifications;
    });

    return correlation;
  };

  const calculatePercentageDifference = (value1, value2) => {
    return ((value2 - value1) / value1) * 100;
  };

  const calculateOverlap = (set1, set2) => {
    const unique1 = new Set(set1);
    const unique2 = new Set(set2);
    const intersection = new Set([...unique1].filter(x => unique2.has(x)));
    return (intersection.size / Math.max(unique1.size, unique2.size)) * 100;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Search Results Comparison</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Metric Selection */}
      <div className="flex space-x-4">
        {[
          { id: 'overview', label: 'Overview', icon: ChartBarIcon },
          { id: 'distributions', label: 'Distributions', icon: ChartPieIcon },
          { id: 'correlations', label: 'Correlations', icon: ChartBarIcon },
          { id: 'differences', label: 'Differences', icon: ArrowTrendingUpIcon },
        ].map(metric => (
          <button
            key={metric.id}
            onClick={() => {
              setSelectedMetrics(prev =>
                prev.includes(metric.id)
                  ? prev.filter(m => m !== metric.id)
                  : [...prev, metric.id]
              );
            }}
            className={`${
              selectedMetrics.includes(metric.id)
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } px-3 py-2 rounded-md text-sm font-medium flex items-center`}
          >
            <metric.icon className="h-5 w-5 mr-2" />
            {metric.label}
          </button>
        ))}
      </div>

      {/* Overview Metrics */}
      {selectedMetrics.includes('overview') && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Overview Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisonData.overview.map((set, index) => (
              <div key={set.id} className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">{set.name}</h4>
                {renderMetricCard(
                  'Total Advisors',
                  set.metrics.totalAdvisors,
                  <UserGroupIcon className="h-5 w-5 text-blue-500" />
                )}
                {renderMetricCard(
                  'Average Rating',
                  set.metrics.averageRating.toFixed(1),
                  <StarIcon className="h-5 w-5 text-blue-500" />
                )}
                {renderMetricCard(
                  'Average Experience',
                  `${set.metrics.averageExperience.toFixed(1)} years`,
                  <AcademicCapIcon className="h-5 w-5 text-blue-500" />
                )}
                {renderMetricCard(
                  'Total Certifications',
                  set.metrics.totalCertifications,
                  <AcademicCapIcon className="h-5 w-5 text-blue-500" />
                )}
                {renderMetricCard(
                  'Total Specializations',
                  set.metrics.totalSpecializations,
                  <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distribution Metrics */}
      {selectedMetrics.includes('distributions') && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Distribution Metrics</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {comparisonData.distributions.map((set, index) => (
              <div key={set.id} className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">{set.name}</h4>
                {renderDistributionChart(
                  set.distributions.locations,
                  'Location Distribution',
                  <MapIcon className="h-5 w-5 text-blue-500" />
                )}
                {renderDistributionChart(
                  set.distributions.specializations,
                  'Specialization Distribution',
                  <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />
                )}
                {renderDistributionChart(
                  set.distributions.certifications,
                  'Certification Distribution',
                  <AcademicCapIcon className="h-5 w-5 text-blue-500" />
                )}
                {renderDistributionChart(
                  set.distributions.feeStructures,
                  'Fee Structure Distribution',
                  <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correlation Metrics */}
      {selectedMetrics.includes('correlations') && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Correlation Metrics</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {comparisonData.correlations.map((set, index) => (
              <div key={set.id} className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">{set.name}</h4>
                <div className="bg-white rounded-lg shadow p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-4">Rating vs Experience Correlation</h5>
                  <p className="text-sm text-gray-600">
                    Correlation coefficient: {set.correlations.ratingVsExperience.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-4">Experience vs Fee Structure</h5>
                  <div className="space-y-2">
                    {Object.entries(set.correlations.experienceVsFeeStructure)
                      .sort(([, a], [, b]) => b - a)
                      .map(([structure, experience]) => (
                        <div key={structure} className="flex justify-between">
                          <span className="text-sm text-gray-600">{structure}</span>
                          <span className="text-sm text-gray-900">{experience.toFixed(1)} years</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Difference Metrics */}
      {selectedMetrics.includes('differences') && comparisonData.differences && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Difference Metrics</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {comparisonData.differences.map((diff, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-4">
                  {diff.set1} vs {diff.set2}
                </h4>
                <div className="space-y-4">
                  {renderMetricCard(
                    'Advisor Count Difference',
                    diff.metrics.advisorCount,
                    <UserGroupIcon className="h-5 w-5 text-blue-500" />,
                    diff.metrics.advisorCount
                  )}
                  {renderMetricCard(
                    'Average Rating Difference',
                    `${Math.abs(diff.metrics.averageRating).toFixed(1)}%`,
                    <StarIcon className="h-5 w-5 text-blue-500" />,
                    diff.metrics.averageRating
                  )}
                  {renderMetricCard(
                    'Average Experience Difference',
                    `${Math.abs(diff.metrics.averageExperience).toFixed(1)}%`,
                    <AcademicCapIcon className="h-5 w-5 text-blue-500" />,
                    diff.metrics.averageExperience
                  )}
                  {renderMetricCard(
                    'Location Overlap',
                    `${diff.metrics.locationOverlap.toFixed(1)}%`,
                    <MapIcon className="h-5 w-5 text-blue-500" />
                  )}
                  {renderMetricCard(
                    'Specialization Overlap',
                    `${diff.metrics.specializationOverlap.toFixed(1)}%`,
                    <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />
                  )}
                  {renderMetricCard(
                    'Certification Overlap',
                    `${diff.metrics.certificationOverlap.toFixed(1)}%`,
                    <AcademicCapIcon className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsComparison; 