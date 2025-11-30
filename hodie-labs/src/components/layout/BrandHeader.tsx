import React from 'react';
import { User } from 'firebase/auth';
import { useAuth0 } from '@auth0/auth0-react';
import { HelpCircle, Settings } from 'lucide-react';

interface BrandHeaderProps {
  user?: User | any;
  currentScreen?: string;
  onScreenChange?: (screen: string) => void;
  showNavigation?: boolean;
}

const BrandHeader: React.FC<BrandHeaderProps> = ({ 
  user, 
  currentScreen = 'home', 
  onScreenChange,
  showNavigation = true 
}) => {
  const { logout } = useAuth0();

  const handleLogout = () => {
    logout({ 
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  };

  return (
    <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section - Clickable to return to overview */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onScreenChange && onScreenChange('home')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img
                src="/hodie_transparent_logo.png"
                alt="HodieLabs"
                className="h-8 w-auto"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const textFallback = document.createElement('div');
                  textFallback.textContent = 'HodieLabs';
                  textFallback.className = 'text-xl font-semibold text-white font-poppins';
                  target.parentNode?.appendChild(textFallback);
                }}
              />
              <div className="hidden sm:block">
                <div className="text-lg font-semibold text-white">HodieLabs</div>
                <div className="text-xs text-white/70 -mt-1">Health Dashboard</div>
              </div>
            </button>
          </div>

          {/* Navigation - only show if enabled */}
          {showNavigation && onScreenChange && (
            <nav className="hidden md:flex items-center space-x-8">
              {[
                { id: 'home', label: 'Overview' },
                { id: 'recommendations', label: 'Insights' },
                { id: 'labs', label: 'Labs' },
                { id: 'dna', label: 'DNA' },
                { id: 'reports', label: 'Reports' },
                { id: 'faq', label: 'FAQ' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onScreenChange(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentScreen === item.id
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {/* Help Button */}
            <a
              href="https://hodielabs.com/contact/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-3 py-2 text-white/70 text-sm font-medium rounded-full hover:bg-white/10 hover:text-white transition-colors duration-200"
              title="Get Help & Support"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Help</span>
            </a>

            {/* User Info */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-white">
                    {user.name || user.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-xs text-white/70">
                    {user.email}
                  </div>
                </div>
                
                <div className="relative group">
                  <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white font-medium text-sm hover:bg-white/30 transition-colors">
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200/50">
                      <div className="font-medium text-gray-900">{user.name || 'User'}</div>
                      <div className="text-xs">{user.email}</div>
                    </div>
                    
                    <button
                      onClick={() => onScreenChange && onScreenChange('settings')}
                      className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/50"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    
                    <a
                      href="https://hodielabs.com/contact/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/50"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Help & Support</span>
                    </a>
                    
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default BrandHeader;