import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { StarIcon, MapPinIcon, BuildingOfficeIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon, CheckBadgeIcon, ShareIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ReviewList } from '../components/reviews/ReviewList';
import { WriteReviewModal } from '../components/reviews/WriteReviewModal';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import AdvisorLocationMap from '../components/directory/AdvisorLocationMap';
import MessageAdvisorModal from '../components/directory/MessageAdvisorModal';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import SEOHelmet from '../components/common/SEOHelmet';
import { generateAdvisorProfileSEO, generateImageAlt } from '../utils/seoUtils';

// Add a helper function for title case
function toTitleCase(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

// Helper to clean up firm name
function cleanFirmName(name) {
  if (!name) return '';
  // Remove ', LLC', ' LLC', ', llc', ' llc', ', Inc', ' Inc', ', inc', ', inc.', ' Inc.' (with or without comma/period, case-insensitive)
  return name.replace(/,?\s*(llc|inc)\.?$/i, '').trim();
}

// Helper to format registration date
function formatRegistrationDate(dateValue) {
  if (!dateValue) return '';
  // Excel serial date (days since 1/1/1900, ignoring Excel's leap year bug)
  const serial = Number(dateValue);
  if (!isNaN(serial) && serial > 20000 && serial < 60000) {
    // Excel incorrectly treats 1900 as a leap year, so subtract 1 for serials >= 60
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const days = serial >= 60 ? serial - 1 : serial;
    const resultDate = new Date(excelEpoch.getTime() + days * 86400000);
    return resultDate.toLocaleDateString();
  }
  // Try to parse as YYYYMMDD
  if (/^\d{8}$/.test(dateValue)) {
    const year = dateValue.slice(0, 4);
    const month = dateValue.slice(4, 6);
    const day = dateValue.slice(6, 8);
    return `${month}/${day}/${year}`;
  }
  // Try to parse as YYYYDDD (ordinal date)
  if (/^\d{7}$/.test(dateValue)) {
    const year = parseInt(dateValue.slice(0, 4), 10);
    const dayOfYear = parseInt(dateValue.slice(4), 10);
    const date = new Date(year, 0);
    date.setDate(dayOfYear);
    return date.toLocaleDateString();
  }
  // Try to parse as ISO or other recognizable date
  const parsed = new Date(dateValue);
  if (!isNaN(parsed)) {
    return parsed.toLocaleDateString();
  }
  // Fallback: show as-is
  return dateValue;
}

// Helper for minimum account size
function formatAccountMinimum(value) {
  if (value === 0 || value === '0' || value === '$0') return 'No Minimum';
  return value;
}

// Helper for discretionary authority
function formatDiscretionaryAuthority(value) {
  const str = String(value || '').trim().toLowerCase();
  if (!str) return 'Not provided';
  // Normalize and check for both terms, with or without comma/space
  if ((str.includes('discretionary') && str.includes('non-discretionary')) || str.replace(/\s+/g, '') === 'discretionary,non-discretionary') {
    return 'Discretionary and Non-discretionary';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper for Other Business Activities
function formatOtherBusinessActivities(value) {
  if (!value) return '';
  if (typeof value === 'string' && value.trim().toLowerCase() === 'none') return 'None';
  return value;
}

// Helper to format currency
function formatCurrency(value) {
  const num = Number(value);
  if (isNaN(num) || num === 0) return '$0';
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

// Helper to format numbers with commas
function formatNumber(value) {
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString('en-US');
}

// Helper for capitalizing 'None'
function formatNone(value) {
  if (!value) return '';
  if (typeof value === 'string' && value.trim().toLowerCase() === 'none') return 'None';
  return value;
}

function renderFeeScheduleSection(feeSchedule, feeNotes, performanceBasedFees, performanceFeeRate) {
  // Robust parsing: split on every new percentage or 'Negotiable' (even if no commas or spaces)
  let feeRows = [];
  if (typeof feeSchedule === 'string') {
    // Insert a delimiter before each new fee tier
    const normalized = feeSchedule.replace(/(\d+\.\d+%|Negotiable) for/g, '|$1 for');
    feeRows = normalized.split('|').map(row => {
      const match = row.match(/([\d.]+%|Negotiable) for \$?([\d,]+)(?:-(\$?[\d,]+))?(?: and above)?/i);
      if (match) {
        return {
          range: match[3]
            ? `$${Number(match[2].replace(/\$/g, '')).toLocaleString()} – $${Number(match[3].replace(/\$/g, '')).toLocaleString()}`
            : match[0].toLowerCase().includes('above')
              ? `$${Number(match[2].replace(/\$/g, '')).toLocaleString()} and above`
              : `$${Number(match[2].replace(/\$/g, '')).toLocaleString()}`,
          rate: match[1]
        };
      }
      return null;
    }).filter(Boolean);
  }

  return (
    <div className="text-sm text-gray-700 space-y-4">
      <div>
        <strong>Fee Schedule:</strong>
        {feeRows.length > 0 ? (
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 border-b">Portfolio Value</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 border-b">Annual Fee Rate</th>
              </tr>
            </thead>
            <tbody>
              {feeRows.map((row, idx) => (
                <tr key={idx} className="border-b last:border-b-0">
                  <td className="px-6 py-4 text-sm text-gray-900">{row.range}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">{row.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <span className="ml-1">{feeSchedule || 'Not provided'}</span>
        )}
      </div>
      <div>
        <strong>Fee Notes:</strong> <span className="ml-1">{feeNotes || 'Not provided'}</span>
      </div>
      <div>
        <strong>Performance-Based Fees:</strong> <span className="ml-1">{performanceBasedFees || 'Not provided'}</span>
      </div>
      <div>
        <strong>Performance Fee Rate:</strong> <span className="ml-1">{performanceFeeRate || 'Not provided'}</span>
      </div>
    </div>
  );
}

const AdvisorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [advisor, setAdvisor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    }
  });
  const [logoUrl, setLogoUrl] = useState(null);
  const [advPart2, setAdvPart2] = useState(null);
  const [advPart2B, setAdvPart2B] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [sortBy, setSortBy] = useState('relevant');
  const [repNames, setRepNames] = useState([]);
  const [repProfiles, setRepProfiles] = useState([]);

  useEffect(() => {
    const fetchAdvisorData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch advisor details
        const advisorDoc = await getDoc(doc(db, 'state_adv_part_1_data', id));
        if (!advisorDoc.exists()) {
          throw new Error('Advisor not found');
        }

        const advisorData = {
          id: advisorDoc.id,
          ...advisorDoc.data()
        };
        setAdvisor(advisorData);

        // Fetch logo from adviser_logos using crd_number
        if (advisorData.crd_number) {
          const logosQuery = query(
            collection(db, 'adviser_logos'),
            where('crd_number', '==', advisorData.crd_number),
            limit(1)
          );
          const logosSnapshot = await getDocs(logosQuery);
          if (!logosSnapshot.empty) {
            setLogoUrl(logosSnapshot.docs[0].data().logo_url);
          }
        }

        // Fetch reviews
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('advisorId', '==', id),
          orderBy('createdAt', 'desc')
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsData = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate review statistics
        const totalReviews = reviewsData.length;
        const averageRating = totalReviews > 0
          ? reviewsData.reduce((acc, review) => acc + review.rating, 0) / totalReviews
          : 0;
        const ratingDistribution = reviewsData.reduce((acc, review) => {
          acc[review.rating] = (acc[review.rating] || 0) + 1;
          return acc;
        }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

        // Fetch ADV Part 2 data using crd_number
        if (advisorData.crd_number) {
          const adv2Query = query(
            collection(db, 'adv_part_2_data'),
            where('crd_number', '==', advisorData.crd_number),
            limit(1)
          );
          const adv2Snapshot = await getDocs(adv2Query);
          if (!adv2Snapshot.empty) {
            setAdvPart2(adv2Snapshot.docs[0].data());
          }
        }

        // Fetch ADV Part 2B data using crd_number (for rep names and profiles)
        if (advisorData.crd_number) {
          const adv2bQuery = query(
            collection(db, 'adv_part_2b_data'),
            where('crd_number', '==', advisorData.crd_number)
          );
          const adv2bSnapshot = await getDocs(adv2bQuery);
          const names = adv2bSnapshot.docs
            .map(doc => doc.data().rep_name)
            .filter(Boolean);
          setRepNames(names);
          // Store all rep profiles
          setRepProfiles(adv2bSnapshot.docs.map(doc => doc.data()));
          if (!adv2bSnapshot.empty) {
            setAdvPart2B(adv2bSnapshot.docs[0].data());
          }
        }

        setReviews(reviewsData);
        setStats({
          totalReviews,
          averageRating,
          ratingDistribution
        });
      } catch (err) {
        console.error('Error fetching advisor data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisorData();
  }, [id]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIcon
            key={i}
            className="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <StarIcon
            key={i}
            className="h-5 w-5 text-yellow-400"
            style={{ clipPath: 'inset(0 50% 0 0)' }}
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

  const handleWriteReview = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/advisor/${id}` } });
      return;
    }
    setShowReviewModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="h-12 w-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/directory"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  const seoData = generateAdvisorProfileSEO(advisor, stats);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {advisor && (
        <SEOHelmet
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords}
          url={`/advisor/${advisor.id}`}
          type="article"
          structuredData={seoData.structuredData}
          breadcrumbs={seoData.breadcrumbs}
          canonical={`/advisor/${advisor.id}`}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        {/* Main Content Area (reduced width) */}
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Advisor Info Box */}
            <div className="flex-1 bg-white rounded-lg shadow-sm p-6 flex flex-col justify-center">
              <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
                <div className="flex-shrink-0 mb-4 md:mb-0">
                  <div className="h-32 w-32 rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={generateImageAlt('advisor-logo', { 
                          firmName: cleanFirmName(toTitleCase(advisor.primary_business_name)) 
                        })}
                        className="h-full w-full object-contain"
                        loading="eager"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <BuildingOfficeIcon className="h-16 w-16" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h1 className="text-3xl font-bold text-gray-900">{cleanFirmName(toTitleCase(advisor.primary_business_name))}</h1>
                  </div>
                  <div className="text-gray-700 mb-1"><span className="font-semibold">CRD Number:</span> {advisor.crd_number}</div>
                  <div className="text-gray-700 mb-1"><span className="font-semibold">Founded:</span> {advisor.status_effective_date ? new Date(formatRegistrationDate(advisor.status_effective_date)).getFullYear() : ''}</div>
                  <div className="text-gray-700 mb-1"><span className="font-semibold">Address:</span> {toTitleCase(advisor.principal_office_city)}, {advisor.principal_office_state ? advisor.principal_office_state.toUpperCase() : ''}</div>
                </div>
              </div>
            </div>
          </div>

          {/* About section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><span className="font-semibold">Number of Financial Advisors:</span> {advisor['5b1_how_many_employees_perform_investmen'] || 'Not provided'}</div>
              <div><span className="font-semibold">Financial Advisors:</span> {repNames.length > 0 ? repNames.join(', ') : 'Not provided'}</div>
              <div><span className="font-semibold">Number of Client Accounts:</span> {formatNumber(advisor['5f2_assets_under_management_total_number']) || 0}</div>
              <div><span className="font-semibold">Other Advisor Business Activities:</span> {formatOtherBusinessActivities(advPart2?.other_business_activities)}</div>
              <div><span className="font-semibold">Assets Under Management:</span> {formatCurrency(advisor['5f2_assets_under_management_total_us_dol'])}</div>
              <div><span className="font-semibold">Data as of:</span> {advPart2 && advPart2.upload_date ? new Date(advPart2.upload_date).toLocaleDateString() : 'N/A'}</div>
            </div>
          </div>

          {/* Investment Management Approach section */}
          {advPart2 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Investment Management Approach</h2>
              <div>
                {advPart2.investment_summary}
              </div>
            </div>
          )}

          {/* Account & Custody section */}
          {advPart2 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Account & Custody</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div><span className="font-semibold">Minimum Account Size:</span> {formatAccountMinimum(advPart2.account_minimum)}</div>
                <div><span className="font-semibold">Custodians:</span> {(!advPart2.custodians || advPart2.custodians.trim().toLowerCase() === 'none') ? 'None stated' : advPart2.custodians}</div>
                <div><span className="font-semibold">Discretionary Authority:</span> {formatDiscretionaryAuthority(advPart2.discretionary_authority)}</div>
              </div>
            </div>
          )}

          {/* Fees & Compensation */}
          {advPart2 && (
            <div className="bg-white rounded-lg shadow p-6 w-full mx-auto mb-8">
              <h2 className="text-lg font-bold mb-4">Fee Schedule & Details</h2>
              <div className="flex flex-col md:flex-row gap-8">
                {/* Fee Schedule Table */}
                <div className="flex-1">
                  <table className="w-full max-w-md bg-white">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 border-b">Fee Schedule</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(advPart2.fees) && [...new Set(advPart2.fees)].map((fee, idx) => (
                        <tr key={idx} className="border-b last:border-b-0">
                          <td className="px-3 py-2 text-sm text-gray-900">{fee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Fee Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <span className="font-semibold">Fee Notes:</span>
                    <span className="ml-1 text-gray-700">{advPart2.feeNotes || advPart2.fee_notes || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Performance-Based Fees:</span>
                    <span className="ml-1 text-gray-700">{
                      (advPart2.performanceFeeRate || advPart2.performance_fee_rate)
                        ? 'Yes'
                        : ((advPart2.performanceBasedFees || advPart2.performance_fees) ? (advPart2.performanceBasedFees || advPart2.performance_fees) : 'No')
                    }</span>
                  </div>
                  <div>
                    <span className="font-semibold">Performance Fee Rate:</span>
                    <span className="ml-1 text-gray-700">{
                      (advPart2.performanceFeeRate || advPart2.performance_fee_rate)
                        ? ((advPart2.performanceFeeRate || advPart2.performance_fee_rate).toLowerCase() === 'none' ? 'None' : (advPart2.performanceFeeRate || advPart2.performance_fee_rate))
                        : 'None'
                    }</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Disclosures */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Disclosures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {advPart2 && <div><span className="font-semibold">Disciplinary Disclosures:</span> {advPart2.disciplinary_disclosures ? formatNone(advPart2.disciplinary_disclosures) : 'None'}</div>}
              {advPart2B && <div><span className="font-semibold">Other Legal Events:</span> {advPart2B.rep_other_legal_events ? formatNone(advPart2B.rep_other_legal_events) : 'None'}</div>}
            </div>
          </div>

          {/* Representative Profile */}
          {repProfiles.length > 0 && repProfiles.map((rep, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Advisor Profile</h2>
              <div className="flex flex-col space-y-2">
                <div><span className="font-semibold">Name:</span> {rep.rep_name}</div>
                <div><span className="font-semibold">CRD Number:</span> {rep.rep_crd_number}</div>
                <div><span className="font-semibold">Professional Designations:</span> {formatNone(rep.rep_professional_designations)}</div>
                <div>
                  <span className="font-semibold">Education:</span>
                  {rep.rep_education && (
                    <div className="ml-1">{rep.rep_education}</div>
                  )}
                </div>
                <div>
                  <span className="font-semibold">Business Experience:</span>
                  {rep.rep_business_experience && (
                    <div className="ml-1">{rep.rep_business_experience}</div>
                  )}
                </div>
                <div>
                  <span className="font-semibold">Other Business Activities:</span>
                  {rep.rep_other_business_activities && (
                    <div className="ml-1">{rep.rep_other_business_activities}</div>
                  )}
                </div>
                <div><span className="font-semibold">Disciplinary Information:</span> {formatNone(rep.rep_disciplinary_information)}</div>
              </div>
            </div>
          ))}

          {/* Reviews Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 w-full mx-auto mb-8 mt-12" id="reviews-section">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>
            {/* Sort by buttons */}
            <div className="mb-6">
              <span className="block text-sm text-gray-700 mb-2">Sort by</span>
              <div className="flex gap-2">
                {[
                  { label: 'Most relevant', value: 'relevant' },
                  { label: 'Newest', value: 'newest' },
                  { label: 'Highest', value: 'highest' },
                  { label: 'Lowest', value: 'lowest' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    className={`px-4 py-1.5 rounded-md border text-sm font-medium focus:outline-none transition-colors ${sortBy === opt.value
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setSortBy(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Review List */}
            <div className="space-y-8">
              {reviews.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</div>
              ) : (
                reviews
                  .slice()
                  .sort((a, b) => {
                    if (sortBy === 'newest') return b.createdAt?.toMillis?.() - a.createdAt?.toMillis?.();
                    if (sortBy === 'highest') return b.rating - a.rating;
                    if (sortBy === 'lowest') return a.rating - b.rating;
                    // Default: relevant (by most recent for now)
                    return b.createdAt?.toMillis?.() - a.createdAt?.toMillis?.();
                  })
                  .map((review) => (
                    <div key={review.id} className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-lg font-bold text-purple-700">
                        {review.reviewerName ? review.reviewerName[0] : '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{review.reviewerName || 'Anonymous'}</span>
                          <span className="text-xs text-gray-500">{review.createdAt ? timeAgo(review.createdAt) : ''}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'text-red-500' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <polygon points="9.9,1.1 7.6,6.6 1.6,7.6 6,11.9 4.8,17.8 9.9,14.7 15,17.8 13.8,11.9 18.2,7.6 12.2,6.6 " />
                            </svg>
                          ))}
                        </div>
                        <div className="mt-2 text-gray-800 text-sm whitespace-pre-line">
                          {review.content}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Sticky Sidebar */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-8 sticky top-8">
            {/* Fiduciary and Claimed/Unclaimed badges */}
            <div className="flex flex-row items-center gap-2 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold border border-green-200 h-7 min-w-[110px] justify-center">
                <ShieldCheckIcon className="h-4 w-4 text-green-500 mr-1" /> Fiduciary
              </span>
              {advisor.verified ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 h-7 min-w-[110px] justify-center">
                  <CheckBadgeIcon className="h-4 w-4 text-blue-500 mr-1" /> Claimed
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-400 text-xs font-semibold border border-gray-200 h-7 min-w-[110px] justify-center">
                  <CheckBadgeIcon className="h-4 w-4 text-gray-400 mr-1" /> Unclaimed
                </span>
              )}
            </div>
            <div className="font-semibold text-gray-900 mb-2 text-lg">Overall rating</div>
            <div className="flex items-center mb-4">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="inline-flex items-center justify-center w-8 h-8 bg-red-500 rounded-md mr-1 last:mr-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 20 20" className="w-5 h-5">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                  </svg>
                </span>
              ))}
            </div>
            <div className="text-gray-600 text-base mb-6">{stats.totalReviews} review{stats.totalReviews === 1 ? '' : 's'}</div>
            {/* Star Rating Tiers */}
            <div className="w-full max-w-xs">
              {[5,4,3,2,1].map(star => {
                const count = stats.ratingDistribution[star] || 0;
                const percent = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                let barColor = 'bg-gray-200';
                if (star === 5) barColor = 'bg-red-500';
                else if (star === 4) barColor = 'bg-gray-200';
                else if (star === 3) barColor = 'bg-orange-400';
                else if (star === 2) barColor = 'bg-yellow-400';
                else if (star === 1) barColor = 'bg-yellow-300';
                return (
                  <div key={star} className="flex items-center mb-2">
                    <span className="w-12 text-sm text-gray-700">{star} star{star > 1 ? 's' : ''}</span>
                    <div className="flex-1 mx-2 h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`${barColor} h-3 rounded-full`} style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="w-6 text-sm text-gray-700 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
            {/* Sidebar content goes here (empty for now) */}
            {advisor && (
              <div className="mt-6">
                <AdvisorLocationMap advisor={{
                  ...advisor,
                  address: [
                    advisor.principal_office_address_1,
                    advisor.principal_office_address_2,
                    advisor.principal_office_city,
                    advisor.principal_office_state,
                    advisor.principal_office_postal_code
                  ].filter(Boolean).join(', ')
                }} height={220} />
                <button
                  className="mt-4 w-full inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => setShowMessageModal(true)}
                >
                  Message Advisor
                </button>
                {/* Action Links */}
                <div className="flex gap-2 mt-4 mb-2">
                  {/* Website */}
                  <a
                    href={advisor.website_address || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-4 py-2 rounded-full border border-gray-300 bg-white text-blue-600 hover:bg-blue-50 text-sm font-medium transition"
                  >
                    <GlobeAltIcon className="h-5 w-5 text-blue-500" /> Website
                  </a>
                  {/* Reviews */}
                  <button
                    className="flex items-center gap-1 px-4 py-2 rounded-full border border-gray-300 bg-white text-blue-600 hover:bg-blue-50 text-sm font-medium transition"
                    onClick={() => {
                      const el = document.getElementById('reviews-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <StarIcon className="h-5 w-5 text-blue-500" /> Reviews
                  </button>
                  {/* Share */}
                  <button
                    className="flex items-center gap-1 px-4 py-2 rounded-full border border-gray-300 bg-white text-blue-600 hover:bg-blue-50 text-sm font-medium transition"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      // Optionally show a toast/alert
                    }}
                  >
                    <ShareIcon className="h-5 w-5 text-blue-500" /> Share
                  </button>
                </div>
                {/* SEC Adviser Info Button */}
                <a
                  href={`https://adviserinfo.sec.gov/individual/summary/${advisor.crd_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 w-full inline-flex items-center justify-center rounded-md bg-white border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                  style={{ fontWeight: 600 }}
                >
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2" />
                  Look up on SEC Advisor Info
                </a>
                {showMessageModal && (
                  <MessageAdvisorModal
                    advisorId={advisor.id}
                    advisorName={advisor.primary_business_name}
                    onClose={() => setShowMessageModal(false)}
                    onMessageSent={() => {}}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Write Review Modal */}
      {showReviewModal && (
        <WriteReviewModal
          advisorId={id}
          advisorName={cleanFirmName(advisor.primary_business_name)}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={(newReview) => {
            setReviews(prev => [newReview, ...prev]);
            setShowReviewModal(false);
          }}
        />
      )}
    </div>
  );
};

// Helper function for time ago
function timeAgo(date) {
  const now = new Date();
  const d = date?.toDate ? date.toDate() : new Date(date);
  const seconds = Math.floor((now - d) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

export default AdvisorProfile; 