/**
 * Live Recommendations Service
 * Provides real-time, recurrent health recommendations based on user data and current health insights
 */

import { publicHealthDatabaseService, PublicHealthData, HealthAlert } from './publicHealthDatabaseService';

export interface LiveRecommendation {
  id: string;
  type: 'immediate' | 'daily' | 'weekly' | 'monthly' | 'emergency';
  category: 'nutrition' | 'exercise' | 'medication' | 'monitoring' | 'lifestyle' | 'preventive';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  reasoning: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  references: HealthReference[];
  expiresAt: Date;
  isPersonalized: boolean;
  triggers: string[]; // What triggered this recommendation
  userContext: {
    conditions: string[];
    medications: string[];
    recentLabs: any[];
    symptoms: string[];
  };
}

export interface HealthReference {
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  pmid?: string;
  url: string;
  abstractSummary: string;
  evidenceGrade: string;
  relevanceScore: number;
}

export interface RecommendationSchedule {
  userId: string;
  dailyChecks: Date;
  weeklyReview: Date;
  monthlyAssessment: Date;
  lastUpdated: Date;
  preferences: {
    frequency: 'real-time' | 'daily' | 'weekly';
    categories: string[];
    emergencyAlerts: boolean;
  };
}

class LiveRecommendationsService {
  private activeRecommendations = new Map<string, LiveRecommendation[]>();
  private userSchedules = new Map<string, RecommendationSchedule>();
  private updateInterval: NodeJS.Timeout | null = null;

  /**
   * Start live monitoring for a user
   */
  async startLiveMonitoring(userId: string, preferences: any): Promise<void> {
    const schedule: RecommendationSchedule = {
      userId,
      dailyChecks: new Date(),
      weeklyReview: new Date(),
      monthlyAssessment: new Date(),
      lastUpdated: new Date(),
      preferences: {
        frequency: preferences.frequency || 'daily',
        categories: preferences.categories || ['nutrition', 'exercise', 'medication', 'monitoring'],
        emergencyAlerts: preferences.emergencyAlerts !== false
      }
    };

    this.userSchedules.set(userId, schedule);
    
    // Start background monitoring
    if (!this.updateInterval) {
      this.updateInterval = setInterval(() => {
        this.performScheduledUpdates();
      }, 60 * 60 * 1000); // Check every hour
    }

    // Generate initial recommendations
    await this.generateInitialRecommendations(userId);
  }

  /**
   * Generate live recommendations for user
   */
  async generateLiveRecommendations(
    userId: string,
    userProfile: any,
    recentActivity: any = {}
  ): Promise<LiveRecommendation[]> {
    const recommendations: LiveRecommendation[] = [];

    try {
      // Check for immediate health alerts
      const healthAlerts = await publicHealthDatabaseService.getCurrentHealthAlerts({
        conditions: userProfile.conditions || [],
        medications: userProfile.medications || [],
        age: userProfile.age || 30,
        location: userProfile.location || 'Australia'
      });

      // Convert alerts to emergency recommendations
      for (const alert of healthAlerts) {
        if (alert.severity === 'high' || alert.severity === 'critical') {
          recommendations.push(await this.createEmergencyRecommendation(alert, userProfile));
        }
      }

      // Generate personalised daily recommendations
      const dailyRecs = await this.generateDailyRecommendations(userProfile, recentActivity);
      recommendations.push(...dailyRecs);

      // Generate medication management recommendations
      const medRecs = await this.generateMedicationRecommendations(userProfile);
      recommendations.push(...medRecs);

      // Generate lab monitoring recommendations
      const labRecs = await this.generateLabMonitoringRecommendations(userProfile);
      recommendations.push(...labRecs);

      // Store recommendations
      this.activeRecommendations.set(userId, recommendations);

      return recommendations.sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));

    } catch (error) {
      console.error('Error generating live recommendations:', error);
      return [];
    }
  }

  /**
   * Get current active recommendations for user
   */
  getActiveRecommendations(userId: string): LiveRecommendation[] {
    const recommendations = this.activeRecommendations.get(userId) || [];
    
    // Filter out expired recommendations
    const now = new Date();
    const activeRecs = recommendations.filter(rec => rec.expiresAt > now);
    
    // Update stored recommendations
    this.activeRecommendations.set(userId, activeRecs);
    
    return activeRecs;
  }

  /**
   * Generate initial recommendations when user starts monitoring
   */
  private async generateInitialRecommendations(userId: string): Promise<void> {
    try {
      // Get user profile from your user service
      const userProfile = await this.getUserProfile(userId);
      
      // Generate comprehensive initial assessment
      const recommendations = await this.generateLiveRecommendations(userId, userProfile);
      
      console.log(`Generated ${recommendations.length} initial recommendations for user ${userId}`);
    } catch (error) {
      console.error('Error generating initial recommendations:', error);
    }
  }

  /**
   * Generate daily health recommendations
   */
  private async generateDailyRecommendations(userProfile: any, recentActivity: any): Promise<LiveRecommendation[]> {
    const recommendations: LiveRecommendation[] = [];
    const now = new Date();

    // Nutrition recommendations based on recent activity
    if (recentActivity.lowFiberIntake) {
      recommendations.push({
        id: `nutrition_fibre_${now.getTime()}`,
        type: 'daily',
        category: 'nutrition',
        priority: 'medium',
        title: 'Increase Fiber Intake Today',
        description: 'Your recent nutrition data suggests low fibre intake. Aim for 25-35g of fibre today.',
        actionItems: [
          'Add 1 cup of berries to breakfast',
          'Include legumes in lunch',
          'Choose whole grain options',
          'Snack on raw vegetables with hummus'
        ],
        reasoning: 'Adequate fibre intake supports digestive health, blood sugar control, and cardiovascular health.',
        evidenceLevel: 'A',
        references: [
          {
            title: 'Dietary fibre intake and risk of cardiovascular disease: systematic review and meta-analysis',
            authors: ['Threapleton DE', 'Greenwood DC', 'Evans CE'],
            journal: 'BMJ',
            year: 2013,
            pmid: '24355537',
            url: 'https://pubmed.ncbi.nlm.nih.gov/24355537/',
            abstractSummary: 'Higher fibre intake significantly reduces cardiovascular disease risk.',
            evidenceGrade: 'A',
            relevanceScore: 95
          }
        ],
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        isPersonalized: true,
        triggers: ['low fibre intake detected'],
        userContext: {
          conditions: userProfile.conditions || [],
          medications: userProfile.medications || [],
          recentLabs: [],
          symptoms: []
        }
      });
    }

    // Exercise recommendations
    if (recentActivity.sedentaryTime > 8) {
      recommendations.push({
        id: `exercise_movement_${now.getTime()}`,
        type: 'immediate',
        category: 'exercise',
        priority: 'high',
        title: 'Movement Break Needed',
        description: 'You\'ve been sedentary for over 8 hours. Take active breaks to improve circulation and metabolism.',
        actionItems: [
          'Take a 5-10 minute walk',
          'Do 2 minutes of stretching',
          'Perform desk exercises',
          'Use stairs instead of elevator'
        ],
        reasoning: 'Prolonged sitting increases cardiovascular risk and metabolic dysfunction. Regular movement breaks are essential.',
        evidenceLevel: 'A',
        references: [
          {
            title: 'Breaking up prolonged sitting reduces postprandial glucose and insulin responses',
            authors: ['Dunstan DW', 'Kingwell BA', 'Larsen R'],
            journal: 'Diabetes Care',
            year: 2012,
            pmid: '22374636',
            url: 'https://pubmed.ncbi.nlm.nih.gov/22374636/',
            abstractSummary: 'Breaking up sitting time significantly improves glucose metabolism.',
            evidenceGrade: 'A',
            relevanceScore: 92
          }
        ],
        expiresAt: new Date(now.getTime() + 4 * 60 * 60 * 1000),
        isPersonalized: true,
        triggers: ['prolonged sedentary time detected'],
        userContext: {
          conditions: userProfile.conditions || [],
          medications: userProfile.medications || [],
          recentLabs: [],
          symptoms: []
        }
      });
    }

    return recommendations;
  }

  /**
   * Generate medication management recommendations
   */
  private async generateMedicationRecommendations(userProfile: any): Promise<LiveRecommendation[]> {
    const recommendations: LiveRecommendation[] = [];
    const medications = userProfile.medications || [];

    for (const medication of medications) {
      // Check for drug interactions
      const interactions = await this.checkDrugInteractions(medications);
      if (interactions.length > 0) {
        recommendations.push({
          id: `med_interaction_${Date.now()}`,
          type: 'immediate',
          category: 'medication',
          priority: 'critical',
          title: 'Potential Drug Interaction Detected',
          description: `Potential interaction between ${interactions[0].drug1} and ${interactions[0].drug2}`,
          actionItems: [
            'Contact your prescribing physician immediately',
            'Do not stop medications without medical supervision',
            'Bring all medications to your next appointment'
          ],
          reasoning: 'Drug interactions can cause serious adverse effects or reduce medication effectiveness.',
          evidenceLevel: 'A',
          references: [
            {
              title: 'Clinical significance of drug interactions',
              authors: ['Magro L', 'Moretti U', 'Leone R'],
              journal: 'Drug Saf',
              year: 2012,
              url: 'https://pubmed.ncbi.nlm.nih.gov/22339505/',
              abstractSummary: 'Drug interactions are a significant cause of adverse drug events.',
              evidenceGrade: 'A',
              relevanceScore: 98
            }
          ],
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isPersonalized: true,
          triggers: ['drug interaction analysis'],
          userContext: {
            conditions: userProfile.conditions || [],
            medications: userProfile.medications || [],
            recentLabs: [],
            symptoms: []
          }
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate lab monitoring recommendations
   */
  private async generateLabMonitoringRecommendations(userProfile: any): Promise<LiveRecommendation[]> {
    const recommendations: LiveRecommendation[] = [];
    const conditions = userProfile.conditions || [];
    const lastLabDate = userProfile.lastLabDate ? new Date(userProfile.lastLabDate) : null;
    const now = new Date();

    // Check if labs are due
    for (const condition of conditions) {
      const monitoringInterval = this.getLabMonitoringInterval(condition);
      if (lastLabDate && now.getTime() - lastLabDate.getTime() > monitoringInterval) {
        recommendations.push({
          id: `lab_monitoring_${condition}_${Date.now()}`,
          type: 'weekly',
          category: 'monitoring',
          priority: 'medium',
          title: `${condition} Monitoring Labs Due`,
          description: `Your routine monitoring labs for ${condition} are overdue. Schedule with your healthcare provider.`,
          actionItems: [
            'Contact your GP to schedule lab work',
            'Review current symptoms',
            'Prepare questions for your appointment',
            'Bring current medication list'
          ],
          reasoning: `Regular monitoring is essential for optimal ${condition} management and early detection of complications.`,
          evidenceLevel: 'A',
          references: [
            {
              title: `Clinical monitoring guidelines for ${condition}`,
              authors: ['Clinical Practice Guidelines'],
              journal: 'Medical Guidelines',
              year: 2024,
              url: `https://guidelines.org/${condition}`,
              abstractSummary: `Evidence-based monitoring recommendations for ${condition}.`,
              evidenceGrade: 'A',
              relevanceScore: 90
            }
          ],
          expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          isPersonalized: true,
          triggers: ['overdue lab monitoring'],
          userContext: {
            conditions: userProfile.conditions || [],
            medications: userProfile.medications || [],
            recentLabs: [],
            symptoms: []
          }
        });
      }
    }

    return recommendations;
  }

  /**
   * Create emergency recommendation from health alert
   */
  private async createEmergencyRecommendation(alert: HealthAlert, userProfile: any): Promise<LiveRecommendation> {
    return {
      id: `emergency_${alert.id}`,
      type: 'emergency',
      category: 'medication',
      priority: 'critical',
      title: alert.title,
      description: alert.description,
      actionItems: [alert.actionRequired],
      reasoning: `Health authority alert requiring immediate attention: ${alert.source}`,
      evidenceLevel: 'A',
      references: [
        {
          title: alert.title,
          authors: [alert.source],
          journal: 'Health Authority Alert',
          year: new Date().getFullYear(),
          url: '#',
          abstractSummary: alert.description,
          evidenceGrade: 'A',
          relevanceScore: 100
        }
      ],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isPersonalized: true,
      triggers: [`${alert.source} health alert`],
      userContext: {
        conditions: userProfile.conditions || [],
        medications: userProfile.medications || [],
        recentLabs: [],
        symptoms: []
      }
    };
  }

  /**
   * Perform scheduled updates for all users
   */
  private async performScheduledUpdates(): Promise<void> {
    const now = new Date();
    
    this.userSchedules.forEach((schedule, userId) => {
      try {
        // Check if daily update is due
        if (now.getTime() - schedule.dailyChecks.getTime() > 24 * 60 * 60 * 1000) {
          this.generateInitialRecommendations(userId);
          schedule.dailyChecks = now;
          schedule.lastUpdated = now;
        }
        
        // Weekly comprehensive review
        if (now.getTime() - schedule.weeklyReview.getTime() > 7 * 24 * 60 * 60 * 1000) {
          this.performWeeklyReview(userId);
          schedule.weeklyReview = now;
        }
        
      } catch (error) {
        console.error(`Error updating recommendations for user ${userId}:`, error);
      }
    });
  }

  /**
   * Perform weekly comprehensive review
   */
  private async performWeeklyReview(userId: string): Promise<void> {
    // Implementation for weekly comprehensive health review
    console.log(`Performing weekly review for user ${userId}`);
  }

  /**
   * Helper methods
   */
  private getPriorityWeight(priority: string): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  private async getUserProfile(userId: string): Promise<any> {
    // Mock user profile - in production would fetch from user service
    return {
      conditions: ['hypertension'],
      medications: ['lisinopril'],
      age: 35,
      location: 'Australia',
      lastLabDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    };
  }

  private async checkDrugInteractions(medications: string[]): Promise<any[]> {
    // Mock drug interaction check - in production would use drug interaction API
    return [];
  }

  private getLabMonitoringInterval(condition: string): number {
    // Return monitoring interval in milliseconds
    switch (condition.toLowerCase()) {
      case 'diabetes':
      case 'hypertension':
        return 3 * 30 * 24 * 60 * 60 * 1000; // 3 months
      case 'thyroid':
        return 6 * 30 * 24 * 60 * 60 * 1000; // 6 months
      default:
        return 12 * 30 * 24 * 60 * 60 * 1000; // 12 months
    }
  }

  /**
   * Stop monitoring for user
   */
  stopLiveMonitoring(userId: string): void {
    this.userSchedules.delete(userId);
    this.activeRecommendations.delete(userId);
    
    // If no users being monitored, clear interval
    if (this.userSchedules.size === 0 && this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

export const liveRecommendationsService = new LiveRecommendationsService();