import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { 
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Bell,
  Eye,
  Download,
  Trash2,
  Save,
  Edit3,
  Lock,
  Globe,
  Clock,
  Activity,
  CreditCard,
  Receipt,
  Star,
  Bot
} from 'lucide-react';

interface SettingsScreenProps {
  user: User;
}

interface UserProfile {
  displayName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  location: string;
  emergencyContact: string;
  medicalConditions: string[];
  medications: string[];
  allergies: string[];
}

interface PrivacySettings {
  dataSharing: boolean;
  marketingEmails: boolean;
  healthInsights: boolean;
  thirdPartyIntegration: boolean;
  anonymousAnalytics: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  healthReminders: boolean;
  testResults: boolean;
  weeklyReports: boolean;
  emergencyAlerts: boolean;
}

interface PaymentDetails {
  subscription: {
    plan: 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    nextBilling: string;
    amount: number;
  };
  paymentMethod: {
    type: 'card' | 'paypal' | 'bank';
    last4: string;
    expiry: string;
    brand: string;
  };
  billingAddress: {
    name: string;
    address: string;
    city: string;
    country: string;
    postal: string;
  };
}

interface AISettings {
  kimiK2ApiKey: string;
  enableAI: boolean;
  aiProvider: 'moonshot' | 'aimlapi' | 'openrouter';
  maxTokensPerDay: number;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'notifications' | 'payment' | 'ai' | 'account'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    displayName: user.displayName || '',
    email: user.email || '',
    phone: '+61 400 000 000',
    dateOfBirth: '1985-03-15',
    gender: 'Male',
    location: 'Sydney, Australia',
    emergencyContact: 'Jane Doe - +61 400 111 222',
    medicalConditions: ['Hypertension', 'Type 2 Diabetes'],
    medications: ['Metformin 500mg', 'Lisinopril 10mg'],
    allergies: ['Penicillin', 'Shellfish']
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataSharing: true,
    marketingEmails: false,
    healthInsights: true,
    thirdPartyIntegration: false,
    anonymousAnalytics: true
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    healthReminders: true,
    testResults: true,
    weeklyReports: true,
    emergencyAlerts: true
  });

  const [aiSettings, setAiSettings] = useState<AISettings>({
    kimiK2ApiKey: '',
    enableAI: false,
    aiProvider: 'moonshot',
    maxTokensPerDay: 1000
  });

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    subscription: {
      plan: 'premium',
      status: 'active',
      nextBilling: '2025-01-15',
      amount: 29.99
    },
    paymentMethod: {
      type: 'card',
      last4: '4242',
      expiry: '12/26',
      brand: 'Visa'
    },
    billingAddress: {
      name: 'John Doe',
      address: '123 Health Street',
      city: 'Sydney',
      country: 'Australia',
      postal: '2000'
    }
  });

  const handleSave = () => {
    // Here you would save to your backend/database
    setIsEditing(false);
    // Show success message
  };

  const handleExportData = () => {
    // Export user health data as JSON/PDF
    const dataToExport = {
      profile: userProfile,
      privacy: privacySettings,
      notifications: notificationSettings,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hodie-labs-data-export.json';
    link.click();
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Handle account deletion
      alert('Account deletion would be processed here');
    }
  };

  const handleUpgrade = (plan: string) => {
    alert(`Upgrading to ${plan} plan...`);
    // Handle plan upgrade logic
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      alert('Subscription cancellation would be processed here');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'ai', label: 'AI Settings', icon: Bot },
    { id: 'account', label: 'Account', icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-white/70">Manage your account, privacy, and preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-white/10 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm border border-white/20">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Display Name</label>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <UserIcon className="w-5 h-5 text-white/60" />
                    <input
                      type="text"
                      value={userProfile.displayName}
                      onChange={(e) => setUserProfile({...userProfile, displayName: e.target.value})}
                      disabled={!isEditing}
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <Mail className="w-5 h-5 text-white/60" />
                    <input
                      type="email"
                      value={userProfile.email}
                      disabled={true}
                      className="flex-1 bg-transparent border-none outline-none text-white/60 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <Phone className="w-5 h-5 text-white/60" />
                    <input
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                      disabled={!isEditing}
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date of Birth</label>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <Calendar className="w-5 h-5 text-white/60" />
                    <input
                      type="date"
                      value={userProfile.dateOfBirth}
                      onChange={(e) => setUserProfile({...userProfile, dateOfBirth: e.target.value})}
                      disabled={!isEditing}
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <MapPin className="w-5 h-5 text-white/60" />
                    <input
                      type="text"
                      value={userProfile.location}
                      onChange={(e) => setUserProfile({...userProfile, location: e.target.value})}
                      disabled={!isEditing}
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Emergency Contact</label>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <Phone className="w-5 h-5 text-white/60" />
                    <input
                      type="text"
                      value={userProfile.emergencyContact}
                      onChange={(e) => setUserProfile({...userProfile, emergencyContact: e.target.value})}
                      disabled={!isEditing}
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Privacy & Data Settings</h2>
              
              <div className="space-y-4">
                {Object.entries(privacySettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h3 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                      <p className="text-sm text-white/70">
                        {key === 'dataSharing' && 'Allow HodieLabs to share anonymized data for research'}
                        {key === 'marketingEmails' && 'Receive marketing emails and promotional content'}
                        {key === 'healthInsights' && 'Get personalized health insights based on your data'}
                        {key === 'thirdPartyIntegration' && 'Allow integration with third-party health apps'}
                        {key === 'anonymousAnalytics' && 'Help improve our service with anonymous usage data'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setPrivacySettings({...privacySettings, [key]: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Notification Preferences</h2>
              
              <div className="space-y-4">
                {Object.entries(notificationSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-white/60" />
                      <div>
                        <h3 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                        <p className="text-sm text-white/70">
                          {key === 'emailNotifications' && 'Receive notifications via email'}
                          {key === 'pushNotifications' && 'Get push notifications on your device'}
                          {key === 'healthReminders' && 'Reminders for health check-ups and medications'}
                          {key === 'testResults' && 'Get notified when test results are available'}
                          {key === 'weeklyReports' && 'Weekly health summary reports'}
                          {key === 'emergencyAlerts' && 'Critical health alerts and emergency notifications'}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotificationSettings({...notificationSettings, [key]: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Payment & Billing</h2>
              
              {/* Current Subscription */}
              <div className="space-y-4">
                <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Star className="w-6 h-6 text-yellow-400" />
                      <div>
                        <h3 className="font-semibold text-lg capitalize">{paymentDetails.subscription.plan} Plan</h3>
                        <p className="text-sm text-white/70">
                          Status: <span className={`capitalize ${paymentDetails.subscription.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                            {paymentDetails.subscription.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${paymentDetails.subscription.amount}</div>
                      <div className="text-sm text-white/60">per month</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-white/5 rounded">
                      <div className="text-sm text-white/70">Next Billing</div>
                      <div className="font-medium">{new Date(paymentDetails.subscription.nextBilling).toLocaleDateString()}</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded">
                      <div className="text-sm text-white/70">Billing Cycle</div>
                      <div className="font-medium">Monthly</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded">
                      <div className="text-sm text-white/70">Auto Renew</div>
                      <div className="font-medium text-green-400">Enabled</div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleUpgrade('enterprise')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Upgrade Plan
                    </button>
                    <button
                      onClick={handleCancelSubscription}
                      className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3 mb-4">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <h3 className="font-medium">Payment Method</h3>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded border border-white/5">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-xs font-bold">
                        {paymentDetails.paymentMethod.brand.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">•••• •••• •••• {paymentDetails.paymentMethod.last4}</div>
                        <div className="text-sm text-white/60">Expires {paymentDetails.paymentMethod.expiry}</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-white/10 hover:bg-white/20 text-sm rounded transition-colors">
                      Update
                    </button>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Billing Address</h3>
                    <button className="px-3 py-1 bg-white/10 hover:bg-white/20 text-sm rounded transition-colors">
                      Edit
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>{paymentDetails.billingAddress.name}</div>
                    <div>{paymentDetails.billingAddress.address}</div>
                    <div>{paymentDetails.billingAddress.city}, {paymentDetails.billingAddress.postal}</div>
                    <div>{paymentDetails.billingAddress.country}</div>
                  </div>
                </div>

                {/* Billing History */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3 mb-4">
                    <Receipt className="w-5 h-5 text-green-400" />
                    <h3 className="font-medium">Recent Invoices</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { date: '2024-12-15', amount: 29.99, status: 'paid' },
                      { date: '2024-11-15', amount: 29.99, status: 'paid' },
                      { date: '2024-10-15', amount: 29.99, status: 'paid' }
                    ].map((invoice, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded">
                        <div className="flex items-center space-x-4">
                          <div>
                            <div className="font-medium">${invoice.amount}</div>
                            <div className="text-sm text-white/60">{new Date(invoice.date).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {invoice.status.toUpperCase()}
                          </span>
                          <button className="text-blue-400 text-sm hover:underline">
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Available Plans */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="font-medium mb-4">Available Plans</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: 'basic', price: 9.99, features: ['Basic health tracking', '5 health reports', 'Email support'] },
                      { name: 'premium', price: 29.99, features: ['Advanced analytics', 'Unlimited reports', 'AI insights', 'Priority support'] },
                      { name: 'enterprise', price: 99.99, features: ['Everything in Premium', 'Custom integrations', 'Dedicated support', 'API access'] }
                    ].map((plan) => (
                      <div key={plan.name} className={`p-4 rounded-lg border ${
                        paymentDetails.subscription.plan === plan.name 
                          ? 'border-blue-400 bg-blue-500/10' 
                          : 'border-white/20 bg-white/5'
                      }`}>
                        <div className="text-center mb-3">
                          <h4 className="font-semibold capitalize">{plan.name}</h4>
                          <div className="text-2xl font-bold">${plan.price}</div>
                          <div className="text-sm text-white/60">per month</div>
                        </div>
                        
                        <ul className="space-y-2 text-sm mb-4">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {paymentDetails.subscription.plan === plan.name ? (
                          <div className="text-center text-blue-400 font-medium">Current Plan</div>
                        ) : (
                          <button
                            onClick={() => handleUpgrade(plan.name)}
                            className="w-full py-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
                          >
                            {plan.price > paymentDetails.subscription.amount ? 'Upgrade' : 'Downgrade'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Settings Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">AI Health Analytics Settings</h2>
              
              {/* AI Status */}
              <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Bot className="w-6 h-6 text-purple-400" />
                    <div>
                      <h3 className="font-semibold">Kimi K2 AI Status</h3>
                      <p className="text-sm text-white/60">
                        {aiSettings.enableAI && aiSettings.kimiK2ApiKey 
                          ? 'AI-powered health analytics enabled' 
                          : 'Limited AI mode - Configure your API key for advanced features'
                        }
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    aiSettings.enableAI && aiSettings.kimiK2ApiKey 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {aiSettings.enableAI && aiSettings.kimiK2ApiKey ? 'Active' : 'Limited Mode'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">256k</div>
                    <div className="text-xs text-white/60">Context Window</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{aiSettings.maxTokensPerDay}</div>
                    <div className="text-xs text-white/60">Daily Token Limit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{aiSettings.aiProvider}</div>
                    <div className="text-xs text-white/60">AI Provider</div>
                  </div>
                </div>
              </div>

              {/* API Key Configuration */}
              <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-3 mb-4">
                  <Lock className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold">Your Personal API Key</h3>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-300">Why Use Your Own API Key?</h4>
                      <p className="text-xs text-yellow-200/80 mt-1">
                        • Control your own usage and costs<br/>
                        • No sharing API limits with other users<br/>
                        • Direct access to latest Kimi K2 features<br/>
                        • Your conversations remain private to your account
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Kimi K2 API Key
                    </label>
                    <div className="relative">
                      <input
                        type={aiSettings.kimiK2ApiKey ? 'password' : 'text'}
                        value={aiSettings.kimiK2ApiKey}
                        onChange={(e) => setAiSettings(prev => ({ ...prev, kimiK2ApiKey: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                        placeholder="sk-your-kimi-k2-api-key-here"
                      />
                      {aiSettings.kimiK2ApiKey && (
                        <Eye className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      )}
                    </div>
                    <p className="text-xs text-white/50 mt-1">
                      Get your free API key at <a href="https://platform.moonshot.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">platform.moonshot.ai</a>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      AI Provider
                    </label>
                    <select
                      value={aiSettings.aiProvider}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, aiProvider: e.target.value as any }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    >
                      <option value="moonshot">Moonshot AI (Official)</option>
                      <option value="aimlapi">AI/ML API (Third-party)</option>
                      <option value="openrouter">OpenRouter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Daily Token Limit
                    </label>
                    <input
                      type="number"
                      value={aiSettings.maxTokensPerDay}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, maxTokensPerDay: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                      placeholder="1000"
                      min="100"
                      max="10000"
                    />
                    <p className="text-xs text-white/50 mt-1">
                      Set a daily limit to control API usage and costs
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Enable AI Features</h4>
                      <p className="text-sm text-white/60">Activate AI-powered health analytics</p>
                    </div>
                    <button
                      onClick={() => setAiSettings(prev => ({ ...prev, enableAI: !prev.enableAI }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        aiSettings.enableAI ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          aiSettings.enableAI ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        // Save AI settings logic here
                        alert('AI settings saved successfully!');
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        // Test API key logic here
                        alert('Testing API connection...');
                      }}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Test API
                    </button>
                  </div>
                </div>
              </div>

              {/* Feature Overview */}
              <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                <h3 className="font-semibold mb-4">AI Features Available</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <Bot className="w-5 h-5 text-purple-400 mt-1" />
                    <div>
                      <h4 className="font-medium text-sm">Advanced Health Chat</h4>
                      <p className="text-xs text-white/60">Contextual conversations with 256k memory</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Activity className="w-5 h-5 text-blue-400 mt-1" />
                    <div>
                      <h4 className="font-medium text-sm">DNA Analysis</h4>
                      <p className="text-xs text-white/60">AI-powered genetic insights and recommendations</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Star className="w-5 h-5 text-green-400 mt-1" />
                    <div>
                      <h4 className="font-medium text-sm">Health Recommendations</h4>
                      <p className="text-xs text-white/60">Personalized suggestions based on your data</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Globe className="w-5 h-5 text-orange-400 mt-1" />
                    <div>
                      <h4 className="font-medium text-sm">Biomarker Interpretation</h4>
                      <p className="text-xs text-white/60">Understand your health metrics with AI insights</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Account Management</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3 mb-3">
                    <Download className="w-5 h-5 text-blue-400" />
                    <h3 className="font-medium">Export Your Data</h3>
                  </div>
                  <p className="text-sm text-white/70 mb-4">
                    Download all your health data, test results, and account information in JSON format.
                  </p>
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Export Data
                  </button>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3 mb-3">
                    <Globe className="w-5 h-5 text-green-400" />
                    <h3 className="font-medium">Connected Services</h3>
                  </div>
                  <p className="text-sm text-white/70 mb-4">
                    Manage your connected health apps and devices.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                      <span className="text-sm">Apple Health</span>
                      <span className="text-xs text-green-400">Connected</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                      <span className="text-sm">Google Fit</span>
                      <span className="text-xs text-white/60">Not Connected</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                      <span className="text-sm">Fitbit</span>
                      <span className="text-xs text-white/60">Not Connected</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Trash2 className="w-5 h-5 text-red-400" />
                    <h3 className="font-medium text-red-400">Danger Zone</h3>
                  </div>
                  <p className="text-sm text-white/70 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;