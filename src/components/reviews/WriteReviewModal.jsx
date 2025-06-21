import { Fragment, useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import StarRating from '../common/StarRating';

export const WriteReviewModal = ({ advisorId, advisorName, onClose, onReviewSubmitted }) => {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const initialFocusRef = useRef(null);
  const contentRef = useRef(null);

  // Focus management
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    // Focus the first interactive element when modal opens
    setTimeout(() => {
      initialFocusRef.current?.focus();
    }, 100);
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating) {
      setError('Please provide a rating.');
      initialFocusRef.current?.focus();
      return;
    }
    
    if (!content.trim()) {
      setError('Please provide review content.');
      contentRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const reviewData = {
        advisorId,
        advisorName,
        rating,
        content: content.trim(),
        reviewerId: currentUser.uid,
        reviewerName: currentUser.displayName || 'Anonymous',
        reviewerPhoto: currentUser.photoURL,
        createdAt: serverTimestamp(),
        status: 'published'
      };

      const docRef = await addDoc(collection(db, 'reviews'), reviewData);
      
      // Create a review object with the ID for immediate display
      const newReview = {
        id: docRef.id,
        ...reviewData,
        createdAt: new Date() // Use current date for immediate display
      };

      onReviewSubmitted(newReview);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    setError(null); // Clear error when user interacts
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
                    aria-label="Close modal"
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h2" className="text-xl font-semibold leading-6 text-gray-900 mb-4">
                      Write a Review for {advisorName}
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Rating Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Rating *
                        </label>
                        <StarRating
                          rating={rating}
                          interactive={true}
                          onChange={handleRatingChange}
                          size={10}
                          label="Rate this advisor from 1 to 5 stars"
                          ref={initialFocusRef}
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          {rating > 0 ? `You rated ${rating} star${rating > 1 ? 's' : ''}` : 'Click to rate'}
                        </p>
                      </div>

                      {/* Review Content */}
                      <div>
                        <label htmlFor="review-content" className="block text-sm font-medium text-gray-700 mb-2">
                          Your Review *
                        </label>
                        <textarea
                          ref={contentRef}
                          id="review-content"
                          rows={6}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Share your experience with this advisor..."
                          value={content}
                          onChange={(e) => {
                            setContent(e.target.value);
                            setError(null); // Clear error when user types
                          }}
                          required
                          aria-describedby={error ? "review-error" : "review-help"}
                        />
                        <p id="review-help" className="mt-1 text-sm text-gray-500">
                          Please provide honest feedback about your experience with this advisor.
                        </p>
                      </div>

                      {/* Error Message */}
                      {error && (
                        <div 
                          id="review-error" 
                          className="rounded-md bg-red-50 p-4 border border-red-200" 
                          role="alert"
                          aria-live="polite"
                        >
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
                          className="inline-flex w-full justify-center rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <LoadingSpinner size="sm" message="Submitting review" />
                              <span className="ml-2">Submitting...</span>
                            </>
                          ) : (
                            'Submit Review'
                          )}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
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