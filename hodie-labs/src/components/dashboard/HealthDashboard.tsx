import React from 'react';
import { User } from 'firebase/auth';

interface HealthDashboardProps {
  user: User;
}

const HealthDashboard: React.FC<HealthDashboardProps> = ({ user }) => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Top Row - Streak and Health Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 5 Day Streak Card */}
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-centre justify-between mb-4">
                    <h3 className="text-lg font-semibold">5 Day Streak</h3>
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-centre justify-centre">
                      <div className="w-6 h-6 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-sm opacity-90 mb-6">
                    You're on fire! Keep up the great work and maintain your healthy habits
                  </p>
                  <button className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors">
                    View Details
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
              </div>

              {/* Health Score Card */}
              <div className="bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold mb-2">Your Health Score</h3>
                  <div className="flex items-centre justify-between mb-4">
                    <div className="text-4xl font-bold">48</div>
                    <div className="text-right">
                      <div className="text-sm opacity-90">Last 7 days</div>
                      <div className="text-sm opacity-90">+5 points</div>
                    </div>
                  </div>
                  <p className="text-sm opacity-90 mb-4">
                    Based on your daily activities, sleep quality, and exercise routine
                  </p>
                  <button className="bg-white text-teal-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors">
                    Improve Score
                  </button>
                </div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mb-12"></div>
              </div>
            </div>

            {/* Top 3 Recommendations */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Top 3 Recommendations</h3>
              <div className="space-y-4">
                
                <div className="flex items-centre justify-between p-4 bg-green-50 rounded-xl">
                  <div className="flex items-centre space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-800 font-medium">Drink enough water daily</span>
                  </div>
                  <span className="text-green-600 text-sm font-medium">Complete</span>
                </div>

                <div className="flex items-centre justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-centre space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-800 font-medium">Take 10,000+ steps daily</span>
                  </div>
                  <div className="flex items-centre space-x-2">
                    <div className="w-24 h-2 bg-blue-200 rounded-full">
                      <div className="w-3/4 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <span className="text-blue-600 text-sm font-medium">75%</span>
                  </div>
                </div>

                <div className="flex items-centre justify-between p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-centre space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-purple-800 font-medium">Take Omega-3 supplements with meals</span>
                  </div>
                  <div className="flex items-centre space-x-2">
                    <div className="w-24 h-2 bg-purple-200 rounded-full">
                      <div className="w-1/2 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                    <span className="text-purple-600 text-sm font-medium">50%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Metrics Cards */}
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
                    <span className="text-sm font-medium">8,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Calories</span>
                    <span className="text-sm font-medium">342</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Distance</span>
                    <span className="text-sm font-medium">5.2 km</span>
                  </div>
                </div>
                <button className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  View Details
                </button>
              </div>

              {/* Mood Check */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-centre justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Mood check</h4>
                  <div className="text-xs text-gray-500">Today</div>
                </div>
                <div className="text-centre py-4">
                  <div className="text-3xl mb-2">😊</div>
                  <div className="text-sm text-gray-600 mb-4">How are you feeling today?</div>
                </div>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  Log Mood
                </button>
              </div>

              {/* Sleep Tracker */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-centre justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Last night</h4>
                  <div className="text-xs text-gray-500">Sleep Quality</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="text-sm font-medium">7h 32m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quality</span>
                    <span className="text-sm font-medium">Good</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">REM</span>
                    <span className="text-sm font-medium">1h 45m</span>
                  </div>
                </div>
                <button className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Discover Your Risks */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Discover Your Risks</h3>
              <div className="space-y-4">
                
                <div className="flex items-centre justify-between py-2">
                  <span className="text-sm text-gray-700">Diabetes & Obesity</span>
                  <span className="text-xs text-gray-500">3 Risks</span>
                </div>
                
                <div className="flex items-centre justify-between py-2">
                  <span className="text-sm text-gray-700">Nutrition & Supplements</span>
                  <span className="text-xs text-gray-500">8 Risks</span>
                </div>
                
                <div className="flex items-centre justify-between py-2">
                  <span className="text-sm text-gray-700">Disease</span>
                  <span className="text-xs text-gray-500">12 Risks</span>
                </div>
                
                <div className="flex items-centre justify-between py-2">
                  <span className="text-sm text-gray-700">Heart Health (Alcohol)</span>
                  <span className="text-xs text-gray-500">4 Risks</span>
                </div>
                
                <div className="flex items-centre justify-between py-2">
                  <span className="text-sm text-gray-700">Liver Health</span>
                  <span className="text-xs text-gray-500">6 Risks</span>
                </div>
                
                <div className="flex items-centre justify-between py-2">
                  <span className="text-sm text-gray-700">Mental Health</span>
                  <span className="text-xs text-gray-500">2 Risks</span>
                </div>
                
                <div className="flex items-centre justify-between py-2">
                  <span className="text-sm text-gray-700">Family Planning</span>
                  <span className="text-xs text-gray-500">14 Risks</span>
                </div>
                
                <div className="flex items-centre justify-between py-2">
                  <span className="text-sm text-gray-700">Body Scan</span>
                  <span className="text-xs text-gray-500">16 Risks</span>
                </div>

              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex space-x-2 mb-4">
                  <button className="bg-orange-600 text-white px-3 py-1 rounded text-xs">Heart Attack</button>
                  <button className="bg-red-600 text-white px-3 py-1 rounded text-xs">High Priority</button>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs">Low Priority</button>
                </div>
              </div>
            </div>

            {/* Ask HodieAI */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-700 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-4">Ask HodieAI</h3>
              <p className="text-sm opacity-90 mb-6">
                Get instant health advice, ask questions about your metrics, or get personalised recommendations.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="text-sm opacity-75">Popular questions:</div>
                <div className="space-y-2">
                  <button className="block w-full text-left text-xs bg-white bg-opacity-20 px-3 py-2 rounded-lg hover:bg-opacity-30 transition-colors">
                    "How can I improve my sleep quality?"
                  </button>
                  <button className="block w-full text-left text-xs bg-white bg-opacity-20 px-3 py-2 rounded-lg hover:bg-opacity-30 transition-colors">
                    "What should I eat for better heart health?"
                  </button>
                  <button className="block w-full text-left text-xs bg-white bg-opacity-20 px-3 py-2 rounded-lg hover:bg-opacity-30 transition-colors">
                    "Should I be concerned about my BMI?"
                  </button>
                </div>
              </div>
              
              <button className="w-full bg-white text-purple-700 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors">
                Start Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;