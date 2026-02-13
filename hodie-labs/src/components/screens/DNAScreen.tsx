import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import {
  Dna,
  Heart,
  Activity,
  Brain,
  Shield,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  Star,
  Loader2,
  Upload
} from 'lucide-react';
import type { DNAInsight, HealthContext } from '../../services/kimiK2Service';
import FileUpload from '../common/FileUpload';

interface DNAScreenProps {
  user: User;
}

interface HealthRisk {
  condition: string;
  risk: string;
  genetic: number;
  lifestyle: number;
  color: string;
}

interface Trait {
  trait: string;
  result: string;
  gene: string;
}

const DNAScreen: React.FC<DNAScreenProps> = ({ user }) => {
  const { getAccessToken } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('overview');
  const [fitnessInsights, setFitnessInsights] = useState<DNAInsight[]>([]);
  const [nutritionInsights, setNutritionInsights] = useState<DNAInsight[]>([]);
  const [healthInsights, setHealthInsights] = useState<DNAInsight[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);
  const [isLoadingGeneticData, setIsLoadingGeneticData] = useState<boolean>(true);
  const [geneticDataError, setGeneticDataError] = useState<string | null>(null);
  const [healthRisks, setHealthRisks] = useState<HealthRisk[]>([]);
  const [traits, setTraits] = useState<Trait[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Fetch genetic data from MongoDB on mount
  useEffect(() => {
    const fetchGeneticData = async () => {
      setIsLoadingGeneticData(true);
      setGeneticDataError(null);

      try {
        const userId = (user as any).sub || user.uid;

        // Get Auth0 token
        const token = await getAccessToken().catch((error) => {
          console.warn('⚠️ Could not get Auth0 token for genetic data:', error);
          return null;
        });

        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch genetic data from backend
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/genetic-data/${userId}`,
          { headers }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch genetic data: ${response.status}`);
        }

        const geneticData = await response.json();
        console.log('🧬 Fetched genetic data:', geneticData);

        // Process genetic data into health risks and traits
        if (geneticData && geneticData.length > 0) {
          const extractedRisks = extractHealthRisks(geneticData);
          const extractedTraits = extractTraits(geneticData);
          setHealthRisks(extractedRisks);
          setTraits(extractedTraits);
        } else {
          // No genetic data - leave arrays empty
          setHealthRisks([]);
          setTraits([]);
        }

      } catch (err) {
        console.error('Error fetching genetic data:', err);
        setGeneticDataError(err instanceof Error ? err.message : 'Failed to load genetic data');
        // No genetic data on error - leave arrays empty
        setHealthRisks([]);
        setTraits([]);
      } finally {
        setIsLoadingGeneticData(false);
      }
    };

    fetchGeneticData();
  }, [user, getAccessToken]);

  // AI is enabled via backend - no client-side API key needed
  useEffect(() => {
    setAiEnabled(true);
    setLoading(false);
  }, []);

  const mainCategories = [
    { id: 'fitness', name: 'Fitness', icon: Activity },
    { id: 'nutrition', name: 'Nutrition', icon: Heart },
    { id: 'health', name: 'Health', icon: Shield }
  ];

  const dnaCategories = [
    { id: 'overview', name: 'Overview', icon: Dna },
    { id: 'fitness', name: 'Fitness & Exercise', icon: Activity },
    { id: 'nutrition', name: 'Nutrition & Metabolism', icon: Heart },
    { id: 'cognitive', name: 'Cognitive Health', icon: Brain },
    { id: 'immunity', name: 'Immunity & Health', icon: Shield },
    { id: 'traits', name: 'Personal Traits', icon: Star }
  ];

  // Extract health risks from genetic data
  const extractHealthRisks = (geneticData: any[]): HealthRisk[] => {
    const risks: HealthRisk[] = [];

    geneticData.forEach((data) => {
      if (data.healthRisks && Array.isArray(data.healthRisks)) {
        data.healthRisks.forEach((risk: any) => {
          risks.push({
            condition: risk.condition || risk.name || 'Unknown Condition',
            risk: risk.riskLevel || risk.risk || 'Unknown',
            genetic: parseFloat(risk.geneticContribution || risk.genetic) || 0,
            lifestyle: parseFloat(risk.lifestyleContribution || risk.lifestyle) || 0,
            color: determineRiskColor(risk.riskLevel || risk.risk)
          });
        });
      }
    });

    return risks;
  };

  // Extract traits from genetic data
  const extractTraits = (geneticData: any[]): Trait[] => {
    const traitsList: Trait[] = [];

    geneticData.forEach((data) => {
      if (data.traits && Array.isArray(data.traits)) {
        data.traits.forEach((trait: any) => {
          traitsList.push({
            trait: trait.name || trait.trait || 'Unknown Trait',
            result: trait.result || trait.description || 'Unknown',
            gene: trait.gene || trait.geneSymbol || 'N/A'
          });
        });
      }
    });

    return traitsList;
  };

  // Determine risk color based on risk level
  const determineRiskColor = (riskLevel: string): string => {
    const level = riskLevel.toLowerCase();
    if (level.includes('low') || level.includes('lower')) return 'text-green-600';
    if (level.includes('elevated') || level.includes('high')) return 'text-orange-600';
    if (level.includes('critical') || level.includes('very high')) return 'text-red-600';
    return 'text-yellow-600'; // Average
  };

  // Default health risks fallback
  const getDefaultHealthRisks = (): HealthRisk[] => [
    { condition: 'Heart Disease', risk: 'Lower than average', genetic: 15, lifestyle: 25, color: 'text-green-600' },
    { condition: 'Type 2 Diabetes', risk: 'Average', genetic: 35, lifestyle: 40, color: 'text-yellow-600' },
    { condition: 'Alzheimer\'s Disease', risk: 'Slightly elevated', genetic: 45, lifestyle: 30, color: 'text-orange-600' }
  ];

  // Default traits fallback
  const getDefaultTraits = (): Trait[] => [
    { trait: 'Sleep Duration Preference', result: 'Long sleeper (8-9 hours optimal)', gene: 'PER2' },
    { trait: 'Morning/Evening Preference', result: 'Moderate morning person', gene: 'CLOCK' },
    { trait: 'Stress Response', result: 'Resilient to stress', gene: 'COMT' }
  ];

  const renderOverview = () => {
    // Check if user has actual genetic data
    const hasGeneticData = healthRisks.length > 0 || traits.length > 0;

    return (
      <div className="space-y-6">
        {/* DNA Testing Status - Always show */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Dna className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">DNA Testing Status</h2>
                <p className="text-white/70">
                  {hasGeneticData
                    ? 'Your genetic analysis is complete'
                    : 'Upload your DNA data to get started'}
                </p>
              </div>
            </div>
            {!hasGeneticData && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
              >
                Upload DNA Data
              </button>
            )}
          </div>

          {/* Status badge */}
          <div className="flex items-center space-x-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              hasGeneticData
                ? 'bg-green-500/20 text-green-300'
                : 'bg-yellow-500/20 text-yellow-300'
            }`}>
              {hasGeneticData ? 'Completed & Analysed' : 'Not Started'}
            </span>
          </div>

          {/* Only show stats if data exists */}
          {hasGeneticData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{healthRisks.length}</div>
                <div className="text-sm text-white/70">Health risks analysed</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{traits.length}</div>
                <div className="text-sm text-white/70">Genetic traits</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">
                  {healthRisks.filter(r => r.color === 'text-green-600').length}
                </div>
                <div className="text-sm text-white/70">Lower risk conditions</div>
              </div>
            </div>
          )}
        </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-centre">
            <Activity className="w-5 h-5 mr-2" />
            Fitness Highlights {!aiEnabled && <span className="text-xs text-blue-400 ml-2">(AI Loading...)</span>}
          </h3>
          {loading ? (
            <div className="flex items-centre justify-centre py-4">
              <Loader2 className="w-6 h-6 animate-spin text-white/60" />
              <span className="text-white/60 ml-2">Analyzing genetics...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {fitnessInsights.slice(0, 3).map((insight, index) => (
                <div key={index} className="flex items-centre justify-between">
                  <span className="text-white/80">{insight.trait}</span>
                  <span className={`font-medium ${insight.color.replace('text-', 'text-').replace('-600', '-400')}`}>
                    {insight.impact} impact
                  </span>
                </div>
              ))}
              {fitnessInsights.length === 0 && (
                <div className="text-white/60 text-sm">Upload genetic data for personalised insights</div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-centre">
            <Heart className="w-5 h-5 mr-2" />
            Health Risks
          </h3>
          {hasGeneticData && healthRisks.length > 0 ? (
            <div className="space-y-3">
              {healthRisks.slice(0, 3).map((risk, index) => (
                <div key={index} className="flex items-centre justify-between">
                  <span className="text-white/80">{risk.condition}</span>
                  <span className={`font-medium ${
                    risk.color === 'text-green-600' ? 'text-green-400' :
                    risk.color === 'text-yellow-600' ? 'text-yellow-400' :
                    risk.color === 'text-orange-600' ? 'text-orange-400' :
                    'text-red-400'
                  }`}>{risk.risk}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white/60 text-sm">
              Upload your genetic data to see your personalised health risk analysis
            </div>
          )}
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="bg-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-centre">
          Top DNA-Based Recommendations
        </h3>
        {loading ? (
          <div className="flex items-centre justify-centre py-8">
            <Loader2 className="w-8 h-8 animate-spin text-white/60" />
            <span className="text-white/60 ml-3">Generating personalised recommendations...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {[...fitnessInsights, ...nutritionInsights, ...healthInsights].slice(0, 3).map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <div className="text-white font-medium">{insight.trait}</div>
                  <div className="text-white/70 text-sm">{insight.description}</div>
                  <div className="text-blue-300 text-sm mt-1 font-medium">{insight.recommendation}</div>
                </div>
              </div>
            ))}
            {[...fitnessInsights, ...nutritionInsights, ...healthInsights].length === 0 && (
              <div className="text-centre py-4">
                <div className="text-white/60">Upload your genetic data to unlock AI-powered insights</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
  };

  const renderFitness = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-centre">
        Fitness & Exercise Genetics
        {loading && <Loader2 className="w-6 h-6 animate-spin text-white/60 ml-3" />}
        {!aiEnabled && <span className="text-sm text-blue-400 ml-3">(AI Activating...)</span>}
      </h2>
      {loading ? (
        <div className="flex items-centre justify-centre py-12">
          <Loader2 className="w-8 h-8 animate-spin text-white/60" />
          <span className="text-white/60 ml-3">Analysing your fitness genetics...</span>
        </div>
      ) : (
        <>
          {fitnessInsights.map((insight, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{insight.trait}</h3>
              <div className="text-sm text-gray-600">{insight.gene} gene • {insight.variant} variant</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              insight.impact === 'High' ? 'bg-red-100 text-red-800' :
              insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {insight.impact} Impact
            </span>
          </div>
          <p className="text-gray-700 mb-3">{insight.description}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-800 mb-1">Recommendation:</div>
            <div className="text-gray-800 text-sm">{insight.recommendation}</div>
          </div>
          <div className="mt-4">
            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              View Details →
            </button>
          </div>
        </div>
      ))}
          {fitnessInsights.length === 0 && (
            <div className="bg-gray-50 rounded-xl p-8 text-centre">
              <div className="text-gray-600 mb-2">No fitness insights available</div>
              <div className="text-gray-500 text-sm">Upload genetic data for AI-generated fitness genetics analysis</div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderNutrition = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-centre">
        Nutrition & Metabolism
        {loading && <Loader2 className="w-6 h-6 animate-spin text-white/60 ml-3" />}
        {!aiEnabled && <span className="text-sm text-blue-400 ml-3">(AI Activating...)</span>}
      </h2>
      {loading ? (
        <div className="flex items-centre justify-centre py-12">
          <Loader2 className="w-8 h-8 animate-spin text-white/60" />
          <span className="text-white/60 ml-3">Analysing your nutrition genetics...</span>
        </div>
      ) : (
        <>
          {nutritionInsights.map((insight, index) => (
        <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{insight.trait}</h3>
              <div className="text-sm text-gray-600">{insight.gene} gene • {insight.variant} variant</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              insight.impact === 'High' ? 'bg-red-100 text-red-800' :
              insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {insight.impact} Impact
            </span>
          </div>
          <p className="text-gray-700 mb-3">{insight.description}</p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm font-medium text-orange-800 mb-1">Recommendation:</div>
            <div className="text-gray-800 text-sm">{insight.recommendation}</div>
          </div>
          <div className="mt-4">
            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              View Details →
            </button>
          </div>
        </div>
      ))}
          {nutritionInsights.length === 0 && (
            <div className="bg-gray-50 rounded-xl p-8 text-centre">
              <div className="text-gray-600 mb-2">No nutrition insights available</div>
              <div className="text-gray-500 text-sm">Upload genetic data for AI-generated nutrition genetics analysis</div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderHealth = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Health Risk Analysis</h2>
      {healthRisks.map((risk, index) => (
        <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{risk.condition}</h3>
              <div className={`text-sm font-medium ${
                risk.color === 'text-green-600' ? 'text-green-700' :
                risk.color === 'text-yellow-600' ? 'text-yellow-700' :
                'text-orange-700'
              }`}>{risk.risk}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-2">Genetic contribution</div>
              <div className="bg-gray-200 rounded-full h-2 mb-1">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${risk.genetic}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">{risk.genetic}% genetic risk</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-2">Lifestyle contribution</div>
              <div className="bg-gray-200 rounded-full h-2 mb-1">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${risk.lifestyle}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">{risk.lifestyle}% lifestyle risk</div>
            </div>
          </div>
          <div className="mt-4">
            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              View Details →
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTraits = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Personal Traits</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {traits.map((trait, index) => (
          <div key={index} className="bg-gray-50 rounded-xl p-4 shadow-lg border border-gray-100">
            <h3 className="text-gray-900 font-medium mb-1">{trait.trait}</h3>
            <div className="text-gray-700 text-sm mb-2">{trait.result}</div>
            <div className="text-gray-500 text-xs">{trait.gene} gene</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedCategory) {
      case 'overview': return renderOverview();
      case 'fitness': return renderFitness();
      case 'nutrition': return renderNutrition();
      case 'health':
      case 'immunity': return renderHealth();
      case 'traits': return renderTraits();
      default: return renderOverview();
    }
  };

  // Loading state
  if (isLoadingGeneticData) {
    return (
      <div className="px-6 pb-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-white/70">Loading genetic data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state (non-blocking - show warning but still render with default data)
  const renderErrorBanner = () => {
    if (!geneticDataError) return null;

    return (
      <div className="mb-6 bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white">Using Default Genetic Data</h3>
            <p className="text-white/70 text-sm">{geneticDataError}</p>
          </div>
        </div>
      </div>
    );
  };

  // Empty state (no genetic data and no error - encourage upload)
  if (healthRisks.length === 0 && traits.length === 0 && !geneticDataError && !showUploadModal) {
    return (
      <div className="px-6 pb-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">DNA Insights</h1>
          <p className="text-white/70">Personalised health and fitness recommendations based on your genetic profile</p>
        </div>
        <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-8 text-center">
          <Dna className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Genetic Data Available</h3>
          <p className="text-white/70 mb-6">
            Upload your DNA data to unlock personalised genetic insights, health risk analysis, and tailored recommendations.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg mx-auto"
          >
            <Upload className="w-5 h-5" />
            <span>Upload DNA Data</span>
          </button>
        </div>
      </div>
    );
  }

  // Show upload modal in empty state
  if (showUploadModal && healthRisks.length === 0 && traits.length === 0 && !geneticDataError) {
    return (
      <div className="px-6 pb-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">DNA Insights</h1>
          <p className="text-white/70">Personalised health and fitness recommendations based on your genetic profile</p>
        </div>
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Upload Genetic Data</h3>
            <button
              onClick={() => setShowUploadModal(false)}
              className="text-white/70 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <FileUpload
            category="genetic_data"
            onUploadSuccess={() => {
              setShowUploadModal(false);
              window.location.reload();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">DNA Insights</h1>
        <p className="text-white/70">Personalised health and fitness recommendations based on your genetic profile</p>
      </div>

      {/* Error banner (if any) */}
      {renderErrorBanner()}

      {/* Main Category Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {mainCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-centre space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Category Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {dnaCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-centre space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowUploadModal(!showUploadModal)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Data</span>
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="mb-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Upload Genetic Data</h3>
            <button
              onClick={() => setShowUploadModal(false)}
              className="text-white/70 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <FileUpload
            category="genetic_data"
            onUploadSuccess={() => {
              setShowUploadModal(false);
              window.location.reload();
            }}
          />
        </div>
      )}

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default DNAScreen;