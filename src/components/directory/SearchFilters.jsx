import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
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

export const AdvancedSearchFilters = ({ onSearch }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
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
    navigate('/directory');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Query */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                id="search"
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                className="block w-full rounded-md border-gray-300 pl-3 pr-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Name, company, or expertise"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                id="location"
                value={locationInput}
                onChange={(e) => {
                  setLocationInput(e.target.value);
                  handleFilterChange('location', e.target.value);
                }}
                className="block w-full rounded-md border-gray-300 pl-3 pr-20 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="City, state, or zip code"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isGettingLocation}
                  className="inline-flex items-center px-2 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGettingLocation ? (
                    <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                  ) : (
                    <MapPinIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {locationError && (
              <p className="mt-1 text-sm text-red-600">{locationError}</p>
            )}
          </div>

          {/* Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Distance</label>
            <select
              value={filters.radius}
              onChange={(e) => handleFilterChange('radius', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="10">Within 10 miles</option>
              <option value="25">Within 25 miles</option>
              <option value="50">Within 50 miles</option>
              <option value="100">Within 100 miles</option>
            </select>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Minimum Rating</label>
            <select
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="0">Any Rating</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Specializations</label>
            <div className="mt-1 max-h-32 overflow-y-auto">
              {specializations.map((spec) => (
                <div key={spec} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`spec-${spec}`}
                    checked={filters.specializations.includes(spec)}
                    onChange={() => handleMultiSelect('specializations', spec)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`spec-${spec}`} className="ml-2 text-sm text-gray-700">
                    {spec}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Certifications</label>
            <div className="mt-1 max-h-32 overflow-y-auto">
              {certifications.map((cert) => (
                <div key={cert} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`cert-${cert}`}
                    checked={filters.certifications.includes(cert)}
                    onChange={() => handleMultiSelect('certifications', cert)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`cert-${cert}`} className="ml-2 text-sm text-gray-700">
                    {cert}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="sm:col-span-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verifiedOnly"
                  checked={filters.verifiedOnly}
                  onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="verifiedOnly" className="ml-2 text-sm text-gray-700">
                  Verified Advisors Only
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="feeOnly"
                  checked={filters.feeOnly}
                  onChange={(e) => handleFilterChange('feeOnly', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="feeOnly" className="ml-2 text-sm text-gray-700">
                  Fee-Only Advisors
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Clear Filters
          </button>
        </div>
      </form>
    </div>
  );
}; 