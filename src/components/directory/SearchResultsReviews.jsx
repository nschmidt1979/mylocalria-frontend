import { useState, useEffect } from 'react';
import { StarIcon, XMarkIcon } from '@heroicons/react/24/outline';

const generateMockReviews = (advisors) => {
  // Generate mock reviews for each advisor
  const reviews = [];
  advisors.forEach((advisor) => {
    for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
      reviews.push({
        id: `${advisor.id}-review-${i}`,
        advisorId: advisor.id,
        reviewer: `User${Math.floor(Math.random() * 1000)}`,
        rating: Math.floor(Math.random() * 5) + 1,
        text: 'This is a sample review.',
        date: new Date(Date.now() - Math.random() * 1000000000),
        verified: Math.random() > 0.2,
        helpful: Math.floor(Math.random() * 10),
      });
    }
  });
  return reviews;
};

const SearchResultsReviews = ({ advisors, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const mockReviews = generateMockReviews(advisors);
      setReviews(mockReviews);
    } catch (err) {
      setError('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  }, [advisors]);

  const renderRatingStars = (rating) => (
    <span className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </span>
  );

  const renderReviewCard = (review) => (
    <div key={review.id} className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-800">{review.reviewer}</span>
          {review.verified && (
            <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">Verified</span>
          )}
        </div>
        <span className="text-xs text-gray-500">{review.date.toLocaleDateString()}</span>
      </div>
      <div className="flex items-center mb-2">
        {renderRatingStars(review.rating)}
        <span className="ml-2 text-sm text-gray-600">{review.rating} / 5</span>
      </div>
      <div className="text-gray-700 mb-2">{review.text}</div>
      <div className="flex items-center text-xs text-gray-500">
        <span className="mr-2">Helpful: {review.helpful}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Advisor Reviews</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      {reviews.length === 0 ? (
        <div className="text-center text-gray-500">No reviews found.</div>
      ) : (
        <div>
          {reviews.map(renderReviewCard)}
        </div>
      )}
    </div>
  );
};

export default SearchResultsReviews;