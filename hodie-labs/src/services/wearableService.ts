// Wearable Device Integration Service
// Supports Apple Health, Google Fit, Fitbit, and other health devices

interface HealthData {
  steps?: number;
  heartRate?: number;
  calories?: number;
  sleep?: {
    duration: number;
    quality: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  };
  weight?: number;
  distance?: number;
  timestamp: Date;
}

interface DeviceInfo {
  type: 'apple_health' | 'google_fit' | 'fitbit' | 'garmin' | 'samsung_health';
  connected: boolean;
  lastSync?: Date;
  permissions?: string[];
}

class WearableService {
  private devices: Map<string, DeviceInfo> = new Map();

  // Apple Health Integration
  async connectAppleHealth(): Promise<boolean> {
    try {
      // Check if running in iOS Safari or PWA
      if (!this.isIOS()) {
        throw new Error('Apple Health is only available on iOS devices');
      }

      // Request HealthKit permissions
      const permissions = [
        'steps',
        'heart_rate',
        'active_energy',
        'distance_walking_running',
        'sleep_analysis',
        'body_mass'
      ];

      // Note: Actual HealthKit integration requires native iOS app or PWA with specific capabilities
      // For web implementation, we'll simulate the connection
      console.log('Requesting Apple Health permissions:', permissions);
      
      // Simulate permission request
      const granted = await this.simulatePermissionRequest('Apple Health');
      
      if (granted) {
        this.devices.set('apple_health', {
          type: 'apple_health',
          connected: true,
          lastSync: new Date(),
          permissions
        });
        
        // Start periodic sync
        this.startPeriodicSync('apple_health');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Apple Health connection failed:', error);
      return false;
    }
  }

  // Google Fit Integration  
  async connectGoogleFit(): Promise<boolean> {
    try {
      // Google Fit REST API integration
      const scopes = [
        'https://www.googleapis.com/auth/fitness.activity.read',
        'https://www.googleapis.com/auth/fitness.body.read',
        'https://www.googleapis.com/auth/fitness.heart_rate.read',
        'https://www.googleapis.com/auth/fitness.sleep.read'
      ];

      // Note: Requires Google OAuth setup and API credentials
      console.log('Requesting Google Fit permissions:', scopes);
      
      const granted = await this.simulatePermissionRequest('Google Fit');
      
      if (granted) {
        this.devices.set('google_fit', {
          type: 'google_fit',
          connected: true,
          lastSync: new Date(),
          permissions: scopes
        });
        
        this.startPeriodicSync('google_fit');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Google Fit connection failed:', error);
      return false;
    }
  }

  // Fitbit Integration
  async connectFitbit(): Promise<boolean> {
    try {
      // Fitbit Web API integration
      const scopes = [
        'activity',
        'heartrate',
        'sleep',
        'weight',
        'profile'
      ];

      console.log('Requesting Fitbit permissions:', scopes);
      
      const granted = await this.simulatePermissionRequest('Fitbit');
      
      if (granted) {
        this.devices.set('fitbit', {
          type: 'fitbit',
          connected: true,
          lastSync: new Date(),
          permissions: scopes
        });
        
        this.startPeriodicSync('fitbit');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Fitbit connection failed:', error);
      return false;
    }
  }

  // Generic device sync
  async syncDeviceData(deviceType: string): Promise<HealthData[]> {
    const device = this.devices.get(deviceType);
    if (!device || !device.connected) {
      throw new Error(`Device ${deviceType} is not connected`);
    }

    try {
      // Simulate fetching data from device
      const mockData = this.generateMockHealthData(deviceType);
      
      // Update last sync time
      device.lastSync = new Date();
      this.devices.set(deviceType, device);
      
      return mockData;
    } catch (error) {
      console.error(`Sync failed for ${deviceType}:`, error);
      throw error;
    }
  }

  // Get all connected devices
  getConnectedDevices(): DeviceInfo[] {
    return Array.from(this.devices.values()).filter(device => device.connected);
  }

  // Disconnect device
  async disconnectDevice(deviceType: string): Promise<boolean> {
    const device = this.devices.get(deviceType);
    if (device) {
      device.connected = false;
      this.devices.set(deviceType, device);
      return true;
    }
    return false;
  }

  // Check device compatibility
  isDeviceSupported(deviceType: string): boolean {
    const supportedDevices = ['apple_health', 'google_fit', 'fitbit', 'garmin', 'samsung_health'];
    return supportedDevices.includes(deviceType);
  }

  // Private helper methods
  private isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  private isAndroid(): boolean {
    return /Android/.test(navigator.userAgent);
  }

  private async simulatePermissionRequest(deviceName: string): Promise<boolean> {
    // Simulate user permission dialog
    return new Promise((resolve) => {
      const granted = window.confirm(
        `Would you like to connect ${deviceName} to sync your health data with Hodie Labs? 
        
This will allow us to:
• Import your step count and activity data
• Track your heart rate and sleep patterns  
• Monitor your weight and body metrics
• Provide personalized health insights

Your data is encrypted and never shared with third parties.`
      );
      
      setTimeout(() => resolve(granted), 1000);
    });
  }

  private generateMockHealthData(deviceType: string): HealthData[] {
    const data: HealthData[] = [];
    const now = new Date();
    
    // Generate 7 days of mock data
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        steps: Math.floor(Math.random() * 5000) + 5000, // 5000-10000 steps
        heartRate: Math.floor(Math.random() * 30) + 60, // 60-90 bpm
        calories: Math.floor(Math.random() * 300) + 200, // 200-500 calories
        sleep: {
          duration: Math.random() * 2 + 6.5, // 6.5-8.5 hours
          quality: ['Poor', 'Fair', 'Good', 'Excellent'][Math.floor(Math.random() * 4)] as any
        },
        weight: Math.random() * 10 + 65, // 65-75 kg
        distance: Math.random() * 3 + 2, // 2-5 km
        timestamp: date
      });
    }
    
    return data;
  }

  private startPeriodicSync(deviceType: string): void {
    // Start background sync every 15 minutes
    setInterval(async () => {
      try {
        const data = await this.syncDeviceData(deviceType);
        console.log(`Synced ${data.length} records from ${deviceType}`);
        
        // Send data to backend
        await this.sendDataToBackend(data);
      } catch (error) {
        console.error(`Periodic sync failed for ${deviceType}:`, error);
      }
    }, 15 * 60 * 1000); // 15 minutes
  }

  private async sendDataToBackend(healthData: HealthData[]): Promise<void> {
    try {
      // Send synchronized data to backend API
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/health-metrics/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: healthData }),
      });

      if (!response.ok) {
        throw new Error('Failed to send data to backend');
      }
      
      console.log('Health data synchronized to backend');
    } catch (error) {
      console.error('Backend sync failed:', error);
    }
  }
}

export const wearableService = new WearableService();