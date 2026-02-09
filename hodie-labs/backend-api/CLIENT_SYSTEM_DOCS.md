# Client Management & Secure Upload System

## Overview

This system implements a secure, user-specific health data management platform with:

✅ **Master Client Table** - One record per user with profile and subscription info
✅ **Auto-Generated Client IDs** - Format: `HDL-00001`, `HDL-00002`, etc.
✅ **Upload Restrictions** - 3 uploads per day, no duplicate files
✅ **JWT Authentication** - Secure token-based authentication (Auth0/Firebase)
✅ **Data Isolation** - Users can ONLY access their own data

## Database Collections

### 1. `clients` (Master Table)

One row per user. Contains all profile and subscription information.

**Schema:**
```javascript
{
  clientID: "HDL-00001",                      // Auto-generated unique ID
  phoneNumber: "+61-412-345-678",             // Contact number
  email: "user@example.com",                  // From OAuth login
  authProvider: "auth0",                      // auth0 or firebase
  authProviderUserId: "google-oauth2|123",    // The uid/sub from auth
  age: 34,                                    // User's age
  sex: "Female",                              // Male, Female, Other, Prefer not to say
  height: 165,                                // cm
  weight: 62,                                 // kg
  exerciseLevel: "Moderate",                  // Low, Moderate, High, Very High
  subscriptionLevel: "Premium",               // Free, Basic, Pro, Premium
  amountPaid: 149.97,                         // Total paid (AUD)
  amountDue: 0.00,                            // Currently outstanding (AUD)
  subscriptionStartDate: "2025-11-15",        // When they subscribed
  uploadsMade: 47,                            // Total uploads all-time
  createdAt: "2025-11-15T08:30:00Z",
  updatedAt: "2026-02-09T14:20:00Z"
}
```

**Static Fields (set once):**
- `clientID` - Never changes
- `email` - Rarely changes
- `authProvider` - Never changes
- `authProviderUserId` - Never changes
- `subscriptionStartDate` - Never changes

**Dynamic Fields (can be updated):**
- `phoneNumber`, `age`, `sex`, `height`, `weight`
- `exerciseLevel`, `subscriptionLevel`
- `amountPaid`, `amountDue`
- `uploadsMade` (auto-incremented)

### 2. `uploads_history`

Tracks every file upload with detailed metadata for restriction enforcement.

**Schema:**
```javascript
{
  clientID: "HDL-00001",
  fileName: "blood_results_jan_2026.csv",
  fileHash: "a3f5d8e9c2b1...",              // SHA-256 for duplicate detection
  fileSize: 524288,                          // bytes
  fileType: "csv",
  category: "lab_results",
  uploadDate: "2026-02-09T10:30:00Z",
  recordsCount: 748,
  status: "completed",                       // processing, completed, failed
  errorMessage: null
}
```

### 3. Health Data Collections

User data is stored in category-specific collections:
- `lab_results` - Lab test results
- `genetic_data` - DNA/genetic information
- `wearable_data` - Fitbit, Apple Watch, etc.
- `health_metrics` - Manual health metrics
- `medical_reports` - PDF reports, scans, etc.

All linked by `clientID` for easy retrieval.

## API Endpoints

### Authentication

All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Client Management

#### `POST /api/clients`
Create new client profile (auto-registers on first login)

**Request:**
```json
{
  "phoneNumber": "+61-412-345-678",
  "age": 34,
  "sex": "Female",
  "height": 165,
  "weight": 62,
  "exerciseLevel": "Moderate"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Client profile created successfully",
  "client": {
    "clientID": "HDL-00042",
    "email": "user@example.com",
    "subscriptionLevel": "Free",
    "createdAt": "2026-02-09T14:30:00Z"
  }
}
```

#### `GET /api/clients/me`
Get current user's profile

**Response:**
```json
{
  "success": true,
  "client": {
    "clientID": "HDL-00042",
    "phoneNumber": "+61-412-345-678",
    "email": "user@example.com",
    "age": 34,
    "sex": "Female",
    "height": 165,
    "weight": 62,
    "exerciseLevel": "Moderate",
    "subscriptionLevel": "Free",
    "amountPaid": 0.00,
    "amountDue": 0.00,
    "uploadsMade": 0,
    "subscriptionStartDate": "2026-02-09T14:30:00Z"
  }
}
```

#### `PATCH /api/clients/:clientID`
Update client profile (dynamic fields only)

**Request:**
```json
{
  "weight": 63.5,
  "exerciseLevel": "High"
}
```

### File Upload

#### `POST /api/upload`
Upload health data file

**Form Data:**
- `file` - The file to upload (CSV, JSON, PDF, TXT)
- `category` - Data category (lab_results, genetic_data, wearable_data, etc.)

**Response (Success):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "upload": {
    "uploadId": "65d8f3e9a2b1c4d5e6f7g8h9",
    "fileName": "blood_results.csv",
    "category": "lab_results",
    "recordsCount": 748,
    "fileSize": 52428,
    "uploadDate": "2026-02-09T14:45:00Z"
  },
  "uploadStats": {
    "uploadsToday": 1,
    "remainingToday": 2,
    "totalUploads": 1
  }
}
```

**Response (Daily Limit Reached):**
```json
{
  "error": "Upload limit reached",
  "message": "You've reached your daily limit of 3 uploads. Try again tomorrow.",
  "uploadsToday": 3,
  "remainingToday": 0
}
```

**Response (Duplicate File):**
```json
{
  "error": "Duplicate file",
  "message": "This file was already uploaded on 08/02/2026",
  "existingUpload": {
    "fileName": "blood_results.csv",
    "uploadDate": "2026-02-08T10:20:00Z",
    "recordsCount": 748
  }
}
```

#### `GET /api/upload/history`
Get upload history

**Response:**
```json
{
  "success": true,
  "count": 5,
  "uploads": [
    {
      "clientID": "HDL-00042",
      "fileName": "blood_results.csv",
      "category": "lab_results",
      "recordsCount": 748,
      "uploadDate": "2026-02-09T14:45:00Z",
      "status": "completed"
    },
    // ... more uploads
  ]
}
```

#### `GET /api/upload/statistics`
Get upload statistics

**Response:**
```json
{
  "success": true,
  "statistics": {
    "totalUploads": 15,
    "todayUploads": 2,
    "remainingToday": 1,
    "uploadsByCategory": [
      { "category": "lab_results", "count": 8 },
      { "category": "genetic_data", "count": 3 },
      { "category": "wearable_data", "count": 4 }
    ]
  }
}
```

### Health Data Access

#### `GET /api/lab-results/:userId`
Get lab results (must be owner)

#### `GET /api/genetic-data/:userId`
Get genetic data (must be owner)

#### `GET /api/wearable-data/:userId`
Get wearable data (must be owner)

#### `GET /api/health-metrics/:userId`
Get health metrics (must be owner)

#### `GET /api/medical-reports/:userId`
Get medical reports (must be owner)

**All return:**
```json
[
  {
    "clientID": "HDL-00042",
    "uploadId": "...",
    "fileName": "blood_results.csv",
    "uploadDate": "2026-02-09T14:45:00Z",
    "testType": "Lab Results",
    "results": [ /* actual data */ ],
    "metadata": {
      "fileSize": 52428,
      "fileHash": "a3f5d8e9...",
      "recordsCount": 748
    }
  }
]
```

## Security Features

### 1. JWT Token Verification
- Supports Auth0 and Firebase tokens
- Verifies signature using JWKS
- Extracts user identity from token
- Rejects expired or invalid tokens

### 2. Data Ownership Enforcement
Every request checks:
```
authenticated_user_id == data_owner_user_id
```

Users CANNOT access other users' data (unless admin).

### 3. Upload Restrictions
- **3 per day limit** - Enforced server-side
- **Duplicate detection** - SHA-256 file hash comparison
- **File size limit** - 10MB max
- **File type validation** - Only CSV, JSON, PDF, TXT allowed

### 4. Rate Limiting
Built into existing rate limit system.

## Client ID Generation

Sequential auto-increment with zero-padding:
```
HDL-00001
HDL-00002
HDL-00003
...
HDL-09999
HDL-10000
```

Format: `HDL-` + 5-digit number

## Integration with Existing System

The new system integrates seamlessly:

1. **Uses existing MongoDB connection**
2. **Uses existing authentication** (Auth0/Firebase)
3. **Maintains existing AI chat endpoints**
4. **Adds new client management layer**
5. **Secures existing data access endpoints**

## Frontend Integration

Update frontend to include JWT token in requests:

```typescript
// Get auth token (Auth0 or Firebase)
const token = await getAuthToken();

// Make authenticated request
const response = await fetch('https://api.hodielabs.com/api/clients/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Testing

See `backend-api/test-api.sh` for comprehensive API tests.

## Migration Path

1. **Install dependencies** - `cd backend-api && npm install`
2. **Update .env** - Add Auth0 configuration
3. **Restart server** - `npm start`
4. **Test endpoints** - Use test script
5. **Update frontend** - Add JWT authentication
6. **Deploy** - Deploy backend with new routes

## Future Enhancements

- Admin dashboard for viewing all clients
- Payment processing integration
- Advanced analytics and reporting
- Bulk upload functionality
- Data export/download features
