import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { queryLogger } from '../utils/queryLogger';

/**
 * Auth Context Interface
 * Mirrors Auth0's useAuth0 hook interface for easy migration
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;

  // Auth methods
  loginWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  signupWithEmailAndPassword: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getAccessToken: () => Promise<string>;

  // Auth0 compatibility aliases
  loginWithRedirect: (options?: { authorizationParams?: { screen_hint?: string } }) => Promise<void>;
  getAccessTokenSilently: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Firebase Auth Provider
 * Provides authentication state and methods throughout the app
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [redirectAction, setRedirectAction] = useState<'login' | 'signup' | null>(null);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);

      if (firebaseUser) {
        queryLogger.logQuery(
          `Firebase user authenticated: ${firebaseUser.email}`,
          'general_query',
          firebaseUser.uid,
          {
            action: 'firebase_state_changed',
            auth_provider: 'firebase',
            deployment_status: 'production',
            backend_url: process.env.REACT_APP_API_BASE_URL,
            timestamp: new Date().toISOString()
          }
        );
      }
    }, (err) => {
      console.error('Firebase auth state error:', err);
      setError(err as Error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Login with email and password
   */
  const loginWithEmailAndPassword = async (email: string, password: string) => {
    try {
      setError(null);
      const logId = queryLogger.logQuery(
        `Firebase login attempt: ${email}`,
        'general_query',
        undefined,
        { action: 'firebase_login_attempt', email }
      );

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      queryLogger.logResponse(logId, 'Login successful');
      setUser(userCredential.user);
    } catch (err: any) {
      console.error('Firebase login error:', err);
      setError(err);
      queryLogger.logQuery(
        `Firebase login error: ${err.message}`,
        'general_query',
        undefined,
        { action: 'firebase_login_error', error: err.message }
      );
      throw err;
    }
  };

  /**
   * Sign up with email and password
   */
  const signupWithEmailAndPassword = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null);
      const logId = queryLogger.logQuery(
        `Firebase signup attempt: ${email}`,
        'general_query',
        undefined,
        { action: 'firebase_signup_attempt', email }
      );

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      queryLogger.logResponse(logId, 'Signup successful');
      setUser(userCredential.user);
    } catch (err: any) {
      console.error('Firebase signup error:', err);
      setError(err);
      queryLogger.logQuery(
        `Firebase signup error: ${err.message}`,
        'general_query',
        undefined,
        { action: 'firebase_signup_error', error: err.message }
      );
      throw err;
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      queryLogger.logQuery(
        'Firebase user logged out',
        'general_query',
        undefined,
        { action: 'firebase_logout' }
      );
    } catch (err: any) {
      console.error('Firebase logout error:', err);
      setError(err);
      throw err;
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      const logId = queryLogger.logQuery(
        `Firebase password reset: ${email}`,
        'general_query',
        undefined,
        { action: 'firebase_password_reset', email }
      );

      await sendPasswordResetEmail(auth, email);
      queryLogger.logResponse(logId, 'Password reset email sent');
    } catch (err: any) {
      console.error('Firebase password reset error:', err);
      setError(err);
      queryLogger.logQuery(
        `Firebase password reset error: ${err.message}`,
        'general_query',
        undefined,
        { action: 'firebase_password_reset_error', error: err.message }
      );
      throw err;
    }
  };

  /**
   * Get Firebase ID token (access token)
   */
  const getAccessToken = async (): Promise<string> => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      const token = await user.getIdToken();
      return token;
    } catch (err: any) {
      console.error('Error getting Firebase token:', err);
      throw err;
    }
  };

  /**
   * Auth0 compatibility: loginWithRedirect
   * In Firebase, we don't redirect - we show a modal/page instead
   * This stores the intent and the UI can respond accordingly
   */
  const loginWithRedirect = async (options?: { authorizationParams?: { screen_hint?: string } }) => {
    const action = options?.authorizationParams?.screen_hint === 'signup' ? 'signup' : 'login';
    setRedirectAction(action);

    // In a real implementation, this would trigger navigation to login page
    // For now, we'll just log it
    queryLogger.logQuery(
      `Firebase redirect action: ${action}`,
      'general_query',
      undefined,
      { action: 'firebase_redirect_action', redirect_type: action }
    );
  };

  /**
   * Auth0 compatibility: getAccessTokenSilently
   * Alias for getAccessToken
   */
  const getAccessTokenSilently = getAccessToken;

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    loginWithEmailAndPassword,
    signupWithEmailAndPassword,
    logout,
    resetPassword,
    getAccessToken,
    loginWithRedirect,
    getAccessTokenSilently
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 * Mirrors Auth0's useAuth0 hook
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Auth0 compatibility: export useAuth as useAuth0
 */
export const useAuth0 = useAuth;

export default AuthContext;
