import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { queryLogger } from '../../utils/queryLogger';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';
import { motion } from 'framer-motion';
import { Lock, User, AlertCircle, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const HodieLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-b from-[#1b1740] to-[#0d0925] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-[#221c57]/90 border-none text-white shadow-xl rounded-3xl p-6">
          <CardHeader className="text-center">
            <img
              src="/hodielabs_logo.svg"
              alt="Hodie Labs"
              className="mx-auto w-32 mb-2"
              onError={(e) => {
                // Fallback if logo doesn't exist
                e.currentTarget.style.display = 'none';
              }}
            />
            <CardTitle className="text-2xl font-semibold text-white">
              Welcome to Hodie Labs
            </CardTitle>
            <p className="text-sm text-gray-300 mt-1">
              Your personalised health and performance dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-white/10 border border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-white/10 border border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center space-x-2"
                >
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#ff7a18] to-[#af002d] text-white font-medium py-2 rounded-xl hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
              </Button>

              <div className="flex justify-between items-center text-sm text-gray-300 mt-3">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="hover:underline hover:text-white transition-colors"
                >
                  {isLogin ? "Create account" : "Already have an account?"}
                </button>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="hover:underline hover:text-white transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
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
            <Card className="bg-[#221c57]/90 border-none text-white shadow-xl rounded-3xl p-6">
              <CardContent>
                {!resetSuccess ? (
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <button
                        onClick={handleBackToLogin}
                        className="text-orange-400 hover:text-white transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h3 className="text-xl font-semibold text-white">Reset Password</h3>
                      <div className="w-5"></div>
                    </div>

                    {/* Instructions */}
                    <div className="text-center mb-6">
                      <Mail className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                      <p className="text-gray-300 text-sm">
                        Enter your email address and we'll send you a link to reset your password.
                      </p>
                    </div>

                    {/* Reset Form */}
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                          className="pl-10 bg-white/10 border border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>

                      {/* Error Message */}
                      {resetError && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center space-x-2"
                        >
                          <AlertCircle size={16} />
                          <span className="text-sm">{resetError}</span>
                        </motion.div>
                      )}

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={resetLoading}
                        className="w-full bg-gradient-to-r from-[#ff7a18] to-[#af002d] text-white font-medium py-2 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                      >
                        {resetLoading ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </form>
                  </>
                ) : (
                  /* Success State */
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-3">Check Your Email</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      We've sent a password reset link to <span className="text-orange-400 font-medium">{resetEmail}</span>.
                      Please check your email and follow the instructions to reset your password.
                    </p>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 mb-6">
                      <p className="text-yellow-200 text-xs">
                        💡 <strong>Tip:</strong> If you don't see the email in your inbox, please check your junk or spam folder.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Button
                        onClick={handleBackToLogin}
                        className="w-full bg-gradient-to-r from-[#ff7a18] to-[#af002d] text-white font-medium py-2 rounded-xl hover:opacity-90 transition"
                      >
                        Back to Login
                      </Button>
                      <Button
                        onClick={() => {
                          setResetSuccess(false);
                          setResetEmail('');
                        }}
                        className="w-full border border-gray-600 text-gray-300 font-medium py-2 rounded-xl hover:bg-white/10 transition bg-transparent"
                      >
                        Send Another Email
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default HodieLoginPage;