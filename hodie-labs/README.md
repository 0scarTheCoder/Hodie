# HodieLabs Health Dashboard

A comprehensive health dashboard application built with React, Firebase, and Auth0. Features AI-powered health insights, comprehensive user metrics tracking, and Apple Health-style visualizations.

## 🚀 Live Demo

Visit the live application: [https://hodielabs-app.web.app](https://hodielabs-app.web.app)

## ✨ Features

### Core Functionality
- **Professional Authentication** - Auth0 integration with secure login/signup
- **Health Metrics Tracking** - Comprehensive health score calculation
- **AI Health Assistant** - Groq-powered conversational AI with Australian health guidelines
- **Apple Health UI** - Beautiful ring-style progress indicators
- **Dashboard Analytics** - Real-time health data visualization
- **Settings Management** - Complete user profile and payment management

### Advanced Features
- **Payment Integration** - Subscription management with billing history
- **Chat Memory** - Persistent conversation storage with Firebase
- **Responsive Design** - Mobile-first, works on all devices
- **Real-time Updates** - Live health metrics and streak tracking
- **Security Best Practices** - Professional auth, secure data handling

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Firebase** for database and hosting

### Backend & Services
- **Auth0** - Professional authentication
- **Firebase Firestore** - Real-time database
- **Kimi K2 AI** - Advanced health analytics AI (256k context, medical specialization)
- **Firebase Hosting** - Production deployment

### Development
- **Create React App** with TypeScript template
- **ESLint** for code quality
- **Jest** for testing

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Firebase CLI
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hodie-labs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

4. **Configure Firebase**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use hodie-labs-webapp
   ```

5. **Start development server**
   ```bash
   npm start
   ```

## ⚙️ Configuration

### Required Environment Variables

Create a `.env` file with:

```bash
# Auth0 Configuration
REACT_APP_AUTH0_DOMAIN=your-auth0-domain
REACT_APP_AUTH0_CLIENT_ID=your-auth0-client-id

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# Optional: Kimi K2 AI (for advanced health analytics)
REACT_APP_KIMI_K2_API_KEY=your-kimi-k2-api-key
```

### Enable Advanced AI Health Analytics (Optional but Recommended)

1. Get API key from [platform.moonshot.ai](https://platform.moonshot.ai) (Official) or [api.aimlapi.com](https://api.aimlapi.com) (Third-party)
2. Add to `.env`: `REACT_APP_KIMI_K2_API_KEY=your_key`
3. Rebuild and deploy

**Benefits**: 256k context window, health specialization, DNA analysis, biomarker interpretation
Without this, the app uses "Limited AI Mode" with basic pattern-matched responses.

## 📚 Documentation

### Setup Guides
- [KIMI_K2_SETUP.md](KIMI_K2_SETUP.md) - Enable advanced health AI (Recommended)
- [GROQ_SETUP.md](GROQ_SETUP.md) - Alternative AI chat setup
- [AUTH0_SETUP_GUIDE.md](AUTH0_SETUP_GUIDE.md) - Authentication configuration

### Feature Guides
- [EMAIL_CUSTOMIZATION_GUIDE.md](EMAIL_CUSTOMIZATION_GUIDE.md) - Customize Auth0 emails
- [FORGOT_PASSWORD_FEATURE.md](FORGOT_PASSWORD_FEATURE.md) - Password reset functionality

## 🏗 Project Structure

```
src/
├── components/
│   ├── auth/                 # Authentication components
│   ├── chat/                 # AI chat interface
│   ├── dashboard/            # Main dashboard views
│   ├── layout/               # Header, navigation
│   ├── screens/              # Feature screens (DNA, Labs, etc.)
│   ├── workflows/            # Multi-step processes
│   └── ui/                   # Reusable UI components
├── services/
│   ├── auth0Service.ts       # Auth0 integration
│   ├── groqChatService.ts    # AI chat service
│   ├── userMetricsService.ts # Health metrics
│   └── chatStorageService.ts # Chat persistence
├── firebase/
│   └── config.ts             # Firebase configuration
└── utils/                    # Utility functions
```

## 🚀 Deployment

### Firebase Hosting (Production)

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy --only hosting
   ```

3. **View live site**
   ```bash
   firebase open hosting:site
   ```

### Development Server
```bash
npm start     # http://localhost:3000
```

## 🧪 Testing

### Run Tests
```bash
npm test                    # Interactive test runner
npm test -- --watchAll=false   # Single run
```

### Database Testing
- **Live Testing**: Use deployed app
- **Firebase Console**: View real-time data
- **Chat System**: Test AI responses and storage

## 🔒 Security Features

- **Auth0 Professional Authentication**
- **Firebase Security Rules**
- **Environment Variable Protection**
- **HTTPS Encryption** (Firebase Hosting)
- **Input Validation** and sanitization

## 📊 Features Overview

### Dashboard Components
- **Health Score Calculation** - AI-powered health assessment
- **Login Streak Tracking** - Gamified engagement
- **Apple Health Rings** - Beautiful progress visualization
- **Real-time Metrics** - Live health data updates

### AI Health System
- **Kimi K2 Integration** - Advanced health analytics AI (256k context)
- **DNA Analysis** - Genetic variant interpretation and recommendations
- **Biomarker Analysis** - Lab result interpretation and trend analysis
- **Australian Health Guidelines** - Localized health advice
- **Conversation Memory** - Persistent chat history with massive context

### Settings & Account
- **Profile Management** - Complete user information
- **Payment Integration** - Subscription handling
- **Privacy Controls** - Data sharing preferences
- **Account Export** - GDPR compliance

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary. All rights reserved.

## 🆘 Support

- **Documentation**: Check the setup guides in this repository
- **Issues**: Create an issue for bugs or feature requests
- **Contact**: Visit [hodielabs.com/contact](https://hodielabs.com/contact)

## 🌟 Key Highlights

- **🚀 Production Ready**: Live at hodielabs-app.web.app
- **🤖 AI Powered**: Advanced conversational health assistant
- **🏥 Health Focused**: Australian health guidelines integration
- **📱 Mobile First**: Responsive design for all devices
- **🔒 Secure**: Professional authentication and data protection
- **⚡ Fast**: Optimized build with Firebase CDN
- **🎨 Beautiful**: Apple Health-inspired design system

---

Built with ❤️ by the HodieLabs team