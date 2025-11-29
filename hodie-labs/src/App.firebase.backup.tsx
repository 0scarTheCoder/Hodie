import React, { useEffect, useState } from 'react';
import { auth } from './firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import ExactHodieLogin from './components/auth/ExactHodieLogin';
import ComprehensiveDashboard from './components/dashboard/ComprehensiveDashboard';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import { queryLogger } from './utils/queryLogger';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        // Check if user has completed onboarding
        const onboardingComplete = localStorage.getItem(`hodie_onboarding_${user.uid}`);
        setShowOnboarding(!onboardingComplete);
        
        queryLogger.logQuery(
          `User authenticated: ${user.email}`,
          'general_query',
          user.uid,
          { 
            action: 'auth_state_changed',
            deployment_status: 'production',
            backend_url: process.env.REACT_APP_API_BASE_URL,
            timestamp: new Date().toISOString()
          }
        );
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? (
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
}

export default App;
