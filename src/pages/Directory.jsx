import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';
import { SearchFilters } from '../components/directory/SearchFilters';
import AdvisorCard from '../components/advisors/AdvisorCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { filterAdvisorsByDistance, getCurrentLocation, geocodeAddress } from '../services/geolocationService';
import { SortOptions } from '../components/directory/SortOptions';
import { AdvisorComparison } from '../components/directory/AdvisorComparison';
import ShareSearchModal from '../components/directory/ShareSearchModal';
import AdvisorQuickView from '../components/directory/AdvisorQuickView';
import { MapIcon, Squares2X2Icon, BookmarkIcon, ShareIcon, ChartBarIcon, ChatBubbleLeftIcon, UserGroupIcon, Cog6ToothIcon, ClockIcon, CalendarIcon, ChatBubbleLeftRightIcon, ArrowsRightLeftIcon, ArrowDownTrayIcon, ChartBarSquareIcon, MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import RecentlyViewedAdvisors from '../components/directory/RecentlyViewedAdvisors';
import SimilarAdvisors from '../components/directory/SimilarAdvisors';
import SearchHistory from '../components/directory/SearchHistory';
import FeaturedAdvisors from '../components/directory/FeaturedAdvisors';
import PopularSearches from '../components/directory/PopularSearches';
import SearchInsights from '../components/directory/SearchInsights';
import SearchSuggestions from '../components/directory/SearchSuggestions';
import FilterTags from '../components/directory/FilterTags';
import SearchTips from '../components/directory/SearchTips';
import SearchAnalytics from '../components/directory/SearchAnalytics';
import SavedSearches from '../components/directory/SavedSearches';
import SearchFilterPresets from '../components/directory/SearchFilterPresets';
import SearchResultsSummary from '../components/directory/SearchResultsSummary';
import SearchExport from '../components/directory/SearchExport';
import SearchFeedback from '../components/directory/SearchFeedback';
import SearchTrends from '../components/directory/SearchTrends';
import SearchNotifications from '../components/directory/SearchNotifications';
import SearchComparison from '../components/directory/SearchComparison';
import SearchBookmarks from '../components/directory/SearchBookmarks';
import SearchRecommendations from '../components/directory/SearchRecommendations';
import SearchFiltersHistory from '../components/directory/SearchFiltersHistory';
import SearchResultsExport from '../components/directory/SearchResultsExport';
import SearchCollaboration from '../components/directory/SearchCollaboration';
import SearchPreferences from '../components/directory/SearchPreferences';
import SearchInsightsDashboard from '../components/directory/SearchInsightsDashboard';
import SearchResultsComparison from '../components/directory/SearchResultsComparison';
import SearchResultsTimeline from '../components/directory/SearchResultsTimeline';
import SearchResultsMap from '../components/directory/SearchResultsMap';
import SearchResultsCalendar from '../components/directory/SearchResultsCalendar';
import SearchResultsReviews from '../components/directory/SearchResultsReviews';
import SearchResultsAnalytics from '../components/directory/SearchResultsAnalytics';
import SaveSearchModal from '../components/directory/SaveSearchModal';
import { db } from '../firebase';

const Directory = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('rating');
  const [comparisonAdvisors, setComparisonAdvisors] = useState([]);
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [showShareSearchModal, setShowShareSearchModal] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showTrends, setShowTrends] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [currentSearch, setCurrentSearch] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showFiltersHistory, setShowFiltersHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showInsightsDashboard, setShowInsightsDashboard] = useState(false);
  const [showResultsComparison, setShowResultsComparison] = useState(false);
  const [showResultsTimeline, setShowResultsTimeline] = useState(false);
  const [searchSets, setSearchSets] = useState([]);
  const [selectedSearchSets, setSelectedSearchSets] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const RESULTS_PER_PAGE = 10;

  const getCurrentFilters = () => {
    return {
      query: searchParams.get('q'),
      location: searchParams.get('location'),
      radius: searchParams.get('radius'),
      minRating: searchParams.get('minRating'),
      specializations: searchParams.get('specializations')?.split(','),
      certifications: searchParams.get('certifications')?.split(','),
      verifiedOnly: searchParams.get('verifiedOnly') === 'true',
      feeOnly: searchParams.get('feeOnly') === 'true',
    };
  };

  // Get user's location when component mounts
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
        setLocationError(null);
      } catch (err) {
        console.error('Error getting user location:', err);
        setLocationError('Unable to get your location. You can still search by entering a location manually.');
      }
    };

    getUserLocation();
  }, []);

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query based on filters
        let advisorsQuery = query(collection(db, 'state_adv_part_1_data'));

        // Apply filters from URL parameters
        const filters = getCurrentFilters();

        // Add where clauses based on filters
        if (filters.verifiedOnly) {
          advisorsQuery = query(advisorsQuery, where('verified', '==', true));
        }
        if (filters.feeOnly) {
          advisorsQuery = query(advisorsQuery, where('feeOnly', '==', true));
        }
        if (filters.minRating) {
          advisorsQuery = query(advisorsQuery, where('averageRating', '>=', parseFloat(filters.minRating)));
        }
        if (filters.specializations?.length > 0) {
          advisorsQuery = query(advisorsQuery, where('specializations', 'array-contains-any', filters.specializations));
        }
        if (filters.certifications?.length > 0) {
          advisorsQuery = query(advisorsQuery, where('certifications', 'array-contains-any', filters.certifications));
        }

        // Add ordering and limit
        advisorsQuery = query(
          advisorsQuery,
          orderBy('averageRating', 'desc'),
          orderBy('reviewCount', 'desc'),
          limit(RESULTS_PER_PAGE)
        );

        const snapshot = await getDocs(advisorsQuery);
        let advisorsData = snapshot.docs.map(doc => {
          const data = doc.data();
          // Only keep the selected fields
          return {
            id: doc.id,
            crd_number: data.crd_number,
            primary_business_name: data.primary_business_name,
            principal_office_address_1: data.principal_office_address_1,
            principal_office_address_2: data.principal_office_address_2,
            principal_office_city: data.principal_office_city,
            principal_office_state: data.principal_office_state,
            principal_office_postal_code: data.principal_office_postal_code,
            principal_office_telephone_number: data.principal_office_telephone_number,
            website_address: data.website_address,
            status_effective_date: data.status_effective_date,
            '5b1_how_many_employees_perform_investmen': data['5b1_how_many_employees_perform_investmen'],
            '5f2_assets_under_management_total_number': data['5f2_assets_under_management_total_number'],
            '5f2_assets_under_management_total_us_dol': data['5f2_assets_under_management_total_us_dol'],
          };
        });

        // Filter by location if specified
        if (filters.location) {
          try {
            const locationCoords = await geocodeAddress(filters.location);
            advisorsData = filterAdvisorsByDistance(advisorsData, locationCoords, filters.radius);
          } catch (err) {
            console.error('Error geocoding location:', err);
            // Fall back to text-based filtering if geocoding fails
            advisorsData = advisorsData.filter(advisor => 
              advisor.location?.toLowerCase().includes(filters.location.toLowerCase())
            );
          }
        } else if (userLocation) {
          // Use user's location if available and no location filter is specified
          advisorsData = filterAdvisorsByDistance(advisorsData, userLocation, filters.radius);
        }

        // Filter by search query if specified
        if (filters.query) {
          const queryLower = filters.query.toLowerCase();
          advisorsData = advisorsData.filter(advisor =>
            advisor.name?.toLowerCase().includes(queryLower) ||
            advisor.company?.toLowerCase().includes(queryLower) ||
            advisor.specializations?.some(spec => spec.toLowerCase().includes(queryLower)) ||
            advisor.certifications?.some(cert => cert.toLowerCase().includes(queryLower))
          );
        }

        // Sort advisors
        advisorsData = sortAdvisors(advisorsData, sortBy, userLocation);

        setAdvisors(advisorsData);
        setTotalResults(advisorsData.length);
        setHasMore(snapshot.docs.length === RESULTS_PER_PAGE);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      } catch (err) {
        console.error('Error fetching advisors:', err);
        setError('Failed to load advisors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisors();
  }, [searchParams, userLocation, sortBy]);

  useEffect(() => {
    // Add current search to history
    if (searchParams.toString()) {
      const searchHistory = new SearchHistory();
      searchHistory.addToHistory(searchParams);
    }
  }, [searchParams]);

  // Add new useEffect for managing search sets
  useEffect(() => {
    if (advisors.length > 0) {
      const newSearchSet = {
        id: Date.now(),
        name: `Search ${searchSets.length + 1}`,
        timestamp: new Date().toISOString(),
        advisors,
        filters: getCurrentFilters(),
      };

      setSearchSets(prev => [...prev, newSearchSet].slice(-10)); // Keep last 10 searches
    }
  }, [advisors, getCurrentFilters]);

  const sortAdvisors = (advisors, sortBy, userLocation) => {
    return [...advisors].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'reviews':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'company':
          return (a.company || '').localeCompare(b.company || '');
        case 'distance':
          if (!userLocation) return 0;
          const distA = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            a.latitude,
            a.longitude
          );
          const distB = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            b.latitude,
            b.longitude
          );
          return distA - distB;
        default:
          return 0;
      }
    });
  };

  const handleAdvisorClick = (advisor) => {
    setSelectedAdvisor(advisor);
    setShowQuickView(true);
  };

  const handleCompareAdvisor = (advisor) => {
    if (comparisonAdvisors.length >= 3) {
      // Replace the oldest advisor
      setComparisonAdvisors(prev => [...prev.slice(1), advisor]);
    } else {
      setComparisonAdvisors(prev => [...prev, advisor]);
    }
  };

  const handleRemoveFromComparison = (advisorId) => {
    setComparisonAdvisors(prev => prev.filter(a => a.id !== advisorId));
  };

  const handleSaveSearch = (savedSearch) => {
    // TODO: Show a success notification
    console.log('Search saved:', savedSearch);
  };

  const handleSearch = async (searchParams) => {
    // Add to search history
    const historyItem = {
      query: searchParams.get('q') || '',
      criteria: {
        location: searchParams.get('location'),
        radius: searchParams.get('radius'),
        minRating: searchParams.get('minRating'),
        specializations: searchParams.get('specializations')?.split(','),
        certifications: searchParams.get('certifications')?.split(','),
        verifiedOnly: searchParams.get('verifiedOnly') === 'true',
        feeOnly: searchParams.get('feeOnly') === 'true',
      },
      timestamp: new Date().toISOString(),
    };

    const currentHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const newHistory = [historyItem, ...currentHistory.filter(item => 
      JSON.stringify(item.criteria) !== JSON.stringify(historyItem.criteria)
    )].slice(0, 10); // Keep last 10 searches
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    // Update URL and fetch results
    navigate(`/directory?${searchParams.toString()}`);
    fetchAdvisors(searchParams);

    // Save current search for comparison and bookmarks
    setCurrentSearch({
      id: Date.now().toString(),
      name: `Search ${new Date().toLocaleDateString()}`,
      advisors: advisors,
      filters: searchParams,
      timestamp: new Date().toISOString(),
    });

    // Add to search history
    const searchEntry = {
      timestamp: new Date().toISOString(),
      filters: searchParams,
      results: advisors.length,
    };
    setSearchHistory(prev => [searchEntry, ...prev].slice(0, 100)); // Keep last 100 searches
  };

  const handleLoadSearch = (search) => {
    // Apply the saved search
    setFilters(search.filters);
    setAdvisors(search.advisors);
    setCurrentSearch(search);
  };

  const handleCompare = (metrics) => {
    // Handle comparison metrics if needed
    console.log('Comparison metrics:', metrics);
  };

  const handleSavePreferences = async (newPreferences) => {
    try {
      // In a real implementation, this would save to your backend
      console.log('Saving preferences:', newPreferences);
      // Update local state or trigger necessary updates
    } catch (err) {
      console.error('Error saving preferences:', err);
      throw err;
    }
  };

  // Add new handlers for the new features
  const handleToggleInsightsDashboard = () => {
    setShowInsightsDashboard(prev => !prev);
    if (showResultsComparison) setShowResultsComparison(false);
    if (showResultsTimeline) setShowResultsTimeline(false);
  };

  const handleToggleResultsComparison = () => {
    setShowResultsComparison(prev => !prev);
    if (showInsightsDashboard) setShowInsightsDashboard(false);
    if (showResultsTimeline) setShowResultsTimeline(false);
  };

  const handleToggleResultsTimeline = () => {
    setShowResultsTimeline(prev => !prev);
    if (showInsightsDashboard) setShowInsightsDashboard(false);
    if (showResultsComparison) setShowResultsComparison(false);
  };

  const handleSelectSearchSet = (setId) => {
    setSelectedSearchSets(prev => {
      if (prev.includes(setId)) {
        return prev.filter(id => id !== setId);
      }
      return [...prev, setId].slice(-2); // Allow comparing up to 2 search sets
    });
  };

  const handleToggleMap = () => {
    setShowMap(!showMap);
    if (showCalendar) setShowCalendar(false);
    if (showReviews) setShowReviews(false);
  };

  const handleToggleCalendar = () => {
    setShowCalendar(!showCalendar);
    if (showMap) setShowMap(false);
    if (showReviews) setShowReviews(false);
  };

  const handleToggleReviews = () => {
    setShowReviews(!showReviews);
    if (showMap) setShowMap(false);
    if (showCalendar) setShowCalendar(false);
  };

  const handleToggleExport = () => {
    setShowExport(prev => !prev);
    // Close other views when opening export
    if (!showExport) {
      setShowMap(false);
      setShowCalendar(false);
      setShowReviews(false);
      setShowInsightsDashboard(false);
      setShowResultsComparison(false);
      setShowResultsTimeline(false);
    }
  };

  const handleToggleAnalytics = () => {
    setShowAnalytics(prev => !prev);
    // Close other views when opening analytics
    if (!showAnalytics) {
      setShowMap(false);
      setShowCalendar(false);
      setShowReviews(false);
      setShowInsightsDashboard(false);
      setShowResultsComparison(false);
      setShowResultsTimeline(false);
      setShowExport(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="w-full lg:w-80 space-y-4 lg:space-y-6">
            <SearchTips />
            <SearchFilters
              filters={getCurrentFilters()}
              onFilterChange={(newFilters) => {
                // Handle filter change
              }}
              onLocationChange={(newLocation) => {
                // Handle location change
              }}
              userLocation={userLocation}
            />
            <SearchFilterPresets onApplyPreset={(newFilters) => {
              // Handle applying a preset
            }} />
            {showFiltersHistory && (
              <SearchFiltersHistory
                onApplyFilters={(newFilters) => {
                  // Handle applying new filters
                }}
                currentFilters={getCurrentFilters()}
              />
            )}
            {!Object.keys(getCurrentFilters()).length && !searchQuery && (
              <>
                <SearchHistory onSearch={handleSearch} />
                <RecentlyViewedAdvisors onAdvisorClick={handleAdvisorClick} />
                <SearchTrends />
              </>
            )}
            {showAnalytics && <SearchAnalytics />}
            {currentUser && <SearchNotifications />}
            <SearchBookmarks
              currentSearch={currentSearch}
              onLoadSearch={handleLoadSearch}
            />
            {showComparison && (
              <SearchComparison
                currentSearch={currentSearch}
                onCompare={handleCompare}
              />
            )}
            {showCollaboration && currentUser && (
              <SearchCollaboration
                currentUser={currentUser}
                advisors={advisors}
                filters={getCurrentFilters()}
                onApplyFilters={(newFilters) => {
                  // Handle applying new filters
                }}
              />
            )}
            {showPreferences && (
              <SearchPreferences
                currentUser={currentUser}
                onSavePreferences={handleSavePreferences}
              />
            )}
          </div>

          <div className="flex-1 space-y-4 sm:space-y-6">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {searchQuery ? `Search Results for "${searchQuery}"` : 'All Advisors'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {advisors.length} {advisors.length === 1 ? 'advisor' : 'advisors'} found
                    </p>
                  </div>
                  
                  {/* Mobile-optimized toolbar */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {/* Primary actions - always visible */}
                    <div className="flex items-center gap-2">
                      <SortOptions
                        currentSort={sortBy}
                        onSortChange={(newSort) => {
                          // Handle sort change
                        }}
                      />
                      
                      {/* View mode toggle */}
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                            viewMode === 'grid'
                              ? 'bg-blue-100 text-blue-600'
                              : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
                          }`}
                          title="Grid View"
                        >
                          <Squares2X2Icon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setViewMode('map')}
                          className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center border-l border-gray-300 ${
                            viewMode === 'map'
                              ? 'bg-blue-100 text-blue-600'
                              : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
                          }`}
                          title="Map View"
                        >
                          <MapIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Secondary actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowFeedback(true)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px]"
                      >
                        <ChatBubbleLeftIcon className="h-4 w-4 sm:mr-2 text-gray-400" />
                        <span className="hidden sm:inline">Feedback</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {advisors.length > 0 && (
              <SearchResultsSummary advisors={advisors} filters={getCurrentFilters()} />
            )}

            {/* Results Content */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading advisors...</p>
                </div>
              </div>
            ) : advisors.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="max-w-md mx-auto">
                  <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No advisors found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search criteria or location.</p>
                  <button
                    onClick={() => {
                      // Clear filters and reload
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {advisors.map((advisor) => (
                  <AdvisorCard
                    key={advisor.id}
                    advisor={advisor}
                    onCompare={() => handleCompareAdvisor(advisor)}
                    isInComparison={comparisonAdvisors.some(a => a.id === advisor.id)}
                    onAdvisorClick={() => handleAdvisorClick(advisor)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-96 sm:h-[500px] lg:h-[600px] relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <MapIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Map view coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Load More Button */}
            {hasMore && advisors.length > 0 && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => {
                    // Handle load more
                  }}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] transition-colors"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading more...
                    </>
                  ) : (
                    <>
                      Load More Advisors
                      <ChevronDownIcon className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            )}

            {advisors.length > 0 && (
              <SearchExport advisors={advisors} filters={getCurrentFilters()} />
            )}

            {/* Search Results Header */}
            <div className="bg-white shadow">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      Search Results ({advisors.length})
                    </h2>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleToggleMap}
                        className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                          showMap
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <MapIcon className="h-4 w-4 mr-1.5" />
                        Map View
                      </button>
                      <button
                        onClick={handleToggleCalendar}
                        className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                          showCalendar
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <CalendarIcon className="h-4 w-4 mr-1.5" />
                        Calendar
                      </button>
                      <button
                        onClick={handleToggleReviews}
                        className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                          showReviews
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1.5" />
                        Reviews
                      </button>
                      <button
                        onClick={handleToggleAnalytics}
                        className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                          showAnalytics
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <ChartBarSquareIcon className="h-4 w-4 mr-1.5" />
                        Analytics
                      </button>
                      <button
                        onClick={handleToggleInsightsDashboard}
                        className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                          showInsightsDashboard
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <ChartBarIcon className="h-4 w-4 mr-1.5" />
                        Insights
                      </button>
                      <button
                        onClick={handleToggleResultsComparison}
                        className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                          showResultsComparison
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <ArrowsRightLeftIcon className="h-4 w-4 mr-1.5" />
                        Compare
                      </button>
                      <button
                        onClick={handleToggleResultsTimeline}
                        className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                          showResultsTimeline
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <ClockIcon className="h-4 w-4 mr-1.5" />
                        Timeline
                      </button>
                      <button
                        onClick={handleToggleExport}
                        className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                          showExport
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
                        Export
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {comparisonAdvisors.length > 0 && (
        <AdvisorComparison
          advisors={comparisonAdvisors}
          onRemoveAdvisor={handleRemoveFromComparison}
        />
      )}

      {selectedAdvisor && (
        <AdvisorQuickView
          isOpen={!!selectedAdvisor}
          onClose={() => setSelectedAdvisor(null)}
          advisor={selectedAdvisor}
          onCompare={() => handleCompareAdvisor(selectedAdvisor)}
          isInComparison={comparisonAdvisors.some(a => a.id === selectedAdvisor.id)}
          isAuthenticated={isAuthenticated}
        />
      )}

      {showSaveSearchModal && (
        <SaveSearchModal
          isOpen={showSaveSearchModal}
          onClose={() => setShowSaveSearchModal(false)}
          currentFilters={getCurrentFilters()}
          onSave={handleSaveSearch}
        />
      )}

       {showShareSearchModal && (
        <ShareSearchModal
          isOpen={showShareSearchModal}
          onClose={() => setShowShareSearchModal(false)}
          searchUrl={window.location.href}
          searchTitle={`Financial Advisors in ${searchParams.get('location') || 'Your Area'}`}
        />
      )}
    </div>
  );
} // <--- This closes the Directory component function

export default Directory;