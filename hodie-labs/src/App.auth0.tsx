import React, { useEffect, useState } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { auth0Service } from './services/auth0Service';
import Auth0LoginPage from './components/auth/Auth0LoginPage';
import ComprehensiveDashboard from './components/dashboard/ComprehensiveDashboard';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import { queryLogger } from './utils/queryLogger';
import { Loader2 } from 'lucide-react';

// Auth0 App Content Component
const Auth0AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading, error } = useAuth0();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if user has completed onboarding
      const onboardingComplete = localStorage.getItem(`hodie_onboarding_${user.sub}`);
      setShowOnboarding(!onboardingComplete);
      
      queryLogger.logQuery(
        `Auth0 user authenticated: ${user.email}`,
        'general_query',
        user.sub,
        { 
          action: 'auth0_state_changed',
          auth_provider: 'auth0',
          deployment_status: 'production',
          backend_url: process.env.REACT_APP_API_BASE_URL,
          user_metadata: user.user_metadata,
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
          <div className="text-white/60 text-sm mt-2">Powered by Auth0</div>
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
            user={user as any} // Type compatibility with existing Firebase User interface
            onComplete={() => {
              localStorage.setItem(`hodie_onboarding_${user.sub}`, 'true');
              setShowOnboarding(false);
            }} 
          />
        ) : (
          <ComprehensiveDashboard user={user as any} />
        )
      ) : (
        <Auth0LoginPage />
      )}
    </div>
  );
};

// Main Auth0 App Component
function Auth0App() {
  const isAuth0Configured = auth0Service.isConfigured();

  // Fallback if Auth0 is not configured
  if (!isAuth0Configured) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2a1e5c] via-[#1a0f3a] to-[#0f0622] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-yellow-400 text-6xl mb-4">🔧</div>
          <h1 className="text-white text-2xl font-bold mb-4">Auth0 Configuration Required</h1>
          <p className="text-white/70 mb-6">
            Please configure your Auth0 credentials in the .env file to enable secure authentication.
          </p>
          <div className="bg-[#1e1548]/80 rounded-xl p-4 text-left">
            <p className="text-white/80 text-sm mb-2">Required environment variables:</p>
            <code className="text-[#8b7ed8] text-xs block">
              REACT_APP_AUTH0_DOMAIN=your-tenant.auth0.com<br/>
              REACT_APP_AUTH0_CLIENT_ID=your_client_id
            </code>
          </div>
          <div className="mt-6">
            <a 
              href="https://manage.auth0.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f97316] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Get Auth0 Credentials
            </a>
          </div>
        </div>
      </div>
    );
  }

  const auth0Props = auth0Service.getProviderProps();

  return (
    <Auth0Provider {...auth0Props}>
      <Auth0AppContent />
    </Auth0Provider>
  );
}

export default Auth0App;