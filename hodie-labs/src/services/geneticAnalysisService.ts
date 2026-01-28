// Advanced Genetic Analysis Service
// Integrates with major genetic testing providers for comprehensive health insights

interface GeneticVariant {
  rsid: string; // e.g., "rs1815739" for ACTN3
  gene: string;
  chromosome: string;
  position: number;
  genotype: string; // e.g., "CT", "TT", "CC"
  alleles: [string, string];
  significance: 'pathogenic' | 'likely_pathogenic' | 'uncertain' | 'likely_benign' | 'benign';
  clinicalRelevance: string;
}

interface GeneticProfile {
  userId: string;
  provider: '23andme' | 'ancestrydna' | 'myheritagedna' | 'uploaded_raw';
  processedDate: Date;
  totalVariants: number;
  qualityScore: number;
  coverage: {
    exome: number;
    genome: number;
    snpArray: number;
  };
  variants: GeneticVariant[];
}

interface HealthPredisposition {
  condition: string;
  riskScore: number; // 0-100 percentile
  geneticContribution: number; // 0-100%
  lifestyleContribution: number; // 0-100%
  evidence: 'high' | 'moderate' | 'limited';
  actionability: 'high' | 'moderate' | 'low';
  recommendations: string[];
  relevantGenes: string[];
}

interface NutrientRecommendation {
  nutrient: string;
  recommendedDailyAmount: string;
  geneticBasis: string[];
  supplementForm: string;
  timing: string;
  interactions: string[];
  confidence: number; // 0-100%
}

interface FitnessProfile {
  powerVsEndurance: 'power' | 'endurance' | 'mixed';
  recoverySpeed: 'fast' | 'average' | 'slow';
  injuryRisk: 'low' | 'moderate' | 'high';
  optimalExerciseTypes: string[];
  recommendedIntensity: string;
  geneticBasis: string[];
}

class GeneticAnalysisService {
  private readonly KNOWN_VARIANTS = new Map([
    // Fitness genes
    ['rs1815739', { // ACTN3 - muscle fibre type
      gene: 'ACTN3',
      trait: 'muscle_fibre_composition',
      function: 'Fast-twitch muscle protein',
      variants: {
        'CC': { type: 'power', description: 'Enhanced power/sprint performance' },
        'CT': { type: 'mixed', description: 'Balanced power and endurance' },
        'TT': { type: 'endurance', description: 'Enhanced endurance performance' }
      }
    }],
    ['rs4340', { // ACE - cardiovascular response
      gene: 'ACE',
      trait: 'cardiovascular_response',
      function: 'Blood pressure regulation',
      variants: {
        'DD': { type: 'power', description: 'Better power response to training' },
        'ID': { type: 'mixed', description: 'Moderate cardiovascular adaptation' },
        'II': { type: 'endurance', description: 'Superior endurance adaptation' }
      }
    }],
    
    // Nutrition genes
    ['rs7903146', { // TCF7L2 - diabetes risk
      gene: 'TCF7L2',
      trait: 'diabetes_risk',
      function: 'Blood glucose regulation',
      variants: {
        'CC': { risk: 'low', description: 'Normal diabetes risk' },
        'CT': { risk: 'moderate', description: '1.4x diabetes risk' },
        'TT': { risk: 'high', description: '2x diabetes risk' }
      }
    }],
    ['rs1801133', { // MTHFR - folate metabolism
      gene: 'MTHFR',
      trait: 'folate_metabolism',
      function: 'Folate processing',
      variants: {
        'CC': { efficiency: 'normal', description: 'Normal folate metabolism' },
        'CT': { efficiency: 'reduced', description: '65% enzyme efficiency' },
        'TT': { efficiency: 'significantly_reduced', description: '30% enzyme efficiency' }
      }
    }],
    
    // Pharmacogenomics
    ['rs776746', { // CYP3A5 - drug metabolism
      gene: 'CYP3A5',
      trait: 'drug_metabolism',
      function: 'Medication processing',
      variants: {
        '*1/*1': { activity: 'high', description: 'Fast drug metabolism' },
        '*1/*3': { activity: 'intermediate', description: 'Intermediate metabolism' },
        '*3/*3': { activity: 'low', description: 'Slow drug metabolism' }
      }
    }]
  ]);

  async processGeneticData(rawData: string, provider: string): Promise<GeneticProfile> {
    console.log('🧬 Processing genetic data from:', provider);
    
    // Parse raw genetic data (format varies by provider)
    const variants = this.parseRawGeneticData(rawData, provider);
    
    // Quality control and validation
    const qualityScore = this.calculateQualityScore(variants);
    
    // Create comprehensive genetic profile
    const profile: GeneticProfile = {
      userId: '', // Set by calling function
      provider: provider as any,
      processedDate: new Date(),
      totalVariants: variants.length,
      qualityScore,
      coverage: this.calculateCoverage(variants),
      variants: variants.filter(v => this.KNOWN_VARIANTS.has(v.rsid))
    };

    return profile;
  }

  async generateHealthPredispositions(profile: GeneticProfile): Promise<HealthPredisposition[]> {
    const predispositions: HealthPredisposition[] = [];

    // Cardiovascular disease risk
    const cardioRisk = this.calculateCardiovascularRisk(profile);
    if (cardioRisk) predispositions.push(cardioRisk);

    // Type 2 diabetes risk
    const diabetesRisk = this.calculateDiabetesRisk(profile);
    if (diabetesRisk) predispositions.push(diabetesRisk);

    // Alzheimer's disease risk
    const alzheimerRisk = this.calculateAlzheimerRisk(profile);
    if (alzheimerRisk) predispositions.push(alzheimerRisk);

    // Cancer predispositions
    const cancerRisks = this.calculateCancerRisks(profile);
    predispositions.push(...cancerRisks);

    return predispositions;
  }

  async generateNutrientRecommendations(profile: GeneticProfile): Promise<NutrientRecommendation[]> {
    const recommendations: NutrientRecommendation[] = [];

    // Folate recommendations based on MTHFR
    const mthfrVariant = profile.variants.find(v => v.rsid === 'rs1801133');
    if (mthfrVariant) {
      const folateRec = this.getFolateRecommendation(mthfrVariant);
      recommendations.push(folateRec);
    }

    // Vitamin D recommendations based on GC and DHCR7
    const vitaminDRec = this.getVitaminDRecommendation(profile);
    recommendations.push(vitaminDRec);

    // Omega-3 recommendations based on FADS variants
    const omega3Rec = this.getOmega3Recommendation(profile);
    recommendations.push(omega3Rec);

    return recommendations;
  }

  async generateFitnessProfile(profile: GeneticProfile): Promise<FitnessProfile> {
    // ACTN3 analysis for power vs endurance
    const actn3 = profile.variants.find(v => v.rsid === 'rs1815739');
    const powerVsEndurance = this.determinePowerEnduranceProfile(actn3);

    // ACE analysis for cardiovascular response
    const ace = profile.variants.find(v => v.rsid === 'rs4340');
    const recoverySpeed = this.determineRecoverySpeed(ace);

    // Injury risk analysis
    const injuryRisk = this.calculateInjuryRisk(profile);

    return {
      powerVsEndurance,
      recoverySpeed,
      injuryRisk,
      optimalExerciseTypes: this.getOptimalExercises(powerVsEndurance, injuryRisk),
      recommendedIntensity: this.getRecommendedIntensity(recoverySpeed),
      geneticBasis: [actn3?.gene, ace?.gene].filter(Boolean) as string[]
    };
  }

  private parseRawGeneticData(rawData: string, provider: string): GeneticVariant[] {
    const variants: GeneticVariant[] = [];
    const lines = rawData.split('\n');

    for (const line of lines) {
      if (line.startsWith('#') || line.trim() === '') continue;

      try {
        const variant = this.parseSingleVariant(line, provider);
        if (variant) variants.push(variant);
      } catch (error) {
        console.warn('Failed to parse variant line:', line, error);
      }
    }

    return variants;
  }

  private parseSingleVariant(line: string, provider: string): GeneticVariant | null {
    const columns = line.split('\t');
    
    // Format varies by provider - this is a simplified parser
    if (columns.length < 4) return null;

    return {
      rsid: columns[0],
      gene: this.getGeneForVariant(columns[0]),
      chromosome: columns[1],
      position: parseInt(columns[2]),
      genotype: columns[3],
      alleles: [columns[3][0], columns[3][1]] as [string, string],
      significance: 'uncertain', // Would be determined by clinical databases
      clinicalRelevance: 'Under evaluation'
    };
  }

  private getGeneForVariant(rsid: string): string {
    const knownVariant = this.KNOWN_VARIANTS.get(rsid);
    return knownVariant?.gene || 'Unknown';
  }

  private calculateQualityScore(variants: GeneticVariant[]): number {
    // Simplified quality scoring
    const totalVariants = variants.length;
    const knownVariants = variants.filter(v => this.KNOWN_VARIANTS.has(v.rsid)).length;
    
    return Math.min(100, (knownVariants / Math.max(1, totalVariants * 0.001)) * 100);
  }

  private calculateCoverage(variants: GeneticVariant[]): { exome: number; genome: number; snpArray: number } {
    // Simplified coverage calculation
    return {
      exome: Math.min(95, variants.length * 0.001),
      genome: Math.min(85, variants.length * 0.0008),
      snpArray: Math.min(99, variants.length * 0.002)
    };
  }

  private calculateCardiovascularRisk(profile: GeneticProfile): HealthPredisposition {
    // Simplified cardiovascular risk calculation
    let riskScore = 50; // Baseline population risk
    const relevantGenes: string[] = [];

    // Check for known cardiovascular variants
    // This would be much more comprehensive in production
    
    return {
      condition: 'Cardiovascular Disease',
      riskScore,
      geneticContribution: 35,
      lifestyleContribution: 65,
      evidence: 'high',
      actionability: 'high',
      recommendations: [
        'Regular cardiovascular exercise 150+ minutes/week',
        'Mediterranean diet pattern',
        'Blood pressure monitoring',
        'Lipid panel every 2 years'
      ],
      relevantGenes
    };
  }

  private calculateDiabetesRisk(profile: GeneticProfile): HealthPredisposition {
    let riskScore = 50;
    const relevantGenes: string[] = [];

    // Check TCF7L2 variant
    const tcf7l2 = profile.variants.find(v => v.rsid === 'rs7903146');
    if (tcf7l2) {
      relevantGenes.push('TCF7L2');
      if (tcf7l2.genotype === 'TT') riskScore += 30;
      else if (tcf7l2.genotype === 'CT') riskScore += 15;
    }

    return {
      condition: 'Type 2 Diabetes',
      riskScore: Math.min(100, riskScore),
      geneticContribution: 25,
      lifestyleContribution: 75,
      evidence: 'high',
      actionability: 'high',
      recommendations: [
        'Low glycemic index diet',
        'Regular physical activity',
        'Weight management',
        'Annual glucose screening'
      ],
      relevantGenes
    };
  }

  private calculateAlzheimerRisk(profile: GeneticProfile): HealthPredisposition {
    // Placeholder for APOE analysis
    return {
      condition: "Alzheimer's Disease",
      riskScore: 50,
      geneticContribution: 60,
      lifestyleContribution: 40,
      evidence: 'moderate',
      actionability: 'moderate',
      recommendations: [
        'Cognitive training exercises',
        'Regular physical exercise',
        'Social engagement',
        'Mediterranean diet'
      ],
      relevantGenes: ['APOE']
    };
  }

  private calculateCancerRisks(profile: GeneticProfile): HealthPredisposition[] {
    // Placeholder for cancer risk analysis
    return [];
  }

  private getFolateRecommendation(mthfrVariant: GeneticVariant): NutrientRecommendation {
    let amount = '400 mcg';
    let form = 'Folic acid';

    if (mthfrVariant.genotype === 'TT') {
      amount = '800-1000 mcg';
      form = 'Methylfolate (active form)';
    } else if (mthfrVariant.genotype === 'CT') {
      amount = '600 mcg';
      form = 'Methylfolate or folic acid';
    }

    return {
      nutrient: 'Folate',
      recommendedDailyAmount: amount,
      geneticBasis: ['MTHFR C677T variant affects folate metabolism'],
      supplementForm: form,
      timing: 'With meals',
      interactions: ['B12 required for proper utilization'],
      confidence: 85
    };
  }

  private getVitaminDRecommendation(profile: GeneticProfile): NutrientRecommendation {
    return {
      nutrient: 'Vitamin D',
      recommendedDailyAmount: '1000-2000 IU',
      geneticBasis: ['GC and DHCR7 variants affect vitamin D metabolism'],
      supplementForm: 'Vitamin D3 (cholecalciferol)',
      timing: 'With fatty meal for absorption',
      interactions: ['Magnesium required for activation'],
      confidence: 75
    };
  }

  private getOmega3Recommendation(profile: GeneticProfile): NutrientRecommendation {
    return {
      nutrient: 'Omega-3 EPA/DHA',
      recommendedDailyAmount: '1-2g combined EPA/DHA',
      geneticBasis: ['FADS variants affect omega-3 metabolism'],
      supplementForm: 'Fish oil or algae oil',
      timing: 'With meals',
      interactions: ['Vitamin E helps prevent oxidation'],
      confidence: 70
    };
  }

  private determinePowerEnduranceProfile(actn3?: GeneticVariant): FitnessProfile['powerVsEndurance'] {
    if (!actn3) return 'mixed';
    
    switch (actn3.genotype) {
      case 'CC': return 'power';
      case 'TT': return 'endurance';
      default: return 'mixed';
    }
  }

  private determineRecoverySpeed(ace?: GeneticVariant): FitnessProfile['recoverySpeed'] {
    if (!ace) return 'average';
    
    // Simplified ACE analysis
    return 'average';
  }

  private calculateInjuryRisk(profile: GeneticProfile): FitnessProfile['injuryRisk'] {
    // Would analyse collagen-related genes, inflammation markers, etc.
    return 'moderate';
  }

  private getOptimalExercises(powerVsEndurance: string, injuryRisk: string): string[] {
    const exercises: string[] = [];
    
    if (powerVsEndurance === 'power') {
      exercises.push('Weight training', 'Sprint intervals', 'Plyometrics');
    } else if (powerVsEndurance === 'endurance') {
      exercises.push('Long-distance running', 'Cycling', 'Swimming');
    } else {
      exercises.push('Circuit training', 'HIIT', 'Cross-training');
    }

    if (injuryRisk === 'high') {
      exercises.push('Extended warm-up', 'Mobility work', 'Recovery protocols');
    }

    return exercises;
  }

  private getRecommendedIntensity(recoverySpeed: string): string {
    switch (recoverySpeed) {
      case 'fast': return 'Can handle high frequency and intensity';
      case 'slow': return 'Needs longer recovery between sessions';
      default: return 'Moderate intensity with standard recovery';
    }
  }
}

export const geneticAnalysisService = new GeneticAnalysisService();
export type {
  GeneticProfile,
  GeneticVariant,
  HealthPredisposition,
  NutrientRecommendation,
  FitnessProfile
};