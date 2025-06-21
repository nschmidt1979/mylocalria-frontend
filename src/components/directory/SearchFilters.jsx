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

export const SearchFilters = ({ onSearch }) => {
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
    setLocationInput('');
    navigate('/directory');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <form onSubmit={handleSubmit} role="search" aria-label="Search for financial advisors">
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
                name="search"
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                className="block w-full rounded-md border-gray-300 pl-3 pr-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Name, company, or expertise"
                aria-describedby="search-help"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <p id="search-help" className="sr-only">
                Search by advisor name, company name, or area of expertise
              </p>
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
                name="location"
                value={locationInput}
                onChange={(e) => {
                  setLocationInput(e.target.value);
                  handleFilterChange('location', e.target.value);
                }}
                className="block w-full rounded-md border-gray-300 pl-3 pr-20 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="City, state, or zip code"
                aria-describedby={locationError ? "location-error" : "location-help"}
                aria-invalid={locationError ? "true" : "false"}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isGettingLocation}
                  aria-label="Use my current location"
                  className="inline-flex items-center px-2 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGettingLocation ? (
                    <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" aria-hidden="true" />
                  ) : (
                    <MapPinIcon className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p id="location-help" className="sr-only">
                Enter a city, state, or zip code to find advisors near you
              </p>
            </div>
            {locationError && (
              <p id="location-error" className="mt-1 text-sm text-red-600" role="alert">
                {locationError}
              </p>
            )}
          </div>

          {/* Radius */}
          <div>
            <label htmlFor="radius" className="block text-sm font-medium text-gray-700">
              Distance
            </label>
            <select
              id="radius"
              name="radius"
              value={filters.radius}
              onChange={(e) => handleFilterChange('radius', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              aria-describedby="radius-help"
            >
              <option value="10">Within 10 miles</option>
              <option value="25">Within 25 miles</option>
              <option value="50">Within 50 miles</option>
              <option value="100">Within 100 miles</option>
            </select>
            <p id="radius-help" className="sr-only">
              Select the maximum distance from your location
            </p>
          </div>

          {/* Minimum Rating */}
          <div>
            <label htmlFor="minRating" className="block text-sm font-medium text-gray-700">
              Minimum Rating
            </label>
            <select
              id="minRating"
              name="minRating"
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              aria-describedby="rating-help"
            >
              <option value="0">Any Rating</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
            <p id="rating-help" className="sr-only">
              Filter advisors by minimum star rating
            </p>
          </div>

          {/* Specializations */}
          <div>
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">
                Specializations
              </legend>
              <div className="mt-1 max-h-32 overflow-y-auto" role="group" aria-labelledby="specializations-legend">
                {specializations.map((spec) => (
                  <div key={spec} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`spec-${spec.replace(/\s+/g, '-').toLowerCase()}`}
                      name="specializations"
                      value={spec}
                      checked={filters.specializations.includes(spec)}
                      onChange={() => handleMultiSelect('specializations', spec)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      aria-describedby={`spec-${spec.replace(/\s+/g, '-').toLowerCase()}-desc`}
                    />
                    <label htmlFor={`spec-${spec.replace(/\s+/g, '-').toLowerCase()}`} className="ml-2 text-sm text-gray-700">
                      {spec}
                    </label>
                    <span id={`spec-${spec.replace(/\s+/g, '-').toLowerCase()}-desc`} className="sr-only">
                      Filter advisors who specialize in {spec}
                    </span>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Certifications */}
          <div>
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">
                Certifications
              </legend>
              <div className="mt-1 max-h-32 overflow-y-auto" role="group" aria-labelledby="certifications-legend">
                {certifications.map((cert) => (
                  <div key={cert} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`cert-${cert.toLowerCase()}`}
                      name="certifications"
                      value={cert}
                      checked={filters.certifications.includes(cert)}
                      onChange={() => handleMultiSelect('certifications', cert)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      aria-describedby={`cert-${cert.toLowerCase()}-desc`}
                    />
                    <label htmlFor={`cert-${cert.toLowerCase()}`} className="ml-2 text-sm text-gray-700">
                      {cert}
                    </label>
                    <span id={`cert-${cert.toLowerCase()}-desc`} className="sr-only">
                      Filter advisors with {cert} certification
                    </span>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Additional Options */}
          <div className="sm:col-span-2">
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">
                Additional Filters
              </legend>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="verifiedOnly"
                    name="verifiedOnly"
                    checked={filters.verifiedOnly}
                    onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-describedby="verified-desc"
                  />
                  <label htmlFor="verifiedOnly" className="ml-2 text-sm text-gray-700">
                    Verified Advisors Only
                  </label>
                  <span id="verified-desc" className="sr-only">
                    Show only advisors who have been verified by our platform
                  </span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="feeOnly"
                    name="feeOnly"
                    checked={filters.feeOnly}
                    onChange={(e) => handleFilterChange('feeOnly', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-describedby="fee-desc"
                  />
                  <label htmlFor="feeOnly" className="ml-2 text-sm text-gray-700">
                    Fee-Only Advisors
                  </label>
                  <span id="fee-desc" className="sr-only">
                    Show only fee-only advisors who don't earn commissions
                  </span>
                </div>
              </div>
            </fieldset>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-between items-center">
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <XMarkIcon className="h-4 w-4 mr-1" aria-hidden="true" />
            Clear Filters
          </button>
          
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <MagnifyingGlassIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            Search Advisors
          </button>
        </div>
      </form>
    </div>
  );
}; 