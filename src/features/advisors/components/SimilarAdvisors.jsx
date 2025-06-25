import { useState, useEffect } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import AdvisorCard from './AdvisorCard';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { filterAdvisorsByDistance } from '../../shared/services/geolocationService';

const SimilarAdvisors = ({ currentAdvisor, userLocation, onAdvisorClick, onCompare, comparisonAdvisors }) => {
  const [similarAdvisors, setSimilarAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const MAX_SIMILAR_ADVISORS = 6;

  useEffect(() => {
    const fetchSimilarAdvisors = async () => {
      if (!currentAdvisor) return;

      try {
        setLoading(true);
        setError(null);

        // Build query based on specializations
        let advisorsQuery = query(
          collection(db, 'state_adv_part_1_data'),
          where('id', '!=', currentAdvisor.id), // Exclude current advisor
          limit(20) // Fetch more than needed to filter by distance
        );

        // Add filters for specializations if available
        if (currentAdvisor.specializations?.length > 0) {
          advisorsQuery = query(
            advisorsQuery,
            where('specializations', 'array-contains-any', currentAdvisor.specializations.slice(0, 3))
          );
        }

        const snapshot = await getDocs(advisorsQuery);
        let advisors = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter by distance if user location is available
        if (userLocation) {
          advisors = filterAdvisorsByDistance(advisors, userLocation, 50); // 50 mile radius
        }

        // Sort by similarity score
        advisors.sort((a, b) => {
          // Calculate similarity score based on matching specializations
          const getSimilarityScore = (advisor) => {
            let score = 0;
            if (currentAdvisor.specializations) {
              score += advisor.specializations?.filter(spec =>
                currentAdvisor.specializations.includes(spec)
              ).length || 0;
            }
            if (currentAdvisor.certifications) {
              score += advisor.certifications?.filter(cert =>
                currentAdvisor.certifications.includes(cert)
              ).length || 0;
            }
            // Add rating as a factor
            score += (advisor.averageRating || 0) * 0.5;
            return score;
          };

          return getSimilarityScore(b) - getSimilarityScore(a);
        });

        // Take top N advisors
        setSimilarAdvisors(advisors.slice(0, MAX_SIMILAR_ADVISORS));
      } catch (err) {
        console.error('Error fetching similar advisors:', err);
        setError('Failed to load similar advisors');
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarAdvisors();
  }, [currentAdvisor, userLocation]);

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

  if (error || similarAdvisors.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-8">
      <div className="flex items-center mb-4">
        <SparklesIcon className="h-5 w-5 text-gray-400 mr-2" />
        <h2 className="text-lg font-medium text-gray-900">Similar Advisors</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {similarAdvisors.map((advisor) => (
          <div key={advisor.id} className="transform transition-transform hover:scale-[1.02]">
            <AdvisorCard
              advisor={advisor}
              onClick={() => onAdvisorClick(advisor)}
              onCompare={() => onCompare(advisor)}
              isInComparison={comparisonAdvisors.some(a => a.id === advisor.id)}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarAdvisors; 