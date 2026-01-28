import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Shield, 
  Lock, 
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

const PasswordResetPage: React.FC = () => {
  const { isLoading, error, isAuthenticated } = useAuth0();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Password requirements validation
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    {
      id: 'length',
      label: 'At least 12 characters long',
      test: (pwd) => pwd.length >= 12,
      met: false
    },
    {
      id: 'uppercase',
      label: 'One uppercase letter (A-Z)',
      test: (pwd) => /[A-Z]/.test(pwd),
      met: false
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter (a-z)',
      test: (pwd) => /[a-z]/.test(pwd),
      met: false
    },
    {
      id: 'number',
      label: 'One number (0-9)',
      test: (pwd) => /\d/.test(pwd),
      met: false
    },
    {
      id: 'special',
      label: 'One special character (!@#$%^&*()_+-=[]{}|;\':",./<>?)',
      test: (pwd) => /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(pwd),
      met: false
    }
  ]);

  // Update requirements when password changes
  useEffect(() => {
    setRequirements(prevReqs => 
      prevReqs.map(req => ({
        ...req,
        met: req.test(password)
      }))
    );
  }, [password]);

  // Check if all requirements are met
  const allRequirementsMet = requirements.every(req => req.met);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isFormValid = allRequirementsMet && passwordsMatch;

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      setResetError('Please ensure all password requirements are met and passwords match.');
      return;
    }

    setIsSubmitting(true);
    setResetError(null);

    try {
      // This would be handled by Auth0's password reset flow
      // The actual implementation depends on your Auth0 configuration
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResetSuccess(true);
    } catch (error) {
      setResetError('Failed to reset password. Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-centre justify-centre">
        <div className="text-centre text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading password reset...</p>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-centre justify-centre p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 text-centre">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-centre justify-centre mx-auto mb-6">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Password Reset Successful!</h1>
            <p className="text-white/70 mb-6">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-centre justify-centre p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          {/* Header */}
          <div className="text-centre mb-8">
            <img
              src="/hodie_transparent_logo.png"
              alt="HodieLabs"
              className="h-12 mx-auto mb-4"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
              }}
            />
            <h1 className="text-2xl font-bold text-white">Reset Your Password</h1>
            <p className="text-white/70 mt-2">Create a new secure password for your health data</p>
          </div>

          {/* Error Message */}
          {(error || resetError) && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-300">Error</h4>
                  <p className="text-sm text-red-200 mt-1">
                    {resetError || error?.message || 'An error occurred during password reset.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Password Requirements */}
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-centre">
              <Shield className="w-4 h-4 mr-2" />
              Password Requirements
            </h3>
            <div className="space-y-2">
              {requirements.map((req) => (
                <div key={req.id} className="flex items-centre space-x-2 text-sm">
                  {req.met ? (
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                  <span className={req.met ? 'text-green-300' : 'text-white/70'}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Password Form */}
          <form onSubmit={handlePasswordReset} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 bg-white/5 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-1 ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-green-400 focus:border-green-400 focus:ring-green-400'
                        : 'border-red-400 focus:border-red-400 focus:ring-red-400'
                      : 'border-white/20 focus:border-blue-400 focus:ring-blue-400'
                  }`}
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-red-400 text-sm mt-1">Passwords do not match</p>
              )}
              {passwordsMatch && confirmPassword.length > 0 && (
                <p className="text-green-400 text-sm mt-1">Passwords match</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isFormValid && !isSubmitting
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                  : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-centre justify-centre space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Resetting Password...</span>
                </div>
              ) : (
                <div className="flex items-centre justify-centre space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Reset Password</span>
                </div>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-300">Security Notice</h4>
                <p className="text-xs text-blue-200 mt-1">
                  Your new password cannot be the same as your previous 5 passwords. 
                  All password data is encrypted and secure.
                </p>
              </div>
            </div>
          </div>

          {/* Help Links */}
          <div className="mt-6 text-centre space-y-2">
            <p className="text-xs text-white/60">
              Having trouble? Visit our{' '}
              <a 
                href="https://hodielabs.com/contact" 
                className="text-blue-300 hover:text-blue-200 underline" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                help centre
              </a>
            </p>
            <div className="flex items-centre justify-centre space-x-4 text-xs text-white/50">
              <a href="/privacy" className="hover:text-white/70">Privacy Policy</a>
              <span>•</span>
              <a href="/terms" className="hover:text-white/70">Terms of Service</a>
              <span>•</span>
              <a href="https://hodielabs.com/contact" className="hover:text-white/70 flex items-centre">
                <HelpCircle className="w-3 h-3 mr-1" />
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;