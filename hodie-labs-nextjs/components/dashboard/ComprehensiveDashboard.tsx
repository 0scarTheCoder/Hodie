import React, { useState, useEffect } from 'react';
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

interface User {
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  sub?: string;
  uid?: string; // For compatibility with Firebase User type
}

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
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface HealthAlert {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
}

interface UpcomingTest {
  id: string;
  name: string;
  date: string;
  type: 'blood' | 'imaging' | 'screening';
  status: 'scheduled' | 'overdue' | 'completed';
}

const ComprehensiveDashboard: React.FC<DashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    healthScore: 87,
    streakDays: 12,
    systolic: 118,
    diastolic: 76,
    heartRate: 72,
    cholesterol: 185,
    psaLevel: 1.2
  });

  const [recommendations] = useState<Recommendation[]>([
    {
      id: '1',
      title: 'Increase Omega-3 Intake',
      category: 'Nutrition',
      icon: Heart,
      description: 'Based on your latest blood work, consider adding fish oil supplements.',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Morning Cardio Session',
      category: 'Fitness',
      icon: Activity,
      description: '20-30 minutes of moderate cardio to improve cardiovascular health.',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Vitamin D Supplement',
      category: 'Supplements',
      icon: Shield,
      description: 'Your vitamin D levels are below optimal range.',
      priority: 'high'
    }
  ]);

  const [healthAlerts] = useState<HealthAlert[]>([
    {
      id: '1',
      type: 'info',
      title: 'Blood Test Reminder',
      message: 'Your quarterly blood panel is due next week.',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'success',
      title: 'Health Goal Achieved',
      message: 'You\'ve maintained your target heart rate for 7 consecutive days!',
      timestamp: '1 day ago'
    }
  ]);

  const [upcomingTests] = useState<UpcomingTest[]>([
    {
      id: '1',
      name: 'Comprehensive Metabolic Panel',
      date: '2024-02-15',
      type: 'blood',
      status: 'scheduled'
    },
    {
      id: '2',
      name: 'Annual Physical Exam',
      date: '2024-02-20',
      type: 'screening',
      status: 'scheduled'
    }
  ]);

  useEffect(() => {
    // Load user health metrics on component mount
    const loadHealthData = async () => {
      try {
        // In a real app, you would fetch this from your API
        console.log('Loading health data for user:', user.email);
        
        // Simulate API call
        const sampleData = {
          healthScore: Math.floor(Math.random() * 30) + 70,
          streakDays: Math.floor(Math.random() * 30),
          systolic: Math.floor(Math.random() * 20) + 110,
          diastolic: Math.floor(Math.random() * 15) + 70,
          heartRate: Math.floor(Math.random() * 20) + 60,
          cholesterol: Math.floor(Math.random() * 50) + 160,
          psaLevel: Math.random() * 2 + 0.5
        };
        
        setHealthMetrics(sampleData);
      } catch (error) {
        console.error('Error loading health data:', error);
      }
    };

    loadHealthData();
  }, [user]);

  const tabItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'chat', label: 'AI Health Chat', icon: MessageCircle },
    { id: 'labs', label: 'Lab Results', icon: Stethoscope },
    { id: 'dna', label: 'DNA Insights', icon: Dna },
    { id: 'recommendations', label: 'Recommendations', icon: Target },
    { id: 'reports', label: 'Reports', icon: Calendar },
    { id: 'blood-test', label: 'Order Blood Test', icon: Upload },
    { id: 'body-scan', label: 'Body Scan', icon: Camera },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'chat':
        return <ChatInterface user={user} />;
      case 'labs':
        return <LabsScreen user={user} />;
      case 'dna':
        return <DNAScreen user={user} />;
      case 'recommendations':
        return <RecommendationsScreen user={user} />;
      case 'reports':
        return <ReportsScreen user={user} />;
      case 'blood-test':
        return <BloodTestWorkflow user={user} />;
      case 'body-scan':
        return <BodyScanWorkflow user={user} />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name || user?.email?.split('@')[0] || 'User'}! 👋
            </h1>
            <p className="text-purple-100 text-lg">
              Your health score is <span className="font-bold">{healthMetrics.healthScore}/100</span>
            </p>
            <p className="text-purple-100">
              You're on a {healthMetrics.streakDays}-day health streak! 🔥
            </p>
          </div>
          <div className="text-6xl opacity-50">🩺</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Blood Pressure</p>
              <p className="text-2xl font-bold text-gray-900">
                {healthMetrics.systolic}/{healthMetrics.diastolic}
              </p>
              <p className="text-green-600 text-sm">Normal</p>
            </div>
            <Heart className="w-12 h-12 text-red-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Heart Rate</p>
              <p className="text-2xl font-bold text-gray-900">{healthMetrics.heartRate}</p>
              <p className="text-green-600 text-sm">BPM</p>
            </div>
            <Activity className="w-12 h-12 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Cholesterol</p>
              <p className="text-2xl font-bold text-gray-900">{healthMetrics.cholesterol}</p>
              <p className="text-yellow-600 text-sm">mg/dL</p>
            </div>
            <TrendingUp className="w-12 h-12 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">PSA Level</p>
              <p className="text-2xl font-bold text-gray-900">{healthMetrics.psaLevel.toFixed(1)}</p>
              <p className="text-green-600 text-sm">ng/mL</p>
            </div>
            <Shield className="w-12 h-12 text-green-400" />
          </div>
        </div>
      </div>

      {/* Health Alerts */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Health Alerts</h2>
          <AlertTriangle className="w-6 h-6 text-orange-500" />
        </div>
        <div className="space-y-4">
          {healthAlerts.map((alert) => (
            <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
              alert.type === 'warning' ? 'border-orange-500 bg-orange-50' :
              alert.type === 'success' ? 'border-green-500 bg-green-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{alert.message}</p>
                </div>
                <span className="text-xs text-gray-500">{alert.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions & Upcoming Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recommendations */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Today's Recommendations</h2>
          <div className="space-y-4">
            {recommendations.slice(0, 3).map((rec) => (
              <div key={rec.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <rec.icon className="w-8 h-8 text-purple-500 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{rec.title}</h3>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {rec.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tests */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Tests</h2>
          <div className="space-y-4">
            {upcomingTests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">{test.name}</h3>
                    <p className="text-sm text-gray-600">{test.date}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  test.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  test.status === 'overdue' ? 'bg-red-100 text-red-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {test.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">HodieLabs</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-2">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="mr-3 h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center">
            <img
              src={user?.picture || '/default-avatar.png'}
              alt={user?.name || 'User'}
              className="w-10 h-10 rounded-full"
            />
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
            <a
              href="/api/auth/logout"
              className="ml-2 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              title="Sign Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar for mobile */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 capitalize">{activeTab.replace('-', ' ')}</h1>
          <div className="w-10"></div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default ComprehensiveDashboard;