import { useState } from 'react';
import { XMarkIcon, StarIcon, MapPinIcon, BuildingOfficeIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import StarRating from '../common/StarRating';

const MAX_COMPARISON = 3;

export const AdvisorComparison = ({ advisors, onRemoveAdvisor }) => {
  const [expandedSections, setExpandedSections] = useState(new Set(['overview']));

  const toggleSection = (section) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  if (advisors.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Compare Advisors ({advisors.length}/{MAX_COMPARISON})
          </h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setExpandedSections(prev => 
                prev.size === Object.keys(sections).length 
                  ? new Set(['overview'])
                  : new Set(Object.keys(sections))
              )}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {expandedSections.size === Object.keys(sections).length ? 'Collapse All' : 'Expand All'}
            </button>
            <Link
              to="/compare"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              View Full Comparison
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advisors.map((advisor) => (
            <div key={advisor.id} className="relative bg-white rounded-lg border border-gray-200 p-4">
              <button
                onClick={() => onRemoveAdvisor(advisor.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                    {advisor.imageUrl ? (
                      <img
                        src={advisor.imageUrl}
                        alt={advisor.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <BuildingOfficeIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/advisor/${advisor.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate"
                    >
                      {advisor.name}
                    </Link>
                    {advisor.verified && (
                      <CheckBadgeIcon className="h-4 w-4 text-blue-500" />
                    )}
                  </div>

                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <BuildingOfficeIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    <span className="truncate">{advisor.company}</span>
                  </div>

                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <MapPinIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    <span className="truncate">{advisor.location}</span>
                  </div>

                  <div className="mt-2 flex items-center">
                    <div className="flex items-center">
                      <StarRating rating={advisor.averageRating} size={5} />
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      ({advisor.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Comparison Sections */}
              <div className="mt-4 space-y-2">
                {Object.entries(sections).map(([key, { title, getValue }]) => (
                  <div key={key} className="border-t border-gray-100 pt-2">
                    <button
                      onClick={() => toggleSection(key)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <span className="text-sm font-medium text-gray-900">{title}</span>
                      <svg
                        className={`h-5 w-5 text-gray-400 transform transition-transform ${
                          expandedSections.has(key) ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedSections.has(key) && (
                      <div className="mt-2 text-sm text-gray-600">
                        {getValue(advisor)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const sections = {
  overview: {
    title: 'Overview',
    getValue: (advisor) => advisor.bio || 'No overview available.'
  },
  specializations: {
    title: 'Specializations',
    getValue: (advisor) => (
      <div className="flex flex-wrap gap-1">
        {advisor.specializations?.map((spec, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
          >
            {spec}
          </span>
        ))}
      </div>
    )
  },
  certifications: {
    title: 'Certifications',
    getValue: (advisor) => (
      <div className="flex flex-wrap gap-1">
        {advisor.certifications?.map((cert, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
          >
            {cert}
          </span>
        ))}
      </div>
    )
  },
  services: {
    title: 'Services',
    getValue: (advisor) => (
      <ul className="list-disc list-inside space-y-1">
        {advisor.services?.map((service, index) => (
          <li key={index} className="text-gray-600">{service}</li>
        ))}
      </ul>
    )
  },
  fees: {
    title: 'Fee Structure',
    getValue: (advisor) => (
      <div className="space-y-1">
        {advisor.feeOnly && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
            Fee-Only Advisor
          </span>
        )}
        <p className="text-gray-600">{advisor.feeStructure || 'Fee structure not specified.'}</p>
      </div>
    )
  }
}; 