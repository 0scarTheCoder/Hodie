import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const FirebasePasswordReset: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      console.log('✅ Password reset email sent to:', email);
    } catch (err: any) {
      console.error('❌ Password reset error:', err);
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a1e5c] via-[#1a0f3a] to-[#0f0622] flex flex-col items-center justify-center px-4">

      {/* Logo */}
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

      {/* Reset Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#1e1548]/80 backdrop-blur-sm border border-[#2a1e5c]/50 rounded-3xl p-8 shadow-2xl">

          {!sent ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleBackToLogin}
                  className="text-[#8b7ed8] hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-semibold text-white">Reset Password</h2>
                <div className="w-5"></div> {/* Spacer */}
              </div>

              {/* Icon and Instructions */}
              <div className="text-center mb-6">
                <Mail className="w-12 h-12 text-[#8b7ed8] mx-auto mb-3" />
                <p className="text-gray-300 text-sm">
                  Enter your email address and we'll send you a link to reset your password via Firebase.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-4 bg-transparent border border-[#3a2e6c] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#6b46c1] focus:ring-1 focus:ring-[#6b46c1] transition-colors"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f97316] text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                {/* Info Banner */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3">
                  <p className="text-blue-200 text-xs text-center">
                    💡 This uses Firebase authentication. If you signed up with Auth0, please use the regular login page.
                  </p>
                </div>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Check Your Email</h3>
              <p className="text-gray-300 text-sm mb-4">
                We've sent a password reset link to <span className="text-[#8b7ed8] font-medium">{email}</span>.
                Please check your email and follow the instructions to reset your password.
              </p>

              {/* Spam Folder Warning */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 mb-6">
                <p className="text-yellow-200 text-xs">
                  💡 <strong>Tip:</strong> If you don't see the email in your inbox, please check your junk or spam folder.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBackToLogin}
                  className="w-full py-3 bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f97316] text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  Back to Login
                </button>
                <button
                  onClick={() => {
                    setSent(false);
                    setEmail('');
                    setError('');
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

      {/* Help Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-gray-400 text-sm mt-8 text-center"
      >
        Having trouble? <a href="/login" className="text-[#8b7ed8] hover:text-white underline">Return to login</a>
      </motion.p>
    </div>
  );
};

export default FirebasePasswordReset;
