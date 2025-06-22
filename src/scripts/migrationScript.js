// Firebase Data Migration Script for Cost Optimization
// Run this script to create optimized data structures from existing data

import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  query, 
  limit,
  writeBatch,
  serverTimestamp,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

// Configuration
const BATCH_SIZE = 450; // Firestore batch limit is 500
const MIGRATION_CONFIG = {
  createOptimizedAdvisorProfiles: true,
  createSearchIndex: true,
  addCompositeScores: true,
  migrateInBatches: true
};

/**
 * Creates optimized advisor profile documents by denormalizing data
 */
export const createOptimizedAdvisorProfiles = async () => {
  console.log('🚀 Starting advisor profile optimization migration...');
  
  try {
    // Get all advisors from the main collection
    const advisorsRef = collection(db, 'state_adv_part_1_data');
    const advisorsSnapshot = await getDocs(advisorsRef);
    
    let processed = 0;
    let batch = writeBatch(db);
    let batchCount = 0;
    const batches = [];

    for (const advisorDoc of advisorsSnapshot.docs) {
      const advisorData = advisorDoc.data();
      const advisorId = advisorDoc.id;

      try {
        // Fetch related data for this advisor
        const [logoData, advPart2Data, advPart2BData, reviewsData] = await Promise.all([
          // Logo data
          getDocs(query(
            collection(db, 'adviser_logos'),
            where('crd_number', '==', advisorData.crd_number),
            limit(1)
          )),
          // ADV Part 2 data  
          getDocs(query(
            collection(db, 'adv_part_2_data'),
            where('crd_number', '==', advisorData.crd_number),
            limit(1)
          )),
          // ADV Part 2B data
          getDocs(query(
            collection(db, 'adv_part_2b_data'),
            where('crd_number', '==', advisorData.crd_number)
          )),
          // Recent reviews (limit to 10 for initial load)
          getDocs(query(
            collection(db, 'reviews'),
            where('advisorId', '==', advisorId),
            orderBy('createdAt', 'desc'),
            limit(10)
          ))
        ]);

        // Process the data
        const logoUrl = !logoData.empty ? logoData.docs[0].data().logo_url : null;
        const advPart2 = !advPart2Data.empty ? advPart2Data.docs[0].data() : null;
        const advPart2B = !advPart2BData.empty ? advPart2BData.docs[0].data() : null;
        const repNames = advPart2BData.docs
          .map(doc => doc.data().rep_name)
          .filter(Boolean);
        const repProfiles = advPart2BData.docs.map(doc => doc.data());
        
        const reviews = reviewsData.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate review statistics
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
          ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
          : 0;
        const ratingDistribution = reviews.reduce((acc, review) => {
          acc[review.rating] = (acc[review.rating] || 0) + 1;
          return acc;
        }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

        // Calculate composite score for optimized sorting
        const compositeScore = calculateCompositeScore(averageRating, totalReviews, advisorData);

        // Create optimized document
        const optimizedData = {
          advisor: advisorData,
          logoUrl,
          advPart2,
          advPart2B,
          reviews: reviews.slice(0, 5), // Store only 5 most recent for quick load
          repNames,
          repProfiles,
          stats: {
            totalReviews,
            averageRating,
            ratingDistribution
          },
          compositeScore,
          lastUpdated: serverTimestamp(),
          migrationVersion: '1.0'
        };

        // Add to batch
        const optimizedRef = doc(db, 'advisor_profiles_optimized', advisorId);
        batch.set(optimizedRef, optimizedData);
        batchCount++;

        // Execute batch when approaching limit
        if (batchCount >= BATCH_SIZE) {
          batches.push(batch.commit());
          batch = writeBatch(db);
          batchCount = 0;
        }

        processed++;
        if (processed % 50 === 0) {
          console.log(`📊 Processed ${processed} advisor profiles...`);
        }

      } catch (error) {
        console.error(`❌ Error processing advisor ${advisorId}:`, error);
      }
    }

    // Execute final batch
    if (batchCount > 0) {
      batches.push(batch.commit());
    }

    // Wait for all batches to complete
    await Promise.all(batches);

    console.log(`✅ Successfully migrated ${processed} advisor profiles to optimized structure`);
    return { success: true, processed };

  } catch (error) {
    console.error('❌ Error in advisor profile migration:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Creates search index document for fast client-side filtering
 */
export const createSearchIndex = async () => {
  console.log('🔍 Creating search index...');

  try {
    // Gather data for search suggestions
    const [advisorsSnapshot, locationsData, specializationsData] = await Promise.all([
      getDocs(query(collection(db, 'state_adv_part_1_data'), limit(1000))),
      // These might need to be generated from advisor data if collections don't exist
      getUniqueLocations(),
      getUniqueSpecializations()
    ]);

    // Extract advisor names for suggestions
    const advisorNames = advisorsSnapshot.docs
      .map(doc => doc.data().primary_business_name)
      .filter(Boolean)
      .map(name => name.toLowerCase().replace(/[^\w\s]/g, '').trim())
      .filter(name => name.length > 0);

    // Remove duplicates and sort
    const uniqueAdvisorNames = [...new Set(advisorNames)].sort();

    const searchIndexData = {
      advisorNames: uniqueAdvisorNames.slice(0, 500), // Limit for performance
      locations: locationsData,
      specializations: specializationsData,
      lastUpdated: serverTimestamp(),
      version: '1.0'
    };

    // Save search index
    await setDoc(doc(db, 'search_metadata', 'suggestions_index'), searchIndexData);

    console.log('✅ Search index created successfully');
    console.log(`📈 Index contains: ${uniqueAdvisorNames.length} advisors, ${locationsData.length} locations, ${specializationsData.length} specializations`);

    return { success: true, data: searchIndexData };

  } catch (error) {
    console.error('❌ Error creating search index:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Adds composite scores to existing advisor documents for optimized sorting
 */
export const addCompositeScores = async () => {
  console.log('🎯 Adding composite scores for optimized sorting...');

  try {
    const advisorsRef = collection(db, 'state_adv_part_1_data');
    const advisorsSnapshot = await getDocs(advisorsRef);
    
    let batch = writeBatch(db);
    let batchCount = 0;
    let processed = 0;
    const batches = [];

    for (const advisorDoc of advisorsSnapshot.docs) {
      const advisorData = advisorDoc.data();
      
      // Calculate composite score
      const compositeScore = calculateCompositeScore(
        advisorData.averageRating || 0,
        advisorData.totalReviews || 0,
        advisorData
      );

      // Update document with composite score
      batch.update(advisorDoc.ref, { 
        compositeScore,
        lastScoreUpdate: serverTimestamp()
      });
      
      batchCount++;
      processed++;

      // Execute batch when approaching limit
      if (batchCount >= BATCH_SIZE) {
        batches.push(batch.commit());
        batch = writeBatch(db);
        batchCount = 0;
      }

      if (processed % 100 === 0) {
        console.log(`📊 Added composite scores to ${processed} advisors...`);
      }
    }

    // Execute final batch
    if (batchCount > 0) {
      batches.push(batch.commit());
    }

    await Promise.all(batches);

    console.log(`✅ Successfully added composite scores to ${processed} advisors`);
    return { success: true, processed };

  } catch (error) {
    console.error('❌ Error adding composite scores:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Calculates a composite score for sorting optimization
 */
const calculateCompositeScore = (averageRating, totalReviews, advisorData) => {
  // Normalize rating (0-5 scale)
  const ratingScore = (averageRating || 0) / 5;
  
  // Normalize review count (logarithmic scale to prevent outliers)
  const reviewScore = Math.log(totalReviews + 1) / 10;
  
  // Assets under management score (normalized)
  const aum = parseFloat(advisorData['5f2_assets_under_management_total_us_dol']) || 0;
  const aumScore = Math.log(aum + 1) / 25;
  
  // Verification bonus
  const verificationBonus = advisorData.verified ? 0.1 : 0;
  
  // Calculate weighted composite score
  const compositeScore = (
    ratingScore * 0.4 +           // 40% weight on ratings
    reviewScore * 0.3 +           // 30% weight on review count
    aumScore * 0.2 +              // 20% weight on AUM
    verificationBonus * 0.1       // 10% verification bonus
  );
  
  return Math.round(compositeScore * 1000) / 1000; // Round to 3 decimal places
};

/**
 * Gets unique locations from advisor data
 */
const getUniqueLocations = async () => {
  try {
    const advisorsSnapshot = await getDocs(query(collection(db, 'state_adv_part_1_data'), limit(1000)));
    const locations = new Set();
    
    advisorsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.principal_office_city && data.principal_office_state) {
        locations.add(`${data.principal_office_city}, ${data.principal_office_state}`);
      }
    });
    
    return Array.from(locations).sort().slice(0, 200); // Limit to 200 locations
  } catch (error) {
    console.error('Error getting locations:', error);
    return ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'];
  }
};

/**
 * Gets unique specializations from advisor data
 */
const getUniqueSpecializations = async () => {
  // This is a fallback list - in a real implementation, you'd extract from advisor data
  return [
    'Retirement Planning',
    'Investment Management', 
    'Financial Planning',
    'Tax Planning',
    'Estate Planning',
    'Insurance Planning',
    'College Planning',
    'Business Planning',
    'Wealth Management',
    'Portfolio Management'
  ];
};

/**
 * Main migration function
 */
export const runFirebaseOptimizationMigration = async (config = MIGRATION_CONFIG) => {
  console.log('🚀 Starting Firebase Cost Optimization Migration');
  console.log('Configuration:', config);
  
  const results = {
    advisorProfiles: null,
    searchIndex: null,
    compositeScores: null,
    startTime: new Date(),
    endTime: null
  };

  try {
    if (config.createOptimizedAdvisorProfiles) {
      console.log('\n📋 Step 1: Creating optimized advisor profiles...');
      results.advisorProfiles = await createOptimizedAdvisorProfiles();
    }

    if (config.createSearchIndex) {
      console.log('\n🔍 Step 2: Creating search index...');
      results.searchIndex = await createSearchIndex();
    }

    if (config.addCompositeScores) {
      console.log('\n🎯 Step 3: Adding composite scores...');
      results.compositeScores = await addCompositeScores();
    }

    results.endTime = new Date();
    const duration = (results.endTime - results.startTime) / 1000;

    console.log('\n✅ Migration completed successfully!');
    console.log(`⏱️  Total time: ${duration.toFixed(2)} seconds`);
    console.log('\n📊 Results:', results);

    return results;

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    results.endTime = new Date();
    results.error = error.message;
    return results;
  }
};

// Uncomment to run migration immediately
// runFirebaseOptimizationMigration();