import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { queryLogger } from '../../utils/queryLogger';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import EmailTestButton from '../EmailTestButton';

const ExactHodieLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const logId = queryLogger.logQuery(
        `Authentication attempt: ${isLogin ? 'login' : 'signup'} for ${email}`,
        'general_query',
        undefined,
        { action: isLogin ? 'login_attempt' : 'signup_attempt', email }
      );

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        queryLogger.logResponse(logId, 'Login successful');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        queryLogger.logResponse(logId, 'Signup successful');
      }
    } catch (error: any) {
      setError(error.message);
      queryLogger.logQuery(
        `Authentication error: ${error.message}`,
        'general_query',
        undefined,
        { action: 'auth_error', error: error.message }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');

    try {
      const logId = queryLogger.logQuery(
        `Password reset request for ${resetEmail}`,
        'general_query',
        undefined,
        { action: 'password_reset_request', email: resetEmail }
      );

      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess(true);
      queryLogger.logResponse(logId, 'Password reset email sent successfully');
    } catch (error: any) {
      setResetError(error.message);
      queryLogger.logQuery(
        `Password reset error: ${error.message}`,
        'general_query',
        undefined,
        { action: 'password_reset_error', error: error.message }
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setResetEmail('');
    setResetError('');
    setResetSuccess(false);
    setResetLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a1e5c] via-[#1a0f3a] to-[#0f0622] flex flex-col items-center justify-center px-4">
      
      {/* Logo at the top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <img
          src="/hodie_transparent_logo.png"
          alt="Hodie Labs"
          className="h-20 w-auto"
          onError={(e) => {
            // Fallback to text if logo fails
            const target = e.currentTarget;
            target.style.display = 'none';
            const textFallback = document.createElement('h1');
            textFallback.textContent = 'HodieLabs';
            textFallback.className = 'text-4xl font-bold text-white';
            target.parentNode?.appendChild(textFallback);
          }}
        />
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#1e1548]/80 backdrop-blur-sm border border-[#2a1e5c]/50 rounded-3xl p-8 shadow-2xl">
          
          {/* Log in heading */}
          <h2 className="text-3xl font-semibold text-white text-center mb-8">
            {isLogin ? 'Log in' : 'Sign up'}
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input */}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-4 bg-transparent border border-[#3a2e6c] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#6b46c1] focus:ring-1 focus:ring-[#6b46c1] transition-colors"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-4 pr-12 bg-transparent border border-[#3a2e6c] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#6b46c1] focus:ring-1 focus:ring-[#6b46c1] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Forgot Password Link */}
            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-[#8b7ed8] hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Log in Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f97316] text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isLogin ? 'Log in' : 'Sign up')}
            </button>

            {/* Sign up link */}
            <div className="text-center">
              <span className="text-gray-400 text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#8b7ed8] hover:text-white transition-colors text-sm font-medium"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="bg-[#1e1548]/95 backdrop-blur-sm border border-[#2a1e5c]/50 rounded-3xl p-8 shadow-2xl">
              {!resetSuccess ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={handleBackToLogin}
                      className="text-[#8b7ed8] hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-xl font-semibold text-white">Reset Password</h3>
                    <div className="w-5"></div> {/* Spacer for centreing */}
                  </div>

                  {/* Instructions */}
                  <div className="text-center mb-6">
                    <Mail className="w-12 h-12 text-[#8b7ed8] mx-auto mb-3" />
                    <p className="text-gray-300 text-sm">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>

                  {/* Reset Form */}
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className="w-full px-4 py-4 bg-transparent border border-[#3a2e6c] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#6b46c1] focus:ring-1 focus:ring-[#6b46c1] transition-colors"
                      />
                    </div>

                    {/* Error Message */}
                    {resetError && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm text-center"
                      >
                        {resetError}
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full py-4 bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f97316] text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resetLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    
                    {/* Quick Test Button */}
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          console.log('🧪 Testing email system...');
                          console.log('Firebase config:', {
                            domain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
                            projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
                            hasApiKey: !!process.env.REACT_APP_FIREBASE_API_KEY
                          });
                          
                          await sendPasswordResetEmail(auth, 'loveoh19@gmail.com');
                          alert('✅ SUCCESS! Email sent to loveoh19@gmail.com. Check your inbox and spam folder.');
                        } catch (error: any) {
                          console.error('❌ Email test failed:', error);
                          alert(`❌ FAILED: ${error.message}\n\nCheck browser console for details.`);
                        }
                      }}
                      className="w-full py-2 border border-yellow-400 text-yellow-400 font-medium rounded-xl hover:bg-yellow-400/10 transition-colors text-sm"
                    >
                      🧪 Test Email (loveoh19@gmail.com)
                    </button>
                  </form>
                </>
              ) : (
                /* Success State */
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-3">Check Your Email</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    We've sent a password reset link to <span className="text-[#8b7ed8] font-medium">{resetEmail}</span>.
                    Please check your email and follow the instructions to reset your password.
                  </p>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 mb-6">
                    <p className="text-yellow-200 text-xs">
                      💡 <strong>Tip:</strong> If you don't see the email in your inbox, please check your junk or spam folder.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={handleBackToLogin}
                      className="w-full py-3 bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f97316] text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                    >
                      Back to Login
                    </button>
                    <button
                      onClick={() => {
                        setResetSuccess(false);
                        setResetEmail('');
                      }}
                      className="w-full py-3 border border-[#3a2e6c] text-[#8b7ed8] font-semibold rounded-2xl hover:bg-[#3a2e6c]/20 transition-colors"
                    >
                      Send Another Email
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Automated Email Diagnostic Tool */}
      <EmailTestButton />
    </div>
  );
};

export default ExactHodieLogin;