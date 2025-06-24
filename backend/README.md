# Backend API Documentation

This is a hardened Express.js backend API with Firebase authentication and data validation.

## Features

- **Firebase Authentication**: All endpoints (except health check) require valid Firebase ID tokens
- **Input Validation**: Uses express-validator for robust input validation
- **Error Handling**: Comprehensive error logging and JSON error responses
- **Firestore Integration**: Stores ADV Part 2A and 2B data in Firebase Firestore
- **RESTful Design**: Clean API design with proper HTTP status codes

## Prerequisites

1. Node.js (v14 or higher)
2. Firebase project with Firestore enabled
3. Firebase service account key

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Add your Firebase service account key:
   - Download your service account key from Firebase Console
   - Save it as `serviceAccountKey.json` in the backend directory
   - Update the path in `.env` if needed

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

All endpoints (except `/health`) require an `Authorization` header with a valid Firebase ID token:
```
Authorization: Bearer <your-firebase-id-token>
```

### POST /upsert_adv_part_2_data

Upserts ADV Part 2A data to Firestore.

**Request Body:**
```json
{
  "crd_number": "123456",
  "rep_name": "John Doe",
  "data": {
    // Additional fields (optional)
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "ADV Part 2A data successfully upserted",
  "crd_number": "123456"
}
```

### POST /upsert_adv_part_2b_data

Upserts ADV Part 2B data to Firestore.

**Request Body:**
```json
{
  "crd_number": "123456",
  "rep_name": "John Doe",
  "data": {
    // Additional fields (optional)
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "ADV Part 2B data successfully upserted",
  "crd_number": "123456"
}
```

### GET /adv_part_2a_data/:crd_number

Retrieves ADV Part 2A data by CRD number.

**Response:**
```json
{
  "success": true,
  "data": {
    "crd_number": "123456",
    "rep_name": "John Doe",
    // Other fields
  }
}
```

### GET /adv_part_2b_data/:crd_number

Retrieves ADV Part 2B data by CRD number.

**Response:**
```json
{
  "success": true,
  "data": {
    "crd_number": "123456",
    "rep_name": "John Doe",
    // Other fields
  }
}
```

### GET /adv_part_2a_data/rep/:rep_id

Retrieves all ADV Part 2A records for a specific representative ID.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "123456",
      "crd_number": "123456",
      "rep_name": "John Doe",
      // Other fields
    }
  ]
}
```

### GET /adv_part_2b_data/rep/:rep_id

Retrieves all ADV Part 2B records for a specific representative ID.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "123456",
      "crd_number": "123456",
      "rep_name": "John Doe",
      // Other fields
    }
  ]
}
```

### GET /health

Health check endpoint (no authentication required).

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Responses

All errors return JSON responses with appropriate HTTP status codes:

### 400 Bad Request
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

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid authentication token"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "No ADV Part 2A data found for CRD number: 123456"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Security Features

1. **Authentication**: Firebase ID token verification on all data endpoints
2. **Input Validation**: Strict validation of required fields
3. **Error Handling**: No sensitive information leaked in error messages
4. **CORS**: Configured for cross-origin requests
5. **Audit Trail**: Tracks who updated data with timestamps

## Development Notes

- The server logs all errors to the console with detailed information
- In development mode, stack traces are included in error responses
- All Firestore operations include proper error handling
- The API uses async/await for better error handling

## Testing with cURL

Example requests for testing:

```bash
# Get Firebase ID token (you'll need to implement this in your frontend)
TOKEN="your-firebase-id-token"

# Health check
curl http://localhost:5000/health

# Upsert ADV Part 2A data
curl -X POST http://localhost:5000/upsert_adv_part_2_data \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "crd_number": "123456",
    "rep_name": "John Doe",
    "data": {
      "additional_field": "value"
    }
  }'

# Get ADV Part 2A data
curl http://localhost:5000/adv_part_2a_data/123456 \
  -H "Authorization: Bearer $TOKEN"
```