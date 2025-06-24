#!/usr/bin/env node

/**
 * API Test Script for MyLocalRIA Backend
 * 
 * Usage:
 * 1. Set your Firebase ID token: export FIREBASE_TOKEN="your-token-here"
 * 2. Run the script: node api-test-script.js
 * 
 * Or pass the token directly: FIREBASE_TOKEN="your-token" node api-test-script.js
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const FIREBASE_TOKEN = process.env.FIREBASE_TOKEN || 'YOUR_FIREBASE_ID_TOKEN_HERE';

// Test data
const testData = {
  part2A: {
    crd_number: '123456',
    rep_name: 'John Doe',
    data: {
      firm_name: 'Doe Financial Advisors',
      aum: 50000000,
      year_founded: 2010,
      services: ['Investment Advisory', 'Financial Planning']
    }
  },
  part2B: {
    crd_number: '789012',
    rep_name: 'Jane Smith',
    data: {
      rep_id: 'REP001',
      education: 'MBA Finance',
      experience_years: 15,
      specializations: ['Retirement Planning', 'Tax Strategy']
    }
  }
};

// Axios instance with auth
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${FIREBASE_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Helper function to run a test
async function runTest(testName, testFunction) {
  totalTests++;
  process.stdout.write(`Running: ${testName}... `);
  
  try {
    await testFunction();
    passedTests++;
    console.log('✓ PASSED'.green);
  } catch (error) {
    failedTests++;
    console.log('✗ FAILED'.red);
    console.log(`  Error: ${error.message}`.red);
    if (error.response) {
      console.log(`  Status: ${error.response.status}`.red);
      console.log(`  Data: ${JSON.stringify(error.response.data, null, 2)}`.red);
    }
  }
}

// Test Suite
async function runAllTests() {
  console.log('\n🧪 MyLocalRIA Backend API Test Suite'.cyan.bold);
  console.log('=====================================\n'.cyan);

  // 1. Health Check Tests
  console.log('📋 Health Check Tests'.yellow.bold);
  await runTest('Health check (no auth)', async () => {
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.status !== 200) throw new Error('Expected status 200');
    if (!response.data.status) throw new Error('Missing status field');
  });

  // 2. Authentication Tests
  console.log('\n🔐 Authentication Tests'.yellow.bold);
  await runTest('Endpoint without auth should fail', async () => {
    try {
      await axios.get(`${BASE_URL}/adv_part_2a_data/123456`);
      throw new Error('Expected 401 error');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Expected error
        return;
      }
      throw error;
    }
  });

  await runTest('Endpoint with invalid token should fail', async () => {
    try {
      await axios.get(`${BASE_URL}/adv_part_2a_data/123456`, {
        headers: { 'Authorization': 'Bearer invalid-token-12345' }
      });
      throw new Error('Expected 401 error');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Expected error
        return;
      }
      throw error;
    }
  });

  // 3. Validation Tests
  console.log('\n✅ Validation Tests'.yellow.bold);
  await runTest('POST without CRD number should fail', async () => {
    try {
      await api.post('/upsert_adv_part_2_data', {
        rep_name: 'John Doe'
      });
      throw new Error('Expected validation error');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return;
      }
      throw error;
    }
  });

  await runTest('POST with invalid CRD number should fail', async () => {
    try {
      await api.post('/upsert_adv_part_2_data', {
        crd_number: 'not-a-number',
        rep_name: 'John Doe'
      });
      throw new Error('Expected validation error');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return;
      }
      throw error;
    }
  });

  await runTest('POST without rep_name should fail', async () => {
    try {
      await api.post('/upsert_adv_part_2_data', {
        crd_number: '123456'
      });
      throw new Error('Expected validation error');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return;
      }
      throw error;
    }
  });

  // 4. ADV Part 2A Tests
  console.log('\n📊 ADV Part 2A Tests'.yellow.bold);
  await runTest('Upsert ADV Part 2A data', async () => {
    const response = await api.post('/upsert_adv_part_2_data', testData.part2A);
    if (response.status !== 200) throw new Error('Expected status 200');
    if (!response.data.success) throw new Error('Expected success true');
  });

  await runTest('Get ADV Part 2A by CRD', async () => {
    const response = await api.get(`/adv_part_2a_data/${testData.part2A.crd_number}`);
    if (response.status !== 200) throw new Error('Expected status 200');
    if (!response.data.data) throw new Error('Expected data field');
    if (response.data.data.crd_number !== testData.part2A.crd_number) {
      throw new Error('CRD number mismatch');
    }
  });

  await runTest('Get non-existent ADV Part 2A should return 404', async () => {
    try {
      await api.get('/adv_part_2a_data/999999');
      throw new Error('Expected 404 error');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return;
      }
      throw error;
    }
  });

  await runTest('Get ADV Part 2A with invalid CRD should return 400', async () => {
    try {
      await api.get('/adv_part_2a_data/invalid');
      throw new Error('Expected 400 error');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return;
      }
      throw error;
    }
  });

  // 5. ADV Part 2B Tests
  console.log('\n📊 ADV Part 2B Tests'.yellow.bold);
  await runTest('Upsert ADV Part 2B data', async () => {
    const response = await api.post('/upsert_adv_part_2b_data', testData.part2B);
    if (response.status !== 200) throw new Error('Expected status 200');
    if (!response.data.success) throw new Error('Expected success true');
  });

  await runTest('Get ADV Part 2B by CRD', async () => {
    const response = await api.get(`/adv_part_2b_data/${testData.part2B.crd_number}`);
    if (response.status !== 200) throw new Error('Expected status 200');
    if (!response.data.data) throw new Error('Expected data field');
    if (response.data.data.crd_number !== testData.part2B.crd_number) {
      throw new Error('CRD number mismatch');
    }
  });

  await runTest('Get ADV Part 2B by Rep ID', async () => {
    const response = await api.get(`/adv_part_2b_data/rep/${testData.part2B.data.rep_id}`);
    if (response.status !== 200) throw new Error('Expected status 200');
    if (!response.data.data) throw new Error('Expected data field');
  });

  // 6. 404 Test
  console.log('\n🚫 404 Test'.yellow.bold);
  await runTest('Non-existent endpoint should return 404', async () => {
    try {
      await api.get('/non-existent-endpoint');
      throw new Error('Expected 404 error');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return;
      }
      throw error;
    }
  });

  // Print summary
  console.log('\n📊 Test Summary'.cyan.bold);
  console.log('================'.cyan);
  console.log(`Total Tests: ${totalTests}`.white);
  console.log(`Passed: ${passedTests}`.green);
  console.log(`Failed: ${failedTests}`.red);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`.yellow);
  
  if (failedTests === 0) {
    console.log('\n✨ All tests passed! ✨'.green.bold);
  } else {
    console.log('\n❌ Some tests failed. Please check the errors above.'.red.bold);
    process.exit(1);
  }
}

// Check if Firebase token is set
if (FIREBASE_TOKEN === 'YOUR_FIREBASE_ID_TOKEN_HERE') {
  console.log('⚠️  Warning: Firebase ID token not set!'.yellow.bold);
  console.log('Please set the FIREBASE_TOKEN environment variable:'.yellow);
  console.log('export FIREBASE_TOKEN="your-firebase-id-token"'.gray);
  console.log('\nTo get a Firebase ID token, you can:'.yellow);
  console.log('1. Use the Firebase Auth REST API'.gray);
  console.log('2. Get it from your frontend app\'s console'.gray);
  console.log('3. Use the Firebase Admin SDK to create a custom token\n'.gray);
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Test suite failed with error:'.red.bold);
  console.error(error);
  process.exit(1);
});