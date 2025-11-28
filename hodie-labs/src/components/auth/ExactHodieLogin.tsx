import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { queryLogger } from '../../utils/queryLogger';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const ExactHodieLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    </div>
  );
};

export default ExactHodieLogin;