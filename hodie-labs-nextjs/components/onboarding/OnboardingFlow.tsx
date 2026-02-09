import React from 'react';

interface User {
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  sub?: string;
  uid?: string;
}

interface OnboardingFlowProps {
  user: User;
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, onComplete }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to HodieLabs!</h1>
          <p className="text-gray-600 mb-8">
            Let's set up your health profile to get personalized insights.
          </p>
          <button
            onClick={onComplete}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Complete Setup
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;