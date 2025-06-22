import PropTypes from 'prop-types';
import StarRating from '../common/StarRating';

const ReviewCard = ({ review, showAdvisorInfo = false }) => {
  const {
    reviewer_name,
    reviewer_photo,
    rating,
    content,
    created_at,
    advisor_name,
    advisor_crd,
    advisor_logo
  } = review;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <img
            className="h-12 w-12 rounded-full"
            src={reviewer_photo || "https://via.placeholder.com/48"}
            alt={reviewer_name}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {reviewer_name}
              </p>
              <div className="mt-1 flex items-center">
                <StarRating rating={rating} size={5} />
                <span className="ml-2 text-sm text-gray-500">
                  {formatDate(created_at)}
                </span>
              </div>
            </div>
            {showAdvisorInfo && (
              <div className="flex items-center space-x-2">
                <img
                  className="h-8 w-8 rounded-full"
                  src={advisor_logo || "https://via.placeholder.com/32"}
                  alt={advisor_name}
                />
                <span className="text-sm text-gray-600">{advisor_name}</span>
              </div>
            )}
          </div>
          <div className="mt-4 text-sm text-gray-700">
            <p className="whitespace-pre-wrap">{content}</p>
          </div>
          {showAdvisorInfo && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <a
                href={`/adviser/${advisor_crd}`}
                className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
              >
                <i className="fas fa-external-link-alt mr-1 text-xs"></i>
                View Advisor Profile
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ReviewCard.propTypes = {
  review: PropTypes.shape({
    reviewer_name: PropTypes.string.isRequired,
    reviewer_photo: PropTypes.string,
    rating: PropTypes.number.isRequired,
    content: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    advisor_name: PropTypes.string,
    advisor_crd: PropTypes.string,
    advisor_logo: PropTypes.string
  }).isRequired,
  showAdvisorInfo: PropTypes.bool
};

export default ReviewCard; 