import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FireIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const PopularSearches = () => {
  const [popularSearches, setPopularSearches] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopularSearches = async () => {
      try {
        setLoading(true);

        // Fetch popular searches from Firestore
        const searchesQuery = query(
          collection(db, 'state_adv_part_1_data'),
          orderBy('count', 'desc'),
          limit(5)
        );

        const snapshot = await getDocs(searchesQuery);
        const searches = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Group searches by type (location, specialization, etc.)
        const locations = searches.filter(s => s.type === 'location');
        const specializations = searches.filter(s => s.type === 'specialization');
        const certifications = searches.filter(s => s.type === 'certification');

        setPopularSearches({
          locations: locations.slice(0, 3),
          specializations: specializations.slice(0, 3),
          certifications: certifications.slice(0, 3),
        });

        // Generate trending topics based on recent searches
        const trending = [
          { type: 'specialization', value: 'Retirement Planning', count: 156 },
          { type: 'specialization', value: 'Estate Planning', count: 142 },
          { type: 'certification', value: 'CFP', count: 138 },
          { type: 'location', value: 'New York, NY', count: 125 },
          { type: 'specialization', value: 'Tax Planning', count: 118 },
        ];

        setTrendingTopics(trending);
      } catch (err) {
        console.error('Error fetching popular searches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularSearches();
  }, []);

  const handleSearchClick = (type, value) => {
    const params = new URLSearchParams();
    
    switch (type) {
      case 'location':
        params.set('location', value);
        break;
      case 'specialization':
        params.set('specializations', value);
        break;
      case 'certification':
        params.set('certifications', value);
        break;
    }

    navigate(`/directory?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-4 mb-8 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Popular Searches */}
        <div>
          <div className="flex items-center mb-4">
            <FireIcon className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Popular Searches</h2>
          </div>
          <div className="space-y-4">
            {popularSearches.locations.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Locations</h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.locations.map((search) => (
                    <button
                      key={search.id}
                      onClick={() => handleSearchClick('location', search.value)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {search.value}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {popularSearches.specializations.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.specializations.map((search) => (
                    <button
                      key={search.id}
                      onClick={() => handleSearchClick('specialization', search.value)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {search.value}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {popularSearches.certifications.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.certifications.map((search) => (
                    <button
                      key={search.id}
                      onClick={() => handleSearchClick('certification', search.value)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {search.value}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trending Topics */}
        <div>
          <div className="flex items-center mb-4">
            <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Trending Topics</h2>
          </div>
          <div className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <button
                key={index}
                onClick={() => handleSearchClick(topic.type, topic.value)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-700">{topic.value}</span>
                <span className="text-xs text-gray-500">{topic.count} searches</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularSearches; 