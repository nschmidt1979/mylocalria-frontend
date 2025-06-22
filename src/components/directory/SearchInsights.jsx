import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ChartPieIcon,
  MapIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  StarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const SearchInsights = ({ advisors, filters }) => {
  const [insights, setInsights] = useState({
    ratingDistribution: {},
    locationDistribution: {},
    specializationDistribution: {},
    certificationDistribution: {},
    feeStructureDistribution: {},
    experienceDistribution: {},
    responseTimeDistribution: {},
  });

  useEffect(() => {
    if (!advisors.length) return;

    // Calculate rating distribution
    const ratingDist = {};
    for (let i = 1; i <= 5; i++) {
      ratingDist[i] = advisors.filter(a => Math.round(a.averageRating) === i).length;
    }

    // Calculate location distribution
    const locationDist = {};
    advisors.forEach(advisor => {
      if (advisor.location) {
        locationDist[advisor.location] = (locationDist[advisor.location] || 0) + 1;
      }
    });

    // Calculate specialization distribution
    const specializationDist = {};
    advisors.forEach(advisor => {
      advisor.specializations?.forEach(spec => {
        specializationDist[spec] = (specializationDist[spec] || 0) + 1;
      });
    });

    // Calculate certification distribution
    const certificationDist = {};
    advisors.forEach(advisor => {
      advisor.certifications?.forEach(cert => {
        certificationDist[cert] = (certificationDist[cert] || 0) + 1;
      });
    });

    // Calculate fee structure distribution
    const feeStructureDist = {};
    advisors.forEach(advisor => {
      if (advisor.feeStructure) {
        feeStructureDist[advisor.feeStructure] = (feeStructureDist[advisor.feeStructure] || 0) + 1;
      }
    });

    // Calculate experience distribution
    const experienceDist = {
      '0-5 years': 0,
      '6-10 years': 0,
      '11-15 years': 0,
      '16-20 years': 0,
      '20+ years': 0,
    };
    advisors.forEach(advisor => {
      const years = advisor.yearsOfExperience || 0;
      if (years <= 5) experienceDist['0-5 years']++;
      else if (years <= 10) experienceDist['6-10 years']++;
      else if (years <= 15) experienceDist['11-15 years']++;
      else if (years <= 20) experienceDist['16-20 years']++;
      else experienceDist['20+ years']++;
    });

    // Calculate response time distribution
    const responseTimeDist = {
      'Within 24 hours': 0,
      '1-2 days': 0,
      '3-5 days': 0,
      'More than 5 days': 0,
    };
    advisors.forEach(advisor => {
      const responseTime = advisor.averageResponseTime || 0;
      if (responseTime <= 24) responseTimeDist['Within 24 hours']++;
      else if (responseTime <= 48) responseTimeDist['1-2 days']++;
      else if (responseTime <= 120) responseTimeDist['3-5 days']++;
      else responseTimeDist['More than 5 days']++;
    });

    setInsights({
      ratingDistribution: ratingDist,
      locationDistribution: locationDist,
      specializationDistribution: specializationDist,
      certificationDistribution: certificationDist,
      feeStructureDistribution: feeStructureDist,
      experienceDistribution: experienceDist,
      responseTimeDistribution: responseTimeDist,
    });
  }, [advisors]);

  const renderDistribution = (distribution, icon, title, limit = 5) => {
    const sorted = Object.entries(distribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);

    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

    return (
      <div className="space-y-3">
        <div className="flex items-center">
          {icon}
          <h4 className="ml-2 text-sm font-medium text-gray-900">{title}</h4>
        </div>
        <div className="space-y-2">
          {sorted.map(([key, value]) => {
            const percentage = ((value / total) * 100).toFixed(1);
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 truncate">{key}</span>
                  <span className="text-gray-900 font-medium">{value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  {percentage}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!advisors.length) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <ChartBarIcon className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Search Insights</h3>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Rating Distribution */}
        <div>
          {renderDistribution(
            insights.ratingDistribution,
            <StarIcon className="h-5 w-5 text-blue-500" />,
            'Rating Distribution'
          )}
        </div>

        {/* Location Distribution */}
        <div>
          {renderDistribution(
            insights.locationDistribution,
            <MapIcon className="h-5 w-5 text-blue-500" />,
            'Location Distribution'
          )}
        </div>

        {/* Specialization Distribution */}
        <div>
          {renderDistribution(
            insights.specializationDistribution,
            <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />,
            'Specialization Distribution'
          )}
        </div>

        {/* Certification Distribution */}
        <div>
          {renderDistribution(
            insights.certificationDistribution,
            <AcademicCapIcon className="h-5 w-5 text-blue-500" />,
            'Certification Distribution'
          )}
        </div>

        {/* Fee Structure Distribution */}
        <div>
          {renderDistribution(
            insights.feeStructureDistribution,
            <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />,
            'Fee Structure Distribution'
          )}
        </div>

        {/* Experience Distribution */}
        <div>
          {renderDistribution(
            insights.experienceDistribution,
            <ClockIcon className="h-5 w-5 text-blue-500" />,
            'Experience Distribution'
          )}
        </div>

        {/* Response Time Distribution */}
        <div>
          {renderDistribution(
            insights.responseTimeDistribution,
            <ClockIcon className="h-5 w-5 text-blue-500" />,
            'Response Time Distribution'
          )}
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">Average Rating</p>
            <p className="mt-1 text-2xl font-semibold text-blue-900">
              {(advisors.reduce((sum, a) => sum + (a.averageRating || 0), 0) / advisors.length).toFixed(1)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">Average Response Time</p>
            <p className="mt-1 text-2xl font-semibold text-blue-900">
              {Math.round(advisors.reduce((sum, a) => sum + (a.averageResponseTime || 0), 0) / advisors.length)} hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchInsights; 