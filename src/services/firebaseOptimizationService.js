import { 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  writeBatch, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Cache configuration
const CACHE_DURATION = {
  SEARCH_RESULTS: 15 * 60 * 1000, // 15 minutes
  USER_PROFILE: 30 * 60 * 1000,   // 30 minutes
  ADVISOR_PROFILE: 10 * 60 * 1000, // 10 minutes
  SEARCH_SUGGESTIONS: 60 * 60 * 1000 // 1 hour
};

// Cache utilities
export const cacheUtils = {
  set: (key, data, duration = CACHE_DURATION.SEARCH_RESULTS) => {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expires: Date.now() + duration
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
  },

  get: (key) => {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached);
      if (Date.now() > cacheData.expires) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
      
      return cacheData.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  clear: (pattern) => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(`cache_${pattern}`)) {
        localStorage.removeItem(key);
      }
    });
  },

  clearExpired: () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        try {
          const cached = JSON.parse(localStorage.getItem(key));
          if (Date.now() > cached.expires) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          localStorage.removeItem(key);
        }
      }
    });
  }
};

// Optimized advisor profile fetching with denormalized data
export const fetchAdvisorProfileOptimized = async (advisorId) => {
  const cacheKey = `advisor_${advisorId}`;
  const cached = cacheUtils.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    // Try to get optimized denormalized document first
    const optimizedDoc = await getDoc(doc(db, 'advisor_profiles_optimized', advisorId));
    
    if (optimizedDoc.exists()) {
      const data = optimizedDoc.data();
      cacheUtils.set(cacheKey, data, CACHE_DURATION.ADVISOR_PROFILE);
      return data;
    }

    // Fallback to original multi-query approach
    return await fetchAdvisorProfileLegacy(advisorId);
  } catch (error) {
    console.error('Error fetching optimized advisor profile:', error);
    return await fetchAdvisorProfileLegacy(advisorId);
  }
};

// Legacy advisor profile fetching (fallback)
const fetchAdvisorProfileLegacy = async (advisorId) => {
  const advisorDoc = await getDoc(doc(db, 'state_adv_part_1_data', advisorId));
  if (!advisorDoc.exists()) {
    throw new Error('Advisor not found');
  }

  const advisorData = { id: advisorDoc.id, ...advisorDoc.data() };
  let logoUrl = null;
  let advPart2 = null;
  let advPart2B = null;
  let reviews = [];
  let repNames = [];

  // Batch the remaining queries for efficiency
  const promises = [];

  if (advisorData.crd_number) {
    // Logo query
    promises.push(
      getDocs(query(
        collection(db, 'adviser_logos'),
        where('crd_number', '==', advisorData.crd_number),
        limit(1)
      )).then(snapshot => {
        if (!snapshot.empty) {
          logoUrl = snapshot.docs[0].data().logo_url;
        }
      })
    );

    // ADV Part 2 query
    promises.push(
      getDocs(query(
        collection(db, 'adv_part_2_data'),
        where('crd_number', '==', advisorData.crd_number),
        limit(1)
      )).then(snapshot => {
        if (!snapshot.empty) {
          advPart2 = snapshot.docs[0].data();
        }
      })
    );

    // ADV Part 2B query
    promises.push(
      getDocs(query(
        collection(db, 'adv_part_2b_data'),
        where('crd_number', '==', advisorData.crd_number)
      )).then(snapshot => {
        repNames = snapshot.docs
          .map(doc => doc.data().rep_name)
          .filter(Boolean);
        if (!snapshot.empty) {
          advPart2B = snapshot.docs[0].data();
        }
      })
    );
  }

  // Reviews query
  promises.push(
    getDocs(query(
      collection(db, 'reviews'),
      where('advisorId', '==', advisorId),
      orderBy('createdAt', 'desc'),
      limit(10) // Limit initial reviews, load more on demand
    )).then(snapshot => {
      reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    })
  );

  await Promise.all(promises);

  // Calculate review statistics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
    : 0;
  const ratingDistribution = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

  const result = {
    advisor: advisorData,
    logoUrl,
    advPart2,
    advPart2B,
    reviews,
    repNames,
    stats: {
      totalReviews,
      averageRating,
      ratingDistribution
    }
  };

  // Cache the result
  const cacheKey = `advisor_${advisorId}`;
  cacheUtils.set(cacheKey, result, CACHE_DURATION.ADVISOR_PROFILE);

  return result;
};

// Optimized search with client-side filtering and caching
export const searchOptimized = async (searchParams) => {
  const cacheKey = `search_${JSON.stringify(searchParams)}`;
  const cached = cacheUtils.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    // Build optimized query with single orderBy
    let advisorsQuery = query(collection(db, 'state_adv_part_1_data'));

    // Apply only the most selective filters to reduce query cost
    if (searchParams.verifiedOnly) {
      advisorsQuery = query(advisorsQuery, where('verified', '==', true));
    }
    if (searchParams.minRating) {
      advisorsQuery = query(advisorsQuery, where('averageRating', '>=', parseFloat(searchParams.minRating)));
    }

    // Use single composite score for sorting instead of multiple orderBy
    advisorsQuery = query(
      advisorsQuery,
      orderBy('compositeScore', 'desc'), // Pre-calculated score
      limit(50) // Reduced from potentially larger limits
    );

    const snapshot = await getDocs(advisorsQuery);
    let advisorsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply additional filters client-side to reduce database query complexity
    if (searchParams.feeOnly) {
      advisorsData = advisorsData.filter(advisor => advisor.feeOnly);
    }
    if (searchParams.specializations?.length > 0) {
      advisorsData = advisorsData.filter(advisor => 
        advisor.specializations?.some(spec => 
          searchParams.specializations.includes(spec)
        )
      );
    }
    if (searchParams.query) {
      const queryLower = searchParams.query.toLowerCase();
      advisorsData = advisorsData.filter(advisor =>
        advisor.primary_business_name?.toLowerCase().includes(queryLower) ||
        advisor.specializations?.some(spec => spec.toLowerCase().includes(queryLower))
      );
    }

    const result = {
      advisors: advisorsData.slice(0, 20), // Limit results shown
      totalResults: advisorsData.length,
      hasMore: advisorsData.length > 20
    };

    cacheUtils.set(cacheKey, result, CACHE_DURATION.SEARCH_RESULTS);
    return result;
  } catch (error) {
    console.error('Error in optimized search:', error);
    throw error;
  }
};

// Optimized search suggestions with pre-built index
export const getSearchSuggestionsOptimized = async (query) => {
  if (!query || query.length < 2) return { advisors: [], locations: [], specializations: [] };

  const cacheKey = `suggestions_${query.toLowerCase()}`;
  const cached = cacheUtils.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  // Use pre-built search index instead of expensive range queries
  let searchIndex = cacheUtils.get('search_index');
  
  if (!searchIndex) {
    // Build search index from a single optimized document
    try {
      const indexDoc = await getDoc(doc(db, 'search_metadata', 'suggestions_index'));
      if (indexDoc.exists()) {
        searchIndex = indexDoc.data();
        cacheUtils.set('search_index', searchIndex, CACHE_DURATION.SEARCH_SUGGESTIONS);
      }
    } catch (error) {
      console.error('Error fetching search index:', error);
    }
  }

  // Fallback to basic suggestions if index doesn't exist
  if (!searchIndex) {
    searchIndex = {
      advisorNames: [],
      locations: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
      specializations: ['Retirement Planning', 'Investment Management', 'Financial Planning', 'Tax Planning']
    };
  }

  const queryLower = query.toLowerCase();
  
  // Client-side filtering - much faster than database queries
  const suggestions = {
    advisors: (searchIndex.advisorNames || [])
      .filter(name => name.toLowerCase().includes(queryLower))
      .slice(0, 3),
    locations: (searchIndex.locations || [])
      .filter(location => location.toLowerCase().includes(queryLower))
      .slice(0, 3),
    specializations: (searchIndex.specializations || [])
      .filter(spec => spec.toLowerCase().includes(queryLower))
      .slice(0, 3)
  };

  cacheUtils.set(cacheKey, suggestions, CACHE_DURATION.SEARCH_SUGGESTIONS);
  return suggestions;
};

// Batch write operations for better efficiency
export const batchWriteOptimized = async (operations) => {
  const batch = writeBatch(db);
  let operationCount = 0;
  const batches = [];

  for (const operation of operations) {
    const { type, ref, data } = operation;

    switch (type) {
      case 'set':
        batch.set(ref, { ...data, updatedAt: serverTimestamp() });
        break;
      case 'update':
        batch.update(ref, { ...data, updatedAt: serverTimestamp() });
        break;
      case 'delete':
        batch.delete(ref);
        break;
    }

    operationCount++;

    // Firestore batch limit is 500 operations
    if (operationCount >= 450) {
      batches.push(batch.commit());
      batch = writeBatch(db);
      operationCount = 0;
    }
  }

  if (operationCount > 0) {
    batches.push(batch.commit());
  }

  return Promise.all(batches);
};

// User profile caching for auth optimization
export const getUserProfileCached = async (uid) => {
  const cacheKey = `user_profile_${uid}`;
  const cached = cacheUtils.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      cacheUtils.set(cacheKey, userData, CACHE_DURATION.USER_PROFILE);
      return userData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Clear all caches (useful for development)
export const clearAllCaches = () => {
  cacheUtils.clear('');
  console.log('All Firebase optimization caches cleared');
};

// Initialize optimization service
export const initializeOptimization = () => {
  // Clear expired caches on startup
  cacheUtils.clearExpired();
  
  // Set up periodic cache cleanup
  setInterval(() => {
    cacheUtils.clearExpired();
  }, 5 * 60 * 1000); // Every 5 minutes

  console.log('Firebase optimization service initialized');
};