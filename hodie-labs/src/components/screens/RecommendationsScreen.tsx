import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  Activity, 
  Target, 
  Shield, 
  Heart, 
  Zap, 
  CheckCircle, 
  Clock,
  Star,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { kimiK2Service, HealthRecommendation, HealthContext } from '../../services/kimiK2Service';

interface RecommendationsScreenProps {
  user: User;
  healthScore: number;
}

const RecommendationsScreen: React.FC<RecommendationsScreenProps> = ({ user, healthScore }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [recommendations, setRecommendations] = useState<HealthRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);

  // Check if user has configured their own API key
  const checkUserApiKey = (): boolean => {
    try {
      const storedSettings = localStorage.getItem(`aiSettings_${user.uid}`);
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        return settings.enableAI && settings.kimiK2ApiKey && settings.kimiK2ApiKey.trim().length > 0;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Initialize AI and load recommendations
  useEffect(() => {
    const initializeAI = async () => {
      // Check API status for this specific user (includes auto-assigned keys)
      const userApiEnabled = await kimiK2Service.checkApiStatus(user.uid);
      
      setAiEnabled(userApiEnabled);
      loadRecommendations();
    };

    initializeAI();
  }, [user.uid, healthScore]);

  // Load AI-generated recommendations
  const loadRecommendations = async () => {
    setLoading(true);
    
    const healthContext: HealthContext = {
      userId: user.uid,
      recentHealthData: {
        steps: 8500,
        sleep: 7.5,
        mood: 'good',
        healthScore: healthScore,
        heartRate: 65,
        bloodPressure: '120/80'
      }
    };

    try {
      const aiRecommendations = await kimiK2Service.generateHealthRecommendations(healthContext);
      setRecommendations(aiRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const staticRecommendations: HealthRecommendation[] = [
    {
      id: '1',
      category: 'Fitness',
      priority: 'High',
      title: 'Do 30 min of light cardio before breakfast',
      description: 'Morning cardio helps boost metabolism and improves insulin sensitivity throughout the day.',
      impact: 'May improve glucose control and energy levels',
      timeframe: '2-4 weeks',
      difficulty: 'Easy',
      completed: false
    },
    {
      id: '2',
      category: 'Nutrition', 
      priority: 'High',
      title: 'Increase your magnesium intake with leafy greens',
      description: 'Low magnesium levels can contribute to inflammation and poor sleep quality.',
      impact: 'May reduce inflammation by 15-20%',
      timeframe: '3-6 weeks', 
      difficulty: 'Easy',
      completed: false
    },
    {
      id: '3',
      category: 'Supplements',
      priority: 'Medium', 
      title: 'Take Omega-3 supplement with lunch',
      description: 'Omega-3 fatty acids support heart health and may reduce inflammation markers.',
      impact: 'May improve HRV and reduce CRP levels',
      timeframe: '4-8 weeks',
      difficulty: 'Easy',
      completed: false
    },
    {
      id: '4',
      category: 'Sleep',
      priority: 'High',
      title: 'Establish consistent sleep schedule',
      description: 'Going to bed and waking up at the same time improves sleep quality and metabolic health.',
      impact: 'May improve glucose tolerance and HRV',
      timeframe: '1-2 weeks',
      difficulty: 'Medium',
      completed: true
    },
    {
      id: '5', 
      category: 'Stress Management',
      priority: 'Medium',
      title: 'Practice 10 minutes daily meditation',
      description: 'Mindfulness meditation can reduce cortisol levels and improve heart rate variability.',
      impact: 'May reduce stress hormones by 25%',
      timeframe: '2-4 weeks',
      difficulty: 'Medium',
      completed: false
    },
    {
      id: '6',
      category: 'Fitness',
      priority: 'Medium',
      title: 'Add 2 strength training sessions weekly',
      description: 'Resistance exercise improves muscle mass, bone density, and insulin sensitivity.',
      impact: 'May increase muscle mass and improve glucose control',
      timeframe: '6-12 weeks',
      difficulty: 'Hard',
      completed: false
    }
  ];

  const filterCategories = ['All', 'Fitness', 'Nutrition', 'Supplements', 'Sleep', 'Stress Management'];
  
  // Use AI recommendations if available, otherwise fallback to static
  const displayRecommendations = recommendations.length > 0 ? recommendations : staticRecommendations;
  
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

  return (
    <div className="px-6 pb-6">
      {/* Header Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              Your Health Recommendations
              {loading && <Loader2 className="w-6 h-6 animate-spin text-white/60 ml-3" />}
              {!aiEnabled && <span className="text-sm text-orange-400 ml-3">(Limited AI Mode)</span>}
            </h1>
            <p className="text-white/70">
              {aiEnabled ? 'AI-powered personalized recommendations based on your health data' : 'General recommendations shown - configure your API key in Settings for personalized AI insights'}
            </p>
          </div>
          <div className="text-right space-y-2">
            <div>
              <div className="text-2xl font-bold text-white">{completedCount}/{totalCount}</div>
              <div className="text-sm text-white/70">Completed</div>
            </div>
            <button 
              onClick={loadRecommendations}
              disabled={loading}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg transition-colors"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Refresh AI'}
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
                <div className="text-2xl font-bold text-white drop-shadow-sm">{recommendations.filter(r => r.priority === 'High').length}</div>
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
            } rounded-xl p-6 border border-white/10 backdrop-blur-sm transition-all hover:shadow-lg hover:border-white/20 ${
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
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
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