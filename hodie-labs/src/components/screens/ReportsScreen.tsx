import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp,
  Heart,
  Activity,
  Brain,
  Shield,
  Star,
  Clock,
  Share2,
  Printer,
  Eye
} from 'lucide-react';

interface ReportsScreenProps {
  user: User;
}

const ReportsScreen: React.FC<ReportsScreenProps> = ({ user }) => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const reports = [
    {
      id: '1',
      title: 'Comprehensive Health Summary',
      type: 'Health Overview',
      date: '2024-11-01',
      size: '2.4 MB',
      pages: 12,
      description: 'Complete analysis of your current health status including biomarkers, fitness, and recommendations',
      icon: Heart,
      color: 'bg-red-500',
      status: 'ready'
    },
    {
      id: '2',
      title: 'DNA Analysis Report',
      type: 'Genetic Analysis',
      date: '2024-10-15',
      size: '5.1 MB', 
      pages: 28,
      description: 'Detailed genetic analysis covering fitness, nutrition, health risks, and personal traits',
      icon: Brain,
      color: 'bg-purple-500',
      status: 'ready'
    },
    {
      id: '3',
      title: 'Blood Biomarkers Trends',
      type: 'Lab Analysis',
      date: '2024-10-15',
      size: '1.8 MB',
      pages: 8,
      description: '6-month biomarker trends with detailed analysis and improvement recommendations',
      icon: Activity,
      color: 'bg-blue-500',
      status: 'ready'
    },
    {
      id: '4',
      title: 'Body Composition Analysis',
      type: 'Physical Assessment',
      date: '2024-09-20',
      size: '1.2 MB',
      pages: 6,
      description: 'DEXA scan results showing body fat, muscle mass, bone density, and progress tracking',
      icon: TrendingUp,
      color: 'bg-green-500',
      status: 'ready'
    },
    {
      id: '5',
      title: 'Quarterly Progress Report',
      type: 'Progress Summary',
      date: '2024-09-30',
      size: '3.2 MB',
      pages: 15,
      description: 'Comprehensive quarterly review of all health metrics, achievements, and goal progress',
      icon: Star,
      color: 'bg-yellow-500',
      status: 'ready'
    },
    {
      id: '6',
      title: 'Personalized Action Plan',
      type: 'Recommendations',
      date: '2024-11-01',
      size: '0.9 MB',
      pages: 4,
      description: 'Customized health and fitness recommendations based on your latest assessments',
      icon: Shield,
      color: 'bg-indigo-500',
      status: 'ready'
    },
    {
      id: '7',
      title: 'Annual Health Review',
      type: 'Yearly Summary',
      date: 'In Progress',
      size: '- MB',
      pages: 0,
      description: 'Comprehensive yearly health review including all assessments and progress metrics',
      icon: Calendar,
      color: 'bg-gray-500',
      status: 'processing'
    }
  ];

  const healthMetrics = [
    { metric: 'Health Score', current: 72, change: '+8', period: '3 months' },
    { metric: 'Biological Age', current: 38, change: '-2', period: '6 months' },
    { metric: 'Fitness Level', current: 85, change: '+12', period: '3 months' },
    { metric: 'Biomarker Rating', current: 91, change: '+5', period: '3 months' }
  ];

  const achievements = [
    { title: 'Cholesterol Champion', desc: 'Improved cholesterol by 15%', date: 'Oct 2024', icon: '🏆' },
    { title: 'Consistency King', desc: '30-day login streak', date: 'Nov 2024', icon: '🔥' },
    { title: 'Inflammation Fighter', desc: 'CRP levels in optimal range', date: 'Oct 2024', icon: '⚡' },
    { title: 'Vitamin D Optimizer', desc: 'Achieved optimal vitamin D levels', date: 'Sep 2024', icon: '☀️' }
  ];

  const upcomingReports = [
    { title: 'Quarterly Blood Panel', dueDate: '2025-01-15', type: 'Lab Analysis' },
    { title: 'Body Composition Scan', dueDate: '2024-12-20', type: 'Physical Assessment' },
    { title: 'Annual Health Summary', dueDate: '2025-01-01', type: 'Yearly Review' }
  ];

  return (
    <div className="px-6 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Health Reports</h1>
        <p className="text-white/70">Download and share your comprehensive health reports and progress summaries</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {healthMetrics.map((metric, index) => (
          <div key={index} className="bg-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900">{metric.current}</div>
            <div className="text-sm text-gray-900/70">{metric.metric}</div>
            <div className="flex items-center space-x-1 mt-1">
              <span className={`text-xs font-medium ${metric.change.startsWith('+') ? 'text-green-400' : 'text-blue-400'}`}>
                {metric.change}
              </span>
              <span className="text-xs text-gray-900/50">vs {metric.period}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Available Reports */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Reports</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reports.map((report) => (
            <div 
              key={report.id} 
              className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors shadow-lg border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 ${report.color} rounded-lg flex items-center justify-center`}>
                    <report.icon className="w-6 h-6 text-gray-900" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                    <div className="text-sm text-gray-900/70 mb-2">{report.type}</div>
                    <p className="text-sm text-gray-900/60">{report.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === 'ready' 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {report.status === 'ready' ? 'Ready' : 'Processing'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-900/50 mb-4">
                <div className="flex space-x-4">
                  <span>📅 {report.date}</span>
                  <span>📄 {report.pages} pages</span>
                  <span>💾 {report.size}</span>
                </div>
              </div>

              {report.status === 'ready' ? (
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-sm">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400">Processing... ETA: 2-3 business days</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-400" />
            Recent Achievements
          </h3>
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">{achievement.title}</div>
                  <div className="text-gray-900/70 text-sm">{achievement.desc}</div>
                </div>
                <div className="text-gray-900/50 text-xs">{achievement.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-400" />
            Upcoming Reports
          </h3>
          <div className="space-y-4">
            {upcomingReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="text-gray-900 font-medium">{report.title}</div>
                  <div className="text-gray-900/70 text-sm">{report.type}</div>
                </div>
                <div className="text-gray-900/50 text-sm">{report.dueDate}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Your Data</h3>
        <p className="text-gray-900/80 mb-4">
          Download all your health data in various formats for your records or to share with healthcare providers.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
            <Download className="w-4 h-4" />
            <span>Download All Reports (ZIP)</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
            <FileText className="w-4 h-4" />
            <span>Export to PDF</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-sm">
            <Printer className="w-4 h-4" />
            <span>Print Summary</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-sm">
            <Share2 className="w-4 h-4" />
            <span>Share with Provider</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsScreen;