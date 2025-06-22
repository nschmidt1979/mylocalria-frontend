import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import StarRating from '../components/common/StarRating';
import LoadingSpinner from '../components/common/LoadingSpinner';

const WriteReview = () => {
  const { crdNumber } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [advisor, setAdvisor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    content: '',
    title: ''
  });
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    const fetchAdvisor = async () => {
      try {
        const advisorDoc = await getDoc(doc(db, 'advisors', crdNumber));
        if (!advisorDoc.exists()) {
          throw new Error('Advisor not found');
        }
        setAdvisor({ id: advisorDoc.id, ...advisorDoc.data() });
      } catch (err) {
        console.error('Error fetching advisor:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisor();
  }, [crdNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login', { state: { from: `/write-review/${crdNumber}` } });
      return;
    }

    if (formData.rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!formData.content.trim()) {
      setError('Please write your review');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const reviewData = {
        advisor_crd: crdNumber,
        advisor_name: advisor.primary_business_name,
        advisor_logo: advisor.logo_url,
        reviewer_id: currentUser.uid,
        reviewer_name: currentUser.displayName || 'Anonymous',
        reviewer_photo: currentUser.photoURL,
        rating: formData.rating,
        content: formData.content.trim(),
        title: formData.title.trim(),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      await addDoc(collection(db, 'reviews'), reviewData);
      navigate(`/adviser/${crdNumber}`, { state: { reviewSubmitted: true } });
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !advisor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/directory"
            className="text-primary-600 hover:text-primary-800"
          >
            Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-8">
            <Link
              to={`/adviser/${crdNumber}`}
              className="text-primary-600 hover:text-primary-800 flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Advisor Profile
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Write a Review for {advisor.primary_business_name}
            </h1>
            <p className="mt-2 text-gray-600">
              Share your experience to help others make informed decisions
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="fas fa-exclamation-circle text-red-400"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Rating
              </label>
              <div className="mt-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className="focus:outline-none"
                      onMouseEnter={() => setHoveredRating(rating)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setFormData(prev => ({ ...prev, rating }))}
                    >
                      <i
                        className={`fas fa-star text-3xl ${
                          rating <= (hoveredRating || formData.rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-sm text-gray-500">
                    {hoveredRating || formData.rating} out of 5
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Review Title (Optional)
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Summarize your experience"
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Your Review
              </label>
              <textarea
                id="content"
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Share your experience with this advisor..."
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                to={`/adviser/${crdNumber}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Submitting...</span>
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WriteReview; 