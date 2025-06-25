import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  StarIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const SearchResultsSummary = ({ advisors, filters }) => {
  const [summary, setSummary] = useState({
    totalAdvisors: 0,
    averageRating: 0,
    totalReviews: 0,
    locationDistribution: {},
    specializationDistribution: {},
    certificationDistribution: {},
    feeStructureDistribution: {},
  });

  useEffect(() => {
    if (!advisors.length) {
      setSummary({
        totalAdvisors: 0,
        averageRating: 0,
        totalReviews: 0,
        locationDistribution: {},
        specializationDistribution: {},
        certificationDistribution: {},
        feeStructureDistribution: {},
      });
      return;
    }

    // Calculate average rating and total reviews
    const totalRating = advisors.reduce((sum, advisor) => sum + (advisor.averageRating || 0), 0);
    const totalReviews = advisors.reduce((sum, advisor) => sum + (advisor.reviewCount || 0), 0);

    // Calculate distributions
    const locationDist = {};
    const specializationDist = {};
    const certificationDist = {};
    const feeStructureDist = {};

    advisors.forEach(advisor => {
      // Location distribution
      if (advisor.location) {
        locationDist[advisor.location] = (locationDist[advisor.location] || 0) + 1;
      }

      // Specialization distribution
      advisor.specializations?.forEach(spec => {
        specializationDist[spec] = (specializationDist[spec] || 0) + 1;
      });

      // Certification distribution
      advisor.certifications?.forEach(cert => {
        certificationDist[cert] = (certificationDist[cert] || 0) + 1;
      });

      // Fee structure distribution
      if (advisor.feeStructure) {
        feeStructureDist[advisor.feeStructure] = (feeStructureDist[advisor.feeStructure] || 0) + 1;
      }
    });

    setSummary({
      totalAdvisors: advisors.length,
      averageRating: totalRating / advisors.length,
      totalReviews,
      locationDistribution: locationDist,
      specializationDistribution: specializationDist,
      certificationDistribution: certificationDist,
      feeStructureDistribution: feeStructureDist,
    });
  }, [advisors]);

  if (!advisors.length) {
    return null;
  }

  const renderDistribution = (distribution, limit = 3) => {
    const sorted = Object.entries(distribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);

    return (
      <div className="space-y-1">
        {sorted.map(([key, value]) => (
          <div key={key} className="flex items-center justify-between text-sm">
            <span className="text-gray-600 truncate">{key}</span>
            <span className="text-gray-900 font-medium">{value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <ChartBarIcon className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Search Results Summary</h3>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-5 w-5 text-blue-500 mr-2" />
              <h4 className="text-sm font-medium text-blue-900">Total Advisors</h4>
            </div>
            <p className="mt-2 text-2xl font-semibold text-blue-900">
              {summary.totalAdvisors}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <StarIcon className="h-5 w-5 text-blue-500 mr-2" />
              <h4 className="text-sm font-medium text-blue-900">Average Rating</h4>
            </div>
            <p className="mt-2 text-2xl font-semibold text-blue-900">
              {summary.averageRating.toFixed(1)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <StarIcon className="h-5 w-5 text-blue-500 mr-2" />
              <h4 className="text-sm font-medium text-blue-900">Total Reviews</h4>
            </div>
            <p className="mt-2 text-2xl font-semibold text-blue-900">
              {summary.totalReviews}
            </p>
          </div>
        </div>

        {/* Distributions */}
        <div className="grid grid-cols-2 gap-6">
          {/* Location Distribution */}
          <div>
            <div className="flex items-center mb-3">
              <MapPinIcon className="h-5 w-5 text-blue-500 mr-2" />
              <h4 className="text-sm font-medium text-gray-900">Top Locations</h4>
            </div>
            {renderDistribution(summary.locationDistribution)}
          </div>

          {/* Specialization Distribution */}
          <div>
            <div className="flex items-center mb-3">
              <BuildingOfficeIcon className="h-5 w-5 text-blue-500 mr-2" />
              <h4 className="text-sm font-medium text-gray-900">Top Specializations</h4>
            </div>
            {renderDistribution(summary.specializationDistribution)}
          </div>

          {/* Certification Distribution */}
          <div>
            <div className="flex items-center mb-3">
              <AcademicCapIcon className="h-5 w-5 text-blue-500 mr-2" />
              <h4 className="text-sm font-medium text-gray-900">Top Certifications</h4>
            </div>
            {renderDistribution(summary.certificationDistribution)}
          </div>

          {/* Fee Structure Distribution */}
          <div>
            <div className="flex items-center mb-3">
              <CurrencyDollarIcon className="h-5 w-5 text-blue-500 mr-2" />
              <h4 className="text-sm font-medium text-gray-900">Fee Structures</h4>
            </div>
            {renderDistribution(summary.feeStructureDistribution)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsSummary; 