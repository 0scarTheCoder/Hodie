// User Metrics and Health Score Tracking Service
interface UserLoginData {
  userId: string;
  lastLogin: Date;
  loginStreak: number;
  totalLogins: number;
  firstLogin: Date;
  consecutiveDays: number;
}

interface HealthMetrics {
  userId: string;
  timestamp: Date;
  bloodPressure?: { systolic: number; diastolic: number };
  heartRate?: number;
  cholesterol?: number;
  glucose?: number;
  inflammation?: number; // CRP levels
  hrv?: number; // Heart Rate Variability
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
}

interface BiologicalAgeFactors {
  chronologicalAge: number;
  fitness: number; // 0-100
  inflammation: number; // CRP levels
  hrv: number;
  bloodPressure: number;
  cholesterol: number;
  glucose: number;
  sleepQuality: number;
  stressLevel: number;
}

interface HealthScoreMetrics {
  currentScore: number;
  changeIn60Days: number;
  biologicalAge: number;
  chronologicalAge: number;
  keyWins: string[];
  focusArea: string;
  lastUpdated: Date;
}

class UserMetricsService {
  private dbName = 'HodieLabsDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // User login tracking
        if (!db.objectStoreNames.contains('userLogins')) {
          const loginStore = db.createObjectStore('userLogins', { keyPath: 'userId' });
          loginStore.createIndex('lastLogin', 'lastLogin', { unique: false });
        }

        // Health metrics tracking
        if (!db.objectStoreNames.contains('healthMetrics')) {
          const metricsStore = db.createObjectStore('healthMetrics', { 
            keyPath: ['userId', 'timestamp'] 
          });
          metricsStore.createIndex('userId', 'userId', { unique: false });
          metricsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Calculated health scores
        if (!db.objectStoreNames.contains('healthScores')) {
          const scoresStore = db.createObjectStore('healthScores', { keyPath: 'userId' });
          scoresStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }
      };
    });
  }

  // Track user login and calculate streak
  async trackUserLogin(userId: string): Promise<UserLoginData> {
    await this.ensureDBReady();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    
    const transaction = this.db!.transaction(['userLogins'], 'readwrite');
    const store = transaction.objectStore('userLogins');
    
    const existing = await this.getFromStore(store, userId) as UserLoginData | undefined;
    
    let loginData: UserLoginData;
    
    if (!existing) {
      // First time user
      loginData = {
        userId,
        lastLogin: today,
        loginStreak: 1,
        totalLogins: 1,
        firstLogin: today,
        consecutiveDays: 1
      };
    } else {
      const lastLoginDate = new Date(existing.lastLogin);
      lastLoginDate.setHours(0, 0, 0, 0);
      
      const daysSinceLastLogin = Math.floor((today.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastLogin === 0) {
        // Same day login - don't update streak
        return existing;
      } else if (daysSinceLastLogin === 1) {
        // Consecutive day - increment streak
        loginData = {
          ...existing,
          lastLogin: today,
          loginStreak: existing.loginStreak + 1,
          totalLogins: existing.totalLogins + 1,
          consecutiveDays: existing.consecutiveDays + 1
        };
      } else {
        // Streak broken - reset
        loginData = {
          ...existing,
          lastLogin: today,
          loginStreak: 1,
          totalLogins: existing.totalLogins + 1,
          consecutiveDays: 1
        };
      }
    }
    
    await this.putToStore(store, loginData);
    return loginData;
  }

  // Calculate biological age based on health metrics
  calculateBiologicalAge(factors: BiologicalAgeFactors): number {
    const {
      chronologicalAge,
      fitness,
      inflammation,
      hrv,
      bloodPressure,
      cholesterol,
      glucose,
      sleepQuality,
      stressLevel
    } = factors;

    // Base age adjustment factors (can be negative for better health)
    let ageAdjustment = 0;

    // Fitness factor (good fitness reduces biological age)
    ageAdjustment += (50 - fitness) * 0.1; // -5 to +5 years

    // Inflammation (CRP < 1.0 is optimal)
    if (inflammation > 3.0) ageAdjustment += 3;
    else if (inflammation > 1.0) ageAdjustment += 1;
    else ageAdjustment -= 1;

    // Heart Rate Variability (higher is better)
    if (hrv > 50) ageAdjustment -= 2;
    else if (hrv < 30) ageAdjustment += 2;

    // Blood pressure (optimal < 120/80)
    if (bloodPressure > 140) ageAdjustment += 4;
    else if (bloodPressure > 130) ageAdjustment += 2;
    else if (bloodPressure < 120) ageAdjustment -= 1;

    // Cholesterol (total < 5.0 mmol/L optimal)
    if (cholesterol > 6.5) ageAdjustment += 2;
    else if (cholesterol < 5.0) ageAdjustment -= 1;

    // Glucose (fasting < 5.6 mmol/L optimal)
    if (glucose > 7.0) ageAdjustment += 3;
    else if (glucose > 5.6) ageAdjustment += 1;
    else if (glucose < 5.0) ageAdjustment -= 1;

    // Sleep quality
    ageAdjustment += (75 - sleepQuality) * 0.05;

    // Stress level
    ageAdjustment += (stressLevel - 50) * 0.03;

    return Math.max(18, Math.round(chronologicalAge + ageAdjustment));
  }

  // Calculate comprehensive health score
  calculateHealthScore(
    currentMetrics: HealthMetrics,
    previousMetrics: HealthMetrics[],
    loginData: UserLoginData,
    userAge: number
  ): HealthScoreMetrics {
    let score = 50; // Base score

    // Login streak bonus (up to 10 points)
    score += Math.min(loginData.loginStreak * 0.5, 10);

    // Biomarker scores
    if (currentMetrics.bloodPressure) {
      const { systolic, diastolic } = currentMetrics.bloodPressure;
      if (systolic < 120 && diastolic < 80) score += 8;
      else if (systolic < 130 && diastolic < 85) score += 5;
      else if (systolic > 140 || diastolic > 90) score -= 5;
    }

    if (currentMetrics.heartRate) {
      if (currentMetrics.heartRate >= 60 && currentMetrics.heartRate <= 100) score += 5;
    }

    if (currentMetrics.cholesterol) {
      if (currentMetrics.cholesterol < 5.0) score += 8;
      else if (currentMetrics.cholesterol > 6.5) score -= 5;
    }

    if (currentMetrics.glucose) {
      if (currentMetrics.glucose < 5.6) score += 8;
      else if (currentMetrics.glucose > 7.0) score -= 8;
    }

    if (currentMetrics.inflammation) {
      if (currentMetrics.inflammation < 1.0) score += 10;
      else if (currentMetrics.inflammation > 3.0) score -= 8;
    }

    if (currentMetrics.hrv) {
      if (currentMetrics.hrv > 50) score += 8;
      else if (currentMetrics.hrv < 30) score -= 5;
    }

    // Calculate 60-day change
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const oldMetrics = previousMetrics.find(m => 
      new Date(m.timestamp) <= sixtyDaysAgo
    );

    let changeIn60Days = 0;
    if (oldMetrics) {
      const oldScore = this.calculateBaseScore(oldMetrics);
      const currentScore = this.calculateBaseScore(currentMetrics);
      changeIn60Days = currentScore - oldScore;
    }

    // Calculate biological age
    const biologicalAge = this.calculateBiologicalAge({
      chronologicalAge: userAge,
      fitness: 70, // Default - should come from user data
      inflammation: currentMetrics.inflammation || 2.0,
      hrv: currentMetrics.hrv || 40,
      bloodPressure: currentMetrics.bloodPressure?.systolic || 120,
      cholesterol: currentMetrics.cholesterol || 5.2,
      glucose: currentMetrics.glucose || 5.5,
      sleepQuality: 70, // Default - should come from sleep tracking
      stressLevel: 50 // Default - should come from user input
    });

    // Identify key wins and focus areas
    const keyWins = this.identifyKeyWins(currentMetrics, previousMetrics);
    const focusArea = this.identifyFocusArea(currentMetrics);

    return {
      currentScore: Math.min(100, Math.max(0, Math.round(score))),
      changeIn60Days,
      biologicalAge,
      chronologicalAge: userAge,
      keyWins,
      focusArea,
      lastUpdated: new Date()
    };
  }

  private calculateBaseScore(metrics: HealthMetrics): number {
    let score = 50;
    
    if (metrics.bloodPressure) {
      const { systolic } = metrics.bloodPressure;
      if (systolic < 120) score += 8;
      else if (systolic > 140) score -= 5;
    }
    
    if (metrics.cholesterol) {
      if (metrics.cholesterol < 5.0) score += 8;
      else if (metrics.cholesterol > 6.5) score -= 5;
    }
    
    if (metrics.glucose) {
      if (metrics.glucose < 5.6) score += 8;
      else if (metrics.glucose > 7.0) score -= 8;
    }
    
    return score;
  }

  private identifyKeyWins(current: HealthMetrics, previous: HealthMetrics[]): string[] {
    const wins: string[] = [];
    
    if (previous.length === 0) return wins;
    
    const lastMetrics = previous[previous.length - 1];
    
    // Check inflammation improvement
    if (current.inflammation && lastMetrics.inflammation && 
        current.inflammation < lastMetrics.inflammation * 0.88) {
      const improvement = Math.round((1 - current.inflammation / lastMetrics.inflammation) * 100);
      wins.push(`Inflammation -${improvement}%`);
    }
    
    // Check HRV improvement
    if (current.hrv && lastMetrics.hrv && 
        current.hrv > lastMetrics.hrv * 1.15) {
      const improvement = Math.round((current.hrv / lastMetrics.hrv - 1) * 100);
      wins.push(`HRV +${improvement}%`);
    }
    
    // Check cholesterol improvement
    if (current.cholesterol && lastMetrics.cholesterol && 
        current.cholesterol < lastMetrics.cholesterol * 0.9) {
      wins.push('Cholesterol improved');
    }
    
    return wins;
  }

  private identifyFocusArea(metrics: HealthMetrics): string {
    // Prioritize focus areas based on health risks
    
    if (metrics.glucose && metrics.glucose > 5.6) {
      return `Reduce fasting glucose from ${metrics.glucose.toFixed(1)} to 5.0 mmol/L`;
    }
    
    if (metrics.bloodPressure && metrics.bloodPressure.systolic > 130) {
      return `Lower blood pressure from ${metrics.bloodPressure.systolic}/${metrics.bloodPressure.diastolic} to <120/80`;
    }
    
    if (metrics.cholesterol && metrics.cholesterol > 5.5) {
      return `Reduce cholesterol from ${metrics.cholesterol.toFixed(1)} to <5.0 mmol/L`;
    }
    
    if (metrics.inflammation && metrics.inflammation > 3.0) {
      return `Lower inflammation (CRP) from ${metrics.inflammation.toFixed(1)} to <1.0 mg/L`;
    }
    
    return 'Maintain current health improvements';
  }

  // Store health metrics
  async storeHealthMetrics(metrics: HealthMetrics): Promise<void> {
    await this.ensureDBReady();
    
    const transaction = this.db!.transaction(['healthMetrics'], 'readwrite');
    const store = transaction.objectStore('healthMetrics');
    
    await this.putToStore(store, {
      ...metrics,
      timestamp: new Date()
    });
  }

  // Get user's health score metrics
  async getUserHealthScore(userId: string, userAge: number): Promise<HealthScoreMetrics> {
    await this.ensureDBReady();
    
    // Get login data
    const loginTransaction = this.db!.transaction(['userLogins'], 'readonly');
    const loginStore = loginTransaction.objectStore('userLogins');
    const loginData = await this.getFromStore(loginStore, userId) as UserLoginData;
    
    if (!loginData) {
      // New user - track first login
      const newLoginData = await this.trackUserLogin(userId);
      return this.generateDefaultHealthScore(userAge, newLoginData);
    }
    
    // Get health metrics
    const metricsTransaction = this.db!.transaction(['healthMetrics'], 'readonly');
    const metricsStore = metricsTransaction.objectStore('healthMetrics');
    const userIndex = metricsStore.index('userId');
    const allMetrics = await this.getAllFromIndex(userIndex, userId) as HealthMetrics[];
    
    if (allMetrics.length === 0) {
      return this.generateDefaultHealthScore(userAge, loginData);
    }
    
    // Sort by timestamp
    allMetrics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    const currentMetrics = allMetrics[0];
    const previousMetrics = allMetrics.slice(1);
    
    const healthScore = this.calculateHealthScore(currentMetrics, previousMetrics, loginData, userAge);
    
    // Store calculated score
    const scoresTransaction = this.db!.transaction(['healthScores'], 'readwrite');
    const scoresStore = scoresTransaction.objectStore('healthScores');
    await this.putToStore(scoresStore, { userId, ...healthScore });
    
    return healthScore;
  }

  private generateDefaultHealthScore(userAge: number, loginData: UserLoginData): HealthScoreMetrics {
    // Generate realistic sample data for demo
    const baseScore = 45 + loginData.loginStreak * 0.5;
    
    return {
      currentScore: Math.round(baseScore),
      changeIn60Days: loginData.totalLogins > 30 ? Math.floor(Math.random() * 10) - 2 : 0,
      biologicalAge: userAge - Math.floor(Math.random() * 8) + 2,
      chronologicalAge: userAge,
      keyWins: this.generateSampleWins(),
      focusArea: this.generateSampleFocusArea(),
      lastUpdated: new Date()
    };
  }

  private generateSampleWins(): string[] {
    const possibleWins = [
      'Inflammation -12%',
      'HRV +18%',
      'Cholesterol improved',
      'Blood pressure -5%',
      'Sleep quality +15%',
      'Stress levels -20%'
    ];
    
    return possibleWins.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  private generateSampleFocusArea(): string {
    const focusAreas = [
      'Reduce fasting glucose from 5.5 to 5.0 mmol/L',
      'Lower blood pressure from 135/85 to <120/80',
      'Improve sleep quality from 6.5 to 8+ hours',
      'Reduce inflammation (CRP) from 2.8 to <1.0 mg/L',
      'Increase daily steps from 6,000 to 10,000'
    ];
    
    return focusAreas[Math.floor(Math.random() * focusAreas.length)];
  }

  // Helper methods for IndexedDB operations
  private async ensureDBReady(): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }
  }

  private getFromStore(store: IDBObjectStore, key: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private putToStore(store: IDBObjectStore, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private getAllFromIndex(index: IDBIndex, key: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const request = index.getAll(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const userMetricsService = new UserMetricsService();
export type { 
  UserLoginData, 
  HealthMetrics, 
  HealthScoreMetrics,
  BiologicalAgeFactors
};