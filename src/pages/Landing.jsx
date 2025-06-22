import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import AdvisorCard from '../components/advisors/AdvisorCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Landing = () => {
  const [featuredAdvisors, setFeaturedAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedAdvisors = async () => {
      try {
        const advisorsRef = collection(db, 'state_adv_part_1_data');
        const q = query(
          advisorsRef,
          orderBy('5f2_assets_under_management_total_us_dol', 'desc'),
          limit(3)
        );
        
        const querySnapshot = await getDocs(q);
        const advisors = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setFeaturedAdvisors(advisors);
      } catch (err) {
        console.error('Error fetching featured advisors:', err);
        setError('Failed to load featured advisors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedAdvisors();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl tracking-tight font-extrabold leading-tight">
              <span className="block">Find Your Perfect</span>
              <span className="block">Financial Advisor</span>
            </h1>
            <p className="mt-4 sm:mt-6 max-w-lg sm:max-w-2xl lg:max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-primary-100 leading-relaxed">
              Connect with trusted, fiduciary financial advisors in your area. Read reviews, compare services, and make an informed decision.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/directory"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent text-base sm:text-lg font-medium rounded-lg text-primary-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 transition-all duration-200 min-h-[48px] shadow-lg hover:shadow-xl"
              >
                Find an Advisor
                <i className="fas fa-arrow-right ml-2"></i>
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-white text-base sm:text-lg font-medium rounded-lg text-white hover:bg-white hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200 min-h-[48px]"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-lg bg-primary-500 text-white mx-auto mb-4 sm:mb-6">
                <i className="fas fa-shield-alt text-xl sm:text-2xl"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                Fiduciary Standard
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                All advisors are held to the highest fiduciary standard, putting your interests first.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-lg bg-primary-500 text-white mx-auto mb-4 sm:mb-6">
                <i className="fas fa-star text-xl sm:text-2xl"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                Verified Reviews
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Read authentic reviews from real clients to help you make an informed decision.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-lg bg-primary-500 text-white mx-auto mb-4 sm:mb-6">
                <i className="fas fa-search text-xl sm:text-2xl"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                Easy Comparison
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Compare advisors based on services, fees, and client reviews all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Advisors Section */}
      <div className="bg-gray-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
              Featured Advisors
            </h2>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 leading-relaxed">
              Top-rated financial advisors in your area
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="text-red-600 mb-4 text-lg">
                {error}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 min-h-[44px]"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-12">
              {featuredAdvisors.map(advisor => (
                <AdvisorCard key={advisor.id} advisor={advisor} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              to="/directory"
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent text-base sm:text-lg font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 min-h-[48px] shadow-lg hover:shadow-xl"
            >
              View All Advisors
              <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-700">
        <div className="max-w-7xl mx-auto py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="mb-8 lg:mb-0">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                <span className="block">Ready to find your advisor?</span>
                <span className="block text-primary-200 mt-2">Start your search today.</span>
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 lg:flex-shrink-0">
              <Link
                to="/directory"
                className="inline-flex items-center justify-center px-6 py-3 sm:py-4 border border-transparent text-base sm:text-lg font-medium rounded-lg text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-700 transition-all duration-200 min-h-[48px] shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-6 py-3 sm:py-4 border border-white text-base sm:text-lg font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-700 transition-all duration-200 min-h-[48px]"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing; 