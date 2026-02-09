// Auth0 Authentication Service for HodieLabs
import { Auth0Provider, useAuth0, User } from '@auth0/auth0-react';

// Auth0 Configuration Interface
interface Auth0Config {
  domain: string;
  clientId: string;
  audience?: string;
  customDomain?: string;
  redirectUri: string;
}

// Enhanced User Profile Interface
interface HodieUser extends User {
  user_metadata?: {
    healthScore?: number;
    onboardingCompleted?: boolean;
    preferences?: {
      theme?: 'light' | 'dark';
      notifications?: boolean;
      dataSharing?: boolean;
    };
  };
  app_metadata?: {
    role?: 'user' | 'admin' | 'practitioner';
    subscription?: 'free' | 'premium' | 'enterprise';
    createdAt?: string;
  };
}

// Health Context Interface for Auth0
interface Auth0HealthContext {
  userId: string;
  email?: string;
  profile?: HodieUser;
  isAuthenticated: boolean;
  healthScore?: number;
  subscription?: string;
}

class Auth0Service {
  private config: Auth0Config;

  constructor() {
    this.config = {
      domain: process.env.REACT_APP_AUTH0_DOMAIN || '',
      clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || '',
      audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      customDomain: process.env.REACT_APP_AUTH0_CUSTOM_DOMAIN,
      redirectUri: window.location.origin
    };

    if (!this.config.domain || !this.config.clientId) {
      console.warn('⚠️ Auth0 configuration missing. Add REACT_APP_AUTH0_DOMAIN and REACT_APP_AUTH0_CLIENT_ID to .env file');
    } else {
      console.log('✅ Auth0 service initialised for HodieLabs');
    }
  }

  // Get Auth0 configuration for Provider
  getConfig(): Auth0Config {
    return this.config;
  }

  // Check if Auth0 is properly configured
  isConfigured(): boolean {
    return !!(this.config.domain && this.config.clientId);
  }

  // Get Auth0 Provider JSX Element
  getAuth0Provider() {
    return Auth0Provider;
  }

  // Auth0 Provider Props
  getProviderProps() {
    return {
      domain: this.config.customDomain || this.config.domain,
      clientId: this.config.clientId,
      authorizationParams: {
        redirect_uri: this.config.redirectUri,
        audience: this.config.audience,
        scope: 'openid profile email read:current_user update:current_user_metadata offline_access'
      },
      useRefreshTokens: true,
      cacheLocation: 'localstorage' as const
    };
  }

  // Format user data for HodieLabs context
  formatUserContext(auth0User: User | undefined, isAuthenticated: boolean): Auth0HealthContext {
    if (!isAuthenticated || !auth0User) {
      return {
        userId: '',
        isAuthenticated: false
      };
    }

    const user = auth0User as HodieUser;

    return {
      userId: user.sub || '',
      email: user.email,
      profile: user,
      isAuthenticated,
      healthScore: user.user_metadata?.healthScore || 75,
      subscription: user.app_metadata?.subscription || 'free'
    };
  }

  // Login with redirect (replaces Firebase signInWithEmailAndPassword)
  async loginWithRedirect(auth0Hook: any, options?: any) {
    try {
      await auth0Hook.loginWithRedirect({
        authorizationParams: {
          screen_hint: 'login',
          ...options
        }
      });
    } catch (error) {
      console.error('Auth0 login error:', error);
      throw error;
    }
  }

  // Signup with redirect (replaces Firebase createUserWithEmailAndPassword)
  async signupWithRedirect(auth0Hook: any, options?: any) {
    try {
      await auth0Hook.loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup',
          ...options
        }
      });
    } catch (error) {
      console.error('Auth0 signup error:', error);
      throw error;
    }
  }

  // Password reset (replaces Firebase sendPasswordResetEmail)
  async resetPassword(email: string): Promise<void> {
    try {
      const resetUrl = `https://${this.config.domain}/dbconnections/change_password`;
      
      const response = await fetch(resetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.config.clientId,
          email: email,
          connection: 'Username-Password-Authentication' // Default Auth0 database connection
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Password reset failed');
      }

      console.log('✅ Password reset email sent successfully');
    } catch (error) {
      console.error('Auth0 password reset error:', error);
      throw error;
    }
  }

  // Logout (replaces Firebase signOut)
  async logout(auth0Hook: any, returnTo?: string) {
    try {
      await auth0Hook.logout({
        logoutParams: {
          returnTo: returnTo || window.location.origin
        }
      });
    } catch (error) {
      console.error('Auth0 logout error:', error);
      throw error;
    }
  }

  // Update user metadata
  async updateUserMetadata(auth0Hook: any, metadata: any) {
    try {
      const { getAccessTokenSilently } = auth0Hook;
      const token = await getAccessTokenSilently();

      const response = await fetch(`https://${this.config.domain}/api/v2/users/${auth0Hook.user.sub}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_metadata: metadata
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update user metadata');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user metadata:', error);
      throw error;
    }
  }

  // Get user's health data
  getUserHealthData(user: HodieUser): any {
    return {
      healthScore: user.user_metadata?.healthScore || 75,
      onboardingCompleted: user.user_metadata?.onboardingCompleted || false,
      preferences: user.user_metadata?.preferences || {},
      subscription: user.app_metadata?.subscription || 'free',
      role: user.app_metadata?.role || 'user'
    };
  }

  // Create Auth0 hook wrapper for easier migration
  createAuthHook() {
    return {
      useAuth0: () => {
        const auth0 = useAuth0();
        
        return {
          ...auth0,
          // Add HodieLabs specific methods
          getUserContext: () => this.formatUserContext(auth0.user, auth0.isAuthenticated),
          getHealthData: () => auth0.user ? this.getUserHealthData(auth0.user as HodieUser) : null,
          resetPassword: (email: string) => this.resetPassword(email),
          updateHealth: (metadata: any) => this.updateUserMetadata(auth0, metadata)
        };
      }
    };
  }

  // Migration helper: Get equivalent Auth0 error for Firebase errors
  getFirebaseEquivalentError(auth0Error: string): string {
    const errorMap: { [key: string]: string } = {
      'invalid_user_password': 'auth/wrong-password',
      'invalid_username_password': 'auth/wrong-password',
      'user_not_found': 'auth/user-not-found',
      'invalid_signup': 'auth/email-already-in-use',
      'invalid_connection': 'auth/invalid-email',
      'access_denied': 'auth/user-disabled'
    };

    return errorMap[auth0Error] || auth0Error;
  }
}

// Export singleton instance
export const auth0Service = new Auth0Service();
export type { Auth0Config, HodieUser, Auth0HealthContext };