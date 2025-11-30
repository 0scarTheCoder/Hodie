import React, { useState, useEffect } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import BrandHeader from '../layout/BrandHeader';
import { 
  Heart, 
  Activity, 
  Target, 
  TrendingUp, 
  Upload, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageCircle,
  Zap,
  Shield,
  BarChart3,
  Dna,
  Stethoscope,
  Camera,
  Menu,
  X
} from 'lucide-react';
import ChatInterface from '../chat/ChatInterface';
import BloodTestWorkflow from '../workflows/BloodTestWorkflow';
import BodyScanWorkflow from '../workflows/BodyScanWorkflow';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import DNAScreen from '../screens/DNAScreen';
import LabsScreen from '../screens/LabsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import FAQScreen from '../screens/FAQScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { userMetricsService, HealthScoreMetrics, UserLoginData } from '../../services/userMetricsService';

interface DashboardProps {
  user: User;
}

interface HealthMetrics {
  healthScore: number;
  streakDays: number;
  systolic: number;
  diastolic: number;
  heartRate: number;
  cholesterol: number;
  psaLevel: number;
}

interface Recommendation {
  id: string;
  title: string;
  category: 'Fitness' | 'Nutrition' | 'Supplements';
  icon: React.ElementType;
  color: string;
}

interface RiskCategory {
  name: string;
  riskCount: number;
  color: string;
}

const ComprehensiveDashboard: React.FC<DashboardProps> = ({ user }) => {
  const [healthScore, setHealthScore] = useState<HealthScoreMetrics | null>(null);
  const [loginData, setLoginData] = useState<UserLoginData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [currentStep, setCurrentStep] = useState<'blood' | 'dna' | 'body' | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'recommendations' | 'dna' | 'labs' | 'reports' | 'faq' | 'settings'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // Static health metrics for demo - these would come from blood tests/body scans
  const healthMetrics = {
    systolic: 120,
    diastolic: 80,
    heartRate: 72,
    cholesterol: 1.78,
    psaLevel: 0.57
  };

  useEffect(() => {
    const initializeUserMetrics = async () => {
      try {
        // Track this login and get streak data
        const loginInfo = await userMetricsService.trackUserLogin(user.uid);
        setLoginData(loginInfo);

        // Get calculated health score (assumes user age 42 for demo)
        const scoreMetrics = await userMetricsService.getUserHealthScore(user.uid, 42);
        setHealthScore(scoreMetrics);

        // Show confetti if user has a streak
        if (loginInfo?.loginStreak && loginInfo.loginStreak > 1) {
          setTimeout(() => {
            triggerConfetti();
          }, 1000); // Delay to let page load
        }

        setLoading(false);
      } catch (error) {
        console.error('Error initializing user metrics:', error);
        setLoading(false);
      }
    };

    initializeUserMetrics();
  }, [user.uid]);

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (chatInput.trim()) {
        setShowChat(true);
      }
    }
  };

  const triggerConfetti = () => {
    // Create confetti elements
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: ${['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'][Math.floor(Math.random() * 6)]};
        left: ${Math.random() * 100}vw;
        top: -10px;
        z-index: 10000;
        animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
        border-radius: 50%;
      `;
      
      document.body.appendChild(confetti);
      
      // Remove confetti piece after animation
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 5000);
    }
  };

  // Add confetti CSS if not already added
  useEffect(() => {
    if (!document.getElementById('confetti-styles')) {
      const style = document.createElement('style');
      style.id = 'confetti-styles';
      style.textContent = `
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotateZ(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Function to simulate adding health metrics (for demo)
  const addSampleHealthMetrics = async () => {
    try {
      await userMetricsService.storeHealthMetrics({
        userId: user.uid,
        timestamp: new Date(),
        bloodPressure: { systolic: 120, diastolic: 80 },
        heartRate: 72,
        cholesterol: 4.8,
        glucose: 5.2,
        inflammation: 1.5,
        hrv: 45
      });

      // Recalculate health score
      const updatedScore = await userMetricsService.getUserHealthScore(user.uid, 42);
      setHealthScore(updatedScore);
    } catch (error) {
      console.error('Error adding sample metrics:', error);
    }
  };

  const recommendations: Recommendation[] = [
    {
      id: '1',
      title: 'Do 30 min of light cardio before breakfast',
      category: 'Fitness',
      icon: Activity,
      color: 'bg-green-500'
    },
    {
      id: '2', 
      title: 'Increase your magnesium intake with leafy greens',
      category: 'Nutrition',
      icon: Target,
      color: 'bg-orange-500'
    },
    {
      id: '3',
      title: 'Take Omega-3 supplement with lunch',
      category: 'Supplements', 
      icon: Shield,
      color: 'bg-purple-500'
    }
  ];

  const riskCategories: RiskCategory[] = [
    { name: 'Heart & Blood Vessels', riskCount: 1, color: 'text-green-600' },
    { name: 'Nutrition', riskCount: 2, color: 'text-yellow-600' },
    { name: 'Inflammation & Autoimmunity', riskCount: 19, color: 'text-red-600' },
    { name: 'Detox', riskCount: 21, color: 'text-red-600' },
    { name: 'Blood Sugar Control', riskCount: 25, color: 'text-red-600' },
    { name: 'Weight & Body Fat', riskCount: 4, color: 'text-yellow-600' },
    { name: 'Gut Health', riskCount: 16, color: 'text-red-600' },
    { name: 'Skin & Beauty', riskCount: 12, color: 'text-yellow-600' },
    { name: 'Immunity & Infections', riskCount: 4, color: 'text-yellow-600' }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 70) return 'from-green-400 to-green-600';
    if (score >= 50) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-red-600';
  };

  const renderMiniGauge = (value: string, status: 'optimal' | 'good' | 'high') => {
    const getGaugeConfig = (status: string) => {
      switch (status) {
        case 'optimal':
          return { position: '83%', color: 'bg-gray-700' };
        case 'good':
          return { position: '65%', color: 'bg-gray-700' };
        case 'high':
          return { position: '17%', color: 'bg-gray-700' };
        default:
          return { position: '50%', color: 'bg-gray-700' };
      }
    };

    const config = getGaugeConfig(status);
    
    return (
      <div className="flex items-center space-x-3">
        <span className="font-medium text-white">{value}</span>
        <div className="relative w-16 h-6">
          {/* Marker above bar */}
          <div 
            className={`absolute top-0 w-1.5 h-1.5 ${config.color} rounded-full transform -translate-x-1/2`}
            style={{ left: config.position }}
          ></div>
          
          {/* Horizontal bar - three equal sections */}
          <div className="absolute bottom-1 w-full h-1.5 rounded-full overflow-hidden flex">
            <div className="bg-red-400 w-1/3"></div>
            <div className="bg-yellow-400 w-1/3"></div>
            <div className="bg-green-400 w-1/3"></div>
          </div>
        </div>
      </div>
    );
  };

  const renderScreenContent = () => {
    switch (currentScreen) {
      case 'recommendations':
        return <RecommendationsScreen user={user} healthScore={healthScore?.currentScore || 50} />;
      case 'dna':
        return <DNAScreen user={user} />;
      case 'labs':
        return <LabsScreen user={user} />;
      case 'reports':
        return <ReportsScreen user={user} />;
      case 'faq':
        return <FAQScreen user={user} />;
      case 'settings':
        return <SettingsScreen user={user} />;
      case 'home':
      default:
        return renderHomeContent();
    }
  };

  const renderHomeContent = () => (
    <>
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Streak Card */}
        <div className="bg-gradient-to-r from-orange-300 via-orange-400 to-red-400 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">{loginData?.loginStreak || 1} Day Streak</h2>
          <p className="text-white/90 mb-4">Keep up the great work! You're building a healthier habit every day</p>
          <div className="flex space-x-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">7 day Goal</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">30 day Goal</span>
          </div>
        </div>

        {/* Health Score Card */}
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">Your Health Score</h2>
              <div className="space-y-2 text-sm text-white/90">
                <div className="flex items-center space-x-2">
                  <span className={`${(healthScore?.changeIn60Days || 0) >= 0 ? 'text-green-300' : 'text-red-300'}`}>•</span>
                  <span><strong>Change:</strong> {(healthScore?.changeIn60Days || 0) >= 0 ? '+' : ''}{healthScore?.changeIn60Days || 0} in last 60 days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-300">•</span>
                  <span><strong>Biological Age:</strong> {healthScore?.biologicalAge || 42} (Chronological: {healthScore?.chronologicalAge || 42})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-300">•</span>
                  <span><strong>Key wins:</strong> {healthScore?.keyWins?.join(', ') || 'Inflammation -12%'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-red-300">•</span>
                  <span><strong>Focus area:</strong> {healthScore?.focusArea || 'Reduce inflammation (CRP) from 2.8 to <1.0 mg/L'}</span>
                </div>
              </div>
              <button 
                onClick={() => setCurrentScreen('recommendations')}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium mt-4"
              >
                See all recommendations →
              </button>
            </div>
            <div className="relative ml-6">
              {/* Apple Health Style Rings */}
              <div className="relative w-32 h-32">
                {/* Outer Ring - Move */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    fill="none"
                    stroke="#ff006e"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${(85/100) * 2 * Math.PI * 58} ${2 * Math.PI * 58}`}
                  />
                </svg>
                
                {/* Middle Ring - Exercise */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
                  <circle
                    cx="64"
                    cy="64"
                    r="48"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="48"
                    fill="none"
                    stroke="#00ff88"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${(72/100) * 2 * Math.PI * 48} ${2 * Math.PI * 48}`}
                  />
                </svg>
                
                {/* Inner Ring - Stand */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
                  <circle
                    cx="64"
                    cy="64"
                    r="38"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="38"
                    fill="none"
                    stroke="#00d4ff"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${(91/100) * 2 * Math.PI * 38} ${2 * Math.PI * 38}`}
                  />
                </svg>
                
                {/* Center Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{healthScore?.currentScore || 46}</div>
                    <div className="text-xs">Overall Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Recommendations */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Top 3 Recommendations</h2>
          <button 
            onClick={() => setCurrentScreen('recommendations')}
            className="text-blue-300 hover:text-blue-200 text-sm"
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="flex items-center justify-between bg-white/10 rounded-xl p-6 hover:bg-white/15 transition-colors shadow-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 ${rec.color} rounded-lg flex items-center justify-center`}>
                  <rec.icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">{rec.title}</span>
              </div>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{rec.category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Health Summary & Biomarkers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Health Summary */}
        <div className="bg-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full border border-white/20 backdrop-blur-sm">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4 text-white">Your Health Summary</h3>
            <p className="text-sm text-white/70 mb-4">Latest Readings</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Systolic</span>
                {renderMiniGauge(`${healthMetrics.systolic}`, 'optimal')}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Diastolic</span>
                {renderMiniGauge(`${healthMetrics.diastolic}`, 'optimal')}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Heart Rate</span>
                {renderMiniGauge(`${healthMetrics.heartRate}`, 'optimal')}
              </div>
            </div>
            <div className="mt-6 h-2 bg-white/20 rounded-full">
              <div className="h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          <button 
            onClick={() => setCurrentScreen('labs')}
            className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-sm transition-colors"
          >
            View Full Labs →
          </button>
        </div>

        {/* Heart Health */}
        <div className="bg-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full border border-white/20 backdrop-blur-sm">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 text-white">Heart Health</h3>
            <p className="text-sm text-white/70 mb-4">Measures blood pressure and cholesterols for assessing heart disease risk.</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Resting Heart Rate</span>
                  <span className="text-green-400 font-medium">OPTIMAL</span>
                </div>
                <div className="text-xs text-white/60">45 bpm • Aug 2025</div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">HDL Cholesterol</span>
                  <span className="text-green-400 font-medium">OPTIMAL</span>
                </div>
                <div className="text-xs text-white/60">{healthMetrics.cholesterol} mmol/L • Aug 2025</div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setCurrentScreen('labs')}
            className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-sm transition-colors"
          >
            Learn More →
          </button>
        </div>

        {/* Tumour Markers */}
        <div className="bg-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full border border-white/20 backdrop-blur-sm">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 text-white">Tumour Markers</h3>
            <p className="text-sm text-white/70 mb-4">Biomarkers for early detection of various types of cancers.</p>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Prostate sp.antigen (PSA)</span>
                <span className="text-green-400 font-medium">OPTIMAL</span>
              </div>
              <div className="text-xs text-white/60">{healthMetrics.psaLevel} ug/L • Jun 2024</div>
            </div>
          </div>
          <button 
            onClick={() => setCurrentScreen('labs')}
            className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-sm transition-colors"
          >
            Learn More →
          </button>
        </div>
      </div>

      {/* Test Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full border border-white/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 flex-1">
            <div className="flex items-center space-x-3">
              <Dna className="w-6 h-6 text-green-400" />
              <span className="font-semibold text-white">DNA Insights</span>
            </div>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">Done</span>
          </div>
          <button 
            onClick={() => setCurrentScreen('dna')}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-sm transition-colors"
          >
            View Results →
          </button>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full border border-white/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 flex-1">
            <div className="flex items-center space-x-3">
              <Stethoscope className="w-6 h-6 text-yellow-400" />
              <span className="font-semibold text-white">Blood Tests</span>
            </div>
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">Pending</span>
          </div>
          <button 
            onClick={() => setCurrentStep('blood')}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-sm transition-colors"
          >
            Upload →
          </button>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full border border-white/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 flex-1">
            <div className="flex items-center space-x-3">
              <Camera className="w-6 h-6 text-blue-400" />
              <span className="font-semibold text-white">Body Scan</span>
            </div>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">Book Now</span>
          </div>
          <button 
            onClick={() => setCurrentStep('body')}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-sm transition-colors"
          >
            Track →
          </button>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 mb-12">
        <div className="flex items-center space-x-4">
          <AlertTriangle className="w-6 h-6 text-yellow-400" />
          <span className="font-semibold">Next steps:</span>
          <button 
            onClick={() => setCurrentStep('blood')}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm"
          >
            Upload Blood Test
          </button>
          <button 
            onClick={() => setCurrentStep('body')}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm"
          >
            Book Body Scan
          </button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Analysis */}
        <div className="bg-white/10 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Uncover Your Risks</h3>
              <p className="text-sm text-white/70">Choose a health category or click on the body part to reveal a detailed analysis of your genetic, lab and lifestyle risks.</p>
            </div>
          </div>
          <div className="space-y-3">
            {riskCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-sm">{category.name}</span>
                <span className={`font-semibold ${category.color}`}>{category.riskCount} Risks</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ask HodieLabs */}
        <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Ask HodieLabs</h3>
              <p className="text-sm text-white/70">Get personalised health insights powered by your data</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Quick Suggestions</p>
            <div className="space-y-2 text-sm">
              <button className="block text-left text-white/80 hover:text-white">What's the best dinner for recovery?</button>
              <button className="block text-left text-white/80 hover:text-white">How can I improve my sleep quality?</button>
              <button className="block text-left text-white/80 hover:text-white">Should I take magnesium supplements?</button>
              <button className="block text-left text-white/80 hover:text-white">What workout fits my DNA profile?</button>
            </div>
          </div>

          <div className="flex space-x-2">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleChatKeyDown}
              placeholder="Ask HodieGPT anything..."
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            />
            <button 
              onClick={() => chatInput.trim() && setShowChat(true)}
              disabled={!chatInput.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your health metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white font-poppins">
      {/* Brand Header */}
      <BrandHeader 
        user={user}
        currentScreen={currentScreen}
        onScreenChange={(screen) => setCurrentScreen(screen as 'home' | 'recommendations' | 'dna' | 'labs' | 'reports' | 'faq' | 'settings')}
        showNavigation={true}
      />

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/10 backdrop-blur-sm border-t border-white/20">
          <nav className="flex flex-col space-y-4 p-6">
            <button 
              onClick={() => {
                setCurrentScreen('home');
                setMobileMenuOpen(false);
              }}
              className={`text-left text-white hover:text-blue-300 ${currentScreen === 'home' ? 'text-blue-300' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => {
                setCurrentScreen('recommendations');
                setMobileMenuOpen(false);
              }}
              className={`text-left text-white hover:text-blue-300 ${currentScreen === 'recommendations' ? 'text-blue-300' : ''}`}
            >
              Recommendations
            </button>
            <button 
              onClick={() => {
                setCurrentScreen('dna');
                setMobileMenuOpen(false);
              }}
              className={`text-left text-white hover:text-blue-300 ${currentScreen === 'dna' ? 'text-blue-300' : ''}`}
            >
              DNA
            </button>
            <button 
              onClick={() => {
                setCurrentScreen('labs');
                setMobileMenuOpen(false);
              }}
              className={`text-left text-white hover:text-blue-300 ${currentScreen === 'labs' ? 'text-blue-300' : ''}`}
            >
              Labs
            </button>
            <button 
              onClick={() => {
                setCurrentScreen('reports');
                setMobileMenuOpen(false);
              }}
              className={`text-left text-white hover:text-blue-300 ${currentScreen === 'reports' ? 'text-blue-300' : ''}`}
            >
              Reports
            </button>
            <button 
              onClick={() => {
                setCurrentScreen('faq');
                setMobileMenuOpen(false);
              }}
              className={`text-left text-white hover:text-blue-300 ${currentScreen === 'faq' ? 'text-blue-300' : ''}`}
            >
              FAQ
            </button>
          </nav>
        </div>
      )}

      <div className="px-6 pb-6">
        {renderScreenContent()}
      </div>

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Ask HodieLabs</h2>
              <button 
                onClick={() => setShowChat(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1">
              <ChatInterface user={user} />
            </div>
          </div>
        </div>
      )}

      {/* Blood Test Workflow */}
      {currentStep === 'blood' && (
        <BloodTestWorkflow 
          user={user} 
          onClose={() => setCurrentStep(null)} 
        />
      )}

      {/* Body Scan Workflow */}
      {currentStep === 'body' && (
        <BodyScanWorkflow 
          user={user} 
          onClose={() => setCurrentStep(null)} 
        />
      )}
    </div>
  );
};

export default ComprehensiveDashboard;