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

// Professional designations for rep_professional_designations field
const professionalDesignations = [
  'CFA',
  'CFP',
  'ChFC',
  'CLU',
  'CPA',
  'PFS',
  'AAMS',
  'CRPC',
  'CIMA',
  'CPWA',
  'RMA',
  'FRM',
  'CEBS',
  'AEP',
  'CAP',
  'CWS'
];

// Common custodians for filtering
const custodianOptions = [
  'Charles Schwab',
  'Fidelity',
  'TD Ameritrade',
  'E*TRADE',
  'Interactive Brokers',
  'Vanguard',
  'Pershing',
  'LPL Financial',
  'Raymond James',
  'Ameriprise'
];

// Common fee structures
const feeStructures = [
  'Assets Under Management (AUM)',
  'Hourly',
  'Project-Based',
  'Retainer',
  'Commission',
  'Hybrid'
];

// WA Cities for principal_office_city filter
const waCities = [
  'Seattle',
  'Spokane',
  'Tacoma',
  'Vancouver',
  'Bellevue',
  'Kent',
  'Everett',
  'Renton',
  'Yakima',
  'Federal Way',
  'Spokane Valley',
  'Bellingham',
  'Kennewick',
  'Auburn',
  'Pasco',
  'Marysville',
  'Lakewood',
  'Redmond',
  'Shoreline',
  'Richland'
];

export const SearchFilters = ({ onSearch, onFilterError }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [locationInput, setLocationInput] = useState(searchParams.get('location') || '');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [filterErrors, setFilterErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    radius: searchParams.get('radius') || '25',
    minRating: searchParams.get('minRating') || '0',
    specializations: searchParams.get('specializations')?.split(',') || [],
    certifications: searchParams.get('certifications')?.split(',') || [],
    verifiedOnly: searchParams.get('verifiedOnly') === 'true',
    feeOnly: searchParams.get('feeOnly') === 'true',
    // New filters for the test scope
    assetsUnderManagement: searchParams.get('assetsUnderManagement') || '',
    principalOfficeCity: searchParams.get('principalOfficeCity') || '',
    accountMinimum: searchParams.get('accountMinimum') || '',
    custodians: searchParams.get('custodians')?.split(',') || [],
    discretionaryAuthority: searchParams.get('discretionaryAuthority') || '',
    fees: searchParams.get('fees')?.split(',') || [],
    performanceFees: searchParams.get('performanceFees') === 'true',
    professionalDesignations: searchParams.get('professionalDesignations')?.split(',') || [],
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFilterErrors({});

    try {
      // Import validation service dynamically to avoid circular dependencies
      const { filterValidationService } = await import('../../services/filterValidationService');
      
      // Validate filters before submitting
      const validation = filterValidationService.validateFilters(filters);
      
      if (!validation.isValid) {
        const errors = {};
        validation.errors.forEach(error => {
          errors[error.field] = error.message;
        });
        setFilterErrors(errors);
        
        if (onFilterError) {
          onFilterError(validation.errors);
        }
        
        setIsSubmitting(false);
        return;
      }

      // Check query complexity
      const complexityCheck = filterValidationService.validateQueryComplexity(filters);
      if (!complexityCheck.isValid) {
        setFilterErrors({
          general: 'Your search is too complex. Please reduce the number of active filters and try again.'
        });
        setIsSubmitting(false);
        return;
      }

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
      
      // New filter parameters
      if (filters.assetsUnderManagement) params.set('assetsUnderManagement', filters.assetsUnderManagement);
      if (filters.principalOfficeCity) params.set('principalOfficeCity', filters.principalOfficeCity);
      if (filters.accountMinimum) params.set('accountMinimum', filters.accountMinimum);
      if (filters.custodians.length > 0) params.set('custodians', filters.custodians.join(','));
      if (filters.discretionaryAuthority) params.set('discretionaryAuthority', filters.discretionaryAuthority);
      if (filters.fees.length > 0) params.set('fees', filters.fees.join(','));
      if (filters.performanceFees) params.set('performanceFees', 'true');
      if (filters.professionalDesignations.length > 0) params.set('professionalDesignations', filters.professionalDesignations.join(','));

      navigate(`/directory?${params.toString()}`);
    } catch (error) {
      console.error('Error validating filters:', error);
      setFilterErrors({
        general: 'An error occurred while processing your search. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
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
      assetsUnderManagement: '',
      principalOfficeCity: '',
      accountMinimum: '',
      custodians: [],
      discretionaryAuthority: '',
      fees: [],
      performanceFees: false,
      professionalDesignations: [],
    });
    setLocationInput('');
    navigate('/directory');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* Error Display */}
      {Object.keys(filterErrors).length > 0 && (
        <div id="filter-errors" className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md" role="alert">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Please correct the following errors:
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(filterErrors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
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

          {/* Principal Office City - NEW FILTER */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Principal Office City</label>
            <select
              value={filters.principalOfficeCity}
              onChange={(e) => handleFilterChange('principalOfficeCity', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Any City</option>
              {waCities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Assets Under Management - NEW FILTER */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Assets Under Management</label>
            <select
              value={filters.assetsUnderManagement}
              onChange={(e) => handleFilterChange('assetsUnderManagement', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Any Amount</option>
              <option value="0-10000000">Under $10M</option>
              <option value="10000000-50000000">$10M - $50M</option>
              <option value="50000000-100000000">$50M - $100M</option>
              <option value="100000000-500000000">$100M - $500M</option>
              <option value="500000000-1000000000">$500M - $1B</option>
              <option value="1000000000+">Over $1B</option>
            </select>
          </div>

          {/* Account Minimum - NEW FILTER */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Minimum</label>
            <select
              value={filters.accountMinimum}
              onChange={(e) => handleFilterChange('accountMinimum', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Any Minimum</option>
              <option value="0-25000">Under $25K</option>
              <option value="25000-100000">$25K - $100K</option>
              <option value="100000-250000">$100K - $250K</option>
              <option value="250000-500000">$250K - $500K</option>
              <option value="500000-1000000">$500K - $1M</option>
              <option value="1000000+">Over $1M</option>
            </select>
          </div>

          {/* Discretionary Authority - NEW FILTER */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Discretionary Authority</label>
            <select
              value={filters.discretionaryAuthority}
              onChange={(e) => handleFilterChange('discretionaryAuthority', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Any Authority Type</option>
              <option value="true">Discretionary</option>
              <option value="false">Non-Discretionary</option>
              <option value="both">Both</option>
            </select>
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

          {/* Custodians - NEW FILTER */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Custodians</label>
            <div className="mt-1 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {custodianOptions.map((custodian) => (
                <div key={custodian} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`custodian-${custodian}`}
                    checked={filters.custodians.includes(custodian)}
                    onChange={() => handleMultiSelect('custodians', custodian)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`custodian-${custodian}`} className="ml-2 text-sm text-gray-700">
                    {custodian}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Fee Structures - NEW FILTER */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Fee Structure</label>
            <div className="mt-1 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {feeStructures.map((fee) => (
                <div key={fee} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`fee-${fee}`}
                    checked={filters.fees.includes(fee)}
                    onChange={() => handleMultiSelect('fees', fee)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`fee-${fee}`} className="ml-2 text-sm text-gray-700">
                    {fee}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Professional Designations - NEW FILTER */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Professional Designations</label>
            <div className="mt-1 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {professionalDesignations.map((designation) => (
                <div key={designation} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`designation-${designation}`}
                    checked={filters.professionalDesignations.includes(designation)}
                    onChange={() => handleMultiSelect('professionalDesignations', designation)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`designation-${designation}`} className="ml-2 text-sm text-gray-700">
                    {designation}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Specializations</label>
            <div className="mt-1 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
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
            <div className="mt-1 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
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
            <div className="flex flex-wrap items-center gap-4">
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
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="performanceFees"
                  checked={filters.performanceFees}
                  onChange={(e) => handleFilterChange('performanceFees', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="performanceFees" className="ml-2 text-sm text-gray-700">
                  Performance Fees
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <XMarkIcon className="h-4 w-4 mr-2" />
            Clear All Filters
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-describedby={Object.keys(filterErrors).length > 0 ? "filter-errors" : undefined}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                Apply Filters
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}; 