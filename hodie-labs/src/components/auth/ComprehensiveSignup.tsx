import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Heart, 
  Target, 
  Activity, 
  Scale, 
  Ruler, 
  Apple,
  Pill,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';

interface SignupData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | '';
  location: string;
  
  // Health Profile
  height: string;
  weight: string;
  bloodType: string;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | '';
  
  // Health Goals
  primaryGoals: string[];
  healthConditions: string[];
  medications: string[];
  allergies: string[];
  
  // Lifestyle
  sleepHours: string;
  stressLevel: '1' | '2' | '3' | '4' | '5' | '';
  dietType: 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'mediterranean' | 'other' | '';
  
  // Preferences
  notifications: boolean;
  dataSharing: boolean;
  newsletter: boolean;
}

const ComprehensiveSignup: React.FC = () => {
  const { loginWithRedirect } = useAuth0();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState<SignupData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    location: '',
    height: '',
    weight: '',
    bloodType: '',
    activityLevel: '',
    primaryGoals: [],
    healthConditions: [],
    medications: [],
    allergies: [],
    sleepHours: '',
    stressLevel: '',
    dietType: '',
    notifications: true,
    dataSharing: false,
    newsletter: true
  });

  const totalSteps = 5;

  const updateFormData = (field: keyof SignupData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: 'primaryGoals' | 'healthConditions' | 'medications' | 'allergies', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.email);
      case 2:
        return !!(formData.height && formData.weight);
      case 3:
        return formData.primaryGoals.length > 0;
      case 4:
        return true; // Optional step
      case 5:
        return true; // Preferences step
      default:
        return true;
    }
  };

  const handleNext = () => {
    const errors = getValidationErrors(currentStep);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        setValidationErrors([]);
      }
    }
  };

  const getValidationErrors = (step: number): string[] => {
    const errors: string[] = [];
    switch (step) {
      case 1:
        if (!formData.firstName) errors.push('First name is required');
        if (!formData.lastName) errors.push('Last name is required');
        if (!formData.email) errors.push('Email is required');
        break;
      case 2:
        if (!formData.height) errors.push('Height is required');
        if (!formData.weight) errors.push('Weight is required');
        break;
      case 3:
        if (formData.primaryGoals.length === 0) errors.push('Please select at least one health goal');
        break;
    }
    return errors;
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignup = async () => {
    if (!validateStep(currentStep)) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        throw new Error('Please fill in all required fields');
      }
      
      // Store comprehensive signup data in localStorage to retrieve after Auth0 signup
      const signupData = {
        ...formData,
        completedComprehensiveSignup: true,
        signupTimestamp: new Date().toISOString()
      };
      localStorage.setItem('hodie_comprehensive_signup_data', JSON.stringify(signupData));
      
      // Redirect to Auth0 signup with user information
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup',
          login_hint: formData.email,
        },
        appState: {
          returnTo: '/dashboard',
          isComprehensiveSignup: true
        }
      });
    } catch (error: any) {
      console.error('Comprehensive signup error:', error);
      alert(error.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  const renderPersonalInfo = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-centre mb-8">
        <User className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Personal Information</h2>
        <p className="text-white/70">Let's start with the basics</p>
        
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-xl p-3">
            <div className="text-red-200 text-sm">
              {validationErrors.map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => updateFormData('firstName', e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-1 transition-colors ${
              validationErrors.includes('First name is required') && !formData.firstName
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                : 'border-white/20 focus:border-purple-400 focus:ring-purple-400'
            }`}
            placeholder="John"
            required
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => updateFormData('lastName', e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-1 transition-colors ${
              validationErrors.includes('Last name is required') && !formData.lastName
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                : 'border-white/20 focus:border-purple-400 focus:ring-purple-400'
            }`}
            placeholder="Smith"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-1 transition-colors ${
            validationErrors.includes('Email is required') && !formData.email
              ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
              : 'border-white/20 focus:border-purple-400 focus:ring-purple-400'
          }`}
          placeholder="john.smith@example.com"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Date of Birth</label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => updateFormData('gender', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => updateFormData('location', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            placeholder="City, Country"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderHealthProfile = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-centre mb-8">
        <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Health Profile</h2>
        <p className="text-white/70">Help us personalize your health insights</p>
        
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-xl p-3">
            <div className="text-red-200 text-sm">
              {validationErrors.map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Height (cm)</label>
          <input
            type="number"
            value={formData.height}
            onChange={(e) => updateFormData('height', e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-1 transition-colors ${
              validationErrors.includes('Height is required') && !formData.height
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                : 'border-white/20 focus:border-purple-400 focus:ring-purple-400'
            }`}
            placeholder="175"
            required
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Weight (kg)</label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => updateFormData('weight', e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-1 transition-colors ${
              validationErrors.includes('Weight is required') && !formData.weight
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                : 'border-white/20 focus:border-purple-400 focus:ring-purple-400'
            }`}
            placeholder="70"
            required
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Blood Type</label>
          <select
            value={formData.bloodType}
            onChange={(e) => updateFormData('bloodType', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
          >
            <option value="">Select</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-white/80 text-sm font-medium mb-3">Activity Level</label>
        <div className="grid grid-cols-5 gap-2">
          {[
            { value: 'sedentary', label: 'Sedentary', desc: 'Office job, no exercise' },
            { value: 'light', label: 'Light', desc: '1-3 days/week' },
            { value: 'moderate', label: 'Moderate', desc: '3-5 days/week' },
            { value: 'active', label: 'Active', desc: '6-7 days/week' },
            { value: 'very_active', label: 'Very Active', desc: '2x daily' }
          ].map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => updateFormData('activityLevel', level.value)}
              className={`p-3 rounded-xl text-centre transition-all ${
                formData.activityLevel === level.value
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <div className="text-sm font-medium">{level.label}</div>
              <div className="text-xs opacity-75">{level.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Sleep Hours/Night</label>
          <select
            value={formData.sleepHours}
            onChange={(e) => updateFormData('sleepHours', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
          >
            <option value="">Select</option>
            <option value="<5">Less than 5 hours</option>
            <option value="5-6">5-6 hours</option>
            <option value="6-7">6-7 hours</option>
            <option value="7-8">7-8 hours</option>
            <option value="8-9">8-9 hours</option>
            <option value=">9">More than 9 hours</option>
          </select>
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Stress Level</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => updateFormData('stressLevel', level.toString())}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                  formData.stressLevel === level.toString()
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-white/50 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderHealthGoals = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-centre mb-8">
        <Target className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Health Goals</h2>
        <p className="text-white/70">What do you want to achieve? (Select all that apply)</p>
        
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-xl p-3">
            <div className="text-red-200 text-sm">
              {validationErrors.map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          'Weight Loss', 'Weight Gain', 'Muscle Building', 'Cardiovascular Health',
          'Better Sleep', 'Stress Management', 'Energy Increase', 'Disease Prevention',
          'Athletic Performance', 'Mental Health', 'Longevity', 'Pain Management'
        ].map((goal) => (
          <button
            key={goal}
            type="button"
            onClick={() => toggleArrayField('primaryGoals', goal)}
            className={`p-4 rounded-xl text-left transition-all ${
              formData.primaryGoals.includes(goal)
                ? 'bg-green-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <div className="flex items-centre">
              {formData.primaryGoals.includes(goal) && (
                <CheckCircle className="w-5 h-5 mr-2" />
              )}
              <span className="font-medium">{goal}</span>
            </div>
          </button>
        ))}
      </div>

      <div>
        <label className="block text-white/80 text-sm font-medium mb-3">Diet Type</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            'omnivore', 'vegetarian', 'vegan', 'keto', 
            'paleo', 'mediterranean', 'intermittent fasting', 'other'
          ].map((diet) => (
            <button
              key={diet}
              type="button"
              onClick={() => updateFormData('dietType', diet)}
              className={`p-3 rounded-xl text-centre transition-all capitalize ${
                formData.dietType === diet
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {diet.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderHealthConditions = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-centre mb-8">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Health Information</h2>
        <p className="text-white/70">Help us provide safer, more personalised recommendations</p>
      </div>

      <div>
        <label className="block text-white/80 text-sm font-medium mb-3">Current Health Conditions (Optional)</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma',
            'Arthritis', 'Depression', 'Anxiety', 'Thyroid Issues',
            'High Cholesterol', 'Sleep Apnea', 'Chronic Pain', 'None'
          ].map((condition) => (
            <button
              key={condition}
              type="button"
              onClick={() => toggleArrayField('healthConditions', condition)}
              className={`p-3 rounded-xl text-left transition-all ${
                formData.healthConditions.includes(condition)
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <div className="flex items-centre">
                {formData.healthConditions.includes(condition) && (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                <span className="text-sm">{condition}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-white/80 text-sm font-medium mb-2">Current Medications (Optional)</label>
        <textarea
          value={formData.medications.join(', ')}
          onChange={(e) => updateFormData('medications', e.target.value.split(', ').filter(m => m.trim()))}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
          placeholder="List any medications you're currently taking..."
          rows={3}
        />
      </div>

      <div>
        <label className="block text-white/80 text-sm font-medium mb-2">Allergies (Optional)</label>
        <textarea
          value={formData.allergies.join(', ')}
          onChange={(e) => updateFormData('allergies', e.target.value.split(', ').filter(a => a.trim()))}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
          placeholder="Food allergies, drug allergies, environmental allergies..."
          rows={3}
        />
      </div>
    </motion.div>
  );

  const renderPreferences = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-centre mb-8">
        <Sparkles className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Preferences</h2>
        <p className="text-white/70">Customize your HodieLabs experience</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-centre justify-between p-4 bg-white/10 rounded-xl">
          <div>
            <h3 className="text-white font-medium">Health Notifications</h3>
            <p className="text-white/60 text-sm">Get reminders for health goals and check-ups</p>
          </div>
          <button
            type="button"
            onClick={() => updateFormData('notifications', !formData.notifications)}
            className={`relative inline-flex h-6 w-11 items-centre rounded-full transition-colors ${
              formData.notifications ? 'bg-green-500' : 'bg-white/20'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-centre justify-between p-4 bg-white/10 rounded-xl">
          <div>
            <h3 className="text-white font-medium">Data Sharing for Research</h3>
            <p className="text-white/60 text-sm">Help improve health insights (anonymized data only)</p>
          </div>
          <button
            type="button"
            onClick={() => updateFormData('dataSharing', !formData.dataSharing)}
            className={`relative inline-flex h-6 w-11 items-centre rounded-full transition-colors ${
              formData.dataSharing ? 'bg-green-500' : 'bg-white/20'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.dataSharing ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-centre justify-between p-4 bg-white/10 rounded-xl">
          <div>
            <h3 className="text-white font-medium">Newsletter & Updates</h3>
            <p className="text-white/60 text-sm">Stay updated with health tips and platform updates</p>
          </div>
          <button
            type="button"
            onClick={() => updateFormData('newsletter', !formData.newsletter)}
            className={`relative inline-flex h-6 w-11 items-centre rounded-full transition-colors ${
              formData.newsletter ? 'bg-green-500' : 'bg-white/20'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.newsletter ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
        <h3 className="text-blue-200 font-medium mb-2">🔒 Privacy & Security</h3>
        <p className="text-blue-200/80 text-sm">
          Your health data is encrypted and secure. We never sell your personal information. 
          You can modify these preferences anytime in your account settings.
        </p>
      </div>
    </motion.div>
  );

  const getStepContent = () => {
    switch (currentStep) {
      case 1: return renderPersonalInfo();
      case 2: return renderHealthProfile();
      case 3: return renderHealthGoals();
      case 4: return renderHealthConditions();
      case 5: return renderPreferences();
      default: return renderPersonalInfo();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a1e5c] via-[#1a0f3a] to-[#0f0622] flex items-centre justify-centre px-4 py-4">
      <div className="w-full max-w-2xl h-full max-h-screen flex flex-col">
        {/* Progress Bar */}
        <div className="mb-6 flex-shrink-0">
          <div className="flex items-centre justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Join HodieLabs</h1>
            <span className="text-white/60">{currentStep} of {totalSteps}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-[#1e1548]/80 backdrop-blur-sm border border-[#2a1e5c]/50 rounded-3xl shadow-2xl flex flex-col flex-1 min-h-0">
          
          <div className="flex-1 overflow-y-auto px-8 pt-6 pb-4 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-white/10">
            <AnimatePresence mode="wait">
              {getStepContent()}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-centre p-8 pt-6 border-t border-white/10 flex-shrink-0">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-centre space-x-2 px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            {currentStep === totalSteps ? (
              <button
                type="button"
                onClick={handleSignup}
                disabled={loading || !validateStep(currentStep)}
                className="flex items-centre space-x-2 px-8 py-3 bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f97316] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Create My Account</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="flex items-centre space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-centre mt-6">
          <p className="text-white/60 text-sm">
            Already have an account?{' '}
            <button 
              onClick={() => loginWithRedirect()}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveSignup;