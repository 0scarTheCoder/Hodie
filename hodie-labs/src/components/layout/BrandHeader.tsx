import React from 'react';
import { User } from 'firebase/auth';
import { useAuth0 } from '@auth0/auth0-react';
import { HelpCircle } from 'lucide-react';

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
        returnTo: 'https://hodielabs.com'
      }
    });
  };

  return (
    <header className="bg-hodie-white border-b border-hodie-secondary/20 font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section - Links to main marketing site */}
          <div className="flex items-center space-x-4">
            <a 
              href="https://hodielabs.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
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
                  textFallback.className = 'text-xl font-semibold text-hodie-primary font-poppins';
                  target.parentNode?.appendChild(textFallback);
                }}
              />
              <div className="hidden sm:block">
                <div className="text-lg font-semibold text-hodie-primary">HodieLabs</div>
                <div className="text-xs text-hodie-text -mt-1">Health Dashboard</div>
              </div>
            </a>
            
            {/* Breadcrumb indicator */}
            <div className="hidden md:flex items-center text-hodie-text text-sm">
              <span className="opacity-50">•</span>
              <span className="ml-2">Dashboard</span>
            </div>
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
                      ? 'bg-hodie-primary text-hodie-white shadow-sm'
                      : 'text-hodie-text hover:text-hodie-primary hover:bg-hodie-bg'
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
              className="flex items-center space-x-1 px-3 py-2 text-hodie-primary text-sm font-medium rounded-full hover:bg-hodie-primary/10 transition-colors duration-200"
              title="Get Help & Support"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Help</span>
            </a>

            {/* Back to Main Site Button */}
            <a
              href="https://hodielabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center px-3 py-2 border border-hodie-primary/20 text-hodie-primary text-sm font-medium rounded-full hover:bg-hodie-primary hover:text-hodie-white transition-colors duration-200"
            >
              ← Main Site
            </a>

            {/* User Info */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-hodie-dark">
                    {user.name || user.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-xs text-hodie-text">
                    {user.email}
                  </div>
                </div>
                
                <div className="relative group">
                  <button className="flex items-center justify-center w-10 h-10 rounded-full bg-hodie-primary text-hodie-white font-medium text-sm hover:bg-hodie-primary/90 transition-colors">
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-hodie-white rounded-lg shadow-lg border border-hodie-secondary/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-2 text-sm text-hodie-text border-b border-hodie-secondary/10">
                      <div className="font-medium text-hodie-dark">{user.name || 'User'}</div>
                      <div className="text-xs">{user.email}</div>
                    </div>
                    
                    <a
                      href="https://hodielabs.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-hodie-text hover:bg-hodie-bg"
                    >
                      Visit Main Site
                    </a>
                    
                    <a
                      href="https://hodielabs.com/contact/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-hodie-text hover:bg-hodie-bg"
                    >
                      Help & Support
                    </a>
                    
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-hodie-text hover:bg-hodie-bg"
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