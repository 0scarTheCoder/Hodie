'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function AuthPage() {
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState('')

  const handleLogin = () => {
    window.location.href = '/api/auth/login'
  }

  const handleSignup = () => {
    window.location.href = '/api/auth/login?screen_hint=signup'
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setResetError('')

    try {
      // Auth0 password reset via Management API
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      })

      if (response.ok) {
        setResetSuccess(true)
      } else {
        const error = await response.json()
        setResetError(error.message || 'Failed to send reset email')
      }
    } catch (error: any) {
      setResetError('Network error occurred')
    } finally {
      setResetLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setShowForgotPassword(false)
    setResetEmail('')
    setResetError('')
    setResetSuccess(false)
    setResetLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a1e5c] via-[#1a0f3a] to-[#0f0622] flex flex-col items-center justify-center px-4">
      
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="relative w-20 h-20">
          <Image
            src="/hodie_transparent_logo.png"
            alt="HodieLabs"
            fill
            className="object-contain"
            onError={() => {
              // Fallback to text if image fails
            }}
          />
        </div>
        {/* Fallback text logo */}
        <div className="text-center mt-2">
          <h1 className="text-4xl font-bold text-white">🩺 HodieLabs</h1>
        </div>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#1e1548]/80 backdrop-blur-sm border border-[#2a1e5c]/50 rounded-3xl p-8 shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-white mb-2">Welcome to HodieLabs</h2>
            <p className="text-white/70 text-sm">Your AI-powered health intelligence platform</p>
            
            {/* Next.js + Auth0 Status */}
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">Powered by Next.js & Auth0</span>
            </div>
          </div>

          {/* Login Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="w-full py-4 bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f97316] text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
              Sign In
            </button>

            <button
              onClick={handleSignup}
              className="w-full py-4 border-2 border-white/20 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all duration-300"
            >
              Create Account
            </button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-[#8b7ed8] hover:text-white transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-xs text-white/60 mb-3">Enterprise features:</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  <span>SSR & SEO</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                  <span>Server Actions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                  <span>App Router</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                  <span>Edge Runtime</span>
                </div>
              </div>
            </div>
          </div>
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
                    <div className="w-5"></div>
                  </div>

                  {/* Instructions */}
                  <div className="text-center mb-6">
                    <Mail className="w-12 h-12 text-[#8b7ed8] mx-auto mb-3" />
                    <p className="text-gray-300 text-sm">
                      Enter your email address and we'll send you a secure link to reset your password.
                    </p>
                    <div className="mt-2 text-xs text-white/60">
                      ✨ Powered by Auth0 & Next.js
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
                        className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm text-center"
                      >
                        {resetError}
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full py-4 bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f97316] text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
                <div className="text-center">
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

                  <button
                    onClick={handleBackToLogin}
                    className="w-full py-3 bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f97316] text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                  >
                    Back to Login
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}