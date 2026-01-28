import React, { useState } from 'react';
import { Upload, Download, FileText, Play, CheckCircle, AlertCircle, BarChart3, ArrowLeftRight } from 'lucide-react';
import { healthDataParsingService } from '../../services/healthDataParsingService';
import { competitiveTestingService } from '../../services/competitiveTestingService';
import SelfDecodeComparator from './SelfDecodeComparator';

interface TestFile {
  id: string;
  name: string;
  type: string;
  size: number;
  category: 'lab_results' | 'genetic_data' | 'medical_images' | 'health_reports' | 'wearable_data';
  uploadStatus: 'pending' | 'uploading' | 'success' | 'error';
  parseStatus: 'pending' | 'parsing' | 'success' | 'error';
  testStatus: 'pending' | 'testing' | 'success' | 'error';
  results?: any;
}

const HealthDataUploadTester: React.FC = () => {
  const [testFiles, setTestFiles] = useState<TestFile[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [showSampleData, setShowSampleData] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'compare'>('upload');

  // Sample test data for demonstration
  const sampleTestFiles = [
    {
      name: 'comprehensive_labs_male_45.csv',
      type: 'lab_results',
      description: '45-year-old male with prediabetes - comprehensive metabolic panel',
      size: 2048
    },
    {
      name: 'genetic_data_23andme.txt',
      type: 'genetic_data', 
      description: '23andMe raw genetic data with diabetes and fitness variants',
      size: 1024000
    },
    {
      name: 'fitbit_activity_data.json',
      type: 'wearable_data',
      description: '90 days of Fitbit activity, heart rate, and sleep data',
      size: 512000
    },
    {
      name: 'lipid_panel_followup.pdf',
      type: 'health_reports',
      description: 'Follow-up lipid panel report with physician notes',
      size: 1536000
    }
  ];

  const handleFileUpload = async (files: FileList) => {
    const newTestFiles: TestFile[] = Array.from(files).map((file, index) => ({
      id: `test_${Date.now()}_${index}`,
      name: file.name,
      type: file.type,
      size: file.size,
      category: categoriseSampleFile(file.name),
      uploadStatus: 'uploading',
      parseStatus: 'pending',
      testStatus: 'pending'
    }));

    setTestFiles(prev => [...prev, ...newTestFiles]);

    // Process files
    for (const testFile of newTestFiles) {
      try {
        // Simulate upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        updateFileStatus(testFile.id, { uploadStatus: 'success', parseStatus: 'parsing' });

        // Simulate parsing  
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockParsedData = generateMockParsedData(testFile.category);
        updateFileStatus(testFile.id, { 
          parseStatus: 'success', 
          testStatus: 'testing',
          results: mockParsedData 
        });

        // Simulate testing
        await new Promise(resolve => setTimeout(resolve, 1500));
        updateFileStatus(testFile.id, { testStatus: 'success' });

      } catch (error) {
        updateFileStatus(testFile.id, { 
          uploadStatus: 'error', 
          parseStatus: 'error', 
          testStatus: 'error' 
        });
      }
    }
  };

  const updateFileStatus = (fileId: string, updates: Partial<TestFile>) => {
    setTestFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, ...updates } : file
    ));
  };

  const categoriseSampleFile = (fileName: string): TestFile['category'] => {
    const name = fileName.toLowerCase();
    if (name.includes('lab') || name.includes('blood') || name.includes('panel')) return 'lab_results';
    if (name.includes('genetic') || name.includes('23andme') || name.includes('dna')) return 'genetic_data';
    if (name.includes('fitbit') || name.includes('activity') || name.includes('wearable')) return 'wearable_data';
    if (name.includes('report') || name.includes('summary')) return 'health_reports';
    return 'health_reports';
  };

  const generateMockParsedData = (category: TestFile['category']) => {
    switch (category) {
      case 'lab_results':
        return {
          biomarkers: 12,
          abnormalValues: 3,
          criticalAlerts: 0,
          confidence: 94,
          keyFindings: ['Elevated HbA1c (6.2%)', 'Low Vitamin D (48 nmol/L)', 'Borderline LDL (3.9 mmol/L)']
        };
      case 'genetic_data':
        return {
          variantsAnalyzed: 847,
          significantVariants: 23,
          riskFactors: ['Type 2 Diabetes: Elevated', 'Cardiovascular: Moderate'],
          confidence: 98,
          keyFindings: ['ACTN3: Power/endurance balance', 'MTHFR: Normal folate metabolism', 'TCF7L2: Diabetes risk']
        };
      case 'wearable_data':
        return {
          daysAnalyzed: 90,
          averageSteps: 8247,
          sleepEfficiency: 78,
          confidence: 91,
          keyFindings: ['Consistent activity levels', 'Sleep quality declining', 'Heart rate variability normal']
        };
      default:
        return {
          pagesProcessed: 5,
          dataPointsExtracted: 45,
          confidence: 82,
          keyFindings: ['Complete lipid panel results', 'Physician recommendations noted']
        };
    }
  };

  const runCompetitiveTests = async () => {
    setIsRunningTests(true);
    try {
      console.log('🧪 Running competitive analysis...');
      const results = await competitiveTestingService.runCompetitiveAnalysis();
      setTestResults(results);
      console.log('✅ Competitive analysis complete:', results);
    } catch (error) {
      console.error('❌ Error running competitive tests:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const downloadSampleData = (fileName: string) => {
    // Generate sample data content based on file type
    let content = '';
    const mimeType = 'text/plain';

    if (fileName.includes('labs')) {
      content = `Test Name,Value,Unit,Reference Range,Status
Glucose,5.8,mmol/L,3.9-6.1,Normal
HbA1c,6.2,%,<5.7,Elevated
Total Cholesterol,5.2,mmol/L,<5.2,Borderline
LDL Cholesterol,3.9,mmol/L,<3.4,High
HDL Cholesterol,1.2,mmol/L,>1.0,Normal
Triglycerides,1.8,mmol/L,<1.7,Elevated
Vitamin D,48,nmol/L,>75,Low
TSH,2.1,mIU/L,0.4-4.0,Normal
Creatinine,85,µmol/L,60-110,Normal
eGFR,72,mL/min/1.73m²,>60,Normal`;
    } else if (fileName.includes('genetic')) {
      content = `# 23andMe Genetic Data Sample
rsid	chromosome	position	genotype
rs1815739	11	66560624	CT
rs1801133	1	11796321	CC  
rs7903146	10	112998590	CT
rs9939609	16	53786615	AT
rs662799	11	116788025	GG
rs5443	12	6845710	CC
rs1800497	11	113270828	AG`;
    } else if (fileName.includes('fitbit')) {
      content = JSON.stringify({
        activities: [
          {
            dateTime: "2024-11-01",
            steps: 8456,
            calories: 2245,
            distance: 6.2,
            veryActiveMinutes: 23,
            fairlyActiveMinutes: 42
          },
          {
            dateTime: "2024-11-02", 
            steps: 7892,
            calories: 2180,
            distance: 5.8,
            veryActiveMinutes: 18,
            fairlyActiveMinutes: 38
          }
        ],
        sleep: [
          {
            dateOfSleep: "2024-11-01",
            duration: 28080000,
            efficiency: 87,
            minutesAsleep: 468,
            minutesAwake: 72
          }
        ]
      }, null, 2);
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'uploading':
      case 'parsing':
      case 'testing': return <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />;
      default: return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-centre px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          🧪 Health Data Upload & Testing Platform
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
          Test HodieLabs' health data parsing capabilities and compare against competing platforms like SelfDecode.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-centre px-4">
        <div className="bg-gray-100 rounded-lg p-1 flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-md font-medium transition-all duration-200 text-sm sm:text-base ${
              activeTab === 'upload'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📤 File Upload Testing
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-md font-medium transition-all duration-200 flex items-centre justify-centre text-sm sm:text-base ${
              activeTab === 'compare'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Live SelfDecode Comparison
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'upload' && (
        <div className="space-y-8">
          {/* Sample Data Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-centre justify-between mb-4">
              <h2 className="text-xl font-semibold text-blue-900">📦 Sample Test Data</h2>
              <button
                onClick={() => setShowSampleData(!showSampleData)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {showSampleData ? 'Hide' : 'Show'} Sample Files
              </button>
            </div>
            
            {showSampleData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sampleTestFiles.map((file, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{file.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{file.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {file.type} • {Math.round(file.size / 1024)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => downloadSampleData(file.name)}
                        className="ml-4 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* File Upload Section */}
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8">
            <div className="text-centre">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Health Data Files</h3>
              <p className="text-gray-600 mb-4">
                Drop your health files here or click to browse. Supports lab results, genetic data, wearable data, and health reports.
              </p>
              
              <input
                type="file"
                multiple
                accept=".csv,.json,.txt,.pdf,.xml"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-centre px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                <Upload className="w-5 h-5 mr-2" />
                Choose Files
              </label>
            </div>
          </div>

          {/* Uploaded Files Status */}
          {testFiles.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">📊 Processing Status</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {testFiles.map((file) => (
                  <div key={file.id} className="p-6">
                    <div className="flex items-centre justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{file.name}</h4>
                        <p className="text-sm text-gray-500">{file.category.replace('_', ' ')} • {Math.round(file.size / 1024)} KB</p>
                      </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-centre space-x-8">
                      <div className="flex items-centre space-x-2">
                        {getStatusIcon(file.uploadStatus)}
                        <span className="text-sm">Upload</span>
                      </div>
                      <div className="flex items-centre space-x-2">
                        {getStatusIcon(file.parseStatus)}
                        <span className="text-sm">Parse</span>
                      </div>
                      <div className="flex items-centre space-x-2">
                        {getStatusIcon(file.testStatus)}
                        <span className="text-sm">Test</span>
                      </div>
                    </div>

                    {/* Results Preview */}
                    {file.results && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {Object.entries(file.results).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium text-gray-700">{key}:</span>
                              <span className="ml-1 text-gray-900">
                                {Array.isArray(value) ? value.join(', ') : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competitive Testing Section */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
            <div className="text-centre">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ⚔️ Competitive Analysis vs SelfDecode
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Run comprehensive tests comparing HodieLabs' AI capabilities against SelfDecode's DecodeGPT 
                across genetic analysis, lab interpretation, and personalised recommendations.
              </p>
              
              <button
                onClick={runCompetitiveTests}
                disabled={isRunningTests}
                className="inline-flex items-centre px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-300"
              >
                {isRunningTests ? (
                  <div className="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Play className="w-5 h-5 mr-3" />
                )}
                {isRunningTests ? 'Running Tests...' : 'Run Competitive Analysis'}
              </button>
            </div>
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
                <h3 className="text-xl font-bold text-gray-900 flex items-centre">
                  <BarChart3 className="w-6 h-6 mr-2 text-green-600" />
                  Competitive Analysis Results
                </h3>
              </div>

              <div className="p-6 space-y-6">
                {/* Overall Scores */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-centre p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900">🏥 HodieLabs</h4>
                    <div className="text-3xl font-bold text-blue-600 mt-2">
                      {testResults.averageScores?.hodieLabs}
                    </div>
                    <p className="text-sm text-blue-700">Overall Score</p>
                  </div>

                  <div className="text-centre p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900">🧬 SelfDecode</h4>
                    <div className="text-3xl font-bold text-purple-600 mt-2">
                      {testResults.averageScores?.selfDecode}
                    </div>
                    <p className="text-sm text-purple-700">Overall Score</p>
                  </div>

                  <div className="text-centre p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900">📈 Difference</h4>
                    <div className={`text-3xl font-bold mt-2 ${
                      testResults.averageScores?.difference > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {testResults.averageScores?.difference > 0 ? '+' : ''}{testResults.averageScores?.difference}
                    </div>
                    <p className="text-sm text-green-700">HodieLabs Advantage</p>
                  </div>
                </div>

                {/* Key Findings */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">🔍 Key Findings</h4>
                  <div className="space-y-2">
                    {testResults.keyFindings?.map((finding: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{finding}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competitive Advantages */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">💪 HodieLabs Advantages</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {testResults.competitiveAdvantages?.map((advantage: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-green-800">{advantage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">🎯 Recommendations</h4>
                  <div className="space-y-2">
                    {testResults.recommendations?.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-blue-800">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'compare' && (
        <SelfDecodeComparator />
      )}
    </div>
  );
};

export default HealthDataUploadTester;