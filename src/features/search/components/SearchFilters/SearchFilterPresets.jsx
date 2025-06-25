import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AdjustmentsHorizontalIcon,
  StarIcon,
  MapPinIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const SearchFilterPresets = ({ onApplyPreset }) => {
  const [expandedPreset, setExpandedPreset] = useState(null);
  const navigate = useNavigate();

  const presets = [
    {
      id: 'top-rated',
      name: 'Top Rated Advisors',
      description: 'Find advisors with the highest ratings and most reviews',
      icon: StarIcon,
      filters: {
        minRating: '4.5',
        minReviews: '10',
      },
    },
    {
      id: 'nearby',
      name: 'Nearby Advisors',
      description: 'Find advisors within 25 miles of your location',
      icon: MapPinIcon,
      filters: {
        radius: '25',
      },
    },
    {
      id: 'certified',
      name: 'Certified Professionals',
      description: 'Find advisors with CFP®, CFA, or CPA certifications',
      icon: AcademicCapIcon,
      filters: {
        certifications: 'CFP,CFA,CPA',
        verifiedOnly: 'true',
      },
    },
    {
      id: 'fee-only',
      name: 'Fee-Only Advisors',
      description: 'Find advisors who work on a fee-only basis',
      icon: CurrencyDollarIcon,
      filters: {
        feeOnly: 'true',
      },
    },
    {
      id: 'retirement',
      name: 'Retirement Specialists',
      description: 'Find advisors specializing in retirement planning',
      icon: BuildingOfficeIcon,
      filters: {
        specializations: 'Retirement Planning',
      },
    },
  ];

  const handleApplyPreset = (preset) => {
    const searchParams = new URLSearchParams();
    Object.entries(preset.filters).forEach(([key, value]) => {
      searchParams.set(key, value);
    });
    navigate(`/directory?${searchParams.toString()}`);
    onApplyPreset?.(preset.filters);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Quick Filters</h3>
        </div>
      </div>
      <div className="p-4 space-y-2">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="relative"
          >
            <button
              onClick={() => setExpandedPreset(expandedPreset === preset.id ? null : preset.id)}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex items-center">
                <preset.icon className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{preset.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{preset.description}</p>
                </div>
              </div>
            </button>

            {expandedPreset === preset.id && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-2">This preset will apply:</div>
                <ul className="space-y-1">
                  {Object.entries(preset.filters).map(([key, value]) => (
                    <li key={key} className="text-xs text-gray-600">
                      {key === 'minRating' && `${value}+ star rating`}
                      {key === 'minReviews' && `Minimum ${value} reviews`}
                      {key === 'radius' && `Within ${value} miles`}
                      {key === 'certifications' && `Certifications: ${value.split(',').join(', ')}`}
                      {key === 'verifiedOnly' && value === 'true' && 'Verified advisors only'}
                      {key === 'feeOnly' && value === 'true' && 'Fee-only advisors'}
                      {key === 'specializations' && `Specialization: ${value}`}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => handleApplyPreset(preset)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchFilterPresets; 