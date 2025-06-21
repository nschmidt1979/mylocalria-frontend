import { useState } from 'react';
import {
  ChatBubbleLeftIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SearchFeedback = ({ searchQuery, filters, advisors, onClose }) => {
  const [feedbackType, setFeedbackType] = useState(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackType) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const feedbackData = {
        type: feedbackType,
        comment,
        searchQuery,
        filters,
        advisorCount: advisors.length,
        timestamp: serverTimestamp(),
        // Additional metadata
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        // You can add more metadata as needed
      };

      await addDoc(collection(db, 'searchFeedback'), feedbackData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <HandThumbUpIcon className="h-5 w-5 text-green-500 mr-2" />
          <p className="text-sm text-green-700">Thank you for your feedback!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ChatBubbleLeftIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Search Feedback</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700">
            How helpful were these search results?
          </label>
          <div className="mt-2 flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setFeedbackType('helpful')}
              className={`flex items-center px-4 py-2 rounded-md ${
                feedbackType === 'helpful'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <HandThumbUpIcon className="h-5 w-5 mr-2" />
              Helpful
            </button>
            <button
              type="button"
              onClick={() => setFeedbackType('not_helpful')}
              className={`flex items-center px-4 py-2 rounded-md ${
                feedbackType === 'not_helpful'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <HandThumbDownIcon className="h-5 w-5 mr-2" />
              Not Helpful
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700"
          >
            Additional Comments (Optional)
          </label>
          <div className="mt-1">
            <textarea
              id="comment"
              name="comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="What could we improve about the search results?"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!feedbackType || isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchFeedback; 