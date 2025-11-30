// Automatic API Key Assignment Service for HodieLabs
// This service manages automatic assignment of Kimi K2 API keys to new users

interface ApiKeyPool {
  id: string;
  apiKey: string;
  assigned: boolean;
  assignedTo?: string;
  assignedAt?: Date;
  usageCount?: number;
  dailyLimit?: number;
  lastUsed?: Date;
}

interface UserApiKeyAssignment {
  userId: string;
  apiKeyId: string;
  apiKey: string;
  assignedAt: Date;
  status: 'active' | 'suspended' | 'revoked';
  usageStats: {
    totalRequests: number;
    todayRequests: number;
    lastReset: Date;
  };
}

class AutoApiKeyService {
  private readonly API_BACKEND_URL = process.env.REACT_APP_API_BASE_URL || 'https://hodie-backend-api.onrender.com/api';
  
  // Pool of pre-generated API keys for automatic assignment
  private readonly API_KEY_POOL: ApiKeyPool[] = [
    {
      id: 'key_001',
      apiKey: 'sk-k70lkhZA9kmz9VI4OrowDMqcbWXiMKpsS58p5cL0OIK1rvAN',
      assigned: false,
      dailyLimit: 1000
    },
    // Add more API keys here as needed
    // These would typically be managed through an admin interface
  ];

  /**
   * Automatically assign an API key to a new user
   * Called during user registration/first login
   */
  async assignApiKeyToNewUser(userId: string): Promise<UserApiKeyAssignment | null> {
    try {
      console.log(`🔑 Auto-assigning API key for new user: ${userId}`);

      // First check if user already has an assigned key
      const existingAssignment = await this.getUserApiKeyAssignment(userId);
      if (existingAssignment) {
        console.log(`✅ User ${userId} already has API key assigned`);
        return existingAssignment;
      }

      // Find an available API key from the pool
      const availableKey = this.findAvailableApiKey();
      if (!availableKey) {
        console.warn(`⚠️ No available API keys in pool for user ${userId}`);
        await this.notifyAdminOfKeyShortage();
        return null;
      }

      // Create the assignment
      const assignment: UserApiKeyAssignment = {
        userId,
        apiKeyId: availableKey.id,
        apiKey: availableKey.apiKey,
        assignedAt: new Date(),
        status: 'active',
        usageStats: {
          totalRequests: 0,
          todayRequests: 0,
          lastReset: new Date()
        }
      };

      // Mark key as assigned in pool
      availableKey.assigned = true;
      availableKey.assignedTo = userId;
      availableKey.assignedAt = new Date();

      // Store assignment in user's local storage and backend
      await this.storeUserApiKeyAssignment(assignment);
      await this.updateApiKeyPool();

      console.log(`✅ API key ${availableKey.id} successfully assigned to user ${userId}`);
      
      return assignment;

    } catch (error) {
      console.error('Error assigning API key to user:', error);
      return null;
    }
  }

  /**
   * Get user's current API key assignment
   */
  async getUserApiKeyAssignment(userId: string): Promise<UserApiKeyAssignment | null> {
    try {
      // First check localStorage
      const localAssignment = localStorage.getItem(`api_assignment_${userId}`);
      if (localAssignment) {
        const assignment = JSON.parse(localAssignment) as UserApiKeyAssignment;
        
        // Verify the assignment is still valid
        if (this.isAssignmentValid(assignment)) {
          return assignment;
        }
      }

      // If not in localStorage, check backend
      const response = await fetch(`${this.API_BACKEND_URL}/users/${userId}/api-key`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const assignment = await response.json();
        // Cache in localStorage for faster future access
        localStorage.setItem(`api_assignment_${userId}`, JSON.stringify(assignment));
        return assignment;
      }

      return null;
    } catch (error) {
      console.error('Error getting user API key assignment:', error);
      return null;
    }
  }

  /**
   * Get the active API key for a user, with automatic assignment if needed
   */
  async getUserApiKey(userId: string): Promise<string | null> {
    try {
      let assignment = await this.getUserApiKeyAssignment(userId);
      
      // If no assignment exists, create one automatically
      if (!assignment) {
        console.log(`🔄 No API key found for user ${userId}, auto-assigning...`);
        assignment = await this.assignApiKeyToNewUser(userId);
      }

      if (assignment && assignment.status === 'active') {
        // Update usage stats
        await this.trackApiUsage(assignment);
        return assignment.apiKey;
      }

      return null;
    } catch (error) {
      console.error('Error getting user API key:', error);
      return null;
    }
  }

  /**
   * Check if user has valid API access
   */
  async hasValidApiAccess(userId: string): Promise<boolean> {
    const assignment = await this.getUserApiKeyAssignment(userId);
    return assignment !== null && assignment.status === 'active' && this.isAssignmentValid(assignment);
  }

  /**
   * Find an available API key from the pool
   */
  private findAvailableApiKey(): ApiKeyPool | null {
    return this.API_KEY_POOL.find(key => !key.assigned) || null;
  }

  /**
   * Check if an API key assignment is still valid
   */
  private isAssignmentValid(assignment: UserApiKeyAssignment): boolean {
    if (assignment.status !== 'active') return false;
    
    // Check if daily limit exceeded (reset at midnight)
    const now = new Date();
    const lastReset = new Date(assignment.usageStats.lastReset);
    
    if (now.getDate() !== lastReset.getDate()) {
      // Reset daily counter
      assignment.usageStats.todayRequests = 0;
      assignment.usageStats.lastReset = now;
    }
    
    // Check daily limit (default 1000 requests/day)
    const keyData = this.API_KEY_POOL.find(k => k.id === assignment.apiKeyId);
    const dailyLimit = keyData?.dailyLimit || 1000;
    
    return assignment.usageStats.todayRequests < dailyLimit;
  }

  /**
   * Track API usage for rate limiting
   */
  private async trackApiUsage(assignment: UserApiKeyAssignment): Promise<void> {
    assignment.usageStats.totalRequests++;
    assignment.usageStats.todayRequests++;
    
    // Update localStorage
    localStorage.setItem(`api_assignment_${assignment.userId}`, JSON.stringify(assignment));
    
    // Update backend (async, don't wait)
    this.updateBackendUsageStats(assignment).catch(console.error);
  }

  /**
   * Store user API key assignment locally and in backend
   */
  private async storeUserApiKeyAssignment(assignment: UserApiKeyAssignment): Promise<void> {
    // Store in localStorage for immediate access
    localStorage.setItem(`api_assignment_${assignment.userId}`, JSON.stringify(assignment));
    
    // Store in backend for persistence
    try {
      await fetch(`${this.API_BACKEND_URL}/users/${assignment.userId}/api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignment)
      });
    } catch (error) {
      console.error('Error storing API key assignment in backend:', error);
      // Continue anyway - localStorage will work for now
    }
  }

  /**
   * Update backend with current usage statistics
   */
  private async updateBackendUsageStats(assignment: UserApiKeyAssignment): Promise<void> {
    try {
      await fetch(`${this.API_BACKEND_URL}/users/${assignment.userId}/api-key/usage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usageStats: assignment.usageStats
        })
      });
    } catch (error) {
      // Don't log this error as it's expected when backend is not fully implemented
    }
  }

  /**
   * Update the API key pool in backend
   */
  private async updateApiKeyPool(): Promise<void> {
    try {
      await fetch(`${this.API_BACKEND_URL}/admin/api-keys/pool`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.API_KEY_POOL)
      });
    } catch (error) {
      // Don't log this error as it's expected when backend is not fully implemented
    }
  }

  /**
   * Notify admin when API keys are running low
   */
  private async notifyAdminOfKeyShortage(): Promise<void> {
    const availableKeys = this.API_KEY_POOL.filter(k => !k.assigned).length;
    
    if (availableKeys === 0) {
      console.warn('🚨 CRITICAL: All API keys in pool are assigned! Need to add more keys.');
      
      // TODO: Send email notification to admin
      // TODO: Create admin dashboard alert
      
      try {
        await fetch(`${this.API_BACKEND_URL}/admin/alerts/api-key-shortage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            severity: 'critical',
            message: 'API key pool exhausted',
            availableKeys,
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        // Backend not implemented yet, just log
        console.error('Could not send admin alert:', error);
      }
    }
  }

  /**
   * Admin function to add new API keys to the pool
   */
  async addApiKeyToPool(apiKey: string, dailyLimit: number = 1000): Promise<boolean> {
    try {
      const newKey: ApiKeyPool = {
        id: `key_${Date.now()}`,
        apiKey,
        assigned: false,
        dailyLimit
      };

      this.API_KEY_POOL.push(newKey);
      await this.updateApiKeyPool();
      
      console.log(`✅ Added new API key ${newKey.id} to pool`);
      return true;
    } catch (error) {
      console.error('Error adding API key to pool:', error);
      return false;
    }
  }

  /**
   * Get pool statistics for admin dashboard
   */
  getPoolStatistics() {
    const total = this.API_KEY_POOL.length;
    const assigned = this.API_KEY_POOL.filter(k => k.assigned).length;
    const available = total - assigned;
    
    return {
      total,
      assigned,
      available,
      utilizationRate: total > 0 ? (assigned / total) * 100 : 0,
      keys: this.API_KEY_POOL.map(k => ({
        id: k.id,
        assigned: k.assigned,
        assignedTo: k.assignedTo,
        assignedAt: k.assignedAt,
        usageCount: k.usageCount || 0
      }))
    };
  }
}

export const autoApiKeyService = new AutoApiKeyService();
export type { UserApiKeyAssignment, ApiKeyPool };