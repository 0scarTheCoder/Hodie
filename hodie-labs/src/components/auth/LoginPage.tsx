import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { queryLogger } from '../../utils/queryLogger';

const LoginPage: React.FC = () => {
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
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-centre justify-centre bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-centre">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Hodie Labs</h2>
          <p className="text-gray-600">Your health insights platform</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-centre py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-light-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </div>

          <div className="text-centre space-y-2">
            {isLogin && (
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="block w-full text-sm text-brand-blue hover:text-brand-light-blue"
              >
                Forgot your password?
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-blue hover:text-brand-light-blue"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>

      {/* Simple Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-centre justify-centre px-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            {!resetSuccess ? (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Reset Password</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  {resetError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {resetError}
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {resetLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-centre">
                <div className="text-green-600 text-4xl mb-4">✓</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Check Your Email</h3>
                <p className="text-gray-600 text-sm mb-3">
                  We've sent a password reset link to <strong>{resetEmail}</strong>.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-4">
                  <p className="text-yellow-800 text-xs">
                    💡 <strong>Tip:</strong> If you don't see the email in your inbox, please check your junk or spam folder.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetSuccess(false);
                    setResetEmail('');
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;