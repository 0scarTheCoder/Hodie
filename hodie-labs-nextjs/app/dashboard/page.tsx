'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart,
  Activity,
  TrendingUp,
  BarChart3,
  User,
  Settings,
  LogOut,
  Bell,
  Menu
} from 'lucide-react'
import ComprehensiveDashboard from '@/components/dashboard/ComprehensiveDashboard'

export default function DashboardPage() {
  const { user, error, isLoading } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-blue"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-8">{error.message}</p>
          <a 
            href="/api/auth/login"
            className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-light-blue transition-colors"
          >
            Try Again
          </a>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">Please log in to access your dashboard.</p>
          <a 
            href="/api/auth/login"
            className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-light-blue transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex-shrink-0 flex items-center ml-4 lg:ml-0">
                <div className="w-8 h-8 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">HodieLabs</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-6 h-6" />
              </button>
              
              <div className="flex items-center space-x-2">
                <img
                  src={user.picture || '/default-avatar.png'}
                  alt={user.name || 'User'}
                  className="w-8 h-8 rounded-full"
                />
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user.name || user.email}
                </span>
              </div>

              <a
                href="/api/auth/logout"
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar for mobile */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 flex z-40"
        >
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative flex-1 flex flex-col max-w-xs w-full bg-white"
          >
            {/* Sidebar content */}
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">HodieLabs</span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                <a href="#" className="bg-blue-50 border-blue-500 text-blue-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4">
                  <BarChart3 className="text-blue-500 mr-3 flex-shrink-0 h-6 w-6" />
                  Dashboard
                </a>
                <a href="#" className="border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4">
                  <Activity className="text-gray-400 mr-3 flex-shrink-0 h-6 w-6" />
                  Health Metrics
                </a>
                <a href="#" className="border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4">
                  <TrendingUp className="text-gray-400 mr-3 flex-shrink-0 h-6 w-6" />
                  Analytics
                </a>
                <a href="#" className="border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4">
                  <User className="text-gray-400 mr-3 flex-shrink-0 h-6 w-6" />
                  Profile
                </a>
                <a href="#" className="border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4">
                  <Settings className="text-gray-400 mr-3 flex-shrink-0 h-6 w-6" />
                  Settings
                </a>
              </nav>
            </div>
          </motion.div>
          
          <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
        </motion.div>
      )}

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-600 bg-opacity-75 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1">
        <ComprehensiveDashboard user={user as any} />
      </div>
    </div>
  )
}