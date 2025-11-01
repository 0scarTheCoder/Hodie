import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { mongoService } from '../../services/mongoService';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Calendar, Activity, Heart, Moon } from 'lucide-react';

interface HealthDashboardProps {
  user: User;
}

interface HealthMetrics {
  steps: number;
  calories: number;
  distance: number;
  sleepHours: number;
  sleepQuality: string;
  mood: string;
  weight?: number;
  heartRate?: number;
  date: string;
}

interface UserData {
  uid: string;
  email: string;
  healthData?: {
    streak?: number;
    healthScore?: number;
    lastUpdated?: string;
  };
}

const EnhancedHealthDashboard: React.FC<HealthDashboardProps> = ({ user }) => {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [historicalData, setHistoricalData] = useState<HealthMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInputForm, setShowInputForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Sample form data for health metrics input
  const [formData, setFormData] = useState({
    steps: '',
    calories: '',
    distance: '',
    sleepHours: '',
    sleepQuality: 'Good',
    mood: '😊',
    weight: '',
    heartRate: ''
  });

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get or create user
      let userData = await mongoService.getUserData(user.uid);
      if (!userData) {
        userData = await mongoService.createUser({
          uid: user.uid,
          email: user.email || '',
          preferences: {}
        });
      }

      // Get last 30 days of health metrics
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const metricsResponse = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/health-metrics/${user.uid}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      
      if (metricsResponse.ok) {
        const metrics = await metricsResponse.json();
        setHistoricalData(metrics);
        
        // Get today's metrics
        const today = new Date().toISOString().split('T')[0];
        const todayMetrics = metrics.find((m: HealthMetrics) => 
          m.date.split('T')[0] === today
        );
        setHealthMetrics(todayMetrics || null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  const calculateHealthScore = (metrics: HealthMetrics): number => {
    let score = 0;
    
    // Steps (max 30 points)
    if (metrics.steps >= 10000) score += 30;
    else if (metrics.steps >= 7500) score += 25;
    else if (metrics.steps >= 5000) score += 20;
    else score += Math.max(0, (metrics.steps / 5000) * 20);

    // Sleep (max 25 points)
    if (metrics.sleepHours >= 7 && metrics.sleepHours <= 9) score += 25;
    else if (metrics.sleepHours >= 6) score += 20;
    else score += Math.max(0, (metrics.sleepHours / 6) * 20);

    // Mood (max 20 points)
    const moodScores: { [key: string]: number } = {
      '😊': 20, '🙂': 15, '😐': 10, '🙁': 5, '😢': 0
    };
    score += moodScores[metrics.mood] || 10;

    // Sleep quality (max 15 points)
    const qualityScores: { [key: string]: number } = {
      'Excellent': 15, 'Good': 12, 'Fair': 8, 'Poor': 3
    };
    score += qualityScores[metrics.sleepQuality] || 8;

    // Activity/calories (max 10 points)
    if (metrics.calories >= 300) score += 10;
    else score += Math.max(0, (metrics.calories / 300) * 10);

    return Math.round(score);
  };

  const calculateStreak = (): number => {
    if (historicalData.length === 0) return 0;
    
    let streak = 0;
    const sortedData = historicalData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (const data of sortedData) {
      if (calculateHealthScore(data) >= 50) { // Minimum score for streak
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const metricsData = {
        userId: user.uid,
        steps: parseInt(formData.steps) || 0,
        calories: parseInt(formData.calories) || 0,
        distance: parseFloat(formData.distance) || 0,
        sleepHours: parseFloat(formData.sleepHours) || 0,
        sleepQuality: formData.sleepQuality,
        mood: formData.mood,
        weight: parseFloat(formData.weight) || undefined,
        heartRate: parseInt(formData.heartRate) || undefined,
        date: new Date()
      };

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/health-metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metricsData),
      });

      if (response.ok) {
        const savedMetrics = await response.json();
        setHealthMetrics(savedMetrics);
        setShowInputForm(false);
        // Reset form
        setFormData({
          steps: '', calories: '', distance: '', sleepHours: '',
          sleepQuality: 'Good', mood: '😊', weight: '', heartRate: ''
        });
        // Reload data to update charts
        loadUserData();
      }
    } catch (error) {
      console.error('Error saving health metrics:', error);
    }
  };

  // Prepare chart data
  const chartData = historicalData.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    steps: item.steps,
    calories: item.calories,
    sleep: item.sleepHours,
    healthScore: calculateHealthScore(item),
    weight: item.weight || 0
  })).slice(-14); // Last 14 days

  const moodData = historicalData.reduce((acc, item) => {
    const mood = item.mood;
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const moodChartData = Object.entries(moodData).map(([mood, count]) => ({
    name: mood,
    value: count
  }));

  const COLORS = ['#8b5cf6', '#ec4899', '#f97316', '#10b981', '#3b82f6'];

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const healthScore = healthMetrics ? calculateHealthScore(healthMetrics) : 0;
  const streak = calculateStreak();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Health Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your health journey with real-time insights</p>
          </div>
          <button
            onClick={() => setShowInputForm(!showInputForm)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
          >
            <Activity size={20} />
            <span>{showInputForm ? 'Cancel' : 'Add Today\'s Data'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: TrendingUp },
                { id: 'trends', name: 'Trends', icon: Calendar },
                { id: 'goals', name: 'Goals', icon: Target }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon size={16} />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Health Data Input Form */}
        {showInputForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-100"
          >
            <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
              <Activity className="text-blue-600" size={24} />
              <span>Enter Today's Health Data</span>
            </h3>
            <form onSubmit={handleInputSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Steps</label>
                <input
                  type="number"
                  value={formData.steps}
                  onChange={(e) => setFormData({...formData, steps: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="8000"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Calories Burned</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({...formData, calories: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="300"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.distance}
                  onChange={(e) => setFormData({...formData, distance: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5.2"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Sleep Hours</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.sleepHours}
                  onChange={(e) => setFormData({...formData, sleepHours: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="7.5"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Sleep Quality</label>
                <select
                  value={formData.sleepQuality}
                  onChange={(e) => setFormData({...formData, sleepQuality: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Mood</label>
                <select
                  value={formData.mood}
                  onChange={(e) => setFormData({...formData, mood: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="😊">😊 Great</option>
                  <option value="🙂">🙂 Good</option>
                  <option value="😐">😐 Okay</option>
                  <option value="🙁">🙁 Not Great</option>
                  <option value="😢">😢 Poor</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="70.5"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Heart Rate</label>
                <input
                  type="number"
                  value={formData.heartRate}
                  onChange={(e) => setFormData({...formData, heartRate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="75"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <Heart size={20} />
                  <span>Save Health Data</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Health Score */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp size={24} />
                  <span className="text-sm opacity-90">Health Score</span>
                </div>
                <div className="text-3xl font-bold mb-2">{healthScore}/100</div>
                <div className="text-sm opacity-90">
                  {healthScore >= 80 ? 'Excellent!' :
                   healthScore >= 60 ? 'Good progress!' :
                   'Keep improving!'}
                </div>
              </motion.div>

              {/* Streak */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <Target size={24} />
                  <span className="text-sm opacity-90">Streak</span>
                </div>
                <div className="text-3xl font-bold mb-2">{streak} days</div>
                <div className="text-sm opacity-90">Keep it up!</div>
              </motion.div>

              {/* Steps Today */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <Activity size={24} />
                  <span className="text-sm opacity-90">Steps Today</span>
                </div>
                <div className="text-3xl font-bold mb-2">
                  {healthMetrics?.steps?.toLocaleString() || '0'}
                </div>
                <div className="text-sm opacity-90">
                  Goal: 10,000
                </div>
              </motion.div>

              {/* Sleep */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 text-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <Moon size={24} />
                  <span className="text-sm opacity-90">Sleep</span>
                </div>
                <div className="text-3xl font-bold mb-2">
                  {healthMetrics?.sleepHours || '0'}h
                </div>
                <div className="text-sm opacity-90">
                  {healthMetrics?.sleepQuality || 'No data'}
                </div>
              </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Health Score Trend */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <TrendingUp className="text-blue-600" size={24} />
                  <span>Health Score Trend</span>
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="healthScore" 
                      stroke="#8b5cf6" 
                      fill="url(#healthScoreGradient)" 
                    />
                    <defs>
                      <linearGradient id="healthScoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Steps vs Calories */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <Activity className="text-green-600" size={24} />
                  <span>Activity Trends</span>
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="steps" stroke="#10b981" strokeWidth={3} />
                    <Line type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Sleep Pattern */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <Moon className="text-indigo-600" size={24} />
                  <span>Sleep Pattern</span>
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData.slice(-7)}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sleep" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Mood Distribution */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <Heart className="text-pink-600" size={24} />
                  <span>Mood Distribution</span>
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={moodChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {moodChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-6">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Daily Steps</span>
                    <span className="font-semibold">
                      {Math.round(chartData.reduce((sum, day) => sum + day.steps, 0) / chartData.length).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Sleep</span>
                    <span className="font-semibold">
                      {(chartData.reduce((sum, day) => sum + day.sleep, 0) / chartData.length).toFixed(1)}h
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Best Day</span>
                    <span className="font-semibold">
                      {chartData.reduce((best, day) => day.healthScore > best.healthScore ? day : best, chartData[0])?.date || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Improvement</span>
                    <span className="font-semibold text-green-600">+12%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold mb-6">Detailed Trends Analysis</h3>
            <p className="text-gray-600">Advanced analytics and trend predictions coming soon...</p>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold mb-6">Health Goals & Targets</h3>
            <p className="text-gray-600">Goal setting and tracking features coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedHealthDashboard;