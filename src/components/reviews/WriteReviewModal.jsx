import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import StarRating from '../common/StarRating';

export const WriteReviewModal = ({ advisorId, advisorName, onClose, onReviewSubmitted }) => {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasExistingReview, setHasExistingReview] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // Check for existing review on mount
  useEffect(() => {
    const checkExistingReview = async () => {
      if (!currentUser?.uid || !advisorId) return;
      
      try {
        setCheckingExisting(true);
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('advisorId', '==', advisorId),
          where('reviewerId', '==', currentUser.uid),
          limit(1)
        );
        
        const querySnapshot = await getDocs(reviewsQuery);
        setHasExistingReview(!querySnapshot.empty);
        
        if (!querySnapshot.empty) {
          setError('You have already written a review for this advisor. Each user can only write one review per advisor.');
        }
      } catch (err) {
        console.error('Error checking existing review:', err);
        // Don't block the user if we can't check
      } finally {
        setCheckingExisting(false);
      }
    };

    checkExistingReview();
  }, [currentUser, advisorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Comprehensive validation
    if (!currentUser) {
      setError('You must be logged in to write a review.');
      return;
    }
    
    if (!currentUser.emailVerified) {
      setError('Please verify your email address before writing reviews.');
      return;
    }
    
    if (hasExistingReview) {
      setError('You have already written a review for this advisor.');
      return;
    }
    
    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }
    
    if (!content.trim()) {
      setError('Please provide review content.');
      return;
    }
    
    if (content.trim().length < 10) {
      setError('Review content must be at least 10 characters long.');
      return;
    }
    
    if (content.trim().length > 2000) {
      setError('Review content must be less than 2000 characters.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Double-check for existing review before submission
      const existingReviewQuery = query(
        collection(db, 'reviews'),
        where('advisorId', '==', advisorId),
        where('reviewerId', '==', currentUser.uid),
        limit(1)
      );
      
      const existingReviewSnapshot = await getDocs(existingReviewQuery);
      if (!existingReviewSnapshot.empty) {
        setError('You have already written a review for this advisor.');
        return;
      }

      // Sanitize and validate review data
      const reviewData = {
        advisorId: String(advisorId),
        advisorName: String(advisorName || '').substring(0, 200),
        rating: Number(rating),
        content: content.trim().substring(0, 2000),
        reviewerId: currentUser.uid,
        reviewerName: (currentUser.displayName || 'Anonymous').substring(0, 100),
        reviewerPhoto: currentUser.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'published',
        helpful: 0,
        flagged: false,
        // Add metadata for moderation
        userAgent: navigator.userAgent || '',
        ipAddress: null, // Will be added server-side if needed
        version: '1.0'
      };

      const docRef = await addDoc(collection(db, 'reviews'), reviewData);
      
      // Create a review object with the ID for immediate display
      const newReview = {
        id: docRef.id,
        ...reviewData,
        createdAt: new Date(), // Use current date for immediate display
        updatedAt: new Date()
      };

      onReviewSubmitted(newReview);
      onClose(); // Close modal on success
      
    } catch (err) {
      console.error('Error submitting review:', err);
      
      // Handle specific error types
      if (err.code === 'permission-denied') {
        setError('You do not have permission to write reviews. Please contact support.');
      } else if (err.code === 'resource-exhausted') {
        setError('Too many requests. Please try again later.');
      } else {
        setError('Failed to submit review. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 mb-4">
                      Write a Review for {advisorName}
                    </Dialog.Title>

                    {checkingExisting ? (
                      <div className="flex items-center justify-center py-8">
                        <LoadingSpinner className="h-8 w-8" />
                        <span className="ml-2 text-gray-500">Checking for existing review...</span>
                      </div>
                    ) : hasExistingReview ? (
                      <div className="rounded-md bg-yellow-50 p-4">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                              You have already written a review for this advisor.
                            </h3>
                            <p className="mt-2 text-sm text-yellow-700">
                              Each user can only write one review per advisor. You can edit your existing review from the advisor's profile page.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Rating Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Rating
                        </label>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <button
                              key={i + 1}
                              type="button"
                              className="focus:outline-none"
                              onMouseEnter={() => setHoveredRating(i + 1)}
                              onMouseLeave={() => setHoveredRating(0)}
                              onClick={() => setRating(i + 1)}
                            >
                              <StarRating rating={i + 1 <= (hoveredRating || rating) ? i + 1 : 0} size={8} />
                            </button>
                          ))}
                          <span className="ml-2 text-sm text-gray-500">
                            {rating ? `${rating} stars` : 'Select a rating'}
                          </span>
                        </div>
                      </div>

                      {/* Review Content */}
                      <div>
                        <label htmlFor="review-content" className="block text-sm font-medium text-gray-700 mb-2">
                          Your Review
                        </label>
                        <textarea
                          id="review-content"
                          rows={6}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Share your experience with this advisor..."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          maxLength={2000}
                          required
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          {content.length}/2000 characters {content.length < 10 && '(minimum 10 characters)'}
                        </p>
                      </div>

                      {/* Error Message */}
                      {error && (
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="flex">
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">
                                {error}
                              </h3>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Submit Button */}
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <LoadingSpinner className="h-5 w-5 mr-2" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Review'
                          )}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                    )}
                    
                    {/* Close button for non-form states */}
                    {(checkingExisting || hasExistingReview) && (
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="button"
                          className="inline-flex w-full justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:w-auto"
                          onClick={onClose}
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}; 