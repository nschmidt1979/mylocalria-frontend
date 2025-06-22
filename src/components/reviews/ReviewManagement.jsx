import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import StarRating from '../common/StarRating';

export const ReviewManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editReview, setEditReview] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserReviews();
    }
  }, [user]);

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all reviews by the current user
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('userId', '==', user.uid)
      );
      
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = await Promise.all(
        reviewsSnapshot.docs.map(async (doc) => {
          const review = { id: doc.id, ...doc.data() };
          
          // Get advisor details for each review
          const advisorQuery = query(
            collection(db, 'state_adv_part_1_data'),
            where('crdNumber', '==', review.advisorId)
          );
          const advisorSnapshot = await getDocs(advisorQuery);
          const advisorData = advisorSnapshot.docs[0]?.data();
          
          return {
            ...review,
            advisor: advisorData,
          };
        })
      );
      
      setReviews(reviewsData);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      setReviews(reviews.filter(review => review.id !== reviewId));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review. Please try again later.');
    }
  };

  const handleEditReview = async (reviewId, updatedData) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      
      await updateDoc(reviewRef, {
        ...updatedData,
        updatedAt: new Date(),
      });
      
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, ...updatedData, updatedAt: new Date() }
          : review
      ));
      
      setEditReview(null);
    } catch (err) {
      console.error('Error updating review:', err);
      setError('Failed to update review. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
        <button
          onClick={fetchUserReviews}
          className="mt-2 text-blue-600 hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
        <p className="text-gray-600 mb-4">Start sharing your experiences with financial advisors.</p>
        <Link
          to="/directory"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Find an advisor to review
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white shadow rounded-lg p-6"
        >
          {editReview?.id === review.id ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditReview(review.id, {
                  rating: editReview.rating,
                  title: editReview.title,
                  content: editReview.content,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <div className="flex space-x-1 mt-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setEditReview({ ...editReview, rating })}
                      className="focus:outline-none"
                    >
                      {rating <= editReview.rating ? (
                        <StarIconSolid className="h-6 w-6 text-yellow-400" />
                      ) : (
                        <StarIconSolid className="h-6 w-6 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={editReview.title}
                  onChange={(e) => setEditReview({ ...editReview, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Review</label>
                <textarea
                  value={editReview.content}
                  onChange={(e) => setEditReview({ ...editReview, content: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditReview(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    <Link
                      to={`/advisor/${review.advisorId}`}
                      className="hover:text-blue-600"
                    >
                      {review.advisor?.name || 'Advisor'}
                    </Link>
                  </h3>
                  <div className="mt-1 flex items-center">
                    <div className="flex items-center">
                      <StarRating rating={review.rating} size={5} />
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      {new Date(review.createdAt.toDate()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditReview({
                      id: review.id,
                      rating: review.rating,
                      title: review.title,
                      content: review.content,
                    })}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  {deleteConfirmId === review.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(review.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-base font-medium text-gray-900">{review.title}</h4>
                <p className="mt-2 text-gray-600 whitespace-pre-wrap">{review.content}</p>
              </div>
              
              {review.updatedAt && (
                <div className="mt-2 text-sm text-gray-500">
                  Edited on {new Date(review.updatedAt.toDate()).toLocaleDateString()}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}; 