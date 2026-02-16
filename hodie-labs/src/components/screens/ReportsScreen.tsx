import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import FileUpload from '../common/FileUpload';
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
  Eye,
  Loader2,
  AlertCircle,
  Upload
} from 'lucide-react';

interface ReportsScreenProps {
  user: User;
}

interface Report {
  id: string;
  title: string;
  type: string;
  date: string;
  size: string;
  pages: number;
  description: string;
  icon: any;
  color: string;
  status: string;
}

interface HealthMetric {
  metric: string;
  current: number;
  change: string;
  period: string;
}

interface Achievement {
  title: string;
  desc: string;
  date: string;
  icon: string;
}

interface UpcomingReport {
  title: string;
  dueDate: string;
  type: string;
}

const ReportsScreen: React.FC<ReportsScreenProps> = ({ user }) => {
  const { getAccessToken } = useAuth();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(true);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [upcomingReports, setUpcomingReports] = useState<UpcomingReport[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [miscFiles, setMiscFiles] = useState<any[]>([]);

  // Fetch medical reports from MongoDB on mount
  useEffect(() => {
    const fetchMedicalReports = async () => {
      setIsLoadingReports(true);
      setReportsError(null);

      try {
        const userId = (user as any).sub || user.uid;

        // Get Auth0 token
        const token = await getAccessToken().catch((error) => {
          console.warn('⚠️ Could not get Auth0 token for reports:', error);
          return null;
        });

        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch medical reports and miscellaneous files from backend
        const [response, miscResponse] = await Promise.all([
          fetch(
            `${process.env.REACT_APP_API_BASE_URL}/medical-reports/${userId}`,
            { headers }
          ),
          fetch(
            `${process.env.REACT_APP_API_BASE_URL}/miscellaneous/${userId}`,
            { headers }
          ).catch(() => null)
        ]);

        if (!response.ok) {
          throw new Error(`Failed to fetch medical reports: ${response.status}`);
        }

        const medicalReportsData = await response.json();
        console.log('📋 Fetched medical reports:', medicalReportsData);

        // Process miscellaneous files
        if (miscResponse && miscResponse.ok) {
          const miscData = await miscResponse.json();
          setMiscFiles(miscData);
          console.log('📎 Fetched miscellaneous files:', miscData.length);
        }

        // Process medical reports data
        if (medicalReportsData && medicalReportsData.length > 0) {
          const extractedReports = extractReports(medicalReportsData);
          const extractedMetrics = extractHealthMetrics(medicalReportsData);
          const extractedAchievements = extractAchievements(medicalReportsData);
          const extractedUpcoming = extractUpcomingReports(medicalReportsData);

          setReports(extractedReports);
          setHealthMetrics(extractedMetrics);
          setAchievements(extractedAchievements);
          setUpcomingReports(extractedUpcoming);
        } else {
          // No reports available - show empty state
          setReports([]);
          setHealthMetrics([]);
          setAchievements([]);
          setUpcomingReports([]);
        }

      } catch (err) {
        console.error('Error fetching medical reports:', err);
        setReportsError(err instanceof Error ? err.message : 'Failed to load medical reports');
        // Show empty state on error
        setReports([]);
        setHealthMetrics([]);
        setAchievements([]);
        setUpcomingReports([]);
      } finally {
        setIsLoadingReports(false);
      }
    };

    fetchMedicalReports();
  }, [user, getAccessToken]);

  // Extract reports from medical reports data
  const extractReports = (reportsData: any[]): Report[] => {
    const reportsList: Report[] = [];

    reportsData.forEach((data) => {
      if (data.reports && Array.isArray(data.reports)) {
        data.reports.forEach((report: any) => {
          reportsList.push({
            id: report.id || report._id || String(reportsList.length + 1),
            title: report.title || report.name || 'Health Report',
            type: report.type || report.category || 'General',
            date: report.date || report.createdAt || new Date().toISOString().split('T')[0],
            size: report.size || report.fileSize || '0 MB',
            pages: parseInt(report.pages) || 0,
            description: report.description || report.summary || 'Health report summary',
            icon: getReportIcon(report.type || report.category),
            color: getReportColor(report.type || report.category),
            status: report.status || 'ready'
          });
        });
      } else if (data.reportType) {
        // Handle single report object
        reportsList.push({
          id: data.id || data._id || String(reportsList.length + 1),
          title: data.title || data.reportType || 'Health Report',
          type: data.reportType || 'General',
          date: data.uploadDate || data.createdAt || new Date().toISOString().split('T')[0],
          size: data.fileSize || '0 MB',
          pages: 0,
          description: data.summary || 'Health report summary',
          icon: getReportIcon(data.reportType),
          color: getReportColor(data.reportType),
          status: 'ready'
        });
      }
    });

    return reportsList.length > 0 ? reportsList : getDefaultReports();
  };

  // Extract health metrics from data
  const extractHealthMetrics = (reportsData: any[]): HealthMetric[] => {
    // Try to extract health metrics from reports data
    const metrics: HealthMetric[] = [];

    reportsData.forEach((data) => {
      if (data.healthMetrics && Array.isArray(data.healthMetrics)) {
        data.healthMetrics.forEach((metric: any) => {
          metrics.push({
            metric: metric.name || metric.metric || 'Health Metric',
            current: parseFloat(metric.value || metric.current) || 0,
            change: metric.change || '+0',
            period: metric.period || metric.timeframe || '3 months'
          });
        });
      }
    });

    return metrics.length > 0 ? metrics : getDefaultHealthMetrics();
  };

  // Extract achievements from data
  const extractAchievements = (reportsData: any[]): Achievement[] => {
    const achievementsList: Achievement[] = [];

    reportsData.forEach((data) => {
      if (data.achievements && Array.isArray(data.achievements)) {
        data.achievements.forEach((achievement: any) => {
          achievementsList.push({
            title: achievement.title || achievement.name || 'Achievement',
            desc: achievement.description || achievement.desc || 'Health achievement',
            date: achievement.date || achievement.earnedAt || new Date().toISOString().split('T')[0],
            icon: achievement.icon || '🏆'
          });
        });
      }
    });

    return achievementsList.length > 0 ? achievementsList : getDefaultAchievements();
  };

  // Extract upcoming reports
  const extractUpcomingReports = (reportsData: any[]): UpcomingReport[] => {
    const upcoming: UpcomingReport[] = [];

    reportsData.forEach((data) => {
      if (data.upcomingReports && Array.isArray(data.upcomingReports)) {
        data.upcomingReports.forEach((report: any) => {
          upcoming.push({
            title: report.title || report.name || 'Upcoming Report',
            dueDate: report.dueDate || report.scheduledDate || '2025-01-01',
            type: report.type || 'General'
          });
        });
      }
    });

    return upcoming.length > 0 ? upcoming : getDefaultUpcomingReports();
  };

  // Helper functions
  const getReportIcon = (type: string) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('genetic') || typeLower.includes('dna')) return Brain;
    if (typeLower.includes('lab') || typeLower.includes('blood')) return Activity;
    if (typeLower.includes('body') || typeLower.includes('physical')) return TrendingUp;
    if (typeLower.includes('progress') || typeLower.includes('quarterly')) return Star;
    if (typeLower.includes('recommendation') || typeLower.includes('action')) return Shield;
    if (typeLower.includes('annual') || typeLower.includes('yearly')) return Calendar;
    return Heart;
  };

  const getReportColor = (type: string) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('genetic') || typeLower.includes('dna')) return 'bg-purple-500';
    if (typeLower.includes('lab') || typeLower.includes('blood')) return 'bg-blue-500';
    if (typeLower.includes('body') || typeLower.includes('physical')) return 'bg-green-500';
    if (typeLower.includes('progress') || typeLower.includes('quarterly')) return 'bg-yellow-500';
    if (typeLower.includes('recommendation') || typeLower.includes('action')) return 'bg-indigo-500';
    if (typeLower.includes('annual') || typeLower.includes('yearly')) return 'bg-gray-500';
    return 'bg-red-500';
  };

  // Default data functions
  const getDefaultReports = (): Report[] => [
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
      title: 'Personalised Action Plan',
      type: 'Recommendations',
      date: '2024-11-01',
      size: '0.9 MB',
      pages: 4,
      description: 'Customised health and fitness recommendations based on your latest assessments',
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

  const getDefaultHealthMetrics = (): HealthMetric[] => [
    { metric: 'Health Score', current: 72, change: '+8', period: '3 months' },
    { metric: 'Biological Age', current: 38, change: '-2', period: '6 months' },
    { metric: 'Fitness Level', current: 85, change: '+12', period: '3 months' }
  ];

  const getDefaultAchievements = (): Achievement[] => [
    { title: 'Cholesterol Champion', desc: 'Improved cholesterol by 15%', date: 'Oct 2024', icon: '🏆' },
    { title: 'Consistency King', desc: '30-day login streak', date: 'Nov 2024', icon: '🔥' },
    { title: 'Inflammation Fighter', desc: 'CRP levels in optimal range', date: 'Oct 2024', icon: '⚡' }
  ];

  const getDefaultUpcomingReports = (): UpcomingReport[] => [
    { title: 'Quarterly Blood Panel', dueDate: '2025-01-15', type: 'Lab Analysis' },
    { title: 'Body Composition Scan', dueDate: '2024-12-20', type: 'Physical Assessment' }
  ];

  // Loading state
  if (isLoadingReports) {
    return (
      <div className="px-6 pb-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-white/70">Loading medical reports...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error banner (non-blocking - show warning but still render with default data)
  const renderErrorBanner = () => {
    if (!reportsError) return null;

    return (
      <div className="mb-6 bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white">Using Default Report Data</h3>
            <p className="text-white/70 text-sm">{reportsError}</p>
          </div>
        </div>
      </div>
    );
  };

  // Empty state (no reports available)
  if (reports.length === 0 && !reportsError && !showUploadModal) {
    return (
      <div className="px-6 pb-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Health Reports</h1>
          <p className="text-white/70">Download and share your comprehensive health reports and progress summaries</p>
        </div>
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-8 text-center">
          <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Reports Available</h3>
          <p className="text-white/70 mb-6">
            Complete health assessments to generate comprehensive reports and track your progress.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg mx-auto"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Health Data</span>
          </button>
        </div>
      </div>
    );
  }

  // Show upload modal in empty state
  if (showUploadModal && reports.length === 0 && !reportsError) {
    return (
      <div className="px-6 pb-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Health Reports</h1>
          <p className="text-white/70">Download and share your comprehensive health reports and progress summaries</p>
        </div>
        <div className="bg-gradient-to-r from-blue-600/20 to-green-600/20 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Upload Medical Report</h3>
            <button
              onClick={() => setShowUploadModal(false)}
              className="text-white/70 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <FileUpload
            category="medical_reports"
            onUploadSuccess={() => {
              setShowUploadModal(false);
              window.location.reload();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Health Reports</h1>
        <p className="text-white/70">Download and share your comprehensive health reports and progress summaries</p>
      </div>

      {/* Error banner (if any) */}
      {renderErrorBanner()}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {healthMetrics.map((metric, index) => (
          <div key={index} className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
            <div className="text-2xl font-bold text-gray-800">{metric.current}</div>
            <div className="text-sm font-medium text-gray-600">{metric.metric}</div>
            <div className="flex items-center space-x-1 mt-1">
              <span className={`text-xs font-medium ${metric.change.startsWith('+') ? 'text-green-600' : 'text-blue-600'}`}>
                {metric.change}
              </span>
              <span className="text-xs text-gray-500">vs {metric.period}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="mb-6 bg-gradient-to-r from-blue-600/20 to-green-600/20 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Upload Medical Report</h3>
            <button
              onClick={() => setShowUploadModal(false)}
              className="text-white/70 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <FileUpload
            category="medical_reports"
            onUploadSuccess={() => {
              setShowUploadModal(false);
              window.location.reload();
            }}
          />
        </div>
      )}

      {/* Available Reports */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Available Reports</h2>
          <button
            onClick={() => setShowUploadModal(!showUploadModal)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Report</span>
          </button>
        </div>
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

      {/* Miscellaneous Uploads */}
      {miscFiles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">📎 Miscellaneous Uploads</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {miscFiles.map((file: any, index: number) => (
              <div key={file._id || index} className="bg-orange-50 rounded-xl p-4 border border-orange-200 shadow-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    📎
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {file.fileName || file.testType || 'Miscellaneous File'}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Uploaded {file.uploadDate ? new Date(file.uploadDate).toLocaleDateString('en-AU') : 'Unknown date'}
                    </p>
                    {file.results && (
                      <p className="text-xs text-gray-500 mt-1">
                        {Array.isArray(file.results) ? `${file.results.length} records` : 'Data available'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-400" />
            Recent Achievements
          </h3>
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="text-white font-medium">{achievement.title}</div>
                  <div className="text-white/80 text-sm">{achievement.desc}</div>
                </div>
                <div className="text-white/60 text-xs">{achievement.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-400" />
            Upcoming Reports
          </h3>
          <div className="space-y-4">
            {upcomingReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{report.title}</div>
                  <div className="text-white/80 text-sm">{report.type}</div>
                </div>
                <div className="text-white/60 text-sm">{report.dueDate}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Export Your Data</h3>
        <p className="text-white/80 mb-4">
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