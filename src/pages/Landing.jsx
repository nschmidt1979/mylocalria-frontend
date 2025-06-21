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
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 text-white" aria-labelledby="hero-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 id="hero-heading" className="text-4xl tracking-tight font-extrabold text-white drop-shadow-lg sm:text-5xl md:text-6xl">
              Find Your Perfect Financial Advisor
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Connect with trusted, fiduciary financial advisors in your area. Read reviews, compare services, and make an informed decision.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                to="/directory"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 md:py-4 md:text-lg md:px-10"
              >
                Find an Advisor
                <i className="fas fa-arrow-right ml-2" aria-hidden="true"></i>
                <span className="sr-only"> - Search our directory</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="features-heading" className="sr-only">Our Features</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <article className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                <i className="fas fa-shield-alt text-xl" aria-hidden="true"></i>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Fiduciary Standard</h3>
              <p className="mt-2 text-base text-gray-700">
                All advisors are held to the highest fiduciary standard, putting your interests first.
              </p>
            </article>
            <article className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                <i className="fas fa-star text-xl" aria-hidden="true"></i>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Verified Reviews</h3>
              <p className="mt-2 text-base text-gray-700">
                Read authentic reviews from real clients to help you make an informed decision.
              </p>
            </article>
            <article className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                <i className="fas fa-search text-xl" aria-hidden="true"></i>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Easy Comparison</h3>
              <p className="mt-2 text-base text-gray-700">
                Compare advisors based on services, fees, and client reviews all in one place.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Featured Advisors Section */}
      <section className="bg-gray-50 py-12" aria-labelledby="featured-advisors-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 id="featured-advisors-heading" className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Featured Advisors
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-600 sm:mt-4">
              Top-rated financial advisors in your area
            </p>
          </div>

          {loading ? (
            <div className="mt-12" role="status" aria-live="polite">
              <LoadingSpinner size="lg" message="Loading featured advisors" />
            </div>
          ) : error ? (
            <div className="mt-12 text-center text-red-700 bg-red-100 border border-red-300 rounded-md p-4" role="alert">
              {error}
            </div>
          ) : (
            <div className="mt-12">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featuredAdvisors.map(advisor => (
                  <AdvisorCard key={advisor.id} advisor={advisor} />
                ))}
              </div>
              {featuredAdvisors.length === 0 && (
                <div className="text-center text-gray-600 mt-8">
                  <p>No featured advisors available at this time.</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              to="/directory"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-700 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              View All Advisors
              <i className="fas fa-arrow-right ml-2" aria-hidden="true"></i>
              <span className="sr-only"> - Browse our complete directory</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-800" aria-labelledby="cta-heading">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 id="cta-heading" className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to find your advisor?</span>
            <span className="block text-primary-200">Start your search today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/directory"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Get Started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-700 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Landing; 