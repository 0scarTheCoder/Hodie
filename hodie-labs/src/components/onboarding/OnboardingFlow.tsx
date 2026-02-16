import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  ChevronRight,
  ChevronLeft,
  User as UserIcon,
  Target,
  Activity,
  Heart,
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface OnboardingFlowProps {
  user: User;
  onComplete: () => void;
}

interface UserProfile {
  basicInfo: {
    age: string;
    gender: string;
    height: string;
    weight: string;
    activityLevel: string;
  };
  healthGoals: string[];
  preferences: {
    units: 'metric' | 'imperial';
    notifications: boolean;
    dataSharing: boolean;
  };
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, onComplete }) => {
  const { getAccessToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    basicInfo: {
      age: '',
      gender: '',
      height: '',
      weight: '',
      activityLevel: ''
    },
    healthGoals: [],
    preferences: {
      units: 'metric',
      notifications: true,
      dataSharing: false
    }
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Hodie Labs!',
      subtitle: 'Let\'s personalise your health journey',
      icon: Sparkles
    },
    {
      id: 'basic-info',
      title: 'Tell us about yourself',
      subtitle: 'Basic information helps us provide better insights',
      icon: UserIcon
    },
    {
      id: 'health-goals',
      title: 'What are your health goals?',
      subtitle: 'Select all that apply to you',
      icon: Target
    },
    {
      id: 'preferences',
      title: 'Set your preferences',
      subtitle: 'Customise your experience',
      icon: Activity
    },
    {
      id: 'complete',
      title: 'You\'re all set!',
      subtitle: 'Ready to start your health journey',
      icon: CheckCircle
    }
  ];

  const healthGoalOptions = [
    'Lose weight',
    'Gain muscle',
    'Improve cardiovascular health',
    'Better sleep quality',
    'Reduce stress',
    'Increase daily activity',
    'Track nutrition',
    'Monitor vital signs',
    'General wellness',
    'Rehabilitation'
  ];

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
    { value: 'light', label: 'Lightly active', description: 'Light exercise 1-3 days/week' },
    { value: 'moderate', label: 'Moderately active', description: 'Moderate exercise 3-5 days/week' },
    { value: 'very', label: 'Very active', description: 'Hard exercise 6-7 days/week' },
    { value: 'extra', label: 'Extremely active', description: 'Very hard exercise, physical job' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Get auth token for authenticated backend request
      const token = await getAccessToken().catch(() => null);
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Save profile to backend (creates/updates client record)
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/${user.uid}/profile`, {
        method: 'POST',
        headers,
        body: JSON.stringify(profile),
      });

      // Mark onboarding as complete
      localStorage.setItem(`hodie_onboarding_${user.uid}`, 'completed');

      onComplete();
    } catch (error) {
      console.error('Failed to save profile:', error);
      // Still complete onboarding on error
      onComplete();
    }
  };

  const updateBasicInfo = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [field]: value
      }
    }));
  };

  const toggleHealthGoal = (goal: string) => {
    setProfile(prev => ({
      ...prev,
      healthGoals: prev.healthGoals.includes(goal)
        ? prev.healthGoals.filter(g => g !== goal)
        : [...prev.healthGoals, goal]
    }));
  };

  const updatePreferences = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: // Basic info
        return profile.basicInfo.age && profile.basicInfo.gender && 
               profile.basicInfo.height && profile.basicInfo.weight && 
               profile.basicInfo.activityLevel;
      case 2: // Health goals
        return profile.healthGoals.length > 0;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center">
            <div className="mb-8">
              <img 
                src="/hodie_labs_logo.png" 
                alt="Hodie Labs" 
                className="h-16 mx-auto mb-4"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Hodie Labs!
              </h2>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Your personalised health companion is here to help you track, 
                understand, and improve your wellness journey.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: '📊', title: 'Track Health', desc: 'Monitor your daily metrics' },
                { icon: '🤖', title: 'AI Insights', desc: 'Get personalised advice' },
                { icon: '⌚', title: 'Device Sync', desc: 'Connect your wearables' },
                { icon: '🎯', title: 'Reach Goals', desc: 'Achieve your targets' }
              ].map((feature, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className="font-semibold text-sm">{feature.title}</div>
                  <div className="text-xs text-gray-600">{feature.desc}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'basic-info':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={profile.basicInfo.age}
                  onChange={(e) => updateBasicInfo('age', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={profile.basicInfo.gender}
                  onChange={(e) => updateBasicInfo('gender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height ({profile.preferences.units === 'metric' ? 'cm' : 'ft/in'})
                </label>
                <input
                  type="text"
                  value={profile.basicInfo.height}
                  onChange={(e) => updateBasicInfo('height', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={profile.preferences.units === 'metric' ? '175' : '5\'9"'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight ({profile.preferences.units === 'metric' ? 'kg' : 'lbs'})
                </label>
                <input
                  type="text"
                  value={profile.basicInfo.weight}
                  onChange={(e) => updateBasicInfo('weight', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={profile.preferences.units === 'metric' ? '70' : '155'}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Activity Level
              </label>
              <div className="space-y-3">
                {activityLevels.map((level) => (
                  <label key={level.value} className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value={level.value}
                      checked={profile.basicInfo.activityLevel === level.value}
                      onChange={(e) => updateBasicInfo('activityLevel', e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-gray-600">{level.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'health-goals':
        return (
          <div>
            <p className="text-gray-600 mb-6">
              Select the health goals that matter most to you. You can always change these later.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {healthGoalOptions.map((goal) => (
                <label key={goal} className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={profile.healthGoals.includes(goal)}
                    onChange={() => toggleHealthGoal(goal)}
                    className="mr-3"
                  />
                  <span>{goal}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Measurement Units
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="metric"
                    checked={profile.preferences.units === 'metric'}
                    onChange={(e) => updatePreferences('units', e.target.value)}
                    className="mr-2"
                  />
                  Metric (kg, cm)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="imperial"
                    checked={profile.preferences.units === 'imperial'}
                    onChange={(e) => updatePreferences('units', e.target.value)}
                    className="mr-2"
                  />
                  Imperial (lbs, ft/in)
                </label>
              </div>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.preferences.notifications}
                  onChange={(e) => updatePreferences('notifications', e.target.checked)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Enable notifications</div>
                  <div className="text-sm text-gray-600">Get reminders and health tips</div>
                </div>
              </label>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.preferences.dataSharing}
                  onChange={(e) => updatePreferences('dataSharing', e.target.checked)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Help improve Hodie Labs</div>
                  <div className="text-sm text-gray-600">Share anonymous usage data to improve our service</div>
                </div>
              </label>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center">
            <div className="mb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome aboard! 🎉
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Your profile has been set up successfully. You're now ready to start 
                tracking your health and achieving your wellness goals.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2">What's next?</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Start logging your daily health data</li>
                <li>• Connect your wearable devices</li>
                <li>• Chat with our AI health assistant</li>
                <li>• Set up your first health goals</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                {React.createElement(steps[currentStep].icon, { 
                  className: "w-6 h-6 text-blue-600" 
                })}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {steps[currentStep].title}
              </h1>
              <p className="text-gray-600">
                {steps[currentStep].subtitle}
              </p>
            </div>

            {/* Step content */}
            <div className="mb-8">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              {currentStep === steps.length - 1 ? (
                <button
                  onClick={handleComplete}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  Get Started
                  <Heart className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingFlow;