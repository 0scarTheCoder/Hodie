import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { auth0Service } from '../../services/auth0Service';
import { queryLogger } from '../../utils/queryLogger';
import ComprehensiveSignup from './ComprehensiveSignup';

const Auth0LoginPage: React.FC = () => {
  const { loginWithRedirect, isLoading, error } = useAuth0();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showComprehensiveSignup, setShowComprehensiveSignup] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  // Handle Auth0 login
  const handleLogin = async () => {
    try {
      queryLogger.logQuery(
        'Auth0 login attempt',
        'general_query',
        undefined,
        { action: 'auth0_login_attempt' }
      );

      await loginWithRedirect({
        authorizationParams: {
          screen_hint: 'login'
        }
      });
    } catch (error: any) {
      console.error('Auth0 login error:', error);
      queryLogger.logQuery(
        `Auth0 login error: ${error.message}`,
        'general_query',
        undefined,
        { action: 'auth0_login_error', error: error.message }
      );
    }
  };

  // Handle Auth0 signup
  const handleSignup = async () => {
    try {
      queryLogger.logQuery(
        'Auth0 signup attempt',
        'general_query',
        undefined,
        { action: 'auth0_signup_attempt' }
      );

      await loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup'
        }
      });
    } catch (error: any) {
      console.error('Auth0 signup error:', error);
      queryLogger.logQuery(
        `Auth0 signup error: ${error.message}`,
        'general_query',
        undefined,
        { action: 'auth0_signup_error', error: error.message }
      );
    }
  };

  // Handle forgot password with Auth0
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');

    try {
      const logId = queryLogger.logQuery(
        `Auth0 password reset request for ${resetEmail}`,
        'general_query',
        undefined,
        { action: 'auth0_password_reset_request', email: resetEmail }
      );

      await auth0Service.resetPassword(resetEmail);
      setResetSuccess(true);
      queryLogger.logResponse(logId, 'Auth0 password reset email sent successfully');
    } catch (error: any) {
      setResetError(error.message);
      queryLogger.logQuery(
        `Auth0 password reset error: ${error.message}`,
        'general_query',
        undefined,
        { action: 'auth0_password_reset_error', error: error.message }
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
    <div className="min-h-screen bg-hodie-bg font-poppins flex flex-col items-centre justify-centre px-4"
         style={{
           background: 'linear-gradient(135deg, #F4F7FF 0%, #E8EFFF 50%, #F4F7FF 100%)'
         }}>
      
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
        className="w-full max-w-xl lg:max-w-2xl"
      >
        <div className="bg-[#1e1548]/80 backdrop-blur-sm border border-[#2a1e5c]/50 rounded-3xl p-8 md:p-12 shadow-2xl">
          
          {/* Header */}
          <div className="text-centre mb-8">
            <h2 className="text-3xl font-semibold text-white mb-2">Welcome to HodieLabs</h2>
            <p className="text-white/70 text-sm">Your AI-powered health intelligence platform</p>
            
            {/* Auth0 Status */}
            <div className="mt-4 flex items-centre justify-centre space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">Powered by Auth0 Security</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm text-centre mb-6"
            >
              {error.message || 'Authentication error occurred'}
            </motion.div>
          )}

          {/* Auth0 Login Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f97316] text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-centre justify-centre space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            <button
              onClick={() => setShowComprehensiveSignup(true)}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#6b46c1] via-[#8b5cf6] to-[#a855f7] text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Account (Comprehensive)
            </button>

            <button
              onClick={handleSignup}
              disabled={isLoading}
              className="w-full py-2 border border-white/20 text-white/70 text-sm rounded-xl hover:bg-white/5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Quick Signup (Skip Profile)
            </button>

            {/* Forgot Password Link */}
            <div className="text-centre">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-[#8b7ed8] hover:text-white transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {/* Auth0 Features */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-centre">
              <p className="text-xs text-white/60 mb-3">Secure authentication features:</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                <div className="flex items-centre space-x-1">
                  <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  <span>Enterprise Security</span>
                </div>
                <div className="flex items-centre space-x-1">
                  <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                  <span>Multi-Factor Auth</span>
                </div>
                <div className="flex items-centre space-x-1">
                  <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                  <span>Social Login</span>
                </div>
                <div className="flex items-centre space-x-1">
                  <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                  <span>Password Reset</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Comprehensive Signup Modal */}
      {showComprehensiveSignup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-centre justify-centre z-50"
        >
          <div className="relative w-full h-full">
            <button
              onClick={() => setShowComprehensiveSignup(false)}
              className="absolute top-6 right-6 z-10 text-white/70 hover:text-white text-2xl font-light"
            >
              ✕
            </button>
            <ComprehensiveSignup />
          </div>
        </motion.div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-centre justify-centre px-4 z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-xl"
          >
            <div className="bg-[#1e1548]/95 backdrop-blur-sm border border-[#2a1e5c]/50 rounded-3xl p-8 md:p-10 shadow-2xl">
              {!resetSuccess ? (
                <>
                  {/* Header */}
                  <div className="flex items-centre justify-between mb-6">
                    <button
                      onClick={handleBackToLogin}
                      className="text-[#8b7ed8] hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-xl font-semibold text-white">Reset Password</h3>
                    <div className="w-5"></div>
                  </div>

                  {/* Instructions */}
                  <div className="text-centre mb-6">
                    <Mail className="w-12 h-12 text-[#8b7ed8] mx-auto mb-3" />
                    <p className="text-gray-300 text-sm">
                      Enter your email address and we'll send you a secure link to reset your password.
                    </p>
                    <div className="mt-2 text-xs text-white/60">
                      ✨ Powered by Auth0 - Enterprise-grade security
                    </div>
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
                        className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm text-centre"
                      >
                        {resetError}
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full py-4 bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f97316] text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-centre justify-centre space-x-2"
                    >
                      {resetLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Send Reset Link</span>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                /* Success State */
                <div className="text-centre">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-3">Check Your Email</h3>
                  <p className="text-gray-300 text-sm mb-6">
                    We've sent a secure password reset link to <span className="text-[#8b7ed8] font-medium">{resetEmail}</span>.
                  </p>
                  
                  <div className="bg-blue-500/20 border border-blue-500/50 text-blue-200 px-4 py-3 rounded-xl text-sm mb-6">
                    <div className="font-medium mb-1">✉️ Email Details:</div>
                    <div className="text-xs">From: HodieLabs Security</div>
                    <div className="text-xs">Link expires: 24 hours</div>
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
    </div>
  );
};

export default Auth0LoginPage;