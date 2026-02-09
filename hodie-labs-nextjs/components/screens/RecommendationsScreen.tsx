import React from 'react';
import { Target } from 'lucide-react';

interface User {
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  sub?: string;
  uid?: string;
}

interface RecommendationsScreenProps {
  user: User;
}

const RecommendationsScreen: React.FC<RecommendationsScreenProps> = ({ user }) => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
      <div className="text-center">
        <Target className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommendations</h2>
        <p className="text-gray-600">AI-powered health recommendations will appear here.</p>
      </div>
    </div>
  );
};

export default RecommendationsScreen;