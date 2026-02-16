import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import {
  Activity,
  Target,
  Shield,
  Heart,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Loader2,
  AlertCircle,
  Upload,
  RefreshCw
} from 'lucide-react';
import type { HealthRecommendation } from '../../services/kimiK2Service';

interface RecommendationsScreenProps {
  user: User;
  healthScore: number;
  onScreenChange?: (screen: string) => void;
}

interface BiomarkerData {
  name: string;
  value: number;
  unit: string;
  referenceRange?: string;
  flagged?: boolean;
  category?: string;
}

const RecommendationsScreen: React.FC<RecommendationsScreenProps> = ({ user, healthScore, onScreenChange }) => {
  const { getAccessToken } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [recommendations, setRecommendations] = useState<HealthRecommendation[]>([]);
  const [isLoadingFromDB, setIsLoadingFromDB] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [generatingAI, setGeneratingAI] = useState<boolean>(false);
  const hasGeneratedRef = useRef(false);

  // Fetch saved recommendations from MongoDB on mount
  useEffect(() => {
    const fetchSavedRecommendations = async () => {
      setIsLoadingFromDB(true);
      setDbError(null);

      try {
        const userId = (user as any).sub || user.uid;

        const token = await getAccessToken().catch((error) => {
          console.warn('⚠️ Could not get token for recommendations:', error);
          return null;
        });

        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch recommendations from backend
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/recommendations/${userId}`,
          { headers }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch recommendations: ${response.status}`);
        }

        const savedRecommendations = await response.json();
        console.log('💡 Fetched saved recommendations:', savedRecommendations);

        // Use saved recommendations if available
        if (savedRecommendations && savedRecommendations.length > 0) {
          setRecommendations(savedRecommendations);
        }

      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setDbError(err instanceof Error ? err.message : 'Failed to load recommendations');
      } finally {
        setIsLoadingFromDB(false);
      }
    };

    fetchSavedRecommendations();
  }, [user, getAccessToken]);

  // Generate AI recommendations from lab data if none saved
  useEffect(() => {
    if (isLoadingFromDB || recommendations.length > 0 || hasGeneratedRef.current) return;

    const generateFromLabData = async () => {
      hasGeneratedRef.current = true;
      setGeneratingAI(true);

      try {
        const userId = (user as any).sub || user.uid;
        const token = await getAccessToken().catch(() => null);
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Fetch lab results
        const labResponse = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/lab-results/${userId}`,
          { headers }
        );

        if (!labResponse.ok) {
          console.log('💡 No lab data available for recommendations');
          return;
        }

        const labResults = await labResponse.json();
        if (!labResults || labResults.length === 0) {
          console.log('💡 No lab results found, cannot generate recommendations');
          return;
        }

        // Extract all biomarkers from lab results
        const allBiomarkers: BiomarkerData[] = [];
        labResults.forEach((result: any) => {
          if (result.biomarkers && Array.isArray(result.biomarkers)) {
            result.biomarkers.forEach((bm: any) => {
              if (bm.name && bm.value) {
                allBiomarkers.push({
                  name: bm.name,
                  value: parseFloat(bm.value),
                  unit: bm.unit || '',
                  referenceRange: bm.referenceRange || '',
                  flagged: bm.flagged || false,
                  category: bm.category || ''
                });
              }
            });
          }
        });

        if (allBiomarkers.length === 0) {
          console.log('💡 No biomarkers found in lab results');
          return;
        }

        console.log(`💡 Generating AI recommendations from ${allBiomarkers.length} biomarkers`);

        // Build a summary of the biomarkers for the AI prompt
        const biomarkerSummary = allBiomarkers.map(bm =>
          `${bm.name}: ${bm.value} ${bm.unit} (Reference: ${bm.referenceRange || 'N/A'})${bm.flagged ? ' [FLAGGED]' : ''}`
        ).join('\n');

        const prompt = `Based on these blood test results, generate exactly 6 personalised health recommendations. Each recommendation should be actionable and specific to the biomarker values shown.

Blood test results:
${biomarkerSummary}

Return your response as a JSON array with exactly 6 objects. Each object must have these exact fields:
- "id": a unique string (e.g. "ai-1", "ai-2", etc.)
- "category": one of "Fitness", "Nutrition", "Supplements", "Sleep", "Stress Management"
- "priority": "High", "Medium", or "Low"
- "title": a short actionable recommendation (max 10 words)
- "description": 1-2 sentences explaining why this matters based on their results
- "impact": what improvement to expect
- "timeframe": how long until results (e.g. "2-4 weeks")
- "difficulty": "Easy", "Medium", or "Hard"
- "completed": false

Return ONLY the JSON array, no other text.`;

        // Call the backend chat API to generate recommendations
        const chatResponse = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/chat`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              message: prompt,
              conversationHistory: [],
              healthContext: { userId }
            })
          }
        );

        if (!chatResponse.ok) {
          console.warn('💡 Chat API failed for recommendation generation');
          return;
        }

        const chatData = await chatResponse.json();
        const responseText = chatData.response || '';

        // Parse the AI response as JSON
        let aiRecommendations: HealthRecommendation[] = [];
        try {
          // Extract JSON array from the response (handle markdown code blocks)
          const jsonMatch = responseText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            aiRecommendations = JSON.parse(jsonMatch[0]);
          }
        } catch (parseErr) {
          console.error('💡 Failed to parse AI recommendations:', parseErr);
          return;
        }

        if (aiRecommendations.length === 0) {
          console.warn('💡 AI returned no valid recommendations');
          return;
        }

        // Ensure all fields are present and valid
        aiRecommendations = aiRecommendations.map((rec, idx) => ({
          id: rec.id || `ai-${idx + 1}`,
          category: rec.category || 'Nutrition',
          priority: (['High', 'Medium', 'Low'].includes(rec.priority) ? rec.priority : 'Medium') as 'High' | 'Medium' | 'Low',
          title: rec.title || 'Health recommendation',
          description: rec.description || '',
          impact: rec.impact || 'May improve overall health',
          timeframe: rec.timeframe || '2-4 weeks',
          difficulty: (['Easy', 'Medium', 'Hard'].includes(rec.difficulty) ? rec.difficulty : 'Medium') as 'Easy' | 'Medium' | 'Hard',
          completed: false
        }));

        console.log(`💡 Generated ${aiRecommendations.length} AI recommendations`);
        setRecommendations(aiRecommendations);

        // Save to MongoDB for future visits
        await saveRecommendationsToMongoDB(aiRecommendations);

      } catch (err) {
        console.error('Error generating AI recommendations:', err);
      } finally {
        setGeneratingAI(false);
      }
    };

    generateFromLabData();
  }, [isLoadingFromDB, recommendations.length, user, getAccessToken]);


  // Save recommendations to MongoDB
  const saveRecommendationsToMongoDB = async (recs: HealthRecommendation[]) => {
    try {
      const userId = (user as any).sub || user.uid;

      // Get Auth0 token
      const token = await getAccessToken().catch((error) => {
        console.warn('⚠️ Could not get Auth0 token for saving recommendations:', error);
        return null;
      });

      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Save recommendations to backend
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/recommendations/${userId}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ recommendations: recs })
        }
      );

      if (!response.ok) {
        console.warn('Failed to save recommendations to MongoDB');
      }
    } catch (error) {
      console.error('Error saving recommendations:', error);
    }
  };

  // Mark recommendation as complete
  const markComplete = async (recId: string) => {
    try {
      // Update local state
      setRecommendations(prevRecs =>
        prevRecs.map(rec =>
          rec.id === recId ? { ...rec, completed: true } : rec
        )
      );

      // Update in MongoDB
      const userId = (user as any).sub || user.uid;

      const token = await getAccessToken().catch((error) => {
        console.warn('⚠️ Could not get Auth0 token for updating recommendation:', error);
        return null;
      });

      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/recommendations/${userId}/${recId}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ completed: true })
        }
      );

      if (!response.ok) {
        console.warn('Failed to update recommendation completion status');
      }
    } catch (error) {
      console.error('Error marking recommendation as complete:', error);
    }
  };

  // Regenerate recommendations from lab data
  const regenerateRecommendations = async () => {
    hasGeneratedRef.current = false;
    setRecommendations([]);

    // Delete existing recommendations from DB first
    try {
      const userId = (user as any).sub || user.uid;
      const token = await getAccessToken().catch(() => null);
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/recommendations/${userId}`,
        { method: 'DELETE', headers }
      );
    } catch (err) {
      console.error('Error clearing old recommendations:', err);
    }
  };

  const filterCategories = ['All', 'Fitness', 'Nutrition', 'Supplements', 'Sleep', 'Stress Management'];

  const displayRecommendations = recommendations;
  
  const filteredRecommendations = selectedFilter === 'All' 
    ? displayRecommendations 
    : displayRecommendations.filter(rec => rec.category === selectedFilter);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-700';
      case 'Medium': return 'text-yellow-600';
      case 'Hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Fitness': return 'bg-green-500';
      case 'Nutrition': return 'bg-orange-500';
      case 'Supplements': return 'bg-purple-500';
      case 'Sleep': return 'bg-blue-500';
      case 'Stress Management': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Fitness': return <Activity className="w-6 h-6 text-white" />;
      case 'Nutrition': return <Target className="w-6 h-6 text-white" />;
      case 'Supplements': return <Shield className="w-6 h-6 text-white" />;
      case 'Sleep': return <Clock className="w-6 h-6 text-white" />;
      case 'Stress Management': return <Heart className="w-6 h-6 text-white" />;
      default: return <Star className="w-6 h-6 text-white" />;
    }
  };

  const completedCount = filteredRecommendations.filter(r => r.completed).length;
  const totalCount = filteredRecommendations.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Loading state (initial DB load or AI generation)
  if (isLoadingFromDB || generatingAI) {
    return (
      <div className="px-6 pb-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-white/70">
              {generatingAI ? 'Generating personalised recommendations from your lab data...' : 'Loading recommendations...'}
            </p>
            {generatingAI && (
              <p className="text-white/50 text-sm mt-2">This may take a moment while our AI analyses your biomarkers</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Error banner (non-blocking - show warning but still render)
  const renderErrorBanner = () => {
    if (!dbError) return null;

    return (
      <div className="mb-6 bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white">Using Default Recommendations</h3>
            <p className="text-white/70 text-sm">{dbError}</p>
          </div>
        </div>
      </div>
    );
  };

  // Empty state (no recommendations available)
  if (displayRecommendations.length === 0) {
    return (
      <div className="px-6 pb-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Your Health Recommendations</h1>
          <p className="text-white/70">AI-powered personalised recommendations based on your health data</p>
        </div>
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-8 text-center">
          <Target className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Recommendations Available</h3>
          <p className="text-white/70 mb-6">
            Complete health assessments and upload data to receive personalised AI-powered health recommendations.
          </p>
          <button
            onClick={() => onScreenChange && onScreenChange('labs')}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg mx-auto"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Health Data</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6">
      {/* Error banner (if any) */}
      {renderErrorBanner()}

      {/* Header Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Your Health Recommendations
            </h1>
            <p className="text-white/70">
              AI-powered personalised recommendations based on your health data
            </p>
          </div>
          <div className="text-right space-y-2">
            <div>
              <div className="text-2xl font-bold text-white">{completedCount}/{totalCount}</div>
              <div className="text-sm text-white/70">Completed</div>
            </div>
            <button
              onClick={regenerateRecommendations}
              className="flex items-center space-x-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm transition-colors"
              title="Regenerate recommendations from latest lab data"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-white" />
              <div>
                <div className="text-2xl font-bold text-white drop-shadow-sm">{completionRate}%</div>
                <div className="text-sm text-white/90">Completion Rate</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center space-x-3">
              <Star className="w-8 h-8 text-white" />
              <div>
                <div className="text-2xl font-bold text-white drop-shadow-sm">{healthScore}</div>
                <div className="text-sm text-white/90">Health Score</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-white" />
              <div>
                <div className="text-2xl font-bold text-white drop-shadow-sm">{displayRecommendations.filter(r => r.priority === 'High').length}</div>
                <div className="text-sm text-white/90">High Priority</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            {filterCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedFilter(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.map((rec, index) => (
          <div 
            key={rec.id} 
            className={`bg-gradient-to-r ${
              index % 3 === 0 ? 'from-blue-600/20 via-purple-600/20 to-indigo-700/20' :
              index % 3 === 1 ? 'from-teal-500/20 via-cyan-600/20 to-blue-600/20' :
              'from-purple-500/20 via-pink-600/20 to-rose-600/20'
            } rounded-xl p-4 border border-white/10 backdrop-blur-sm transition-all hover:shadow-lg hover:border-white/20 ${
              rec.completed ? 'opacity-75' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className={`w-12 h-12 ${getCategoryColor(rec.category)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  {getCategoryIcon(rec.category)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{rec.title}</h3>
                    {rec.completed && <CheckCircle className="w-5 h-5 text-green-400" />}
                  </div>
                  
                  <p className="text-white/80 mb-3">{rec.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                      {rec.priority} Priority
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white">
                      {rec.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(rec.difficulty)}`}>
                      {rec.difficulty}
                    </span>
                  </div>
                  
                  <div className="text-sm text-white/70">
                    <div className="mb-1"><strong>Expected Impact:</strong> {rec.impact}</div>
                    <div><strong>Timeframe:</strong> {rec.timeframe}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 ml-4">
                {!rec.completed ? (
                  <button
                    onClick={() => markComplete(rec.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                  >
                    Mark Complete
                  </button>
                ) : (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium cursor-default">
                    Completed ✓
                  </button>
                )}
                <button className="px-4 py-2 border border-white/30 hover:bg-white/10 text-white rounded-lg text-sm">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Panel */}
      <div className="mt-8 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-600/20 rounded-xl p-6 border border-white/10 backdrop-blur-sm shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Ready to Improve Your Health Score?</h3>
        <p className="text-white/80 mb-4">
          Complete high-priority recommendations to see the biggest impact on your health score. 
          Each completed recommendation can improve your score by 2-5 points.
        </p>
        <div className="flex space-x-4">
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-md transition-all">
            Start High Priority Tasks
          </button>
          <button className="px-6 py-3 border border-white/30 hover:bg-white/10 text-white rounded-lg transition-all">
            Schedule Reminders
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsScreen;