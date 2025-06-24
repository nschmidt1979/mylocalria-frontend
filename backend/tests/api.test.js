/**
 * Jest Test Suite for MyLocalRIA Backend API
 * 
 * To run: npm test
 */

const request = require('supertest');
const app = require('../index'); // Import your Express app

// Get Firebase token from environment or use a test token
const FIREBASE_TOKEN = process.env.FIREBASE_TOKEN || 'test-firebase-token';

describe('MyLocalRIA Backend API', () => {
  
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

  describe('Health Check', () => {
    test('GET /health should return 200 without authentication', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);
      
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('Authentication', () => {
    test('Endpoints should return 401 without auth token', async () => {
      await request(app)
        .get('/adv_part_2a_data/123456')
        .expect(401);
    });

    test('Endpoints should return 401 with invalid auth token', async () => {
      await request(app)
        .get('/adv_part_2a_data/123456')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    test('Endpoints should return 401 with malformed auth header', async () => {
      await request(app)
        .get('/adv_part_2a_data/123456')
        .set('Authorization', 'NotBearer token')
        .expect(401);
    });
  });

  describe('Input Validation - ADV Part 2A', () => {
    test('POST /upsert_adv_part_2_data should return 400 without crd_number', async () => {
      const res = await request(app)
        .post('/upsert_adv_part_2_data')
        .set('Authorization', `Bearer ${FIREBASE_TOKEN}`)
        .send({
          rep_name: 'John Doe'
        })
        .expect(400);
      
      expect(res.body).toHaveProperty('error', 'Validation failed');
      expect(res.body.errors).toContainEqual(
        expect.objectContaining({
          param: 'crd_number',
          msg: 'CRD number is required'
        })
      );
    });

    test('POST /upsert_adv_part_2_data should return 400 with non-numeric crd_number', async () => {
      const res = await request(app)
        .post('/upsert_adv_part_2_data')
        .set('Authorization', `Bearer ${FIREBASE_TOKEN}`)
        .send({
          crd_number: 'not-a-number',
          rep_name: 'John Doe'
        })
        .expect(400);
      
      expect(res.body.errors).toContainEqual(
        expect.objectContaining({
          param: 'crd_number',
          msg: 'CRD number must be numeric'
        })
      );
    });

    test('POST /upsert_adv_part_2_data should return 400 without rep_name', async () => {
      const res = await request(app)
        .post('/upsert_adv_part_2_data')
        .set('Authorization', `Bearer ${FIREBASE_TOKEN}`)
        .send({
          crd_number: '123456'
        })
        .expect(400);
      
      expect(res.body.errors).toContainEqual(
        expect.objectContaining({
          param: 'rep_name',
          msg: 'Representative name is required'
        })
      );
    });

    test('POST /upsert_adv_part_2_data should return 400 with empty rep_name', async () => {
      const res = await request(app)
        .post('/upsert_adv_part_2_data')
        .set('Authorization', `Bearer ${FIREBASE_TOKEN}`)
        .send({
          crd_number: '123456',
          rep_name: ''
        })
        .expect(400);
      
      expect(res.body.errors).toContainEqual(
        expect.objectContaining({
          param: 'rep_name',
          msg: 'Representative name is required'
        })
      );
    });
  });

  describe('Input Validation - ADV Part 2B', () => {
    test('POST /upsert_adv_part_2b_data should return 400 without required fields', async () => {
      const res = await request(app)
        .post('/upsert_adv_part_2b_data')
        .set('Authorization', `Bearer ${FIREBASE_TOKEN}`)
        .send({})
        .expect(400);
      
      expect(res.body).toHaveProperty('error', 'Validation failed');
      expect(res.body.errors).toHaveLength(2); // Both crd_number and rep_name missing
    });

    test('POST /upsert_adv_part_2b_data should return 400 with multiple validation errors', async () => {
      const res = await request(app)
        .post('/upsert_adv_part_2b_data')
        .set('Authorization', `Bearer ${FIREBASE_TOKEN}`)
        .send({
          crd_number: '',
          rep_name: '   ' // Just whitespace
        })
        .expect(400);
      
      expect(res.body.errors).toHaveLength(2);
    });
  });

  // Note: The following tests would require a valid Firebase token and Firestore setup
  describe('CRUD Operations (requires valid Firebase token)', () => {
    // Skip these tests if no valid token is provided
    const conditionalTest = FIREBASE_TOKEN === 'test-firebase-token' ? test.skip : test;

    conditionalTest('POST /upsert_adv_part_2_data should create/update data successfully', async () => {
      const res = await request(app)
        .post('/upsert_adv_part_2_data')
        .set('Authorization', `Bearer ${FIREBASE_TOKEN}`)
        .send(testData.part2A)
        .expect(200);
      
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('crd_number', testData.part2A.crd_number);
    });

    conditionalTest('GET /adv_part_2a_data/:crd_number should retrieve data', async () => {
      const res = await request(app)
        .get(`/adv_part_2a_data/${testData.part2A.crd_number}`)
        .set('Authorization', `Bearer ${FIREBASE_TOKEN}`)
        .expect(200);
      
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('crd_number', testData.part2A.crd_number);
      expect(res.body.data).toHaveProperty('rep_name', testData.part2A.rep_name);
    });

    conditionalTest('GET /adv_part_2a_data/:crd_number should return 404 for non-existent data', async () => {
      const res = await request(app)
        .get('/adv_part_2a_data/999999')
        .set('Authorization', `Bearer ${FIREBASE_TOKEN}`)
        .expect(404);
      
      expect(res.body).toHaveProperty('error', 'Not Found');
    });

    conditionalTest('GET /adv_part_2a_data/:crd_number should return 400 for invalid CRD', async () => {
      const res = await request(app)
        .get('/adv_part_2a_data/invalid-crd')
        .set('Authorization', `Bearer ${FIREBASE_TOKEN}`)
        .expect(400);
      
      expect(res.body).toHaveProperty('error', 'Bad Request');
    });
  });

  describe('404 Handler', () => {
    test('Non-existent endpoints should return 404', async () => {
      const res = await request(app)
        .get('/non-existent-endpoint')
        .set('Authorization', `Bearer ${FIREBASE_TOKEN}`)
        .expect(404);
      
      expect(res.body).toHaveProperty('error', 'Not Found');
      expect(res.body).toHaveProperty('message', 'The requested endpoint does not exist');
    });

    test('Invalid HTTP methods should return 404', async () => {
      await request(app)
        .patch('/upsert_adv_part_2_data')
        .set('Authorization', `Bearer ${FIREBASE_TOKEN}`)
        .expect(404);
    });
  });

  describe('Response Headers', () => {
    test('All responses should have proper content-type', async () => {
      const res = await request(app)
        .get('/health');
      
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });
  });
});