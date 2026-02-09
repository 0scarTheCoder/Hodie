import React from 'react';
import { Camera } from 'lucide-react';

interface User {
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  sub?: string;
  uid?: string;
}

interface BodyScanWorkflowProps {
  user: User;
}

const BodyScanWorkflow: React.FC<BodyScanWorkflowProps> = ({ user }) => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
      <div className="text-center">
        <Camera className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Body Scan</h2>
        <p className="text-gray-600">Body scanning workflow will appear here.</p>
      </div>
    </div>
  );
};

export default BodyScanWorkflow;