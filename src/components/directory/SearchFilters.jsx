import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon, MapPinIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { getCurrentLocation } from '../../services/geolocationService';

const specializations = [
  'Retirement Planning',
  'Investment Management',
  'Estate Planning',
  'Tax Planning',
  'Insurance Planning',
  'Education Planning',
  'Debt Management',
  'Wealth Management',
];

const certifications = [
  'CFP',
  'CFA',
  'ChFC',
  'CLU',
  'CPA',
  'PFS',
  'AAMS',
  'CRPC',
];

export const SearchFilters = ({ onSearch }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [locationInput, setLocationInput] = useState(searchParams.get('location') || '');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    radius: searchParams.get('radius') || '25',
    minRating: searchParams.get('minRating') || '0',
    specializations: searchParams.get('specializations')?.split(',') || [],
    certifications: searchParams.get('certifications')?.split(',') || [],
    verifiedOnly: searchParams.get('verifiedOnly') === 'true',
    feeOnly: searchParams.get('feeOnly') === 'true',
  });

  const handleGetCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      setLocationError(null);
      const location = await getCurrentLocation();
      
      // Use reverse geocoding to get a human-readable address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        const address = data.display_name.split(',').slice(0, 2).join(','); // Get city and state
        setLocationInput(address);
        setFilters(prev => ({ ...prev, location: address }));
      }
    } catch (err) {
      console.error('Error getting location:', err);
      setLocationError('Unable to get your location. Please enter it manually.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    // Only add non-empty parameters
    if (filters.query) params.set('q', filters.query);
    if (filters.location) params.set('location', filters.location);
    if (filters.radius !== '25') params.set('radius', filters.radius);
    if (filters.minRating !== '0') params.set('minRating', filters.minRating);
    if (filters.specializations.length > 0) params.set('specializations', filters.specializations.join(','));
    if (filters.certifications.length > 0) params.set('certifications', filters.certifications.join(','));
    if (filters.verifiedOnly) params.set('verifiedOnly', 'true');
    if (filters.feeOnly) params.set('feeOnly', 'true');

    navigate(`/directory?${params.toString()}`);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleMultiSelect = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value],
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      location: '',
      radius: '25',
      minRating: '0',
      specializations: [],
      certifications: [],
      verifiedOnly: false,
      feeOnly: false,
    });
    setLocationInput('');
    navigate('/directory');
  };

  const hasActiveFilters = () => {
    return filters.query || filters.location || filters.minRating !== '0' || 
           filters.specializations.length > 0 || filters.certifications.length > 0 ||
           filters.verifiedOnly || filters.feeOnly;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <form onSubmit={handleSubmit}>
        {/* Primary Search Fields - Always Visible */}
        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Search Query - Full Width on Mobile */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Advisors
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  className="block w-full h-12 pl-4 pr-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base placeholder-gray-400"
                  placeholder="Name, company, or expertise..."
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Location and Distance - Stacked on Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="location"
                    value={locationInput}
                    onChange={(e) => {
                      setLocationInput(e.target.value);
                      handleFilterChange('location', e.target.value);
                    }}
                    className="block w-full h-12 pl-4 pr-14 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base placeholder-gray-400"
                    placeholder="City, state, or zip"
                  />
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isGettingLocation}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none"
                  >
                    <div className="p-2 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center">
                      {isGettingLocation ? (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                      ) : (
                        <MapPinIcon className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </button>
                </div>
                {locationError && (
                  <p className="mt-2 text-sm text-red-600">{locationError}</p>
                )}
              </div>

              {/* Distance */}
              <div>
                <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-2">
                  Distance
                </label>
                <select
                  id="radius"
                  value={filters.radius}
                  onChange={(e) => handleFilterChange('radius', e.target.value)}
                  className="block w-full h-12 pl-4 pr-10 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base bg-white"
                >
                  <option value="10">Within 10 miles</option>
                  <option value="25">Within 25 miles</option>
                  <option value="50">Within 50 miles</option>
                  <option value="100">Within 100 miles</option>
                </select>
              </div>
            </div>

            {/* Quick Filters - Stacked on Mobile */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-3 sm:space-y-0">
                <div className="flex items-center min-h-[44px]">
                  <input
                    type="checkbox"
                    id="verifiedOnly"
                    checked={filters.verifiedOnly}
                    onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="verifiedOnly" className="ml-3 text-sm font-medium text-gray-700">
                    Verified Advisors Only
                  </label>
                </div>
                <div className="flex items-center min-h-[44px]">
                  <input
                    type="checkbox"
                    id="feeOnly"
                    checked={filters.feeOnly}
                    onChange={(e) => handleFilterChange('feeOnly', e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="feeOnly" className="ml-3 text-sm font-medium text-gray-700">
                    Fee-Only Advisors
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="flex items-center justify-between w-full text-left min-h-[44px] px-4 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="text-sm font-medium text-gray-700">
                Advanced Filters
                {hasActiveFilters() && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Active
                  </span>
                )}
              </span>
              {isAdvancedOpen ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {isAdvancedOpen && (
          <div className="px-4 sm:px-6 pb-6 border-t border-gray-100">
            <div className="space-y-6 pt-6">
              {/* Rating Filter */}
              <div>
                <label htmlFor="minRating" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  id="minRating"
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="block w-full h-12 pl-4 pr-10 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base bg-white"
                >
                  <option value="0">Any Rating</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              {/* Specializations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Specializations
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                  {specializations.map((spec) => (
                    <div key={spec} className="flex items-center min-h-[44px]">
                      <input
                        type="checkbox"
                        id={`spec-${spec}`}
                        checked={filters.specializations.includes(spec)}
                        onChange={() => handleMultiSelect('specializations', spec)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`spec-${spec}`} className="ml-3 text-sm text-gray-700">
                        {spec}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Certifications
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {certifications.map((cert) => (
                    <div key={cert} className="flex items-center min-h-[44px]">
                      <input
                        type="checkbox"
                        id={`cert-${cert}`}
                        checked={filters.certifications.includes(cert)}
                        onChange={() => handleMultiSelect('certifications', cert)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`cert-${cert}`} className="ml-3 text-sm text-gray-700">
                        {cert}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 rounded-b-lg flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
            Search Advisors
          </button>
          
          {hasActiveFilters() && (
            <button
              type="button"
              onClick={clearFilters}
              className="sm:w-auto bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border border-gray-300 transition-colors min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <XMarkIcon className="h-5 w-5 mr-2" />
              Clear Filters
            </button>
          )}
        </div>
      </form>
    </div>
  );
}; 