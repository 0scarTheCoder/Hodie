# Hodie Labs - Complete Deployment Guide

## Overview
This guide provides step-by-step instructions to deploy the complete Hodie Labs health dashboard application.

## Architecture
- **Frontend**: React + TypeScript (hodie-labs/)
- **Backend**: Express.js + MongoDB (root directory)
- **Database**: MongoDB Atlas
- **Authentication**: Firebase Auth
- **Hosting**: Firebase (Frontend) + Render.com (Backend)

## Prerequisites
1. Node.js 16+ installed
2. Firebase CLI installed (`npm install -g firebase-tools`)
3. Git installed
4. MongoDB Atlas account
5. Render.com account
6. Firebase project created

## Step 1: Clone and Setup Repository

```bash
git clone https://github.com/0scarTheCoder/Hodie.git
cd Hodie
```

## Step 2: Firebase Setup

1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password
3. Initialize Firebase in the project:

```bash
cd hodie-labs
firebase login
firebase use --add # Select your project
```

4. Create `.env` file in `hodie-labs/`:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_API_BASE_URL=https://your-backend-url.onrender.com/api
```

## Step 3: MongoDB Atlas Setup

1. Create cluster at https://cloud.mongodb.com
2. Create database user
3. Get connection string
4. Note your MongoDB URI for backend deployment

## Step 4: Deploy Backend to Render.com

1. Go to https://render.com
2. Connect GitHub account
3. Create new Web Service
4. Select the Hodie repository
5. Configure:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: Leave empty (uses root)

6. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `NODE_ENV`: `production`

7. Deploy and note the URL (e.g., `https://your-app.onrender.com`)

## Step 5: Update Frontend Configuration

Update `.env` in `hodie-labs/` with your deployed backend URL:

```env
REACT_APP_API_BASE_URL=https://your-backend-url.onrender.com/api
```

## Step 6: Deploy Frontend to Firebase

```bash
cd hodie-labs
npm install
npm run build
firebase deploy
```

Your app will be available at: `https://your-project.web.app`

## Step 7: Verify Deployment

1. Visit your Firebase hosted URL
2. Test user registration/login
3. Test health metrics input
4. Verify data persistence
5. Check browser console for any errors

## Environment Variables Summary

### Frontend (.env in hodie-labs/)
```env
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_API_BASE_URL=https://your-backend.onrender.com/api
```

### Backend (Render.com Environment Variables)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hodie_app
NODE_ENV=production
PORT=3001 (auto-set by Render)
```

## Features Included

✅ Firebase Authentication
✅ Health metrics tracking and visualization
✅ AI-powered chat interface (Claude integration)
✅ Responsive dashboard with charts
✅ User onboarding flow
✅ Real-time data synchronization
✅ Query logging for debugging
✅ Mobile-responsive design

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/users` - Create user
- `GET /api/users/:uid` - Get user data
- `PATCH /api/users/:uid/login` - Update login time
- `POST /api/chat-sessions` - Create chat session
- `GET /api/chat-sessions/user/:userId` - Get user chat sessions
- `PATCH /api/chat-sessions/:id` - Update chat session
- `POST /api/health-metrics` - Save health metrics
- `GET /api/health-metrics/:userId` - Get health metrics

## Troubleshooting

### Frontend Issues
- Check browser console for errors
- Verify Firebase config in `.env`
- Ensure backend URL is correct

### Backend Issues
- Check Render.com logs
- Verify MongoDB connection string
- Ensure environment variables are set

### CORS Issues
- Backend already configured for Firebase domains
- Check `allowedOrigins` in `server.js`

## Query Logging

The application includes built-in query logging that tracks:
- User authentication events
- API calls
- Health data interactions
- Session management

Logs are stored in localStorage and can be exported for debugging.

## Database Schema

### Users
```javascript
{
  uid: String (Firebase UID),
  email: String,
  createdAt: Date,
  lastLoginAt: Date,
  preferences: Object,
  healthData: {
    weight: Number,
    height: Number,
    age: Number,
    activityLevel: String,
    goals: [String]
  }
}
```

### Health Metrics
```javascript
{
  userId: String,
  date: Date,
  steps: Number,
  calories: Number,
  distance: Number,
  sleepHours: Number,
  sleepQuality: String,
  mood: String,
  weight: Number,
  heartRate: Number
}
```

### Chat Sessions
```javascript
{
  userId: String,
  messages: [{
    id: String,
    text: String,
    sender: String, // 'user' | 'assistant'
    timestamp: Date
  }],
  title: String,
  category: String
}
```

## Security Features

- Firebase Authentication
- Helmet.js security headers
- CORS protection
- Rate limiting (100 requests per 15 minutes)
- Input validation
- Environment variable protection

## Performance Features

- React lazy loading
- Optimized builds
- CDN delivery via Firebase
- Database indexing
- Efficient queries

---

**Deployment Status**: ✅ Complete
**Last Updated**: November 2025
**Generated with Claude Code**: https://claude.ai/code