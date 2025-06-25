// App-wide constants and configuration

export const APP_NAME = 'MyLocalRIA';
export const APP_VERSION = '1.0.0';

// API endpoints
export const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Firebase collections
export const COLLECTIONS = {
  ADVISORS: 'advisors',
  USERS: 'users',
  REVIEWS: 'reviews',
  SAVED_SEARCHES: 'savedSearches',
  NOTIFICATIONS: 'notifications',
};

// Search constants
export const SEARCH_DEFAULTS = {
  RESULTS_PER_PAGE: 10,
  MAX_DISTANCE_MILES: 50,
  DEFAULT_SORT: 'relevance',
};

// Review constants
export const REVIEW_CONSTANTS = {
  MIN_RATING: 1,
  MAX_RATING: 5,
  MIN_COMMENT_LENGTH: 10,
  MAX_COMMENT_LENGTH: 1000,
};

// Map constants
export const MAP_DEFAULTS = {
  CENTER: { lat: 47.6062, lng: -122.3321 }, // Seattle
  ZOOM: 10,
};

// Feature flags
export const FEATURES = {
  ENABLE_SOCIAL_LOGIN: true,
  ENABLE_ADVISOR_REGISTRATION: true,
  ENABLE_REVIEW_MODERATION: true,
  ENABLE_ADVANCED_SEARCH: true,
};