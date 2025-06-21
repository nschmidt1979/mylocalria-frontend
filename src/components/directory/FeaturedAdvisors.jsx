import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/solid';
import AdvisorCard from '../advisors/AdvisorCard';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';

const FeaturedAdvisors = ({ onAdvisorClick, onCompare, comparisonAdvisors }) => {
  const [featuredAdvisors, setFeaturedAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const ADVISORS_PER_PAGE = 3;

  useEffect(() => {
    const fetchFeaturedAdvisors = async () => {
      try {
        setLoading(true);
        setError(null);

        // Query for featured advisors based on rating, review count, and verification
        const advisorsQuery = query(
          collection(db, 'state_adv_part_1_data'),
          where('verified', '==', true),
          where('averageRating', '>=', 4.5),
          where('reviewCount', '>=', 10),
          orderBy('averageRating', 'desc'),
          orderBy('reviewCount', 'desc'),
          limit(9) // Fetch more than needed for pagination
        );

        const snapshot = await getDocs(advisorsQuery);
        const advisors = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFeaturedAdvisors(advisors);
      } catch (err) {
        console.error('Error fetching featured advisors:', err);
        setError('Failed to load featured advisors');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedAdvisors();
  }, []);

  const totalPages = Math.ceil(featuredAdvisors.length / ADVISORS_PER_PAGE);
  const currentAdvisors = featuredAdvisors.slice(
    currentPage * ADVISORS_PER_PAGE,
    (currentPage + 1) * ADVISORS_PER_PAGE
  );

  const handlePreviousPage = () => {
    setCurrentPage(prev => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-4 mb-8 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || featuredAdvisors.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow rounded-lg p-4 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <StarIcon className="h-6 w-6 text-yellow-400 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Featured Advisors</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePreviousPage}
            className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={handleNextPage}
            className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentAdvisors.map((advisor) => (
            <div key={advisor.id} className="transform transition-transform hover:scale-[1.02]">
              <AdvisorCard
                advisor={advisor}
                onClick={() => onAdvisorClick(advisor)}
                onCompare={() => onCompare(advisor)}
                isInComparison={comparisonAdvisors.some(a => a.id === advisor.id)}
                featured
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-4 space-x-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentPage === index ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedAdvisors; 