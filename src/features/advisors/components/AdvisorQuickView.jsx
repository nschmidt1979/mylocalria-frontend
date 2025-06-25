import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, StarIcon, MapPinIcon, BuildingOfficeIcon, CheckBadgeIcon, ScaleIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { ReviewList } from '../../reviews/components/ReviewList';
import { WriteReviewModal } from '../../reviews/components/WriteReviewModal';
import { useAuth } from '../../auth/contexts/AuthContext';
import StarRating from '../../../shared/components/common/StarRating';

const AdvisorQuickView = ({ isOpen, onClose, advisor, onCompare, isInComparison }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showReviewModal, setShowReviewModal] = useState(false);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarSolid
            key={i}
            className="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="h-5 w-5 text-yellow-400" />
            <div className="absolute inset-0 w-1/2 overflow-hidden">
              <StarSolid className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <StarIcon
            key={i}
            className="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        );
      }
    }
    return stars;
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'services', label: 'Services' },
    { id: 'fees', label: 'Fees' },
  ];

  return (
    <>
      <Transition.Root show={isOpen} as={Fragment}>
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
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
                    <div className="flex-shrink-0">
                      <div className="h-24 w-24 rounded-lg bg-gray-100 overflow-hidden">
                        {advisor.profileImage ? (
                          <img
                            src={advisor.profileImage}
                            alt={advisor.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                            <BuildingOfficeIcon className="h-12 w-12 text-blue-300" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 sm:ml-6 sm:mt-0 sm:flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-gray-900">
                            {advisor.name}
                            {advisor.verified && (
                              <CheckBadgeIcon className="inline-block h-6 w-6 ml-2 text-blue-500" />
                            )}
                          </Dialog.Title>
                          <p className="mt-1 text-lg text-gray-600">{advisor.company}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => onCompare()}
                            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ${
                              isInComparison
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <ScaleIcon className="h-5 w-5 mr-2" />
                            {isInComparison ? 'Remove from Comparison' : 'Add to Comparison'}
                          </button>
                          <Link
                            to={`/advisors/${advisor.id}`}
                            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                          >
                            View Full Profile
                          </Link>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center space-x-6">
                        <div className="flex items-center">
                          <StarRating rating={advisor.averageRating} size={5} />
                          <span className="ml-2 text-sm text-gray-600">
                            ({advisor.reviewCount || 0} reviews)
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPinIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                          {advisor.location}
                        </div>
                        {advisor.feeOnly && (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            <ScaleIcon className="mr-1 h-3 w-3" />
                            Fee-Only
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                            activeTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="mt-6">
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        {advisor.bio && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">About</h4>
                            <p className="mt-2 text-sm text-gray-600">{advisor.bio}</p>
                          </div>
                        )}

                        {advisor.specializations && advisor.specializations.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Specializations</h4>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {advisor.specializations.map((spec, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20"
                                >
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {advisor.certifications && advisor.certifications.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Certifications</h4>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {advisor.certifications.map((cert, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-600/20"
                                >
                                  {cert}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'reviews' && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-900">Reviews</h4>
                          {currentUser && (
                            <button
                              onClick={() => setShowReviewModal(true)}
                              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                            >
                              Write a Review
                            </button>
                          )}
                        </div>
                        <ReviewList advisorId={advisor.id} limit={3} />
                      </div>
                    )}

                    {activeTab === 'services' && (
                      <div className="space-y-6">
                        {advisor.services && advisor.services.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {advisor.services.map((service, index) => (
                              <div
                                key={index}
                                className="relative rounded-lg border border-gray-200 bg-white px-6 py-5 shadow-sm hover:border-gray-300"
                              >
                                <h4 className="text-sm font-medium text-gray-900">{service.name}</h4>
                                <p className="mt-1 text-sm text-gray-600">{service.description}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No services listed yet.</p>
                        )}
                      </div>
                    )}

                    {activeTab === 'fees' && (
                      <div className="space-y-6">
                        {advisor.feeStructure ? (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Fee Structure</h4>
                            <div className="mt-2 prose prose-sm max-w-none text-gray-600">
                              {advisor.feeStructure}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Fee structure not available.</p>
                        )}

                        {advisor.minimumInvestment && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Minimum Investment</h4>
                            <p className="mt-1 text-sm text-gray-600">
                              ${advisor.minimumInvestment.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {showReviewModal && (
        <WriteReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          advisorId={advisor.id}
          advisorName={advisor.name}
        />
      )}
    </>
  );
};

export default AdvisorQuickView; 