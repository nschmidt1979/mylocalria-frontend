import { XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate, useSearchParams } from 'react-router-dom';

const FilterTags = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const getActiveFilters = () => {
    const filters = [];
    const query = searchParams.get('q');
    const location = searchParams.get('location');
    const radius = searchParams.get('radius');
    const minRating = searchParams.get('minRating');
    const specializations = searchParams.get('specializations')?.split(',');
    const certifications = searchParams.get('certifications')?.split(',');
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const feeOnly = searchParams.get('feeOnly') === 'true';

    if (query) {
      filters.push({
        key: 'q',
        label: `Search: ${query}`,
        value: query,
      });
    }

    if (location) {
      filters.push({
        key: 'location',
        label: `Location: ${location}`,
        value: location,
        sublabel: radius ? `within ${radius} miles` : null,
      });
    }

    if (minRating) {
      filters.push({
        key: 'minRating',
        label: `Rating: ${minRating}+ stars`,
        value: minRating,
      });
    }

    if (specializations?.length) {
      specializations.forEach(spec => {
        filters.push({
          key: 'specializations',
          label: `Specialization: ${spec}`,
          value: spec,
        });
      });
    }

    if (certifications?.length) {
      certifications.forEach(cert => {
        filters.push({
          key: 'certifications',
          label: `Certification: ${cert}`,
          value: cert,
        });
      });
    }

    if (verifiedOnly) {
      filters.push({
        key: 'verifiedOnly',
        label: 'Verified Only',
        value: 'true',
      });
    }

    if (feeOnly) {
      filters.push({
        key: 'feeOnly',
        label: 'Fee-Only',
        value: 'true',
      });
    }

    return filters;
  };

  const removeFilter = (filter) => {
    const newParams = new URLSearchParams(searchParams);

    if (filter.key === 'specializations' || filter.key === 'certifications') {
      // Handle array parameters
      const currentValues = newParams.get(filter.key)?.split(',') || [];
      const newValues = currentValues.filter(v => v !== filter.value);
      
      if (newValues.length > 0) {
        newParams.set(filter.key, newValues.join(','));
      } else {
        newParams.delete(filter.key);
      }
    } else {
      // Handle single value parameters
      newParams.delete(filter.key);
    }

    navigate(`/directory?${newParams.toString()}`);
  };

  const clearAllFilters = () => {
    navigate('/directory');
  };

  const activeFilters = getActiveFilters();

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Active Filters</h3>
        <button
          onClick={clearAllFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter) => (
          <div
            key={`${filter.key}-${filter.value}`}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
          >
            <span>{filter.label}</span>
            {filter.sublabel && (
              <span className="ml-1 text-blue-500">({filter.sublabel})</span>
            )}
            <button
              onClick={() => removeFilter(filter)}
              className="ml-2 p-0.5 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterTags; 