import React, { useState } from 'react';
import { User } from 'firebase/auth';
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
  Star
} from 'lucide-react';

interface DNAScreenProps {
  user: User;
}

const DNAScreen: React.FC<DNAScreenProps> = ({ user }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('overview');

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

  const fitnessInsights = [
    {
      gene: 'ACTN3',
      variant: 'RR',
      trait: 'Fast-twitch muscle fibres',
      description: 'You have a genetic advantage for power and sprint activities',
      recommendation: 'Focus on high-intensity, short-duration exercises like sprinting, weightlifting, and HIIT',
      impact: 'High',
      color: 'text-green-600'
    },
    {
      gene: 'ACE',
      variant: 'DD',
      trait: 'Exercise response',
      description: 'You respond better to high-intensity exercise than endurance training',
      recommendation: 'Prioritise strength training and interval workouts over long-distance cardio',
      impact: 'Medium',
      color: 'text-yellow-600'
    },
    {
      gene: 'MCT1',
      variant: 'AA',
      trait: 'Lactate clearance',
      description: 'You have efficient lactate clearance during exercise',
      recommendation: 'You can handle higher training intensities with shorter recovery periods',
      impact: 'Medium',
      color: 'text-blue-600'
    }
  ];

  const nutritionInsights = [
    {
      gene: 'FTO',
      variant: 'AA',
      trait: 'Weight management',
      description: 'You have a lower genetic risk for obesity',
      recommendation: 'Maintain current healthy eating patterns. Focus on portion control and regular meals',
      impact: 'High',
      color: 'text-green-600'
    },
    {
      gene: 'APOE',
      variant: 'E3/E4',
      trait: 'Cholesterol metabolism',
      description: 'You may have increased sensitivity to dietary saturated fat',
      recommendation: 'Limit saturated fat to <7% of calories. Emphasise Mediterranean-style diet',
      impact: 'High',
      color: 'text-red-600'
    },
    {
      gene: 'CYP1A2',
      variant: 'AC',
      trait: 'Caffeine metabolism',
      description: 'You are a moderate caffeine metaboliser',
      recommendation: 'Limit caffeine to 2-3 cups coffee/day. Avoid caffeine after 2pm',
      impact: 'Low',
      color: 'text-yellow-600'
    }
  ];

  const healthRisks = [
    { condition: 'Heart Disease', risk: 'Lower than average', genetic: 15, lifestyle: 25, color: 'text-green-600' },
    { condition: 'Type 2 Diabetes', risk: 'Average', genetic: 35, lifestyle: 40, color: 'text-yellow-600' },
    { condition: 'Alzheimer\'s Disease', risk: 'Slightly elevated', genetic: 45, lifestyle: 30, color: 'text-orange-600' },
    { condition: 'Osteoporosis', risk: 'Lower than average', genetic: 20, lifestyle: 15, color: 'text-green-600' }
  ];

  const traits = [
    { trait: 'Sleep Duration Preference', result: 'Long sleeper (8-9 hours optimal)', gene: 'PER2' },
    { trait: 'Morning/Evening Preference', result: 'Moderate morning person', gene: 'CLOCK' },
    { trait: 'Stress Response', result: 'Resilient to stress', gene: 'COMT' },
    { trait: 'Pain Sensitivity', result: 'Average pain sensitivity', gene: 'SCN9A' },
    { trait: 'Skin Aging', result: 'Average aging rate', gene: 'COL1A1' },
    { trait: 'Hair Thickness', result: 'Thick hair', gene: 'EDAR' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* DNA Profile Summary */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
            <Dna className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Your DNA Profile</h2>
            <p className="text-white/70">Analysis of 850+ genetic variants affecting health and wellness</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">89%</div>
            <div className="text-sm text-white/70">European ancestry</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">850+</div>
            <div className="text-sm text-white/70">Variants analyzed</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">95%</div>
            <div className="text-sm text-white/70">Confidence score</div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Fitness Highlights
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Power vs Endurance</span>
              <span className="text-green-400 font-medium">Power athlete</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Exercise recovery</span>
              <span className="text-blue-400 font-medium">Fast recovery</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Injury risk</span>
              <span className="text-yellow-400 font-medium">Average</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            Health Risks
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Heart disease</span>
              <span className="text-green-400 font-medium">Low risk</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Type 2 diabetes</span>
              <span className="text-yellow-400 font-medium">Average risk</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Alzheimer's</span>
              <span className="text-orange-400 font-medium">Slightly elevated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="bg-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top DNA-Based Recommendations</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <div className="text-white font-medium">Focus on strength training and HIIT</div>
              <div className="text-white/70 text-sm">Your ACTN3 variant suggests you'll respond better to power-based exercises</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />
            <div>
              <div className="text-white font-medium">Follow Mediterranean diet pattern</div>
              <div className="text-white/70 text-sm">Your APOE variant increases sensitivity to saturated fats</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <div className="text-white font-medium">Aim for 8-9 hours of sleep</div>
              <div className="text-white/70 text-sm">Your PER2 variant suggests you need longer sleep duration for optimal health</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFitness = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Fitness & Exercise Genetics</h2>
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
    </div>
  );

  const renderNutrition = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Nutrition & Metabolism</h2>
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

  return (
    <div className="px-6 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">DNA Insights</h1>
        <p className="text-white/70">Personalised health and fitness recommendations based on your genetic profile</p>
      </div>

      {/* Main Category Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {mainCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
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
      <div className="flex flex-wrap gap-2 mb-8">
        {dnaCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default DNAScreen;