import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { 
  Brain,
  Dna,
  Microscope,
  Target,
  Zap,
  Star,
  Trophy,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Heart,
  Shield,
  Activity
} from 'lucide-react';
import ComprehensiveHealthProfile from '../ComprehensiveHealthProfile';

interface DemoScreenProps {
  user: User;
}

const DemoScreen: React.FC<DemoScreenProps> = ({ user }) => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const competitiveFeatures = [
    {
      id: 'genetic-analysis',
      title: '200M+ Genetic Variants Analysis',
      description: 'Advanced genetic analysis covering fitness, nutrition, and health predispositions',
      icon: Dna,
      color: 'from-purple-600 to-pink-600',
      features: [
        'ACTN3, MTHFR, TCF7L2 variant analysis',
        'Personalized fitness recommendations',
        'Precise supplement dosing',
        'Pharmacogenomics insights'
      ],
      vsCompetitor: 'Matches DecodeGPT\'s 200M+ variant capability'
    },
    {
      id: 'lab-integration',
      title: 'Medical-Grade Lab Integration',
      description: 'Deep integration with Australian lab providers for comprehensive analysis',
      icon: Microscope,
      color: 'from-green-600 to-teal-600',
      features: [
        'Australian lab provider integration',
        'Real-time result interpretation',
        'Clinical significance analysis',
        'Automated follow-up recommendations'
      ],
      vsCompetitor: 'Superior to DecodeGPT\'s lab integration'
    },
    {
      id: 'ai-personalization',
      title: 'Enhanced AI Personalization',
      description: 'Multi-factor personalization combining genetics, labs, lifestyle, and goals',
      icon: Brain,
      color: 'from-orange-600 to-red-600',
      features: [
        'Genetic + lab + lifestyle integration',
        'Confidence-scored recommendations',
        'Evidence-based interventions',
        'Real-time adaptation'
      ],
      vsCompetitor: 'More comprehensive than DecodeGPT'
    }
  ];

  const demoOptions = [
    {
      id: 'genetic-demo',
      title: 'Genetic Analysis Demo',
      description: 'See how we analyse your genetic variants for personalised insights',
      icon: Dna,
      component: 'genetic'
    },
    {
      id: 'lab-demo', 
      title: 'Lab Analysis Demo',
      description: 'Experience AI-powered lab result interpretation',
      icon: Microscope,
      component: 'labs'
    },
    {
      id: 'comprehensive-demo',
      title: 'Full Integration Demo',
      description: 'See all systems working together for complete personalization',
      icon: Target,
      component: 'comprehensive'
    }
  ];

  return (
    <div className="p-6">
      {!activeDemo ? (
        <>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Hodie AI vs DecodeGPT Demonstration
            </h1>
            <p className="text-white/70">
              Experience how Hodie AI's enhanced features compete with SelfDecode's DecodeGPT
            </p>
          </div>

          {/* Competitive Advantage Overview */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 mb-8">
            <div className="flex items-centre space-x-3 mb-4">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Competitive Advantages</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {competitiveFeatures.map((feature) => (
                <div key={feature.id} className={`bg-gradient-to-r ${feature.color}/20 rounded-lg p-4 border border-white/10`}>
                  <div className="flex items-centre space-x-3 mb-3">
                    <feature.icon className="w-6 h-6 text-white" />
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                  </div>
                  
                  <p className="text-white/80 text-sm mb-3">{feature.description}</p>
                  
                  <ul className="space-y-1 mb-3">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-centre space-x-2 text-sm text-white/70">
                        <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="text-xs text-green-400 font-medium">
                    {feature.vsCompetitor}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DecodeGPT Comparison */}
          <div className="bg-white/10 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">How We Compare to DecodeGPT</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* DecodeGPT */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">SelfDecode DecodeGPT</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-centre space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span className="text-white/80">$119-894/year pricing</span>
                  </div>
                  <div className="flex items-centre space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span className="text-white/80">50-100 questions/month limit</span>
                  </div>
                  <div className="flex items-centre space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span className="text-white/80">200M+ genetic variants</span>
                  </div>
                  <div className="flex items-centre space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span className="text-white/80">Basic lab integration</span>
                  </div>
                </div>
              </div>
              
              {/* Hodie AI */}
              <div className="bg-gradient-to-r from-green-600/30 to-blue-600/30 rounded-lg p-4 border border-green-400/20">
                <h3 className="font-semibold text-white mb-3">Hodie AI Enhanced</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-centre space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white">Included in subscription</span>
                  </div>
                  <div className="flex items-centre space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white">Unlimited AI conversations</span>
                  </div>
                  <div className="flex items-centre space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white">200M+ genetic variants</span>
                  </div>
                  <div className="flex items-centre space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white">Deep Australian lab integration</span>
                  </div>
                  <div className="flex items-centre space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white">Multi-factor personalization</span>
                  </div>
                  <div className="flex items-centre space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white">Real-time health tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Options */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Interactive Demonstrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {demoOptions.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => setActiveDemo(demo.component)}
                  className="bg-white/10 hover:bg-white/20 rounded-xl p-6 text-left transition-colors group"
                >
                  <div className="flex items-centre space-x-3 mb-3">
                    <demo.icon className="w-6 h-6 text-blue-400" />
                    <h3 className="font-semibold text-white">{demo.title}</h3>
                  </div>
                  <p className="text-white/70 text-sm mb-3">{demo.description}</p>
                  <div className="flex items-centre space-x-2 text-blue-400 group-hover:text-blue-300">
                    <span className="text-sm">Try Demo</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Key Benefits */}
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6">
            <div className="flex items-centre space-x-3 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Why Hodie AI is Better</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-centre">
                <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <h3 className="font-medium text-white mb-1">No Limits</h3>
                <p className="text-sm text-white/70">Unlimited AI conversations vs DecodeGPT's 50-100/month</p>
              </div>
              
              <div className="text-centre">
                <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h3 className="font-medium text-white mb-1">Australian Focus</h3>
                <p className="text-sm text-white/70">Local lab integration and Australian health guidelines</p>
              </div>
              
              <div className="text-centre">
                <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="font-medium text-white mb-1">Real-time</h3>
                <p className="text-sm text-white/70">Live health tracking and dynamic recommendations</p>
              </div>
              
              <div className="text-centre">
                <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <h3 className="font-medium text-white mb-1">All-in-one</h3>
                <p className="text-sm text-white/70">Complete health platform, not just genetic analysis</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div>
          {/* Back Button */}
          <button
            onClick={() => setActiveDemo(null)}
            className="mb-4 flex items-centre space-x-2 text-white/70 hover:text-white"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Back to Overview</span>
          </button>
          
          {/* Demo Content */}
          {activeDemo === 'comprehensive' && (
            <ComprehensiveHealthProfile user={user} />
          )}
          
          {activeDemo === 'genetic' && (
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Genetic Analysis Demo</h2>
              <p className="text-white/80 mb-4">
                This demo shows how we analyse genetic variants similar to DecodeGPT's 200M+ variant analysis.
              </p>
              <ComprehensiveHealthProfile user={user} />
            </div>
          )}
          
          {activeDemo === 'labs' && (
            <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Lab Analysis Demo</h2>
              <p className="text-white/80 mb-4">
                Experience our medical-grade lab integration that surpasses DecodeGPT's capabilities.
              </p>
              <ComprehensiveHealthProfile user={user} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DemoScreen;