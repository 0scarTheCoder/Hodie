import React, { useState } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import ChatInterface from '../chat/ChatInterface';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { queryLogger } from '../../utils/queryLogger';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('chat');

  const handleSignOut = async () => {
    try {
      queryLogger.logQuery(
        `User signed out: ${user.email}`,
        'general_query',
        user.uid,
        { action: 'sign_out' }
      );
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'chat':
        return <ChatInterface user={user} />;
      case 'history':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Query History</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Your query history will appear here.</p>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <p className="mt-1 text-sm text-gray-500 font-mono">{user.uid}</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <ChatInterface user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onSignOut={handleSignOut}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user} 
          onMenuClick={() => setSidebarOpen(true)}
          onSignOut={handleSignOut}
        />
        
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;