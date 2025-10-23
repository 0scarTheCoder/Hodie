import React, { useEffect, useState } from 'react';
import { auth } from './firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/dashboard/Dashboard';
import { queryLogger } from './utils/queryLogger';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        queryLogger.logQuery(
          `User authenticated: ${user.email}`,
          'general_query',
          user.uid,
          { action: 'auth_state_changed' }
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
      {user ? <Dashboard user={user} /> : <LoginPage />}
    </div>
  );
}

export default App;
