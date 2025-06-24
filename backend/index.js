// Backend Express API with Firebase Authentication and Security Features
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { body, validationResult } = require('express-validator');
require('dotenv').config(); // Load environment variables

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
// Note: You'll need to provide your service account key
try {
  // Option 1: Use service account file
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } 
  // Option 2: Use environment variables
  else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      })
    });
  } 
  // Option 3: Default service account file
  else {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// ============== AUTHENTICATION MIDDLEWARE ==============
/**
 * Middleware to verify Firebase ID tokens
 * Extracts and validates Bearer token from Authorization header
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No valid authentication token provided' 
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the ID token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Attach user info to request
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid authentication token' 
    });
  }
};

// ============== INPUT VALIDATION RULES ==============
/**
 * Validation rules for ADV Part 2A data
 */
const validateAdvPart2AData = [
  body('crd_number').notEmpty().withMessage('CRD number is required').isNumeric().withMessage('CRD number must be numeric'),
  body('rep_name').notEmpty().withMessage('Representative name is required').trim(),
  body('data').optional().isObject().withMessage('Data must be an object')
];

/**
 * Validation rules for ADV Part 2B data
 */
const validateAdvPart2BData = [
  body('crd_number').notEmpty().withMessage('CRD number is required').isNumeric().withMessage('CRD number must be numeric'),
  body('rep_name').notEmpty().withMessage('Representative name is required').trim(),
  body('data').optional().isObject().withMessage('Data must be an object')
];

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      errors: errors.array() 
    });
  }
  next();
};

// ============== ERROR LOGGING MIDDLEWARE ==============
/**
 * Global error handling middleware
 * Logs errors and returns JSON error responses
 */
const errorHandler = (err, req, res, next) => {
  // Log error details
  console.error('Error occurred:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    error: err.message,
    stack: err.stack,
    user: req.user?.uid || 'unauthenticated'
  });

  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Send error response
  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// ============== ROUTES ==============

/**
 * POST /upsert_adv_part_2_data
 * Upserts ADV Part 2A data to Firestore
 * Requires authentication and validation
 */
app.post('/upsert_adv_part_2_data', 
  authenticateUser, 
  validateAdvPart2AData, 
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { crd_number, rep_name, data } = req.body;
      
      // Create document reference using CRD number as ID
      const docRef = db.collection('adv_part_2a_data').doc(crd_number.toString());
      
      // Prepare document data
      const documentData = {
        crd_number: crd_number.toString(),
        rep_name,
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: req.user.uid
      };
      
      // Upsert the document
      await docRef.set(documentData, { merge: true });
      
      res.status(200).json({
        success: true,
        message: 'ADV Part 2A data successfully upserted',
        crd_number
      });
    } catch (error) {
      next(error); // Pass to error handler
    }
});

/**
 * POST /upsert_adv_part_2b_data
 * Upserts ADV Part 2B data to Firestore
 * Requires authentication and validation
 */
app.post('/upsert_adv_part_2b_data', 
  authenticateUser, 
  validateAdvPart2BData, 
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { crd_number, rep_name, data } = req.body;
      
      // Create document reference using CRD number as ID
      const docRef = db.collection('adv_part_2b_data').doc(crd_number.toString());
      
      // Prepare document data
      const documentData = {
        crd_number: crd_number.toString(),
        rep_name,
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: req.user.uid
      };
      
      // Upsert the document
      await docRef.set(documentData, { merge: true });
      
      res.status(200).json({
        success: true,
        message: 'ADV Part 2B data successfully upserted',
        crd_number
      });
    } catch (error) {
      next(error); // Pass to error handler
    }
});

/**
 * GET /adv_part_2a_data/:crd_number
 * Retrieves individual ADV Part 2A record by CRD number
 * Requires authentication
 */
app.get('/adv_part_2a_data/:crd_number', authenticateUser, async (req, res, next) => {
  try {
    const { crd_number } = req.params;
    
    // Validate CRD number parameter
    if (!crd_number || isNaN(crd_number)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Valid CRD number is required'
      });
    }
    
    // Fetch document from Firestore
    const docRef = db.collection('adv_part_2a_data').doc(crd_number);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No ADV Part 2A data found for CRD number: ${crd_number}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: doc.data()
    });
  } catch (error) {
    next(error); // Pass to error handler
  }
});

/**
 * GET /adv_part_2b_data/:crd_number
 * Retrieves individual ADV Part 2B record by CRD number
 * Requires authentication
 */
app.get('/adv_part_2b_data/:crd_number', authenticateUser, async (req, res, next) => {
  try {
    const { crd_number } = req.params;
    
    // Validate CRD number parameter
    if (!crd_number || isNaN(crd_number)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Valid CRD number is required'
      });
    }
    
    // Fetch document from Firestore
    const docRef = db.collection('adv_part_2b_data').doc(crd_number);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No ADV Part 2B data found for CRD number: ${crd_number}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: doc.data()
    });
  } catch (error) {
    next(error); // Pass to error handler
  }
});

/**
 * GET /adv_part_2a_data/rep/:rep_id
 * Retrieves ADV Part 2A records by representative ID
 * Requires authentication
 */
app.get('/adv_part_2a_data/rep/:rep_id', authenticateUser, async (req, res, next) => {
  try {
    const { rep_id } = req.params;
    
    if (!rep_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Representative ID is required'
      });
    }
    
    // Query Firestore for documents with matching rep_id
    const querySnapshot = await db.collection('adv_part_2a_data')
      .where('rep_id', '==', rep_id)
      .get();
    
    if (querySnapshot.empty) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No ADV Part 2A data found for representative ID: ${rep_id}`
      });
    }
    
    const results = [];
    querySnapshot.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error); // Pass to error handler
  }
});

/**
 * GET /adv_part_2b_data/rep/:rep_id
 * Retrieves ADV Part 2B records by representative ID
 * Requires authentication
 */
app.get('/adv_part_2b_data/rep/:rep_id', authenticateUser, async (req, res, next) => {
  try {
    const { rep_id } = req.params;
    
    if (!rep_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Representative ID is required'
      });
    }
    
    // Query Firestore for documents with matching rep_id
    const querySnapshot = await db.collection('adv_part_2b_data')
      .where('rep_id', '==', rep_id)
      .get();
    
    if (querySnapshot.empty) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No ADV Part 2B data found for representative ID: ${rep_id}`
      });
    }
    
    const results = [];
    querySnapshot.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error); // Pass to error handler
  }
});

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// Apply error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;