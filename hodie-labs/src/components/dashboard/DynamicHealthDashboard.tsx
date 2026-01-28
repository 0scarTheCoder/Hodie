import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { mongoService } from '../../services/mongoService';

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

const DynamicHealthDashboard: React.FC<HealthDashboardProps> = ({ user }) => {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInputForm, setShowInputForm] = useState(false);

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

  useEffect(() => {
    loadUserData();
  }, [user]);

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
      setUserData(userData);

      // Get today's health metrics
      const today = new Date().toISOString().split('T')[0];
      const metricsResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/health-metrics/${user.uid}?startDate=${today}&endDate=${today}`);
      
      if (metricsResponse.ok) {
        const metrics = await metricsResponse.json();
        if (metrics.length > 0) {
          setHealthMetrics(metrics[0]);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    // For now, return a placeholder - in real app, calculate from historical data
    return userData?.healthData?.streak || 0;
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
      }
    } catch (error) {
      console.error('Error saving health metrics:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-centre justify-centre">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const healthScore = healthMetrics ? calculateHealthScore(healthMetrics) : 0;
  const streak = calculateStreak();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Add Data Button */}
        <div className="mb-6 flex justify-between items-centre">
          <h1 className="text-2xl font-bold text-gray-900">Health Dashboard</h1>
          <button
            onClick={() => setShowInputForm(!showInputForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showInputForm ? 'Cancel' : 'Add Today\'s Data'}
          </button>
        </div>

        {/* Health Data Input Form */}
        {showInputForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4">Enter Today's Health Data</h3>
            <form onSubmit={handleInputSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Steps</label>
                <input
                  type="number"
                  value={formData.steps}
                  onChange={(e) => setFormData({...formData, steps: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="8000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calories Burned</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({...formData, calories: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.distance}
                  onChange={(e) => setFormData({...formData, distance: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5.2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sleep Hours</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.sleepHours}
                  onChange={(e) => setFormData({...formData, sleepHours: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="7.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sleep Quality</label>
                <select
                  value={formData.sleepQuality}
                  onChange={(e) => setFormData({...formData, sleepQuality: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
                <select
                  value={formData.mood}
                  onChange={(e) => setFormData({...formData, mood: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="😊">😊 Great</option>
                  <option value="🙂">🙂 Good</option>
                  <option value="😐">😐 Okay</option>
                  <option value="🙁">🙁 Not Great</option>
                  <option value="😢">😢 Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) - Optional</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="70.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate - Optional</label>
                <input
                  type="number"
                  value={formData.heartRate}
                  onChange={(e) => setFormData({...formData, heartRate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="75"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Health Data
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Top Row - Streak and Health Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Dynamic Streak Card */}
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-centre justify-between mb-4">
                    <h3 className="text-lg font-semibold">{streak} Day Streak</h3>
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-centre justify-centre">
                      <div className="w-6 h-6 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-sm opacity-90 mb-6">
                    {streak > 0 
                      ? "Keep up the great work and maintain your healthy habits!" 
                      : "Start tracking your health data to build a streak!"}
                  </p>
                  <button 
                    onClick={() => setShowInputForm(true)}
                    className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
                  >
                    {healthMetrics ? 'Update Data' : 'Add Data'}
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
              </div>

              {/* Dynamic Health Score Card */}
              <div className="bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold mb-2">Your Health Score</h3>
                  <div className="flex items-centre justify-between mb-4">
                    <div className="text-4xl font-bold">{healthScore}</div>
                    <div className="text-right">
                      <div className="text-sm opacity-90">Today</div>
                      <div className="text-sm opacity-90">
                        {healthMetrics ? 'Updated' : 'No data'}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm opacity-90 mb-4">
                    {healthScore >= 80 ? 'Excellent health habits!' :
                     healthScore >= 60 ? 'Good progress, keep improving!' :
                     healthScore >= 40 ? 'Room for improvement in your health routine.' :
                     'Start tracking your health data for a better score!'}
                  </p>
                  <button 
                    onClick={() => setShowInputForm(true)}
                    className="bg-white text-teal-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
                  >
                    Improve Score
                  </button>
                </div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mb-12"></div>
              </div>
            </div>

            {/* Dynamic Health Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Daily Activity */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-centre justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Daily Activity</h4>
                  <div className="text-xs text-gray-500">Today</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Steps</span>
                    <span className="text-sm font-medium">
                      {healthMetrics?.steps?.toLocaleString() || 'No data'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Calories</span>
                    <span className="text-sm font-medium">
                      {healthMetrics?.calories || 'No data'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Distance</span>
                    <span className="text-sm font-medium">
                      {healthMetrics?.distance ? `${healthMetrics.distance} km` : 'No data'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowInputForm(true)}
                  className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  {healthMetrics ? 'Update' : 'Add Data'}
                </button>
              </div>

              {/* Mood Check */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-centre justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Mood Check</h4>
                  <div className="text-xs text-gray-500">Today</div>
                </div>
                <div className="text-centre py-4">
                  <div className="text-3xl mb-2">{healthMetrics?.mood || '❓'}</div>
                  <div className="text-sm text-gray-600 mb-4">
                    {healthMetrics ? 'Today\'s mood' : 'How are you feeling today?'}
                  </div>
                </div>
                <button 
                  onClick={() => setShowInputForm(true)}
                  className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  {healthMetrics ? 'Update Mood' : 'Log Mood'}
                </button>
              </div>

              {/* Sleep Tracker */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-centre justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Sleep</h4>
                  <div className="text-xs text-gray-500">Last night</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="text-sm font-medium">
                      {healthMetrics?.sleepHours ? `${healthMetrics.sleepHours}h` : 'No data'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quality</span>
                    <span className="text-sm font-medium">
                      {healthMetrics?.sleepQuality || 'No data'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Score</span>
                    <span className="text-sm font-medium">
                      {healthMetrics ? 
                        `${Math.round((healthMetrics.sleepHours / 8) * 100)}%` : 
                        'No data'
                      }
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowInputForm(true)}
                  className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  {healthMetrics ? 'Update' : 'Add Data'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Static for now, can be made dynamic later */}
          <div className="space-y-6">
            
            {/* Recommendations based on data */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Recommendations</h3>
              <div className="space-y-4">
                
                {healthMetrics && healthMetrics.steps < 10000 && (
                  <div className="flex items-centre justify-between p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-centre space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-800 font-medium">Increase daily steps</span>
                    </div>
                    <span className="text-blue-600 text-sm font-medium">Priority</span>
                  </div>
                )}

                {healthMetrics && healthMetrics.sleepHours < 7 && (
                  <div className="flex items-centre justify-between p-4 bg-purple-50 rounded-xl">
                    <div className="flex items-centre space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-purple-800 font-medium">Get more sleep</span>
                    </div>
                    <span className="text-purple-600 text-sm font-medium">Important</span>
                  </div>
                )}

                {healthMetrics && healthMetrics.calories < 200 && (
                  <div className="flex items-centre justify-between p-4 bg-orange-50 rounded-xl">
                    <div className="flex items-centre space-x-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-orange-800 font-medium">Increase physical activity</span>
                    </div>
                    <span className="text-orange-600 text-sm font-medium">Suggested</span>
                  </div>
                )}

                {!healthMetrics && (
                  <div className="flex items-centre justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-centre space-x-3">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-gray-800 font-medium">Start tracking your health data</span>
                    </div>
                    <span className="text-gray-600 text-sm font-medium">First Step</span>
                  </div>
                )}
              </div>
            </div>

            {/* Data Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-centre">
                  <span className="text-sm text-gray-600">Today's Data</span>
                  <span className={`text-sm font-medium ${
                    healthMetrics ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {healthMetrics ? 'Complete' : 'Missing'}
                  </span>
                </div>
                <div className="flex justify-between items-centre">
                  <span className="text-sm text-gray-600">Health Score</span>
                  <span className="text-sm font-medium text-gray-900">{healthScore}/100</span>
                </div>
                <div className="flex justify-between items-centre">
                  <span className="text-sm text-gray-600">Streak</span>
                  <span className="text-sm font-medium text-gray-900">{streak} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicHealthDashboard;