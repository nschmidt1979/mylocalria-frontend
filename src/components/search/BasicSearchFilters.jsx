import { useState } from 'react';
import PropTypes from 'prop-types';

const BasicSearchFilters = ({ onFilterChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    location: initialFilters.location || '',
    minRating: initialFilters.minRating || 0,
    accountMinimum: initialFilters.accountMinimum || '',
    services: initialFilters.services || [],
    ...initialFilters
  });

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleServiceToggle = (service) => {
    const currentServices = filters.services || [];
    const newServices = currentServices.includes(service)
      ? currentServices.filter(s => s !== service)
      : [...currentServices, service];
    
    handleChange('services', newServices);
  };

  const serviceOptions = [
    { id: 'financial_planning', label: 'Financial Planning' },
    { id: 'investment_management', label: 'Investment Management' },
    { id: 'retirement_planning', label: 'Retirement Planning' },
    { id: 'estate_planning', label: 'Estate Planning' },
    { id: 'tax_planning', label: 'Tax Planning' }
  ];

  const accountMinimumOptions = [
    { value: '', label: 'Any' },
    { value: '0', label: 'No Minimum' },
    { value: '10000', label: '$10,000+' },
    { value: '50000', label: '$50,000+' },
    { value: '100000', label: '$100,000+' },
    { value: '500000', label: '$500,000+' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          type="text"
          id="location"
          value={filters.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="City, State, or ZIP"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Minimum Rating
        </label>
        <div className="mt-2 flex items-center space-x-4">
          {[0, 3, 3.5, 4, 4.5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleChange('minRating', rating)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filters.minRating === rating
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {rating === 0 ? 'Any' : `${rating}+`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="accountMinimum" className="block text-sm font-medium text-gray-700">
          Account Minimum
        </label>
        <select
          id="accountMinimum"
          value={filters.accountMinimum}
          onChange={(e) => handleChange('accountMinimum', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          {accountMinimumOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Services
        </label>
        <div className="space-y-2">
          {serviceOptions.map(service => (
            <label key={service.id} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.services.includes(service.id)}
                onChange={() => handleServiceToggle(service.id)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{service.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            const resetFilters = {
              location: '',
              minRating: 0,
              accountMinimum: '',
              services: []
            };
            setFilters(resetFilters);
            onFilterChange(resetFilters);
          }}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

BasicSearchFilters.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  initialFilters: PropTypes.shape({
    location: PropTypes.string,
    minRating: PropTypes.number,
    accountMinimum: PropTypes.string,
    services: PropTypes.arrayOf(PropTypes.string)
  })
};

export default BasicSearchFilters;