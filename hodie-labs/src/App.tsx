import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ExactHodieLogin from './components/auth/ExactHodieLogin';
import ComprehensiveDashboard from './components/dashboard/ComprehensiveDashboard';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import FirebasePasswordReset from './components/auth/FirebasePasswordReset';
import { queryLogger } from './utils/queryLogger';
import { Loader2 } from 'lucide-react';

// Firebase App Content Component
const FirebaseAppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Check for comprehensive signup data
      const comprehensiveSignupData = localStorage.getItem('hodie_comprehensive_signup_data');

      if (comprehensiveSignupData) {
        try {
          const signupData = JSON.parse(comprehensiveSignupData);
          console.log('Comprehensive signup data found:', signupData);

          // Clear the signup data since we've processed it
          localStorage.removeItem('hodie_comprehensive_signup_data');

          // Mark onboarding as complete since they filled comprehensive form
          localStorage.setItem(`hodie_onboarding_${user.uid}`, 'true');
          setShowOnboarding(false);
        } catch (error) {
          console.error('Error processing comprehensive signup data:', error);
        }
      } else {
        // Check if user has completed onboarding
        const onboardingComplete = localStorage.getItem(`hodie_onboarding_${user.uid}`);
        setShowOnboarding(!onboardingComplete);
      }

      queryLogger.logQuery(
        `Firebase user authenticated: ${user.email}`,
        'general_query',
        user.uid,
        {
          action: 'firebase_state_changed',
          auth_provider: 'firebase',
          deployment_status: 'production',
          backend_url: process.env.REACT_APP_API_BASE_URL,
          comprehensive_signup: !!comprehensiveSignupData,
          timestamp: new Date().toISOString()
        }
      );
    }
  }, [isAuthenticated, user]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2a1e5c] via-[#1a0f3a] to-[#0f0622] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <div className="text-white text-lg font-medium">Securing your session...</div>
          <div className="text-white/60 text-sm mt-2">Powered by Firebase</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2a1e5c] via-[#1a0f3a] to-[#0f0622] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-white text-2xl font-bold mb-4">Authentication Error</h1>
          <p className="text-white/70 mb-6">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f97316] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main app logic
  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && user ? (
        showOnboarding ? (
          <OnboardingFlow
            user={user}
            onComplete={() => {
              localStorage.setItem(`hodie_onboarding_${user.uid}`, 'true');
              setShowOnboarding(false);
            }}
          />
        ) : (
          <ComprehensiveDashboard user={user} />
        )
      ) : (
        <ExactHodieLogin />
      )}
    </div>
  );
};

// Main Firebase App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/reset-password" element={<FirebasePasswordReset />} />
          <Route path="/login" element={<ExactHodieLogin />} />
          <Route path="/*" element={<FirebaseAppContent />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;