import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, MapPinIcon, BuildingOfficeIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { db } from '../../firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { getSearchSuggestionsOptimized } from '../../services/firebaseOptimizationService';

const SearchSuggestions = ({ searchQuery, onSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchTimeout = useRef(null);
  const MIN_QUERY_LENGTH = 2;

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery || searchQuery.length < MIN_QUERY_LENGTH) {
        setSuggestions([]);
        return;
      }

      try {
        setLoading(true);

        // Use optimized search suggestions with client-side filtering
        const suggestionsData = await getSearchSuggestionsOptimized(searchQuery);

        // Convert to the expected format
        const allSuggestions = [
          ...suggestionsData.advisors.map(name => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            type: 'advisor',
            name,
            relevance: 3
          })),
          ...suggestionsData.locations.map(name => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            type: 'location',
            name,
            relevance: 2
          })),
          ...suggestionsData.specializations.map(name => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            type: 'specialization',
            name,
            relevance: 1
          }))
        ].sort((a, b) => b.relevance - a.relevance);

        setSuggestions(allSuggestions);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(fetchSuggestions, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const handleSuggestionClick = (suggestion) => {
    setShowSuggestions(false);
    onSelect(suggestion);

    // Navigate based on suggestion type
    switch (suggestion.type) {
      case 'advisor':
        navigate(`/advisor/${suggestion.id}`);
        break;
      case 'location':
        navigate(`/directory?location=${encodeURIComponent(suggestion.name)}`);
        break;
      case 'specialization':
        navigate(`/directory?specializations=${encodeURIComponent(suggestion.name)}`);
        break;
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'advisor':
        return <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />;
      case 'location':
        return <MapPinIcon className="h-5 w-5 text-green-500" />;
      case 'specialization':
        return <AcademicCapIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  if (!showSuggestions || !searchQuery || searchQuery.length < MIN_QUERY_LENGTH) {
    return null;
  }

  return (
    <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
      <div className="py-2">
        {loading ? (
          <div className="px-4 py-2 text-sm text-gray-500">Loading suggestions...</div>
        ) : suggestions.length > 0 ? (
          <ul className="max-h-60 overflow-auto">
            {suggestions.map((suggestion) => (
              <li
                key={`${suggestion.type}-${suggestion.id}`}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center">
                  {getSuggestionIcon(suggestion.type)}
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {suggestion.name}
                    </div>
                    {suggestion.type === 'advisor' && (
                      <div className="text-xs text-gray-500">
                        {suggestion.company} • {suggestion.location}
                      </div>
                    )}
                    {suggestion.type === 'location' && (
                      <div className="text-xs text-gray-500">
                        {suggestion.state}
                      </div>
                    )}
                    {suggestion.type === 'specialization' && (
                      <div className="text-xs text-gray-500">
                        {suggestion.description}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-2 text-sm text-gray-500">No suggestions found</div>
        )}
      </div>
    </div>
  );
};

export default SearchSuggestions; 