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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
              Find Your Perfect Financial Advisor
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Connect with trusted, fiduciary financial advisors in your area. Read reviews, compare services, and make an informed decision.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                to="/directory"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Find an Advisor
                <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                <i className="fas fa-shield-alt text-xl"></i>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Fiduciary Standard</h3>
              <p className="mt-2 text-base text-gray-500">
                All advisors are held to the highest fiduciary standard, putting your interests first.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                <i className="fas fa-star text-xl"></i>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Verified Reviews</h3>
              <p className="mt-2 text-base text-gray-500">
                Read authentic reviews from real clients to help you make an informed decision.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                <i className="fas fa-search text-xl"></i>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Easy Comparison</h3>
              <p className="mt-2 text-base text-gray-500">
                Compare advisors based on services, fees, and client reviews all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Advisors Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Featured Advisors
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Top-rated financial advisors in your area
            </p>
          </div>

          {loading ? (
            <div className="mt-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="mt-12 text-center text-red-600">
              {error}
            </div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredAdvisors.map(advisor => (
                <AdvisorCard key={advisor.id} advisor={advisor} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              to="/directory"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              View All Advisors
              <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to find your advisor?</span>
            <span className="block text-primary-200">Start your search today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/directory"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50"
              >
                Get Started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
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