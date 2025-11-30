// React Hook for Automatic API Key Assignment
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { autoApiKeyService, UserApiKeyAssignment } from '../services/autoApiKeyService';

interface UseAutoApiKeyAssignmentResult {
  assignment: UserApiKeyAssignment | null;
  isLoading: boolean;
  hasApiAccess: boolean;
  error: string | null;
  retryAssignment: () => Promise<void>;
}

/**
 * Hook that automatically assigns API keys to users on first login
 * and manages their API access throughout their session
 */
export function useAutoApiKeyAssignment(user: User | null): UseAutoApiKeyAssignmentResult {
  const [assignment, setAssignment] = useState<UserApiKeyAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiAccess, setHasApiAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignApiKey = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🔄 Checking API key assignment for user: ${user.uid}`);
      
      // First check if user already has an assignment
      let userAssignment = await autoApiKeyService.getUserApiKeyAssignment(user.uid);
      
      // If no assignment, create one automatically
      if (!userAssignment) {
        console.log(`🎯 New user detected: ${user.uid} - auto-assigning API key`);
        userAssignment = await autoApiKeyService.assignApiKeyToNewUser(user.uid);
        
        if (userAssignment) {
          console.log(`✅ Successfully auto-assigned API key to user: ${user.uid}`);
          
          // Show user notification that they got free API access
          showApiAssignmentNotification(user.displayName || 'User');
        } else {
          console.warn(`⚠️ Could not assign API key to user: ${user.uid}`);
          setError('Unable to assign API key. Please contact support.');
        }
      } else {
        console.log(`✅ User ${user.uid} already has API key: ${userAssignment.apiKeyId}`);
      }

      setAssignment(userAssignment);
      setHasApiAccess(!!userAssignment && userAssignment.status === 'active');

    } catch (error) {
      console.error('Error in API key assignment:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setHasApiAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const retryAssignment = async () => {
    await assignApiKey();
  };

  // Auto-assign API key when user logs in
  useEffect(() => {
    if (user) {
      assignApiKey();
    } else {
      // Reset state when user logs out
      setAssignment(null);
      setHasApiAccess(false);
      setError(null);
    }
  }, [user?.uid]); // Only re-run when user ID changes

  return {
    assignment,
    isLoading,
    hasApiAccess,
    error,
    retryAssignment
  };
}

/**
 * Show a user-friendly notification about automatic API key assignment
 */
function showApiAssignmentNotification(userName: string) {
  // Create a temporary notification element
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
  notification.innerHTML = `
    <div class="flex items-start space-x-3">
      <div class="flex-shrink-0">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
      </div>
      <div>
        <h4 class="font-semibold">🎉 AI Access Granted!</h4>
        <p class="text-sm mt-1">Welcome ${userName}! We've automatically set up your AI-powered health analytics. Enjoy advanced insights!</p>
      </div>
      <button class="flex-shrink-0 ml-2" onclick="this.parentElement.parentElement.remove()">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;

  // Add to page
  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);

  // Add slide-in animation
  notification.style.transform = 'translateX(100%)';
  notification.style.transition = 'transform 0.3s ease-out';
  
  // Trigger animation
  requestAnimationFrame(() => {
    notification.style.transform = 'translateX(0)';
  });
}

/**
 * Hook to check if a user has valid API access (for use in components)
 */
export function useApiAccess(user: User | null): boolean {
  const { hasApiAccess } = useAutoApiKeyAssignment(user);
  return hasApiAccess;
}

export default useAutoApiKeyAssignment;