import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, MapPinIcon, BuildingOfficeIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { db } from '../../../../config/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

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
        const queryLower = searchQuery.toLowerCase();

        // Fetch matching advisors
        const advisorsQuery = query(
          collection(db, 'state_adv_part_1_data'),
          where('name', '>=', queryLower),
          where('name', '<=', queryLower + '\uf8ff'),
          limit(3)
        );

        // Fetch matching locations
        const locationsQuery = query(
          collection(db, 'locations'),
          where('name', '>=', queryLower),
          where('name', '<=', queryLower + '\uf8ff'),
          limit(3)
        );

        // Fetch matching specializations
        const specializationsQuery = query(
          collection(db, 'specializations'),
          where('name', '>=', queryLower),
          where('name', '<=', queryLower + '\uf8ff'),
          limit(3)
        );

        const [advisorsSnapshot, locationsSnapshot, specializationsSnapshot] = await Promise.all([
          getDocs(advisorsQuery),
          getDocs(locationsQuery),
          getDocs(specializationsQuery),
        ]);

        const advisors = advisorsSnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'advisor',
          name: doc.data().name,
          company: doc.data().company,
          location: doc.data().location,
        }));

        const locations = locationsSnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'location',
          name: doc.data().name,
          state: doc.data().state,
        }));

        const specializations = specializationsSnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'specialization',
          name: doc.data().name,
          description: doc.data().description,
        }));

        // Combine and sort suggestions
        const allSuggestions = [
          ...advisors.map(a => ({ ...a, relevance: 3 })), // Highest relevance
          ...locations.map(l => ({ ...l, relevance: 2 })), // Medium relevance
          ...specializations.map(s => ({ ...s, relevance: 1 })), // Lower relevance
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