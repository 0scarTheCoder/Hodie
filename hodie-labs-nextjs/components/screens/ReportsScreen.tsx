import React from 'react';
import { Calendar } from 'lucide-react';

interface User {
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  sub?: string;
  uid?: string;
}

interface ReportsScreenProps {
  user: User;
}

const ReportsScreen: React.FC<ReportsScreenProps> = ({ user }) => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
      <div className="text-center">
        <Calendar className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Health Reports</h2>
        <p className="text-gray-600">Comprehensive health reports and analytics will appear here.</p>
      </div>
    </div>
  );
};

export default ReportsScreen;