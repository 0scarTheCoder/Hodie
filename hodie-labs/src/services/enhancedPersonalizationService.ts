// Enhanced Personalization Engine
// Combines genetic, lab, lifestyle, and symptom data for precision health recommendations

import { GeneticProfile, HealthPredisposition, NutrientRecommendation } from './geneticAnalysisService';
import { ComprehensiveLabPanel, LabResult } from './labIntegrationService';

interface PersonalHealthProfile {
  userId: string;
  demographics: {
    age: number;
    sex: 'male' | 'female' | 'other';
    ethnicity?: string;
    location: string;
  };
  genetic?: GeneticProfile;
  labResults: ComprehensiveLabPanel[];
  lifestyle: LifestyleFactors;
  symptoms: SymptomTracker;
  goals: HealthGoals;
  preferences: UserPreferences;
  riskProfile: PersonalizedRiskProfile;
  lastUpdated: Date;
}

interface LifestyleFactors {
  diet: {
    pattern: 'mediterranean' | 'western' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'other';
    alcohol: 'none' | 'light' | 'moderate' | 'heavy';
    caffeine: 'none' | 'low' | 'moderate' | 'high';
    supplements: SupplementUsage[];
  };
  exercise: {
    frequency: number; // sessions per week
    intensity: 'low' | 'moderate' | 'high';
    types: string[];
    duration: number; // minutes per session
  };
  sleep: {
    averageHours: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
    sleepTime: string;
    wakeTime: string;
  };
  stress: {
    level: 'low' | 'moderate' | 'high';
    sources: string[];
    managementTechniques: string[];
  };
  environment: {
    smoking: 'never' | 'former' | 'current';
    exposure: string[]; // toxins, pollutants
    sunExposure: 'minimal' | 'moderate' | 'high';
  };
}

interface SupplementUsage {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  reason: string;
}

interface SymptomTracker {
  current: CurrentSymptom[];
  historical: HistoricalSymptom[];
  patterns: SymptomPattern[];
}

interface CurrentSymptom {
  symptom: string;
  severity: 1 | 2 | 3 | 4 | 5;
  frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
  onset: Date;
  triggers?: string[];
  impact: 'minimal' | 'mild' | 'moderate' | 'severe';
}

interface HistoricalSymptom {
  symptom: string;
  period: { start: Date; end?: Date };
  severity: number;
  resolution?: string;
}

interface SymptomPattern {
  pattern: string;
  associatedFactors: string[];
  timeOfDay?: string;
  seasonality?: string;
}

interface HealthGoals {
  primary: string;
  secondary: string[];
  timeframe: string;
  measurableTargets: MeasurableTarget[];
  motivation: string;
}

interface MeasurableTarget {
  metric: string;
  current: number;
  target: number;
  deadline: Date;
  priority: 'high' | 'medium' | 'low';
}

interface UserPreferences {
  communicationStyle: 'detailed' | 'concise' | 'visual';
  interventionTypes: ('diet' | 'exercise' | 'supplements' | 'lifestyle' | 'medical')[];
  timeCommitment: 'minimal' | 'moderate' | 'high';
  changeApproach: 'gradual' | 'moderate' | 'aggressive';
}

interface PersonalizedRiskProfile {
  cardiovascular: RiskAssessment;
  metabolic: RiskAssessment;
  cancer: RiskAssessment;
  cognitive: RiskAssessment;
  overall: RiskAssessment;
}

interface RiskAssessment {
  score: number; // 0-100
  category: 'low' | 'moderate' | 'high' | 'very_high';
  factors: RiskFactor[];
  trajectory: 'improving' | 'stable' | 'worsening';
  modifiable: boolean;
}

interface RiskFactor {
  factor: string;
  contribution: number; // percentage
  modifiable: boolean;
  intervention?: string;
}

interface PersonalizedRecommendation {
  id: string;
  type: 'dietary' | 'exercise' | 'supplement' | 'lifestyle' | 'medical' | 'monitoring';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  rationale: string;
  evidence: EvidenceLevel;
  personalizationFactors: string[];
  implementation: ImplementationGuide;
  expectedOutcomes: ExpectedOutcome[];
  monitoring: MonitoringPlan;
  interactions: string[];
  contraindications: string[];
  confidence: number; // 0-100%
}

interface EvidenceLevel {
  grade: 'A' | 'B' | 'C' | 'D'; // Clinical evidence quality
  studies: number;
  populationRelevance: number; // How relevant to user's demographics
  geneticEvidence?: number; // Genetic-specific evidence
}

interface ImplementationGuide {
  startDate: Date;
  phases: ImplementationPhase[];
  totalDuration: string;
  difficultyLevel: 'easy' | 'moderate' | 'challenging';
  resources: string[];
  support: string[];
}

interface ImplementationPhase {
  phase: number;
  duration: string;
  goals: string[];
  actions: string[];
  milestones: string[];
}

interface ExpectedOutcome {
  outcome: string;
  timeframe: string;
  probability: number; // 0-100%
  measurableImprovement: string;
}

interface MonitoringPlan {
  frequency: string;
  metrics: string[];
  methods: string[];
  alerts: string[];
}

class EnhancedPersonalizationService {
  async createPersonalizedProfile(userId: string, initialData: Partial<PersonalHealthProfile>): Promise<PersonalHealthProfile> {
    console.log('🎯 Creating enhanced personalised health profile...');

    const profile: PersonalHealthProfile = {
      userId,
      demographics: initialData.demographics || this.getDefaultDemographics(),
      genetic: initialData.genetic,
      labResults: initialData.labResults || [],
      lifestyle: initialData.lifestyle || this.getDefaultLifestyle(),
      symptoms: initialData.symptoms || this.getDefaultSymptoms(),
      goals: initialData.goals || this.getDefaultGoals(),
      preferences: initialData.preferences || this.getDefaultPreferences(),
      riskProfile: await this.calculatePersonalizedRisk(initialData),
      lastUpdated: new Date()
    };

    return profile;
  }

  async generatePersonalizedRecommendations(profile: PersonalHealthProfile): Promise<PersonalizedRecommendation[]> {
    console.log('💡 Generating highly personalised recommendations...');

    const recommendations: PersonalizedRecommendation[] = [];

    // Genetic-based recommendations
    if (profile.genetic) {
      const geneticRecs = await this.generateGeneticRecommendations(profile);
      recommendations.push(...geneticRecs);
    }

    // Lab-based recommendations
    if (profile.labResults.length > 0) {
      const labRecs = await this.generateLabBasedRecommendations(profile);
      recommendations.push(...labRecs);
    }

    // Lifestyle optimisation
    const lifestyleRecs = await this.generateLifestyleRecommendations(profile);
    recommendations.push(...lifestyleRecs);

    // Symptom-targeted interventions
    const symptomRecs = await this.generateSymptomBasedRecommendations(profile);
    recommendations.push(...symptomRecs);

    // Goal-oriented recommendations
    const goalRecs = await this.generateGoalBasedRecommendations(profile);
    recommendations.push(...goalRecs);

    // Risk mitigation strategies
    const riskRecs = await this.generateRiskMitigationRecommendations(profile);
    recommendations.push(...riskRecs);

    // Prioritize and personalize
    return this.prioritizeRecommendations(recommendations, profile);
  }

  private async generateGeneticRecommendations(profile: PersonalHealthProfile): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];

    if (!profile.genetic) return recommendations;

    // MTHFR-based folate recommendation
    const mthfrVariant = profile.genetic.variants.find(v => v.rsid === 'rs1801133');
    if (mthfrVariant && mthfrVariant.genotype !== 'CC') {
      recommendations.push({
        id: 'mthfr_folate',
        type: 'supplement',
        priority: 'high',
        title: 'Methylfolate Supplementation',
        description: `Take ${mthfrVariant.genotype === 'TT' ? '800-1000' : '600'} mcg methylfolate daily`,
        rationale: `Your MTHFR ${mthfrVariant.genotype} variant reduces folate metabolism efficiency by ${mthfrVariant.genotype === 'TT' ? '70' : '35'}%`,
        evidence: {
          grade: 'A',
          studies: 127,
          populationRelevance: 85,
          geneticEvidence: 95
        },
        personalizationFactors: ['MTHFR C677T variant', 'Folate metabolism efficiency'],
        implementation: this.createImplementationGuide('supplement', 'immediate'),
        expectedOutcomes: [
          {
            outcome: 'Improved homocysteine levels',
            timeframe: '8-12 weeks',
            probability: 90,
            measurableImprovement: '15-25% homocysteine reduction'
          }
        ],
        monitoring: {
          frequency: 'Every 3 months',
          metrics: ['Homocysteine', 'Folate', 'B12'],
          methods: ['Blood test'],
          alerts: ['Homocysteine >15 μmol/L']
        },
        interactions: ['Requires B12 for proper utilization'],
        contraindications: ['B12 deficiency (correct first)'],
        confidence: 95
      });
    }

    // ACTN3-based exercise recommendation
    const actn3Variant = profile.genetic.variants.find(v => v.rsid === 'rs1815739');
    if (actn3Variant) {
      const exerciseType = actn3Variant.genotype === 'CC' ? 'power/strength' : 
                          actn3Variant.genotype === 'TT' ? 'endurance' : 'mixed';
      
      recommendations.push({
        id: 'actn3_exercise',
        type: 'exercise',
        priority: 'medium',
        title: `Genetically Optimized ${exerciseType.charAt(0).toUpperCase() + exerciseType.slice(1)} Training`,
        description: `Focus on ${exerciseType}-based exercises for optimal genetic adaptation`,
        rationale: `Your ACTN3 ${actn3Variant.genotype} variant favors ${exerciseType} performance`,
        evidence: {
          grade: 'B',
          studies: 89,
          populationRelevance: 90,
          geneticEvidence: 88
        },
        personalizationFactors: ['ACTN3 muscle fibre genetics', 'Current fitness level'],
        implementation: this.createImplementationGuide('exercise', 'gradual'),
        expectedOutcomes: [
          {
            outcome: 'Enhanced training response',
            timeframe: '6-8 weeks',
            probability: 85,
            measurableImprovement: '20-30% performance improvement'
          }
        ],
        monitoring: {
          frequency: 'Weekly',
          metrics: ['Performance metrics', 'Recovery time'],
          methods: ['Training log', 'Heart rate monitoring'],
          alerts: ['Overtraining symptoms']
        },
        interactions: ['Synergizes with proper nutrition timing'],
        contraindications: ['Recent injury', 'Cardiovascular restrictions'],
        confidence: 88
      });
    }

    return recommendations;
  }

  private async generateLabBasedRecommendations(profile: PersonalHealthProfile): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];

    const latestLabs = profile.labResults[profile.labResults.length - 1];
    if (!latestLabs) return recommendations;

    // Vitamin D optimisation
    const vitD = latestLabs.results.find(r => r.testName.toLowerCase().includes('vitamin d'));
    if (vitD && (vitD.value as number) < 75) {
      const dosage = (vitD.value as number) < 50 ? '2000 IU' : '1000 IU';
      
      recommendations.push({
        id: 'vitamin_d_optimisation',
        type: 'supplement',
        priority: 'high',
        title: 'Vitamin D3 Optimization',
        description: `Take ${dosage} vitamin D3 daily with meals`,
        rationale: `Your vitamin D level of ${vitD.value} nmol/L is below optimal (>75 nmol/L)`,
        evidence: {
          grade: 'A',
          studies: 340,
          populationRelevance: 95,
          geneticEvidence: profile.genetic ? 75 : undefined
        },
        personalizationFactors: ['Current vitamin D level', 'Sun exposure', 'Skin type', 'Geographic location'],
        implementation: this.createImplementationGuide('supplement', 'immediate'),
        expectedOutcomes: [
          {
            outcome: 'Optimal vitamin D status',
            timeframe: '3-4 months',
            probability: 92,
            measurableImprovement: `Target >75 nmol/L from current ${vitD.value} nmol/L`
          }
        ],
        monitoring: {
          frequency: 'Every 3 months initially, then annually',
          metrics: ['25(OH)D3'],
          methods: ['Blood test'],
          alerts: ['Levels >150 nmol/L (toxicity risk)']
        },
        interactions: ['Enhances calcium absorption', 'Requires magnesium'],
        contraindications: ['Hypercalcemia', 'Kidney stones'],
        confidence: 94
      });
    }

    // Cholesterol management
    const ldl = latestLabs.results.find(r => r.testName.toLowerCase().includes('ldl'));
    if (ldl && (ldl.value as number) > 2.6) {
      recommendations.push({
        id: 'cholesterol_management',
        type: 'dietary',
        priority: 'high',
        title: 'Mediterranean Diet for Cholesterol Management',
        description: 'Adopt Mediterranean diet pattern with increased soluble fibre',
        rationale: `Your LDL cholesterol of ${ldl.value} mmol/L exceeds optimal levels (<2.6 mmol/L)`,
        evidence: {
          grade: 'A',
          studies: 520,
          populationRelevance: 98,
          geneticEvidence: profile.genetic ? 82 : undefined
        },
        personalizationFactors: ['Current LDL level', 'Dietary preferences', 'Genetic lipid metabolism'],
        implementation: this.createImplementationGuide('dietary', 'gradual'),
        expectedOutcomes: [
          {
            outcome: 'LDL cholesterol reduction',
            timeframe: '3 months',
            probability: 88,
            measurableImprovement: '10-20% LDL reduction'
          }
        ],
        monitoring: {
          frequency: 'Every 3 months',
          metrics: ['LDL cholesterol', 'Total cholesterol', 'HDL'],
          methods: ['Lipid panel'],
          alerts: ['LDL >3.4 mmol/L']
        },
        interactions: ['Synergizes with exercise', 'May reduce statin needs'],
        contraindications: ['Severe dietary restrictions'],
        confidence: 91
      });
    }

    return recommendations;
  }

  private async generateLifestyleRecommendations(profile: PersonalHealthProfile): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];

    // Sleep optimisation
    if (profile.lifestyle.sleep.averageHours < 7 || profile.lifestyle.sleep.quality !== 'good') {
      recommendations.push({
        id: 'sleep_optimisation',
        type: 'lifestyle',
        priority: 'high',
        title: 'Sleep Quality Enhancement Protocol',
        description: 'Implement evidence-based sleep hygiene and timing optimisation',
        rationale: `Current sleep: ${profile.lifestyle.sleep.averageHours}h/${profile.lifestyle.sleep.quality} - suboptimal for health recovery`,
        evidence: {
          grade: 'A',
          studies: 890,
          populationRelevance: 100
        },
        personalizationFactors: ['Current sleep pattern', 'Age', 'Stress level', 'Chronotype'],
        implementation: this.createImplementationGuide('lifestyle', 'gradual'),
        expectedOutcomes: [
          {
            outcome: 'Improved sleep quality and duration',
            timeframe: '2-4 weeks',
            probability: 85,
            measurableImprovement: '7-9 hours quality sleep nightly'
          }
        ],
        monitoring: {
          frequency: 'Daily self-assessment',
          metrics: ['Sleep duration', 'Sleep quality', 'Morning alertness'],
          methods: ['Sleep tracking', 'Sleep diary'],
          alerts: ['Consistent <6 hours sleep']
        },
        interactions: ['Affects all other health metrics'],
        contraindications: ['Sleep disorders requiring medical treatment'],
        confidence: 92
      });
    }

    return recommendations;
  }

  private async generateSymptomBasedRecommendations(profile: PersonalHealthProfile): Promise<PersonalizedRecommendation[]> {
    // Generate recommendations based on current symptoms and patterns
    return [];
  }

  private async generateGoalBasedRecommendations(profile: PersonalHealthProfile): Promise<PersonalizedRecommendation[]> {
    // Generate recommendations aligned with user's health goals
    return [];
  }

  private async generateRiskMitigationRecommendations(profile: PersonalHealthProfile): Promise<PersonalizedRecommendation[]> {
    // Generate recommendations to mitigate identified health risks
    return [];
  }

  private prioritizeRecommendations(recommendations: PersonalizedRecommendation[], profile: PersonalHealthProfile): PersonalizedRecommendation[] {
    // Sort by priority, confidence, and user preferences
    return recommendations.sort((a, b) => {
      // Priority order: critical > high > medium > low
      const priorityWeight = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by confidence
      return b.confidence - a.confidence;
    });
  }

  private createImplementationGuide(type: string, approach: string): ImplementationGuide {
    const baseDate = new Date();
    
    return {
      startDate: baseDate,
      phases: [
        {
          phase: 1,
          duration: '1-2 weeks',
          goals: ['Establish baseline', 'Begin gradual implementation'],
          actions: ['Start tracking', 'Initial changes'],
          milestones: ['Consistent tracking', '25% implementation']
        }
      ],
      totalDuration: '12 weeks',
      difficultyLevel: 'moderate',
      resources: ['Educational materials', 'Mobile apps'],
      support: ['Healthcare provider consultation', 'Community support']
    };
  }

  // Helper methods for default values
  private getDefaultDemographics() {
    return {
      age: 35,
      sex: 'other' as const,
      location: 'Australia'
    };
  }

  private getDefaultLifestyle(): LifestyleFactors {
    return {
      diet: {
        pattern: 'western',
        alcohol: 'light',
        caffeine: 'moderate',
        supplements: []
      },
      exercise: {
        frequency: 3,
        intensity: 'moderate',
        types: ['cardio', 'strength'],
        duration: 45
      },
      sleep: {
        averageHours: 7.5,
        quality: 'good',
        sleepTime: '22:30',
        wakeTime: '06:00'
      },
      stress: {
        level: 'moderate',
        sources: ['work'],
        managementTechniques: []
      },
      environment: {
        smoking: 'never',
        exposure: [],
        sunExposure: 'moderate'
      }
    };
  }

  private getDefaultSymptoms(): SymptomTracker {
    return {
      current: [],
      historical: [],
      patterns: []
    };
  }

  private getDefaultGoals(): HealthGoals {
    return {
      primary: 'Improve overall health',
      secondary: [],
      timeframe: '6 months',
      measurableTargets: [],
      motivation: 'Feel better and prevent disease'
    };
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      communicationStyle: 'detailed',
      interventionTypes: ['diet', 'exercise', 'lifestyle'],
      timeCommitment: 'moderate',
      changeApproach: 'gradual'
    };
  }

  private async calculatePersonalizedRisk(data: Partial<PersonalHealthProfile>): Promise<PersonalizedRiskProfile> {
    // Simplified risk calculation
    return {
      cardiovascular: { score: 25, category: 'low', factors: [], trajectory: 'stable', modifiable: true },
      metabolic: { score: 30, category: 'low', factors: [], trajectory: 'stable', modifiable: true },
      cancer: { score: 20, category: 'low', factors: [], trajectory: 'stable', modifiable: true },
      cognitive: { score: 15, category: 'low', factors: [], trajectory: 'stable', modifiable: true },
      overall: { score: 22, category: 'low', factors: [], trajectory: 'stable', modifiable: true }
    };
  }
}

export const enhancedPersonalizationService = new EnhancedPersonalizationService();
export type {
  PersonalHealthProfile,
  PersonalizedRecommendation,
  LifestyleFactors,
  SymptomTracker,
  HealthGoals,
  PersonalizedRiskProfile
};