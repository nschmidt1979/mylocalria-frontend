import { useState, useEffect } from 'react';
import {
  LightBulbIcon,
  ArrowTrendingUpIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

const SearchRecommendations = ({ currentSearch, onApplyRecommendation }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentSearch) return;

    const generateRecommendations = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get current search context
        const { filters, advisors } = currentSearch;
        const currentSpecializations = filters.specializations || [];
        const currentLocation = filters.location;
        const currentCertifications = filters.certifications || [];
        const currentFeeStructure = filters.feeStructure;

        // Generate recommendations based on current search
        const newRecommendations = [];

        // 1. Location-based recommendations
        if (currentLocation) {
          // Find advisors in nearby locations
          const nearbyLocations = advisors
            .filter(a => a.location && a.location !== currentLocation)
            .map(a => a.location)
            .filter((loc, index, self) => self.indexOf(loc) === index)
            .slice(0, 3);

          nearbyLocations.forEach(location => {
            newRecommendations.push({
              id: `location-${location}`,
              type: 'location',
              title: `Advisors in ${location}`,
              description: `Find advisors in ${location} with similar qualifications`,
              filters: {
                ...filters,
                location,
              },
              icon: <MapPinIcon className="h-5 w-5 text-blue-500" />,
            });
          });
        }

        // 2. Specialization-based recommendations
        if (currentSpecializations.length > 0) {
          // Find related specializations
          const relatedSpecializations = advisors
            .flatMap(a => a.specializations || [])
            .filter(spec => !currentSpecializations.includes(spec))
            .filter((spec, index, self) => self.indexOf(spec) === index)
            .slice(0, 3);

          relatedSpecializations.forEach(specialization => {
            newRecommendations.push({
              id: `specialization-${specialization}`,
              type: 'specialization',
              title: `Advisors specializing in ${specialization}`,
              description: `Find advisors with expertise in ${specialization}`,
              filters: {
                ...filters,
                specializations: [...currentSpecializations, specialization],
              },
              icon: <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />,
            });
          });
        }

        // 3. Certification-based recommendations
        if (currentCertifications.length > 0) {
          // Find additional certifications
          const additionalCertifications = advisors
            .flatMap(a => a.certifications || [])
            .filter(cert => !currentCertifications.includes(cert))
            .filter((cert, index, self) => self.indexOf(cert) === index)
            .slice(0, 3);

          additionalCertifications.forEach(certification => {
            newRecommendations.push({
              id: `certification-${certification}`,
              type: 'certification',
              title: `Advisors with ${certification} certification`,
              description: `Find advisors holding the ${certification} certification`,
              filters: {
                ...filters,
                certifications: [...currentCertifications, certification],
              },
              icon: <AcademicCapIcon className="h-5 w-5 text-blue-500" />,
            });
          });
        }

        // 4. Fee structure recommendations
        if (currentFeeStructure) {
          const alternativeFeeStructures = ['Fee-Only', 'Fee-Based', 'Commission-Based']
            .filter(fee => fee !== currentFeeStructure);

          alternativeFeeStructures.forEach(feeStructure => {
            newRecommendations.push({
              id: `fee-${feeStructure}`,
              type: 'fee',
              title: `${feeStructure} advisors`,
              description: `Find advisors with ${feeStructure} fee structure`,
              filters: {
                ...filters,
                feeStructure,
              },
              icon: <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />,
            });
          });
        }

        // 5. Rating-based recommendations
        const avgRating = advisors.reduce((sum, a) => sum + (a.averageRating || 0), 0) / advisors.length;
        if (avgRating < 4.5) {
          newRecommendations.push({
            id: 'high-rated',
            type: 'rating',
            title: 'Highly rated advisors',
            description: 'Find advisors with 4.5+ star ratings',
            filters: {
              ...filters,
              minRating: 4.5,
            },
            icon: <StarIcon className="h-5 w-5 text-blue-500" />,
          });
        }

        // 6. Trending recommendations
        newRecommendations.push({
          id: 'trending',
          type: 'trending',
          title: 'Trending searches',
          description: 'Popular searches in your area',
          filters: {
            ...filters,
            sortBy: 'popularity',
          },
          icon: <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500" />,
        });

        setRecommendations(newRecommendations);
      } catch (err) {
        setError('Failed to generate recommendations');
        console.error('Recommendations error:', err);
      } finally {
        setLoading(false);
      }
    };

    generateRecommendations();
  }, [currentSearch]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-red-600">{error}</div>
      </div>
    );
  }

  if (!recommendations.length) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <LightBulbIcon className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Search Recommendations</h3>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map(recommendation => (
            <button
              key={recommendation.id}
              onClick={() => onApplyRecommendation(recommendation.filters)}
              className="flex items-start p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
            >
              <div className="flex-shrink-0 mt-1">
                {recommendation.icon}
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">
                  {recommendation.title}
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  {recommendation.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchRecommendations; 