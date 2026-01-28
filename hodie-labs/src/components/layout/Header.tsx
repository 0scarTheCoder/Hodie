import React from 'react';
import { User } from 'firebase/auth';

interface HeaderProps {
  user: User;
  onMenuClick: () => void;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onMenuClick, onSignOut }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-centre justify-between h-16 px-4">
        <div className="flex items-centre">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="ml-2 text-xl font-semibold text-gray-900 lg:hidden">Hodie Labs</h1>
        </div>

        <div className="flex items-centre space-x-4">
          <div className="hidden sm:flex sm:items-centre sm:space-x-2">
            <div className="w-8 h-8 bg-brand-blue rounded-full flex items-centre justify-centre">
              <span className="text-white text-sm font-medium">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-700">{user.email}</span>
          </div>
          
          <button
            onClick={onSignOut}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md border border-gray-300 hover:border-gray-400 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;