// Automated Email Testing and Diagnostics for HodieLabs
import { auth } from '../firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';

interface EmailTestResult {
  success: boolean;
  message: string;
  error?: string;
  suggestions: string[];
}

class EmailTester {
  
  // Test Firebase configuration
  async testFirebaseConfig(): Promise<EmailTestResult> {
    const config = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    };

    const missing = [];
    if (!config.apiKey) missing.push('REACT_APP_FIREBASE_API_KEY');
    if (!config.authDomain) missing.push('REACT_APP_FIREBASE_AUTH_DOMAIN');
    if (!config.projectId) missing.push('REACT_APP_FIREBASE_PROJECT_ID');

    if (missing.length > 0) {
      return {
        success: false,
        message: 'Firebase configuration incomplete',
        error: `Missing: ${missing.join(', ')}`,
        suggestions: ['Check .env file', 'Verify environment variables']
      };
    }

    return {
      success: true,
      message: 'Firebase configuration looks good',
      suggestions: []
    };
  }

  // Test email sending capability
  async testEmailSending(testEmail: string): Promise<EmailTestResult> {
    try {
      console.log('🧪 Testing email sending to:', testEmail);
      
      await sendPasswordResetEmail(auth, testEmail);
      
      return {
        success: true,
        message: `Email sent successfully to ${testEmail}`,
        suggestions: [
          'Check your inbox (including spam folder)',
          'Email should arrive within 1-2 minutes',
          'Look for sender: Firebase (noreply@hodie-labs-webapp.firebaseapp.com)'
        ]
      };
    } catch (error: any) {
      let suggestions = [];
      let errorMessage = error.message;

      // Provide specific suggestions based on error
      if (error.code === 'auth/user-not-found') {
        suggestions = [
          'This email is not registered yet',
          'Try creating an account first',
          'Or use a different email address'
        ];
      } else if (error.code === 'auth/invalid-email') {
        suggestions = [
          'Email format is invalid',
          'Please enter a valid email address'
        ];
      } else if (error.code === 'auth/too-many-requests') {
        suggestions = [
          'Too many reset requests',
          'Wait 5-10 minutes before trying again'
        ];
      } else {
        suggestions = [
          'Check Firebase project configuration',
          'Verify email/password authentication is enabled',
          'Check network connection'
        ];
      }

      return {
        success: false,
        message: 'Email sending failed',
        error: errorMessage,
        suggestions
      };
    }
  }

  // Comprehensive email system test
  async runFullDiagnostic(testEmail: string): Promise<EmailTestResult[]> {
    console.log('🔧 Running HodieLabs Email Diagnostic...');
    
    const results: EmailTestResult[] = [];
    
    // Test 1: Configuration
    const configTest = await this.testFirebaseConfig();
    results.push(configTest);
    console.log('✅ Configuration test:', configTest.success ? 'PASSED' : 'FAILED');
    
    // Test 2: Email sending (only if config is good)
    if (configTest.success) {
      const emailTest = await this.testEmailSending(testEmail);
      results.push(emailTest);
      console.log('📧 Email test:', emailTest.success ? 'PASSED' : 'FAILED');
    }
    
    return results;
  }

  // Auto-fix common issues
  async autoFixIssues(): Promise<string[]> {
    const fixes = [];
    
    // Check if user is signed in (affects password reset)
    if (auth.currentUser) {
      await auth.signOut();
      fixes.push('Signed out current user to test password reset');
    }
    
    return fixes;
  }
}

export const emailTester = new EmailTester();
export default emailTester;