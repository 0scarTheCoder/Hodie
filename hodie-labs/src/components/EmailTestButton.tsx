import React, { useState } from 'react';
import { emailTester } from '../utils/emailTester';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const EmailTestButton: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [testEmail, setTestEmail] = useState('loveoh19@gmail.com');

  const runTest = async () => {
    setTesting(true);
    setResults([]);
    
    try {
      console.log('🚀 Starting automated email test...');
      
      // Auto-fix issues first
      const fixes = await emailTester.autoFixIssues();
      if (fixes.length > 0) {
        console.log('🔧 Auto-fixes applied:', fixes);
      }
      
      // Run comprehensive diagnostic
      const testResults = await emailTester.runFullDiagnostic(testEmail);
      setResults(testResults);
      
      // Log results for debugging
      testResults.forEach((result, index) => {
        console.log(`Test ${index + 1}:`, result);
      });
      
    } catch (error) {
      console.error('Test failed:', error);
      setResults([{
        success: false,
        message: 'Test system error',
        error: (error as Error).message,
        suggestions: ['Check browser console for details']
      }]);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-xl shadow-lg border p-4 max-w-md">
        <div className="flex items-centre space-x-2 mb-3">
          <Mail className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold">Email Diagnostic Tool</h3>
        </div>
        
        <div className="space-y-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Test email address"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          
          <button
            onClick={runTest}
            disabled={testing}
            className="w-full flex items-centre justify-centre space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Testing...</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>Test Email System</span>
              </>
            )}
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-sm">Test Results:</h4>
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg text-sm ${
                  result.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-centre space-x-2 mb-1">
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.message}
                  </span>
                </div>
                
                {result.error && (
                  <div className="text-red-700 text-xs mb-2">
                    Error: {result.error}
                  </div>
                )}
                
                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="text-gray-600 text-xs">
                    <div className="font-medium mb-1">Suggestions:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {result.suggestions.map((suggestion: string, i: number) => (
                        <li key={i}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTestButton;