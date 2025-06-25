import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import StarRating from '../common/StarRating';

export const ReviewList = ({ reviews, initialPageSize = 5 }) => {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  const toggleReviewExpansion = (reviewId) => {
    setExpandedReviews(prev => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < rating) {
        stars.push(
          <StarIcon
            key={i}
            className="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        );
      } else {
        stars.push(
          <StarOutlineIcon
            key={i}
            className="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        );
      }
    }
    return stars;
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  const displayedReviews = reviews.slice(0, pageSize);
  const hasMore = reviews.length > pageSize;

  return (
    <div className="space-y-6">
      {displayedReviews.map((review) => (
        <div
          key={review.id}
          className="bg-gray-50 rounded-lg p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                  {review.reviewerPhoto ? (
                    <img
                      src={review.reviewerPhoto}
                      alt={review.reviewerName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                      {review.reviewerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {review.reviewerName}
                </h4>
                <div className="mt-1 flex items-center">
                  <div className="flex items-center">
                    <StarRating rating={review.rating} size={5} />
                  </div>
                  <span className="ml-2 text-sm text-gray-500">
                    {formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-gray-600">
              {expandedReviews.has(review.id) ? (
                <p>{review.content}</p>
              ) : (
                <p>
                  {review.content.length > 300
                    ? `${review.content.substring(0, 300)}...`
                    : review.content}
                </p>
              )}
            </div>
            {review.content.length > 300 && (
              <button
                onClick={() => toggleReviewExpansion(review.id)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {expandedReviews.has(review.id) ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>

          {/* Review Response */}
          {review.response && (
            <div className="mt-4 pl-4 border-l-4 border-blue-200 bg-blue-50 rounded-r-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-900">
                  Response from {review.advisorName}
                </span>
                <span className="text-sm text-blue-600">
                  {formatDistanceToNow(review.responseDate.toDate(), { addSuffix: true })}
                </span>
              </div>
              <p className="mt-2 text-sm text-blue-800">
                {review.response}
              </p>
            </div>
          )}
        </div>
      ))}

      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => setPageSize(prev => prev + initialPageSize)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
}; 