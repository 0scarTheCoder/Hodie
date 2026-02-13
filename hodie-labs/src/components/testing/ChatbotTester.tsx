import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { Play, Download, BarChart3, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import ChatbotTester, { TestResult, standardTestQuestions } from '../../utils/chatbotTesting';

interface ChatbotTesterProps {
  user: User;
}

const ChatbotTesterComponent: React.FC<ChatbotTesterProps> = ({ user }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);
    
    const tester = new ChatbotTester(user.uid);
    const testResults: TestResult[] = [];
    
    for (let i = 0; i < standardTestQuestions.length; i++) {
      const question = standardTestQuestions[i];
      setCurrentTest(question.question);
      
      try {
        const result = await tester.runSingleTest(question);
        testResults.push(result);
        setResults([...testResults]);
      } catch (error) {
        console.error('Test failed:', error);
      }
      
      setProgress(((i + 1) / standardTestQuestions.length) * 100);
    }
    
    setIsRunning(false);
    setCurrentTest('');
  };

  const downloadReport = () => {
    if (results.length === 0) return;
    
    const tester = new ChatbotTester(user.uid);
    const report = tester.generateTestReport(results);
    
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hodie-ai-test-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 8) return 'bg-green-100';
    if (score >= 6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const averageScore = results.length > 0 
    ? results.reduce((sum, r) => sum + r.totalScore, 0) / results.length 
    : 0;

  const categoryScores = results.length > 0 ? {
    genetic: results.filter(r => standardTestQuestions.find(q => q.id === r.questionId)?.category === 'genetic').reduce((sum, r) => sum + r.totalScore, 0) / results.filter(r => standardTestQuestions.find(q => q.id === r.questionId)?.category === 'genetic').length || 0,
    bloodwork: results.filter(r => standardTestQuestions.find(q => q.id === r.questionId)?.category === 'bloodwork').reduce((sum, r) => sum + r.totalScore, 0) / results.filter(r => standardTestQuestions.find(q => q.id === r.questionId)?.category === 'bloodwork').length || 0,
    lifestyle: results.filter(r => standardTestQuestions.find(q => q.id === r.questionId)?.category === 'lifestyle').reduce((sum, r) => sum + r.totalScore, 0) / results.filter(r => standardTestQuestions.find(q => q.id === r.questionId)?.category === 'lifestyle').length || 0,
    conversational: results.filter(r => standardTestQuestions.find(q => q.id === r.questionId)?.category === 'conversational').reduce((sum, r) => sum + r.totalScore, 0) / results.filter(r => standardTestQuestions.find(q => q.id === r.questionId)?.category === 'conversational').length || 0,
    complex: results.filter(r => standardTestQuestions.find(q => q.id === r.questionId)?.category === 'complex').reduce((sum, r) => sum + r.totalScore, 0) / results.filter(r => standardTestQuestions.find(q => q.id === r.questionId)?.category === 'complex').length || 0
  } : {};

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">🧪 AI Chatbot Testing Suite</h1>
          <p className="text-gray-600">
            Test Hodie AI against industry standards. Compare with competitors like SelfDecode's DecodeGPT.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Test Controls</h2>
            <div className="flex space-x-3">
              <button
                onClick={runTests}
                disabled={isRunning}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>{isRunning ? 'Running Tests...' : 'Run Full Test Suite'}</span>
              </button>
              
              {results.length > 0 && (
                <button
                  onClick={downloadReport}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress */}
          {isRunning && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Testing Progress</span>
                <span className="text-sm font-medium text-gray-800">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {currentTest && (
                <p className="text-sm text-gray-600 mt-2 italic">"{currentTest}"</p>
              )}
            </div>
          )}
        </div>

        {/* Overall Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Overall Performance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(averageScore)} mb-1`}>
                  {averageScore.toFixed(1)}/10
                </div>
                <div className="text-gray-600">Average Score</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {results.length}
                </div>
                <div className="text-gray-600">Tests Completed</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length)}ms
                </div>
                <div className="text-gray-600">Avg Response Time</div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(categoryScores).map(([category, score]) => (
                <div key={category} className={`p-3 rounded-lg ${getScoreBackground(score)}`}>
                  <div className={`text-lg font-semibold ${getScoreColor(score)}`}>
                    {score.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">{category}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📝 Detailed Test Results</h2>
            
            <div className="space-y-4">
              {results.map((result, index) => {
                const question = standardTestQuestions.find(q => q.id === result.questionId);
                return (
                  <div key={result.questionId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-500">
                            {question?.category.toUpperCase()} | {question?.difficulty.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreBackground(result.totalScore)} ${getScoreColor(result.totalScore)}`}>
                            {result.totalScore}/10
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-800 mb-2">{result.question}</h3>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{result.responseTime}ms</span>
                      </div>
                    </div>
                    
                    {/* Score Breakdown */}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3 text-xs">
                      {Object.entries(result.scores).map(([metric, score]) => (
                        <div key={metric} className="text-center">
                          <div className={`font-medium ${getScoreColor(score)}`}>{score.toFixed(1)}</div>
                          <div className="text-gray-500 capitalize">{metric.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Response Preview */}
                    <div className="bg-gray-50 rounded p-3 mb-2">
                      <div className="text-sm text-gray-700 line-clamp-3">
                        {result.response}
                      </div>
                    </div>
                    
                    {result.notes && (
                      <div className="text-xs text-gray-500 italic">
                        Notes: {result.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Competitive Comparison */}
        {results.length > 0 && (
          <div className="bg-white rounded-xl p-6 mt-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🆚 Competitive Analysis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-600 mb-3">✅ Hodie AI Strengths</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Unlimited free usage (no 50-100 question limit)</li>
                  <li>• Excellent conversational flow</li>
                  <li>• Fast response times (&lt;2s average)</li>
                  <li>• Mobile-optimised interface</li>
                  <li>• Australian health guidelines</li>
                  <li>• No subscription fees ($0 vs $119-894/year)</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-600 mb-3">🔄 Areas for Enhancement</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Integrate real genetic analysis (200M+ variants)</li>
                  <li>• Add deeper blood work interpretation</li>
                  <li>• Enhance personalisation algorithms</li>
                  <li>• Include medical citations</li>
                  <li>• Add specialist condition knowledge</li>
                  <li>• Implement user health profile persistence</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">💡 Competitive Positioning</h4>
              <p className="text-sm text-blue-700">
                <strong>Hodie AI avg score: {averageScore.toFixed(1)}/10</strong> | 
                <strong> DecodeGPT estimated: 8.5-9.2/10</strong> | 
                <strong> Gap: {Math.abs(averageScore - 8.85).toFixed(1)} points</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                *DecodeGPT estimate based on premium features, genetic integration, and established user base
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotTesterComponent;