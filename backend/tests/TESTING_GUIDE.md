# API Testing Guide

This guide provides comprehensive instructions for testing the MyLocalRIA Backend API.

## 📋 Available Testing Methods

### 1. Postman Collection
Import the `MyLocalRIA-Backend-API.postman_collection.json` file into Postman.

**Features:**
- Pre-configured requests for all endpoints
- Environment variables for easy configuration
- Test scripts for response validation
- Examples of both successful and error scenarios

**Setup:**
1. Import the collection into Postman
2. Update the `firebaseIdToken` variable with a valid token
3. Run individual requests or the entire collection

### 2. Node.js Test Script
A standalone script that tests all endpoints programmatically.

**Run:**
```bash
# First, get a Firebase token
npm run test:token

# Then run the test script
FIREBASE_TOKEN="your-token" npm run test:api
```

**Features:**
- Colorful console output
- Comprehensive test coverage
- No additional setup required
- Real-time test results

### 3. Jest Test Suite
Professional testing framework with detailed assertions.

**Run:**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Features:**
- Unit and integration tests
- Mocking capabilities
- Code coverage reports
- CI/CD compatible

## 🔐 Getting a Firebase ID Token

### Method 1: Token Generator Script
```bash
npm run test:token
```
Follow the prompts to enter:
- Firebase Web API Key
- Test user email
- Test user password

### Method 2: Using curl
```bash
curl -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword",
    "returnSecureToken": true
  }'
```

### Method 3: From Frontend Console
If you have a frontend app:
```javascript
firebase.auth().currentUser.getIdToken().then(token => console.log(token));
```

## 📊 Test Coverage

### Authentication Tests
- ✅ Missing token (401)
- ✅ Invalid token (401)
- ✅ Malformed header (401)
- ✅ Valid token (200)

### Validation Tests
- ✅ Missing required fields (400)
- ✅ Invalid data types (400)
- ✅ Empty values (400)
- ✅ Valid data (200)

### CRUD Operations
- ✅ Create/Update data (POST)
- ✅ Retrieve by CRD (GET)
- ✅ Retrieve by Rep ID (GET)
- ✅ Not found scenarios (404)

### Error Handling
- ✅ Non-existent endpoints (404)
- ✅ Invalid HTTP methods (404)
- ✅ Server errors (500)

## 🚀 Quick Start Testing

### 1. Basic Health Check
```bash
curl http://localhost:5000/health
```

### 2. Test Authentication
```bash
# Should fail with 401
curl http://localhost:5000/adv_part_2a_data/123456

# Should succeed with valid token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/adv_part_2a_data/123456
```

### 3. Test Validation
```bash
# Should fail with 400 (missing required fields)
curl -X POST http://localhost:5000/upsert_adv_part_2_data \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 4. Test CRUD Operations
```bash
# Create data
curl -X POST http://localhost:5000/upsert_adv_part_2_data \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "crd_number": "123456",
    "rep_name": "John Doe",
    "data": {
      "firm_name": "Test Advisors"
    }
  }'

# Retrieve data
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/adv_part_2a_data/123456
```

## 📈 Expected Responses

### Successful Response
```json
{
  "success": true,
  "message": "ADV Part 2A data successfully upserted",
  "crd_number": "123456"
}
```

### Validation Error
```json
{
  "error": "Validation failed",
  "errors": [
    {
      "msg": "CRD number is required",
      "param": "crd_number",
      "location": "body"
    }
  ]
}
```

### Authentication Error
```json
{
  "error": "Unauthorized",
  "message": "Invalid authentication token"
}
```

### Not Found Error
```json
{
  "error": "Not Found",
  "message": "No ADV Part 2A data found for CRD number: 999999"
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Firebase Admin SDK not initialized"**
   - Ensure `serviceAccountKey.json` exists
   - Check file path in `.env`

2. **"Invalid token" errors**
   - Token may be expired (tokens last 1 hour)
   - Generate a new token using the helper script

3. **"CORS error" in browser**
   - API is configured for CORS
   - Check if backend is running on correct port

4. **Tests hanging**
   - Make sure to close server after tests
   - Use `--detectOpenHandles` flag with Jest

## 📝 Adding New Tests

### Postman
1. Add new request to collection
2. Set appropriate auth and headers
3. Add test scripts in "Tests" tab

### Jest
```javascript
test('New test description', async () => {
  const res = await request(app)
    .get('/new-endpoint')
    .set('Authorization', `Bearer ${FIREBASE_TOKEN}`)
    .expect(200);
  
  expect(res.body).toHaveProperty('expectedProperty');
});
```

### Node.js Script
```javascript
await runTest('New test name', async () => {
  const response = await api.get('/new-endpoint');
  if (!response.data.expectedProperty) {
    throw new Error('Missing expected property');
  }
});
```