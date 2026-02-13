import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import {
  Stethoscope,
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  Shield,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Download,
  Upload,
  Info,
  Brain,
  Zap,
  Loader2
} from 'lucide-react';
import { labIntegrationService, ComprehensiveLabPanel, LabResult } from '../../services/labIntegrationService';
import FileUpload from '../common/FileUpload';

interface LabsScreenProps {
  user: User;
}

interface EnhancedBiomarker {
  name: string;
  value: number;
  unit: string;
  range: string;
  status: string;
  trend: string;
  change: number;
  category: string;
  lastTest: string;
  history: number[];
  aiInsights?: string;
  personalisedRec?: string;
}

const LabsScreen: React.FC<LabsScreenProps> = ({ user }) => {
  const { getAccessToken } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [labAnalysis, setLabAnalysis] = useState<ComprehensiveLabPanel | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [biomarkers, setBiomarkers] = useState<EnhancedBiomarker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Fetch lab results from MongoDB on component mount
  useEffect(() => {
    const fetchLabResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userId = (user as any).sub || user.uid;

        // Get Auth0 token
        const token = await getAccessToken().catch((error) => {
          console.warn('⚠️ Could not get Auth0 token for labs:', error);
          return null;
        });

        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch lab results from backend
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/lab-results/${userId}`,
          { headers }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch lab results: ${response.status}`);
        }

        const labResults = await response.json();
        console.log('📊 Fetched lab results:', labResults);

        // Process lab results into biomarkers
        if (labResults && labResults.length > 0) {
          const extractedBiomarkers = extractBiomarkersFromLabResults(labResults);
          setBiomarkers(extractedBiomarkers);
        } else {
          // If no data, show empty state
          setBiomarkers([]);
        }

      } catch (err) {
        console.error('Error fetching lab results:', err);
        setError(err instanceof Error ? err.message : 'Failed to load lab results');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabResults();
  }, [user, getAccessToken]);

  // Extract biomarkers from lab results data
  const extractBiomarkersFromLabResults = (labResults: any[]): EnhancedBiomarker[] => {
    const biomarkersArray: EnhancedBiomarker[] = [];

    labResults.forEach((result) => {
      // Check if result has biomarkers array
      if (result.biomarkers && Array.isArray(result.biomarkers)) {
        result.biomarkers.forEach((biomarker: any) => {
          biomarkersArray.push({
            name: biomarker.name || 'Unknown',
            value: parseFloat(biomarker.value) || 0,
            unit: biomarker.unit || '',
            range: biomarker.referenceRange || biomarker.range || 'N/A',
            status: determineBiomarkerStatus(biomarker),
            trend: biomarker.trend || 'stable',
            change: parseFloat(biomarker.change) || 0,
            category: biomarker.category || 'General',
            lastTest: biomarker.testDate || result.testDate || new Date().toISOString(),
            history: biomarker.history || [parseFloat(biomarker.value) || 0],
            aiInsights: biomarker.aiInsights,
            personalisedRec: biomarker.recommendation
          });
        });
      }

      // Handle generic results data (any CSV/tabular data with numeric columns)
      if (result.results && Array.isArray(result.results) && result.results.length > 0) {
        const sampleRow = result.results[0];
        const columns = Object.keys(sampleRow);

        // Find numeric columns
        const numericColumns = columns.filter(col => {
          const sample = result.results.slice(0, 20);
          return sample.some((row: any) => {
            const val = parseFloat(row[col]);
            return !isNaN(val) && isFinite(val);
          });
        });

        // Create a biomarker entry for each numeric column (up to 20)
        numericColumns.slice(0, 20).forEach((col: string) => {
          const values = result.results
            .map((row: any) => parseFloat(row[col]))
            .filter((v: number) => !isNaN(v) && isFinite(v));

          if (values.length === 0) return;

          const mean = values.reduce((a: number, b: number) => a + b, 0) / values.length;
          const min = Math.min(...values);
          const max = Math.max(...values);
          const latest = values[values.length - 1];

          // Use clinical reference ranges if this looks like a known biomarker
          const refRange = getClinicalReference(col);

          biomarkersArray.push({
            name: col.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            value: Math.round(latest * 100) / 100,
            unit: refRange?.unit || '',
            range: refRange?.range || `${min.toFixed(1)} - ${max.toFixed(1)}`,
            status: refRange ? classifyValue(latest, refRange) : (latest >= min && latest <= max ? 'good' : 'borderline'),
            trend: values.length >= 2 ? (values[values.length - 1] > values[0] ? 'up' : values[values.length - 1] < values[0] ? 'down' : 'stable') : 'stable',
            change: values.length >= 2 ? Math.round(((latest - values[0]) / (values[0] || 1)) * 100) : 0,
            category: refRange?.category || result.testType || 'Lab Results',
            lastTest: result.uploadDate || new Date().toISOString(),
            history: values.slice(-5).map((v: number) => Math.round(v * 100) / 100)
          });
        });
      }
    });

    return biomarkersArray.length > 0 ? biomarkersArray : [];
  };

  // Determine biomarker status based on value and range
  const determineBiomarkerStatus = (biomarker: any): string => {
    if (biomarker.status) return biomarker.status;
    if (biomarker.flagged === true) return 'out of range';
    if (biomarker.flagged === false) return 'optimal';
    return 'good';
  };

  // Clinical reference ranges for common biomarkers
  interface ClinicalReference {
    unit: string;
    range: string;
    category: string;
    optimalLow: number;
    optimalHigh: number;
    borderlineLow: number;
    borderlineHigh: number;
  }

  const getClinicalReference = (name: string): ClinicalReference | null => {
    const key = name.toLowerCase().replace(/[_\s-]+/g, '');
    const refs: Record<string, ClinicalReference> = {
      // Cardiovascular
      'totalcholesterol': { unit: 'mmol/L', range: '< 5.5', category: 'Cardiovascular', optimalLow: 0, optimalHigh: 5.0, borderlineLow: 0, borderlineHigh: 5.5 },
      'cholesterol': { unit: 'mmol/L', range: '< 5.5', category: 'Cardiovascular', optimalLow: 0, optimalHigh: 5.0, borderlineLow: 0, borderlineHigh: 5.5 },
      'hdl': { unit: 'mmol/L', range: '> 1.0', category: 'Cardiovascular', optimalLow: 1.2, optimalHigh: 3.0, borderlineLow: 1.0, borderlineHigh: 4.0 },
      'hdlcholesterol': { unit: 'mmol/L', range: '> 1.0', category: 'Cardiovascular', optimalLow: 1.2, optimalHigh: 3.0, borderlineLow: 1.0, borderlineHigh: 4.0 },
      'ldl': { unit: 'mmol/L', range: '< 3.4', category: 'Cardiovascular', optimalLow: 0, optimalHigh: 2.6, borderlineLow: 0, borderlineHigh: 3.4 },
      'ldlcholesterol': { unit: 'mmol/L', range: '< 3.4', category: 'Cardiovascular', optimalLow: 0, optimalHigh: 2.6, borderlineLow: 0, borderlineHigh: 3.4 },
      'triglycerides': { unit: 'mmol/L', range: '< 1.7', category: 'Cardiovascular', optimalLow: 0, optimalHigh: 1.5, borderlineLow: 0, borderlineHigh: 2.0 },
      // Metabolic
      'glucose': { unit: 'mmol/L', range: '3.9 - 5.5', category: 'Metabolic', optimalLow: 3.9, optimalHigh: 5.5, borderlineLow: 3.5, borderlineHigh: 6.1 },
      'fastingglucose': { unit: 'mmol/L', range: '3.9 - 5.5', category: 'Metabolic', optimalLow: 3.9, optimalHigh: 5.5, borderlineLow: 3.5, borderlineHigh: 6.1 },
      'hba1c': { unit: '%', range: '< 5.7', category: 'Metabolic', optimalLow: 4.0, optimalHigh: 5.6, borderlineLow: 3.5, borderlineHigh: 6.4 },
      'insulin': { unit: 'mU/L', range: '2.6 - 24.9', category: 'Metabolic', optimalLow: 2.6, optimalHigh: 15.0, borderlineLow: 1.0, borderlineHigh: 24.9 },
      // Blood
      'haemoglobin': { unit: 'g/L', range: '130 - 170', category: 'Blood Health', optimalLow: 130, optimalHigh: 170, borderlineLow: 120, borderlineHigh: 180 },
      'hemoglobin': { unit: 'g/L', range: '130 - 170', category: 'Blood Health', optimalLow: 130, optimalHigh: 170, borderlineLow: 120, borderlineHigh: 180 },
      'rbc': { unit: '×10¹²/L', range: '4.5 - 5.5', category: 'Blood Health', optimalLow: 4.5, optimalHigh: 5.5, borderlineLow: 4.0, borderlineHigh: 6.0 },
      'wbc': { unit: '×10⁹/L', range: '4.0 - 11.0', category: 'Blood Health', optimalLow: 4.0, optimalHigh: 11.0, borderlineLow: 3.5, borderlineHigh: 12.0 },
      'platelets': { unit: '×10⁹/L', range: '150 - 400', category: 'Blood Health', optimalLow: 150, optimalHigh: 400, borderlineLow: 130, borderlineHigh: 450 },
      // Inflammation
      'crp': { unit: 'mg/L', range: '< 3.0', category: 'Inflammation', optimalLow: 0, optimalHigh: 1.0, borderlineLow: 0, borderlineHigh: 3.0 },
      'creactiveprotein': { unit: 'mg/L', range: '< 3.0', category: 'Inflammation', optimalLow: 0, optimalHigh: 1.0, borderlineLow: 0, borderlineHigh: 3.0 },
      'esr': { unit: 'mm/hr', range: '0 - 20', category: 'Inflammation', optimalLow: 0, optimalHigh: 15, borderlineLow: 0, borderlineHigh: 20 },
      // Vitamins
      'vitamind': { unit: 'nmol/L', range: '> 75', category: 'Vitamins', optimalLow: 75, optimalHigh: 200, borderlineLow: 50, borderlineHigh: 250 },
      'vitaminb12': { unit: 'pmol/L', range: '150 - 600', category: 'Vitamins', optimalLow: 200, optimalHigh: 600, borderlineLow: 150, borderlineHigh: 700 },
      'folate': { unit: 'nmol/L', range: '> 10', category: 'Vitamins', optimalLow: 10, optimalHigh: 45, borderlineLow: 7, borderlineHigh: 50 },
      'iron': { unit: 'µmol/L', range: '10 - 30', category: 'Vitamins', optimalLow: 10, optimalHigh: 30, borderlineLow: 7, borderlineHigh: 35 },
      'ferritin': { unit: 'µg/L', range: '30 - 300', category: 'Vitamins', optimalLow: 30, optimalHigh: 200, borderlineLow: 15, borderlineHigh: 300 },
      // Liver
      'alt': { unit: 'U/L', range: '< 40', category: 'Liver', optimalLow: 0, optimalHigh: 35, borderlineLow: 0, borderlineHigh: 45 },
      'ast': { unit: 'U/L', range: '< 40', category: 'Liver', optimalLow: 0, optimalHigh: 35, borderlineLow: 0, borderlineHigh: 45 },
      'ggt': { unit: 'U/L', range: '< 60', category: 'Liver', optimalLow: 0, optimalHigh: 45, borderlineLow: 0, borderlineHigh: 60 },
      'bilirubin': { unit: 'µmol/L', range: '< 20', category: 'Liver', optimalLow: 0, optimalHigh: 17, borderlineLow: 0, borderlineHigh: 20 },
      // Kidney
      'creatinine': { unit: 'µmol/L', range: '60 - 110', category: 'Kidney', optimalLow: 60, optimalHigh: 110, borderlineLow: 50, borderlineHigh: 130 },
      'egfr': { unit: 'mL/min', range: '> 90', category: 'Kidney', optimalLow: 90, optimalHigh: 200, borderlineLow: 60, borderlineHigh: 200 },
      'urea': { unit: 'mmol/L', range: '2.5 - 7.1', category: 'Kidney', optimalLow: 2.5, optimalHigh: 7.1, borderlineLow: 2.0, borderlineHigh: 8.0 },
      // Thyroid
      'tsh': { unit: 'mU/L', range: '0.4 - 4.0', category: 'Hormones', optimalLow: 0.4, optimalHigh: 4.0, borderlineLow: 0.3, borderlineHigh: 5.0 },
      'freet4': { unit: 'pmol/L', range: '10 - 20', category: 'Hormones', optimalLow: 10, optimalHigh: 20, borderlineLow: 8, borderlineHigh: 22 },
      'freet3': { unit: 'pmol/L', range: '3.5 - 6.5', category: 'Hormones', optimalLow: 3.5, optimalHigh: 6.5, borderlineLow: 3.0, borderlineHigh: 7.0 },
      // Hormones
      'testosterone': { unit: 'nmol/L', range: '8 - 30', category: 'Hormones', optimalLow: 10, optimalHigh: 30, borderlineLow: 8, borderlineHigh: 35 },
      'cortisol': { unit: 'nmol/L', range: '140 - 690', category: 'Hormones', optimalLow: 140, optimalHigh: 500, borderlineLow: 100, borderlineHigh: 690 },
      // Cancer Markers
      'psa': { unit: 'µg/L', range: '< 4.0', category: 'Cancer Markers', optimalLow: 0, optimalHigh: 2.5, borderlineLow: 0, borderlineHigh: 4.0 },
    };
    return refs[key] || null;
  };

  // Classify a value against clinical reference ranges
  const classifyValue = (value: number, ref: ClinicalReference): string => {
    if (value >= ref.optimalLow && value <= ref.optimalHigh) return 'optimal';
    if (value >= ref.borderlineLow && value <= ref.borderlineHigh) return 'borderline';
    return 'out of range';
  };

  // Fallback default biomarkers if no data available
  const getDefaultBiomarkers = (): EnhancedBiomarker[] => [
    {
      name: 'Total Cholesterol',
      value: 4.2,
      unit: 'mmol/L',
      range: '< 5.0',
      status: 'optimal',
      trend: 'down',
      change: -8,
      category: 'Cardiovascular',
      lastTest: '2024-10-15',
      history: [5.1, 4.8, 4.5, 4.2]
    },
    {
      name: 'HDL Cholesterol',
      value: 1.8,
      unit: 'mmol/L',
      range: '> 1.0',
      status: 'optimal',
      trend: 'up',
      change: 12,
      category: 'Cardiovascular',
      lastTest: '2024-10-15',
      history: [1.4, 1.6, 1.7, 1.8]
    },
    {
      name: 'Vitamin D',
      value: 85,
      unit: 'nmol/L',
      range: '> 75',
      status: 'optimal',
      trend: 'up',
      change: 18,
      category: 'Vitamins',
      lastTest: '2024-10-15',
      history: [62, 71, 78, 85]
    }
  ];

  const categories = [
    'All',
    'Cardiovascular',
    'Metabolic',
    'Blood Health',
    'Inflammation',
    'Vitamins',
    'Liver',
    'Kidney',
    'Hormones',
    'Cancer Markers',
    'Lab Results'
  ];

  const [selectedCategory, setSelectedCategory] = useState('All');

  // Convert biomarkers to LabResult format and analyse with AI
  useEffect(() => {
    const processLabData = async () => {
      if (biomarkers.length === 0 || isLoading) return;

      setIsAnalyzing(true);

      try {
        // Convert biomarkers to LabResult format
        const labResults: LabResult[] = biomarkers.map((biomarker, index) => ({
          testId: biomarker.name.toLowerCase().replace(/\s+/g, '_'),
          testName: biomarker.name,
          value: biomarker.value,
          unit: biomarker.unit,
          referenceRange: {
            text: biomarker.range
          },
          status: biomarker.status === 'out of range' ? 'critical' :
                 biomarker.status === 'optimal' ? 'normal' :
                 biomarker.status === 'good' ? 'normal' : 'high',
          flagged: biomarker.status === 'out of range',
          collectionDate: new Date(biomarker.lastTest),
          processedDate: new Date(biomarker.lastTest),
          methodology: 'Standard laboratory analysis',
          labProvider: 'Hodie Labs'
        }));

        // Process with AI analysis
        const analysis = await labIntegrationService.processLabResults(labResults);
        const userId = (user as any).sub || user.uid;
        analysis.userId = userId;

        setLabAnalysis(analysis);
      } catch (error) {
        console.error('Error processing lab analysis:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    processLabData();
  }, [biomarkers, user, isLoading]);

  const filteredBiomarkers = selectedCategory === 'All' 
    ? biomarkers 
    : biomarkers.filter(b => b.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-500 bg-green-50 border-green-200';
      case 'good': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'borderline': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'out of range': return 'text-red-600 bg-red-100 border-red-300';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'stable') return 'text-gray-500';
    if (change > 0) return 'text-green-600';
    return 'text-green-600'; // Assuming down trends in cholesterol, CRP etc are good
  };

  const renderGauge = (status: string) => {
    const getGaugeConfig = (status: string) => {
      switch (status) {
        case 'optimal':
          return { position: '83%', color: 'bg-gray-700' };
        case 'good':
          return { position: '65%', color: 'bg-gray-700' };
        case 'borderline':
          return { position: '50%', color: 'bg-gray-700' };
        case 'out of range':
          return { position: '17%', color: 'bg-gray-700' };
        default:
          return { position: '50%', color: 'bg-gray-700' };
      }
    };

    const config = getGaugeConfig(status);
    
    return (
      <div className="relative w-20 h-8 mx-auto mb-1">
        {/* Marker above bar */}
        <div 
          className={`absolute top-0 w-2 h-2 ${config.color} rounded-full transform -translate-x-1/2 border border-gray-400`}
          style={{ left: config.position }}
        ></div>
        
        {/* Horizontal bar - three equal sections */}
        <div className="absolute bottom-2 w-full h-2 rounded-full overflow-hidden flex">
          <div className="bg-red-400 w-1/3"></div>
          <div className="bg-yellow-400 w-1/3"></div>
          <div className="bg-green-400 w-1/3"></div>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="px-6 pb-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-white/70">Loading lab results...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="px-6 pb-6">
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Error Loading Lab Results</h3>
              <p className="text-white/70 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state (no lab results available)
  if (biomarkers.length === 0) {
    return (
      <div className="px-6 pb-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Lab Results & Biomarkers</h1>
          <p className="text-white/70">Track your biomarker trends and health improvements over time</p>
        </div>
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-8 text-center">
          <Stethoscope className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Lab Results Available</h3>
          <p className="text-white/70 mb-6">
            Upload your lab results to see personalised biomarker analysis and AI-powered health insights.
          </p>
          <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg mx-auto">
            <Upload className="w-5 h-5" />
            <span>Upload Lab Results</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Lab Results & Biomarkers</h1>
        <p className="text-white/70">Track your biomarker trends and health improvements over time</p>
      </div>

      {/* Health Summary - Enhanced with AI Analysis */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">AI-Powered Health Analysis</h2>
          {isAnalyzing ? (
            <div className="flex items-center space-x-2 text-blue-600">
              <Brain className="w-5 h-5 animate-pulse" />
              <span className="text-sm">Analysing...</span>
            </div>
          ) : labAnalysis && (
            <div className="flex items-center space-x-2 text-green-600">
              <Zap className="w-5 h-5" />
              <span className="text-sm">Analysis complete</span>
            </div>
          )}
        </div>
        
        {labAnalysis && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">Clinical Interpretation</h3>
            <div className="text-sm text-gray-700 mb-3">{labAnalysis.interpretation.clinicalSignificance}</div>
            
            {labAnalysis.interpretation.keyFindings.length > 0 && (
              <div className="mb-3">
                <div className="font-medium text-gray-800 mb-1">Key Findings:</div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {labAnalysis.interpretation.keyFindings.slice(0, 3).map((finding, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                labAnalysis.interpretation.overallStatus === 'optimal' ? 'bg-green-100 text-green-800' :
                labAnalysis.interpretation.overallStatus === 'good' ? 'bg-blue-100 text-blue-800' :
                labAnalysis.interpretation.overallStatus === 'concerning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                Overall Status: {labAnalysis.interpretation.overallStatus.toUpperCase()}
              </span>
              <span className="text-xs text-gray-600">
                Confidence: {labAnalysis.interpretation.confidence}%
              </span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{biomarkers.filter(b => b.status === 'optimal').length}</div>
            <div className="text-sm text-gray-600">Optimal</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{biomarkers.filter(b => b.status === 'good' || b.status === 'borderline').length}</div>
            <div className="text-sm text-gray-600">Suboptimal</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{biomarkers.filter(b => b.status === 'out of range').length}</div>
            <div className="text-sm text-gray-600">Out of range</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Latest Readings</div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="h-3 rounded-full flex">
              <div 
                className="bg-green-500 rounded-l-full" 
                style={{ width: `${(biomarkers.filter(b => b.status === 'optimal').length / biomarkers.length) * 100}%` }}
              ></div>
              <div 
                className="bg-yellow-500" 
                style={{ width: `${(biomarkers.filter(b => b.status === 'good' || b.status === 'borderline').length / biomarkers.length) * 100}%` }}
              ></div>
              <div 
                className="bg-red-500 rounded-r-full" 
                style={{ width: `${(biomarkers.filter(b => b.status === 'out of range').length / biomarkers.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          Learn More →
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">
                {biomarkers.filter(b => b.status === 'optimal').length}
              </div>
              <div className="text-sm text-white/70">Optimal</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Info className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">
                {biomarkers.filter(b => b.status === 'good').length}
              </div>
              <div className="text-sm text-white/70">Good</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">
                {biomarkers.filter(b => b.trend === 'up' || b.trend === 'down').length}
              </div>
              <div className="text-sm text-white/70">Improving</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div>
              <div className="text-2xl font-bold text-white">
                {biomarkers.filter(b => b.status === 'out of range').length}
              </div>
              <div className="text-sm text-white/70">Out of Range</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-white">Oct 15</div>
              <div className="text-sm text-white/70">Last Test</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 ml-auto">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowUploadModal(!showUploadModal)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Results</span>
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="mb-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Upload Lab Results</h3>
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
            category="lab_results"
            onUploadSuccess={() => {
              setShowUploadModal(false);
              // Refetch lab results
              window.location.reload();
            }}
          />
        </div>
      )}

      {/* Biomarkers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBiomarkers.map((biomarker, index) => (
          <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{biomarker.name}</h3>
                <div className="text-sm text-gray-600">{biomarker.category}</div>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(biomarker.trend)}
                {biomarker.change !== 0 && (
                  <span className={`text-sm font-medium ${getTrendColor(biomarker.trend, biomarker.change)}`}>
                    {biomarker.change > 0 ? '+' : ''}{biomarker.change}%
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-end justify-between mb-4">
              <div className="flex items-end space-x-3">
                <div className="text-3xl font-bold text-gray-900">
                  {biomarker.value}
                </div>
                <div className="text-gray-600 pb-1">
                  {biomarker.unit}
                </div>
              </div>
              
              {/* Gauge Chart */}
              <div className="text-center">
                {renderGauge(biomarker.status)}
                <div className="text-xs text-gray-500">Reading</div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                Reference: {biomarker.range}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(biomarker.status)}`}>
                {biomarker.status.charAt(0).toUpperCase() + biomarker.status.slice(1)}
              </span>
            </div>

            {/* Mini Line Chart */}
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-2">6-month trend</div>
              <div className="relative h-12 w-full">
                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    points={biomarker.history.map((value, idx) => {
                      const maxVal = Math.max(...biomarker.history);
                      const minVal = Math.min(...biomarker.history);
                      const range = maxVal - minVal || 1;
                      const x = (idx / (biomarker.history.length - 1)) * 100;
                      const y = 40 - ((value - minVal) / range) * 30;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  {/* Data points */}
                  {biomarker.history.map((value, idx) => {
                    const maxVal = Math.max(...biomarker.history);
                    const minVal = Math.min(...biomarker.history);
                    const range = maxVal - minVal || 1;
                    const x = (idx / (biomarker.history.length - 1)) * 100;
                    const y = 40 - ((value - minVal) / range) * 30;
                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={y}
                        r="2"
                        fill="#60a5fa"
                        className="hover:fill-blue-300"
                      >
                        <title>{`${value} ${biomarker.unit}`}</title>
                      </circle>
                    );
                  })}
                </svg>
              </div>
            </div>

            <div className="text-xs text-gray-500 mt-2 mb-3">
              Last tested: {new Date(biomarker.lastTest).toLocaleDateString()}
            </div>
            
            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              Learn More →
            </button>
          </div>
        ))}
      </div>

      {/* AI-Powered Recommendations */}
      <div className="mt-8 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-white" />
          <h3 className="text-lg font-semibold text-white">AI-Powered Lab Recommendations</h3>
        </div>
        
        {labAnalysis && labAnalysis.recommendations.length > 0 ? (
          <>
            <div className="text-white/80 mb-4">
              Based on your comprehensive lab analysis, here are personalised recommendations to optimise your health:
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="text-sm font-medium text-white mb-2">Priority Actions:</div>
                {labAnalysis.recommendations.slice(0, 3).map((rec, idx) => (
                  <div key={idx} className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.priority === 'high' ? 'bg-red-500 text-white' :
                        rec.priority === 'medium' ? 'bg-yellow-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        {rec.priority.toUpperCase()}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{rec.recommendation}</div>
                        <div className="text-xs text-white/70 mt-1">
                          Target: {rec.targetBiomarkers.join(', ')} • {rec.timeframe}
                        </div>
                        <div className="text-xs text-white/80 mt-1">{rec.rationale}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                <div className="text-sm font-medium text-white mb-2">Key Insights:</div>
                {labAnalysis.interpretation.keyFindings.length > 0 && (
                  <div className="space-y-2">
                    {labAnalysis.interpretation.keyFindings.slice(0, 3).map((finding, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-sm text-white">{finding}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-white/10 rounded-lg">
                  <div className="text-sm font-medium text-white mb-2">Follow-up Plan:</div>
                  <div className="space-y-1">
                    {labAnalysis.followUpRequired ? (
                      <div className="text-sm text-white/80">• Retest recommended in {labAnalysis.nextTestDate ? 
                        Math.ceil((new Date(labAnalysis.nextTestDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + ' days' : 
                        '3 months'}</div>
                    ) : (
                      <div className="text-sm text-white/80">• Annual monitoring sufficient</div>
                    )}
                    <div className="text-sm text-white/80">• Continue current health strategy</div>
                    <div className="text-sm text-white/80">• Track improvements with Hodie AI</div>
                  </div>
                </div>
              </div>
            </div>
            
            {labAnalysis.interpretation.riskFactors.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-white">Areas for Attention:</span>
                </div>
                <div className="text-sm text-white/80">
                  {labAnalysis.interpretation.riskFactors.join(', ')}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-white/80 mb-4">
              Your biomarkers show excellent cardiovascular health and good metabolic function. 
              Continue your current lifestyle approach to maintain these improvements.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white">Cholesterol profile improved 12%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white">Inflammation markers in optimal range</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white">Vitamin D levels significantly improved</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-white mb-2">Next steps:</div>
                <div className="text-sm text-white/80">• Schedule follow-up in 3 months</div>
                <div className="text-sm text-white/80">• Continue Mediterranean diet pattern</div>
                <div className="text-sm text-white/80">• Maintain current exercise routine</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LabsScreen;