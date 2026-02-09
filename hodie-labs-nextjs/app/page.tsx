'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import AuthPage from './auth/page'
import Dashboard from './dashboard/page'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'

export default function HomePage() {
  const { user, error, isLoading } = useUser()
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (user) {
      // Check if user has completed onboarding
      const onboardingComplete = localStorage.getItem(`hodie_onboarding_${user.sub}`)
      setShowOnboarding(!onboardingComplete)
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2a1e5c] via-[#1a0f3a] to-[#0f0622] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <div className="text-white text-lg font-medium">Loading your health dashboard...</div>
          <div className="text-white/60 text-sm mt-2">Powered by Next.js & Auth0</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2a1e5c] via-[#1a0f3a] to-[#0f0622] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-white text-2xl font-bold mb-4">Authentication Error</h1>
          <p className="text-white/70 mb-6">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f97316] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  if (showOnboarding) {
    return (
      <OnboardingFlow 
        user={user as any}
        onComplete={() => {
          localStorage.setItem(`hodie_onboarding_${user.sub}`, 'true')
          setShowOnboarding(false)
        }} 
      />
    )
  }

  return <Dashboard />
}