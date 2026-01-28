import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  Brain,
  Dna,
  Microscope,
  Target,
  TrendingUp,
  Star,
  Shield,
  Activity,
  Heart,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { geneticAnalysisService, GeneticProfile } from '../services/geneticAnalysisService';
import { labIntegrationService, ComprehensiveLabPanel } from '../services/labIntegrationService';
import { enhancedPersonalizationService, PersonalHealthProfile, PersonalizedRecommendation } from '../services/enhancedPersonalizationService';

interface ComprehensiveHealthProfileProps {
  user: User;
}

const ComprehensiveHealthProfile: React.FC<ComprehensiveHealthProfileProps> = ({ user }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [healthProfile, setHealthProfile] = useState<PersonalHealthProfile | null>(null);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock genetic data for demonstration
  const mockGeneticData = `rs1815739	15	73660485	CC
rs4340	17	63477061	ID  
rs7903146	10	112998590	CT
rs1801133	1	11796321	TT
rs776746	7	93348738	*1/*3`;

  useEffect(() => {
    const processComprehensiveProfile = async () => {
      setIsProcessing(true);
      
      try {
        // 1. Process genetic data
        const geneticProfile = await geneticAnalysisService.processGeneticData(
          mockGeneticData, 
          '23andme'
        );
        geneticProfile.userId = user.uid;

        // 2. Create mock lab results
        const mockLabResults = [
          { testId: 'total_cholesterol', testName: 'Total Cholesterol', value: 4.2, unit: 'mmol/L', referenceRange: { min: 3.9, max: 5.5 }, status: 'normal' as const, flagged: false, collectionDate: new Date(), processedDate: new Date(), methodology: 'Standard', labProvider: 'Pathology North' },
          { testId: 'ldl_cholesterol', testName: 'LDL Cholesterol', value: 2.1, unit: 'mmol/L', referenceRange: { min: 0, max: 2.6 }, status: 'normal' as const, flagged: false, collectionDate: new Date(), processedDate: new Date(), methodology: 'Standard', labProvider: 'Pathology North' },
          { testId: 'vitamin_d', testName: 'Vitamin D', value: 65, unit: 'nmol/L', referenceRange: { min: 50, max: 250 }, status: 'low' as const, flagged: true, collectionDate: new Date(), processedDate: new Date(), methodology: 'Standard', labProvider: 'Pathology North' },
          { testId: 'glucose_fasting', testName: 'Fasting Glucose', value: 5.8, unit: 'mmol/L', referenceRange: { min: 3.6, max: 5.6 }, status: 'high' as const, flagged: true, collectionDate: new Date(), processedDate: new Date(), methodology: 'Standard', labProvider: 'Pathology North' }
        ];

        const labPanel = await labIntegrationService.processLabResults(mockLabResults);
        labPanel.userId = user.uid;

        // 3. Create comprehensive health profile
        const profile = await enhancedPersonalizationService.createPersonalizedProfile(
          user.uid,
          {
            demographics: { age: 35, sex: 'male', location: 'Australia' },
            genetic: geneticProfile,
            labResults: [labPanel]
          }
        );

        // 4. Generate personalised recommendations
        const personalisedRecs = await enhancedPersonalizationService.generatePersonalizedRecommendations(profile);

        setHealthProfile(profile);
        setRecommendations(personalisedRecs);

      } catch (error) {
        console.error('Error processing comprehensive health profile:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    processComprehensiveProfile();
  }, [user.uid]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Target },
    { id: 'genetic', name: 'Genetic Profile', icon: Dna },
    { id: 'labs', name: 'Lab Analysis', icon: Microscope },
    { id: 'recommendations', name: 'AI Recommendations', icon: Brain }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (isProcessing) {
    return (
      <div className="flex items-centre justify-centre min-h-[400px]">
        <div className="text-centre">
          <Brain className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Processing Comprehensive Health Profile</h3>
          <p className="text-white/70">Analyzing genetic data, lab results, and generating personalised insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Comprehensive Health Profile</h1>
        <p className="text-white/70">AI-powered analysis integrating genetics, lab results, and personalised recommendations</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white/10 rounded-lg p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-centre space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && healthProfile && (
        <div className="space-y-6">
          {/* Health Score Overview */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Health Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-centre">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {healthProfile.riskProfile.overall.score}
                </div>
                <div className="text-white/70 text-sm">Overall Health Score</div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                  healthProfile.riskProfile.overall.category === 'low' ? 'bg-green-500 text-white' :
                  healthProfile.riskProfile.overall.category === 'moderate' ? 'bg-yellow-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {healthProfile.riskProfile.overall.category.toUpperCase()} RISK
                </div>
              </div>
              
              <div className="text-centre">
                <div className="text-2xl font-bold text-blue-400 mb-2">
                  {healthProfile.genetic?.totalVariants || 0}
                </div>
                <div className="text-white/70 text-sm">Genetic Variants Analyzed</div>
                <div className="text-xs text-white/60 mt-1">
                  Quality: {healthProfile.genetic?.qualityScore || 0}%
                </div>
              </div>
              
              <div className="text-centre">
                <div className="text-2xl font-bold text-purple-400 mb-2">
                  {healthProfile.labResults.length}
                </div>
                <div className="text-white/70 text-sm">Lab Panels Analyzed</div>
                <div className="text-xs text-white/60 mt-1">
                  Latest: {healthProfile.labResults[0]?.orderedDate.toLocaleDateString() || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Profile Summary */}
          <div className="bg-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(healthProfile.riskProfile).filter(([key]) => key !== 'overall').map(([category, risk]) => (
                <div key={category} className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-centre justify-between mb-2">
                    <span className="text-sm font-medium text-white capitalize">{category}</span>
                    <TrendingUp className={`w-4 h-4 ${
                      risk.trajectory === 'improving' ? 'text-green-400' :
                      risk.trajectory === 'stable' ? 'text-blue-400' : 'text-red-400'
                    }`} />
                  </div>
                  <div className="text-xl font-bold text-white mb-1">{risk.score}</div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    risk.category === 'low' ? 'bg-green-500/20 text-green-300' :
                    risk.category === 'moderate' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {risk.category} risk
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'genetic' && healthProfile?.genetic && (
        <div className="space-y-6">
          {/* Genetic Profile Summary */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6">
            <div className="flex items-centre space-x-3 mb-4">
              <Dna className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Genetic Analysis Results</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-centre">
                <div className="text-2xl font-bold text-purple-400">{healthProfile.genetic.totalVariants}</div>
                <div className="text-white/70 text-sm">Total Variants</div>
              </div>
              <div className="text-centre">
                <div className="text-2xl font-bold text-pink-400">{healthProfile.genetic.qualityScore}%</div>
                <div className="text-white/70 text-sm">Quality Score</div>
              </div>
              <div className="text-centre">
                <div className="text-2xl font-bold text-indigo-400">{healthProfile.genetic.provider}</div>
                <div className="text-white/70 text-sm">Data Source</div>
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-medium text-white mb-3">Key Genetic Findings</h4>
              <div className="space-y-3">
                {healthProfile.genetic.variants.map((variant, idx) => (
                  <div key={idx} className="flex items-centre justify-between">
                    <div>
                      <span className="text-white font-medium">{variant.gene}</span>
                      <span className="text-white/70 ml-2">({variant.rsid})</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-mono">{variant.genotype}</div>
                      <div className="text-xs text-white/60">{variant.clinicalRelevance}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'labs' && healthProfile?.labResults && healthProfile.labResults.length > 0 && (
        <div className="space-y-6">
          {/* Lab Analysis Summary */}
          <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 rounded-xl p-6">
            <div className="flex items-centre space-x-3 mb-4">
              <Microscope className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-semibold text-white">Laboratory Analysis</h3>
            </div>
            
            {healthProfile.labResults.map((labPanel, idx) => (
              <div key={idx} className="bg-white/10 rounded-lg p-4 mb-4">
                <div className="flex items-centre justify-between mb-3">
                  <h4 className="font-medium text-white">Clinical Interpretation</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    labPanel.interpretation.overallStatus === 'optimal' ? 'bg-green-500 text-white' :
                    labPanel.interpretation.overallStatus === 'good' ? 'bg-blue-500 text-white' :
                    labPanel.interpretation.overallStatus === 'concerning' ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {labPanel.interpretation.overallStatus.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-white/80 text-sm mb-4">{labPanel.interpretation.clinicalSignificance}</p>
                
                {labPanel.interpretation.keyFindings.length > 0 && (
                  <div className="mb-4">
                    <div className="text-white font-medium mb-2">Key Findings:</div>
                    <ul className="space-y-1">
                      {labPanel.interpretation.keyFindings.map((finding, findingIdx) => (
                        <li key={findingIdx} className="flex items-start space-x-2 text-sm text-white/80">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {labPanel.results.filter(r => r.flagged).slice(0, 4).map((result, resultIdx) => (
                    <div key={resultIdx} className="bg-white/10 rounded p-3">
                      <div className="text-xs text-white/70">{result.testName}</div>
                      <div className="text-lg font-bold text-white">{result.value} {result.unit}</div>
                      <div className={`text-xs ${
                        result.status === 'normal' ? 'text-green-400' :
                        result.status === 'high' || result.status === 'low' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {result.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && recommendations.length > 0 && (
        <div className="space-y-6">
          {/* AI Recommendations */}
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl p-6">
            <div className="flex items-centre space-x-3 mb-4">
              <Brain className="w-6 h-6 text-orange-400" />
              <h3 className="text-xl font-semibold text-white">Personalized AI Recommendations</h3>
            </div>
            
            <div className="grid gap-4">
              {recommendations.slice(0, 6).map((rec, idx) => (
                <div key={idx} className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-centre space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                          {rec.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-white/70">{rec.type}</span>
                      </div>
                      <h4 className="font-medium text-white mb-2">{rec.title}</h4>
                      <p className="text-sm text-white/80 mb-2">{rec.description}</p>
                      <p className="text-xs text-white/70">{rec.rationale}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/20">
                    <div>
                      <div className="text-xs text-white/70 mb-1">Expected Outcome:</div>
                      <div className="text-sm text-white">
                        {rec.expectedOutcomes[0]?.outcome} ({rec.expectedOutcomes[0]?.timeframe})
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-white/70 mb-1">Confidence:</div>
                      <div className="flex items-centre space-x-2">
                        <div className="flex-1 bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-green-400 h-2 rounded-full" 
                            style={{ width: `${rec.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-white">{rec.confidence}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rec.personalizationFactors.slice(0, 3).map((factor, factorIdx) => (
                      <span key={factorIdx} className="px-2 py-1 bg-white/20 rounded text-xs text-white/80">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveHealthProfile;