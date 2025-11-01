# Hodie

Health dashboard application with real-time data tracking and AI-powered insights.

## Components

### Frontend (hodie-labs/)
- React + TypeScript health dashboard
- Firebase Authentication
- Real-time health metrics display
- Responsive design with Tailwind CSS

### Backend (hodie-backend/)
- Express.js API server
- MongoDB Atlas integration
- Health metrics tracking
- User management
- Chat session storage

## Features

- User authentication with Firebase
- Health metrics tracking (steps, sleep, mood, etc.)
- AI-powered health recommendations
- Chat interface for health queries
- Real-time data synchronization
- Responsive dashboard design

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

## Deployment

- Frontend: Firebase Hosting
- Backend: Ready for Render.com/Railway deployment
- Database: MongoDB Atlas
