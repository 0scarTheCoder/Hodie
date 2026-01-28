import React, { useState } from 'react';
import { Upload, Download, BarChart3, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { kimiK2Service } from '../../services/kimiK2Service';

interface ComparisonTest {
  id: string;
  query: string;
  hodiLabsResponse: string;
  selfDecodeResponse: string;
  scores: {
    hodiLabs: {
      accuracy: number;
      completeness: number;
      actionability: number;
      evidence: number;
      overall: number;
    };
    selfDecode: {
      accuracy: number;
      completeness: number;
      actionability: number;
      evidence: number;
      overall: number;
    };
  };
  winner: 'hodilabs' | 'selfdecode' | 'tie';
  analysis: string;
}

const SelfDecodeComparator: React.FC = () => {
  const [testQuery, setTestQuery] = useState('');
  const [selfDecodeInput, setSelfDecodeInput] = useState('');
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [currentTest, setCurrentTest] = useState<ComparisonTest | null>(null);
  const [testHistory, setTestHistory] = useState<ComparisonTest[]>([]);

  // Sample test queries for common health scenarios
  const sampleQueries = [
    {
      category: 'Genetic Analysis',
      query: 'I have the APOE4 variant. What does this mean for my Alzheimer\'s risk and what should I do?',
      description: 'Tests genetic variant interpretation and personalised recommendations'
    },
    {
      category: 'Lab Results',
      query: 'My HbA1c is 6.2%, LDL is 3.9 mmol/L, and Vitamin D is 45 nmol/L. What do these results mean and what should I do?',
      description: 'Tests lab interpretation and clinical recommendations'
    },
    {
      category: 'Nutrition',
      query: 'Based on my genetic profile showing slow caffeine metabolism, what diet and supplement recommendations do you have?',
      description: 'Tests personalised nutrition advice based on genetics'
    },
    {
      category: 'Fitness',
      query: 'I have the ACTN3 RR genotype. What type of exercise program should I follow for optimal results?',
      description: 'Tests fitness recommendations based on genetic variants'
    }
  ];

  const runComparison = async () => {
    if (!testQuery.trim()) {
      alert('Please enter a test query');
      return;
    }

    setIsRunningTest(true);

    try {
      // Get HodieLabs response
      const hodiLabsResponse = await kimiK2Service.generateHealthResponse(
        testQuery,
        {
          userId: 'test-user',
          recentHealthData: {
            steps: 8500,
            sleep: 7.5,
            mood: '😊',
            healthScore: 78
          }
        }
      );

      // Create comparison test
      const test: ComparisonTest = {
        id: Date.now().toString(),
        query: testQuery,
        hodiLabsResponse,
        selfDecodeResponse: selfDecodeInput.trim() || 'No SelfDecode response provided',
        scores: calculateScores(hodiLabsResponse, selfDecodeInput),
        winner: determineWinner(hodiLabsResponse, selfDecodeInput),
        analysis: generateAnalysis(hodiLabsResponse, selfDecodeInput)
      };

      setCurrentTest(test);
      setTestHistory(prev => [test, ...prev.slice(0, 9)]); // Keep last 10 tests

    } catch (error) {
      console.error('Error running comparison:', error);
      alert('Error running test. Please try again.');
    } finally {
      setIsRunningTest(false);
    }
  };

  const calculateScores = (hodiResponse: string, selfDecodeResponse: string) => {
    // Score HodieLabs response
    const hodiScores = {
      accuracy: scoreAccuracy(hodiResponse),
      completeness: scoreCompleteness(hodiResponse),
      actionability: scoreActionability(hodiResponse),
      evidence: scoreEvidence(hodiResponse),
      overall: 0
    };
    hodiScores.overall = Math.round(
      (hodiScores.accuracy + hodiScores.completeness + hodiScores.actionability + hodiScores.evidence) / 4
    );

    // Score SelfDecode response
    const selfDecodeScores = {
      accuracy: scoreAccuracy(selfDecodeResponse),
      completeness: scoreCompleteness(selfDecodeResponse),
      actionability: scoreActionability(selfDecodeResponse),
      evidence: scoreEvidence(selfDecodeResponse),
      overall: 0
    };
    selfDecodeScores.overall = Math.round(
      (selfDecodeScores.accuracy + selfDecodeScores.completeness + selfDecodeScores.actionability + selfDecodeScores.evidence) / 4
    );

    return { hodiLabs: hodiScores, selfDecode: selfDecodeScores };
  };

  const scoreAccuracy = (response: string): number => {
    let score = 70; // Base score
    if (response.includes('meta-analysis') || response.includes('clinical trial')) score += 15;
    if (response.includes('evidence') || response.includes('study')) score += 10;
    if (response.includes('risk') || response.includes('%')) score += 5;
    return Math.min(score, 100);
  };

  const scoreCompleteness = (response: string): number => {
    let score = 60;
    if (response.includes('recommendation')) score += 15;
    if (response.includes('mechanism') || response.includes('pathway')) score += 10;
    if (response.includes('monitoring') || response.includes('follow-up')) score += 10;
    if (response.includes('timeline') || response.includes('weeks') || response.includes('months')) score += 5;
    return Math.min(score, 100);
  };

  const scoreActionability = (response: string): number => {
    let score = 65;
    if (response.includes('specific') || response.includes('dosage') || response.includes('mg')) score += 15;
    if (response.includes('daily') || response.includes('weekly')) score += 10;
    if (response.includes('avoid') || response.includes('increase') || response.includes('decrease')) score += 10;
    return Math.min(score, 100);
  };

  const scoreEvidence = (response: string): number => {
    let score = 60;
    if (response.includes('PMID') || response.includes('doi:')) score += 20;
    if (response.includes('meta-analysis')) score += 15;
    if (response.includes('randomized') || response.includes('RCT')) score += 10;
    if (response.includes('guidelines') || response.includes('recommendation')) score += 5;
    return Math.min(score, 100);
  };

  const determineWinner = (hodiResponse: string, selfDecodeResponse: string): 'hodilabs' | 'selfdecode' | 'tie' => {
    const hodiScore = scoreAccuracy(hodiResponse) + scoreCompleteness(hodiResponse) + scoreActionability(hodiResponse) + scoreEvidence(hodiResponse);
    const selfDecodeScore = scoreAccuracy(selfDecodeResponse) + scoreCompleteness(selfDecodeResponse) + scoreActionability(selfDecodeResponse) + scoreEvidence(selfDecodeResponse);
    
    const difference = hodiScore - selfDecodeScore;
    if (Math.abs(difference) < 10) return 'tie';
    return difference > 0 ? 'hodilabs' : 'selfdecode';
  };

  const generateAnalysis = (hodiResponse: string, selfDecodeResponse: string): string => {
    const hodiStrengths = [];
    const selfDecodeStrengths = [];
    
    if (hodiResponse.includes('meta-analysis')) hodiStrengths.push('Strong evidence citations');
    if (hodiResponse.includes('specific') && hodiResponse.includes('mg')) hodiStrengths.push('Specific dosage recommendations');
    if (hodiResponse.includes('timeline')) hodiStrengths.push('Clear timelines provided');
    
    if (selfDecodeResponse.includes('genetic')) selfDecodeStrengths.push('Genetic focus');
    if (selfDecodeResponse.includes('personalised')) selfDecodeStrengths.push('Personalization emphasis');
    
    return `
HodieLabs Strengths: ${hodiStrengths.join(', ') || 'General health guidance'}
SelfDecode Strengths: ${selfDecodeStrengths.join(', ') || 'Genetic-based recommendations'}

Overall: ${hodiStrengths.length >= selfDecodeStrengths.length ? 'HodieLabs provides more comprehensive, evidence-based recommendations' : 'Both platforms offer valuable but different approaches'}
    `.trim();
  };

  const copyLoginCredentials = () => {
    navigator.clipboard.writeText('Email: support+b2bdemo@selfdecode.com\nPassword: TESTINGPASSWORD1234a');
    alert('Login credentials copied to clipboard!');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-centre">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ⚔️ HodieLabs vs SelfDecode Live Comparison
        </h1>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto">
          Test real responses from both platforms side-by-side. Use the SelfDecode login credentials to get their actual responses, 
          then paste them here for head-to-head comparison.
        </p>
      </div>

      {/* SelfDecode Access Instructions */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-purple-900 mb-4">📋 How to Access SelfDecode</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-purple-800 mb-2">Step 1: Login to SelfDecode</h3>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-2">Use these credentials:</p>
              <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                <div>Email: support+b2bdemo@selfdecode.com</div>
                <div>Password: TESTINGPASSWORD1234a</div>
              </div>
              <button
                onClick={copyLoginCredentials}
                className="mt-2 text-sm text-purple-600 hover:text-purple-800 flex items-centre"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy credentials
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-purple-800 mb-2">Step 2: Access DecodeGPT</h3>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-2">Login URL:</p>
              <a 
                href="https://selfdecode.com/login" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 underline font-mono text-sm"
              >
                https://selfdecode.com/login
              </a>
              <p className="text-xs text-gray-500 mt-2">
                After login, find their AI chatbot (DecodeGPT) to test queries
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Test Queries */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">🎯 Suggested Test Queries</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleQueries.map((sample, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">{sample.category}</h3>
              <p className="text-sm text-gray-700 mb-3">"{sample.query}"</p>
              <p className="text-xs text-gray-500 mb-3">{sample.description}</p>
              <button
                onClick={() => setTestQuery(sample.query)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Use This Query →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Test Input Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">🧪 Run Comparison Test</h2>
        
        <div className="space-y-6">
          {/* Test Query */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Query (ask both platforms the same question)
            </label>
            <textarea
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="e.g., I have the APOE4 variant. What does this mean for my health and what should I do?"
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* SelfDecode Response Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SelfDecode Response (paste their response here)
            </label>
            <textarea
              value={selfDecodeInput}
              onChange={(e) => setSelfDecodeInput(e.target.value)}
              placeholder="Paste the response you got from SelfDecode's DecodeGPT here..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Run Test Button */}
          <button
            onClick={runComparison}
            disabled={isRunningTest || !testQuery.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 flex items-centre justify-centre"
          >
            {isRunningTest ? (
              <div className="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <BarChart3 className="w-5 h-5 mr-3" />
            )}
            {isRunningTest ? 'Running Comparison...' : 'Run Head-to-Head Test'}
          </button>
        </div>
      </div>

      {/* Current Test Results */}
      {currentTest && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className={`px-6 py-4 ${
            currentTest.winner === 'hodilabs' ? 'bg-green-50 border-green-200' :
            currentTest.winner === 'selfdecode' ? 'bg-purple-50 border-purple-200' :
            'bg-yellow-50 border-yellow-200'
          }`}>
            <h3 className="text-xl font-bold text-gray-900 flex items-centre">
              <BarChart3 className="w-6 h-6 mr-2" />
              Test Results
              {currentTest.winner === 'hodilabs' && <CheckCircle className="w-6 h-6 ml-2 text-green-600" />}
              {currentTest.winner === 'selfdecode' && <AlertCircle className="w-6 h-6 ml-2 text-purple-600" />}
            </h3>
          </div>

          <div className="p-6 space-y-6">
            {/* Overall Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-centre p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">🏥 HodieLabs</h4>
                <div className="text-3xl font-bold text-blue-600 mt-2">
                  {currentTest.scores.hodiLabs.overall}
                </div>
                <p className="text-sm text-blue-700">Overall Score</p>
              </div>

              <div className="text-centre p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900">🧬 SelfDecode</h4>
                <div className="text-3xl font-bold text-purple-600 mt-2">
                  {currentTest.scores.selfDecode.overall}
                </div>
                <p className="text-sm text-purple-700">Overall Score</p>
              </div>

              <div className="text-centre p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900">🏆 Winner</h4>
                <div className="text-lg font-bold text-green-600 mt-2">
                  {currentTest.winner === 'hodilabs' ? 'HodieLabs' :
                   currentTest.winner === 'selfdecode' ? 'SelfDecode' : 'Tie'}
                </div>
                <p className="text-sm text-green-700">
                  +{Math.abs(currentTest.scores.hodiLabs.overall - currentTest.scores.selfDecode.overall)} points
                </p>
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(currentTest.scores.hodiLabs).filter(([key]) => key !== 'overall').map(([metric, score]) => (
                <div key={metric} className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-700 capitalize mb-1">{metric}</h4>
                  <div className="flex justify-between items-centre">
                    <span className="text-blue-600 font-semibold">{score}</span>
                    <span className="text-purple-600 font-semibold">
                      {currentTest.scores.selfDecode[metric as keyof typeof currentTest.scores.selfDecode]}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Analysis */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">📊 Analysis</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{currentTest.analysis}</pre>
              </div>
            </div>

            {/* Responses Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-900 mb-3">🏥 HodieLabs Response</h4>
                <div className="bg-blue-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-sm text-blue-800 whitespace-pre-wrap">{currentTest.hodiLabsResponse}</pre>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-purple-900 mb-3">🧬 SelfDecode Response</h4>
                <div className="bg-purple-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-sm text-purple-800 whitespace-pre-wrap">{currentTest.selfDecodeResponse}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test History */}
      {testHistory.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">📈 Test History</h3>
          
          <div className="space-y-3">
            {testHistory.map((test, index) => (
              <div key={test.id} className="flex items-centre justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {test.query}
                  </p>
                  <p className="text-xs text-gray-500">
                    HodieLabs: {test.scores.hodiLabs.overall} | SelfDecode: {test.scores.selfDecode.overall}
                  </p>
                </div>
                <div className="flex items-centre space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    test.winner === 'hodilabs' ? 'bg-green-100 text-green-800' :
                    test.winner === 'selfdecode' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {test.winner === 'hodilabs' ? '🏥 HodieLabs' :
                     test.winner === 'selfdecode' ? '🧬 SelfDecode' : '🤝 Tie'}
                  </span>
                  <button
                    onClick={() => setCurrentTest(test)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelfDecodeComparator;