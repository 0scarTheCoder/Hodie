import React from 'react';
import { Stethoscope } from 'lucide-react';

interface User {
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  sub?: string;
  uid?: string;
}

interface LabsScreenProps {
  user: User;
}

const LabsScreen: React.FC<LabsScreenProps> = ({ user }) => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
      <div className="text-center">
        <Stethoscope className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Lab Results</h2>
        <p className="text-gray-600">Your latest lab results and trends will appear here.</p>
      </div>
    </div>
  );
};

export default LabsScreen;