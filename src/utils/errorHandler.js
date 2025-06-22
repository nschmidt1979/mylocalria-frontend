/**
 * Firebase Error Handler Utility
 * Provides consistent error handling and user-friendly messages
 */

// Firebase error code mappings
const FIREBASE_ERROR_MESSAGES = {
  // Auth errors
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password should be at least 6 characters long.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Contact support.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/requires-recent-login': 'Please log out and log back in to continue.',
  'auth/email-not-verified': 'Please verify your email address before continuing.',

  // Firestore errors
  'permission-denied': 'You do not have permission to perform this action.',
  'not-found': 'The requested data was not found.',
  'already-exists': 'This data already exists.',
  'resource-exhausted': 'Too many requests. Please try again later.',
  'failed-precondition': 'Operation failed due to invalid conditions.',
  'aborted': 'Operation was aborted. Please try again.',
  'out-of-range': 'Request is outside valid range.',
  'unimplemented': 'This feature is not yet implemented.',
  'internal': 'Internal server error. Please try again later.',
  'unavailable': 'Service is temporarily unavailable.',
  'data-loss': 'Data corruption detected. Please contact support.',
  'unauthenticated': 'You must be logged in to perform this action.',
  'invalid-argument': 'Invalid data provided. Please check your input.',
  'deadline-exceeded': 'Request timed out. Please try again.',
  'cancelled': 'Operation was cancelled.',

  // Storage errors
  'storage/object-not-found': 'File not found.',
  'storage/bucket-not-found': 'Storage bucket not found.',
  'storage/project-not-found': 'Project not found.',
  'storage/quota-exceeded': 'Storage quota exceeded.',
  'storage/unauthenticated': 'You must be logged in to access files.',
  'storage/unauthorized': 'You do not have permission to access this file.',
  'storage/retry-limit-exceeded': 'Upload failed. Please try again.',
  'storage/invalid-checksum': 'File upload was corrupted. Please try again.',
  'storage/canceled': 'Upload was cancelled.',
  'storage/invalid-event-name': 'Invalid upload event.',
  'storage/invalid-url': 'Invalid file URL.',
  'storage/invalid-argument': 'Invalid file or arguments.',
  'storage/no-default-bucket': 'No storage bucket configured.',
  'storage/cannot-slice-blob': 'File processing error.',
  'storage/server-file-wrong-size': 'File size mismatch.',
};

// Default messages for different categories
const DEFAULT_MESSAGES = {
  auth: 'Authentication error. Please try logging in again.',
  firestore: 'Database error. Please try again later.',
  storage: 'File operation failed. Please try again.',
  network: 'Network error. Please check your connection and try again.',
  unknown: 'An unexpected error occurred. Please try again.',
};

/**
 * Get user-friendly error message from Firebase error
 * @param {Error} error - Firebase error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) return DEFAULT_MESSAGES.unknown;

  // Check for specific error codes
  if (error.code && FIREBASE_ERROR_MESSAGES[error.code]) {
    return FIREBASE_ERROR_MESSAGES[error.code];
  }

  // Check for network errors
  if (error.message && error.message.toLowerCase().includes('network')) {
    return DEFAULT_MESSAGES.network;
  }

  // Category-based fallbacks
  if (error.code) {
    if (error.code.startsWith('auth/')) {
      return DEFAULT_MESSAGES.auth;
    }
    if (error.code.startsWith('storage/')) {
      return DEFAULT_MESSAGES.storage;
    }
    // Firestore errors don't have a prefix
    return DEFAULT_MESSAGES.firestore;
  }

  // Use original message if it's user-friendly
  if (error.message && error.message.length < 200 && !error.message.includes('Firebase')) {
    return error.message;
  }

  return DEFAULT_MESSAGES.unknown;
};

/**
 * Log error details for debugging (in development) and monitoring
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @param {Object} metadata - Additional metadata
 */
export const logError = (error, context = 'Unknown', metadata = {}) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    code: error.code,
    message: error.message,
    stack: error.stack,
    metadata,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}] Firebase Error:`, errorInfo);
  }

  // In production, you would send this to your monitoring service
  // e.g., Sentry, LogRocket, or Firebase Crashlytics
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to monitoring service
    // monitoringService.logError(errorInfo);
  }
};

/**
 * Handle Firebase errors consistently across the app
 * @param {Error} error - Firebase error
 * @param {string} context - Context where error occurred
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Object with user message and whether to retry
 */
export const handleFirebaseError = (error, context = 'Unknown', metadata = {}) => {
  logError(error, context, metadata);
  
  const userMessage = getErrorMessage(error);
  
  // Determine if operation should be retryable
  const retryableErrors = [
    'network-request-failed',
    'unavailable',
    'deadline-exceeded',
    'resource-exhausted',
    'aborted',
    'cancelled',
  ];
  
  const canRetry = error.code && retryableErrors.includes(error.code);
  
  return {
    message: userMessage,
    canRetry,
    code: error.code || 'unknown',
    isAuthError: error.code && error.code.startsWith('auth/'),
    isPermanent: !canRetry && !['network-request-failed', 'cancelled'].includes(error.code),
  };
};

/**
 * Create a standardized error for the application
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} metadata - Additional metadata
 * @returns {Error} Standardized error object
 */
export const createAppError = (message, code = 'app-error', metadata = {}) => {
  const error = new Error(message);
  error.code = code;
  error.metadata = metadata;
  error.timestamp = new Date().toISOString();
  return error;
};

/**
 * Retry wrapper for Firebase operations
 * @param {Function} operation - Async operation to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise} Result of the operation
 */
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      const errorDetails = handleFirebaseError(error, 'RetryOperation', { attempt });
      
      // Don't retry if it's not a retryable error
      if (!errorDetails.canRetry || attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw lastError;
};

/**
 * Validate user permissions before operations
 * @param {Object} user - Current user object
 * @param {string} operation - Operation being performed
 * @returns {boolean} Whether user has permission
 */
export const validateUserPermissions = (user, operation) => {
  if (!user) {
    throw createAppError('You must be logged in to perform this action.', 'auth/unauthenticated');
  }
  
  if (!user.emailVerified && ['write-review', 'create-profile'].includes(operation)) {
    throw createAppError('Please verify your email address before continuing.', 'auth/email-not-verified');
  }
  
  if (operation === 'admin-action' && user.userType !== 'admin') {
    throw createAppError('You do not have permission to perform this action.', 'permission-denied');
  }
  
  return true;
};

export default {
  getErrorMessage,
  logError,
  handleFirebaseError,
  createAppError,
  retryOperation,
  validateUserPermissions,
};