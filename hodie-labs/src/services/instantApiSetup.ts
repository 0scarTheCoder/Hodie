// Instant API Setup - Immediately assign working API to current user
import { autoApiKeyService } from './autoApiKeyService';

export const forceSetupApiForCurrentUser = async (userId: string): Promise<void> => {
  console.log('🚀 FORCE SETUP: Immediately assigning API key to user:', userId);
  
  // 1. Directly assign from the available API key pool
  const apiKey = 'sk-k70lkhZA9kmz9VI4OrowDMqcbWXiMKpsS58p5cL0OIK1rvAN'; // Working API key
  
  // 2. Create immediate assignment in localStorage
  const assignment = {
    userId,
    apiKeyId: 'instant_key_001',
    apiKey,
    assignedAt: new Date(),
    status: 'active' as const,
    usageStats: {
      totalRequests: 0,
      todayRequests: 0,
      lastReset: new Date()
    }
  };
  
  // 3. Store immediately
  localStorage.setItem(`api_assignment_${userId}`, JSON.stringify(assignment));
  
  // 4. Also store AI settings to enable the system
  const aiSettings = {
    kimiK2ApiKey: apiKey,
    enableAI: true,
    aiProvider: 'moonshot',
    maxTokensPerDay: 1000
  };
  
  localStorage.setItem(`aiSettings_${userId}`, JSON.stringify(aiSettings));
  
  console.log('✅ INSTANT SETUP COMPLETE: User now has full AI access');
};

const showInstantSetupNotification = () => {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm border border-green-400';
  notification.innerHTML = `
    <div class="flex items-start space-x-3">
      <div class="flex-shrink-0">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <div>
        <h4 class="font-bold">🎉 AI Access Activated!</h4>
        <p class="text-sm mt-1">Your account now has full AI-powered health analytics. Page will refresh automatically...</p>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);
};

// Function to check if user needs instant setup
export const checkAndSetupUser = async (userId: string): Promise<boolean> => {
  try {
    // Check if user already has access
    const hasAccess = await autoApiKeyService.hasValidApiAccess(userId);
    if (hasAccess) {
      console.log('✅ User already has API access');
      return true;
    }
    
    // Check localStorage for manual setup
    const localSettings = localStorage.getItem(`aiSettings_${userId}`);
    if (localSettings) {
      const settings = JSON.parse(localSettings);
      if (settings.enableAI && settings.kimiK2ApiKey) {
        console.log('✅ User has manual API setup');
        return true;
      }
    }
    
    // User needs setup - do it now!
    console.log('🔧 User needs API setup - doing instant setup...');
    await forceSetupApiForCurrentUser(userId);
    return true;
    
  } catch (error) {
    console.error('Error in instant setup:', error);
    return false;
  }
};

export default { forceSetupApiForCurrentUser, checkAndSetupUser };