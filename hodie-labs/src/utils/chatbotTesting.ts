// Competitive Chatbot Testing Utility
import { kimiK2Service, HealthContext } from '../services/kimiK2Service';

export interface TestQuestion {
  id: string;
  category: 'genetic' | 'bloodwork' | 'lifestyle' | 'conversational' | 'complex';
  question: string;
  expectedKeywords: string[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

export interface TestResult {
  questionId: string;
  question: string;
  response: string;
  responseTime: number;
  scores: {
    accuracy: number;
    personalization: number;
    conversational: number;
    actionability: number;
    comprehensiveness: number;
    userExperience: number;
  };
  totalScore: number;
  notes: string;
}

export const standardTestQuestions: TestQuestion[] = [
  // Genetic Questions
  {
    id: 'gen001',
    category: 'genetic',
    question: 'What supplements should I take based on my genetics?',
    expectedKeywords: ['genetic', 'DNA', 'variants', 'personalised', 'supplements'],
    difficulty: 'intermediate'
  },
  {
    id: 'gen002', 
    category: 'genetic',
    question: 'How does my ACTN3 gene affect my fitness routine?',
    expectedKeywords: ['ACTN3', 'muscle', 'fibre', 'exercise', 'power', 'endurance'],
    difficulty: 'advanced'
  },

  // Blood Work Questions
  {
    id: 'blood001',
    category: 'bloodwork',
    question: 'My cholesterol is 5.2 mmol/L - what should I do?',
    expectedKeywords: ['cholesterol', 'diet', 'exercise', 'LDL', 'HDL', 'lifestyle'],
    difficulty: 'basic'
  },
  {
    id: 'blood002',
    category: 'bloodwork', 
    question: 'My vitamin D level is 45 nmol/L - is this concerning?',
    expectedKeywords: ['vitamin D', 'deficiency', 'supplements', 'sun', 'bone health'],
    difficulty: 'intermediate'
  },

  // Lifestyle Coaching
  {
    id: 'life001',
    category: 'lifestyle',
    question: 'I\'m tired all the time - help me create an energy plan',
    expectedKeywords: ['energy', 'sleep', 'diet', 'exercise', 'stress', 'plan'],
    difficulty: 'intermediate'
  },
  {
    id: 'life002',
    category: 'lifestyle',
    question: 'Design a weight loss strategy for a 35-year-old male',
    expectedKeywords: ['weight loss', 'diet', 'exercise', 'calories', 'metabolism'],
    difficulty: 'basic'
  },

  // Conversational Intelligence
  {
    id: 'conv001',
    category: 'conversational',
    question: 'Hi, how are you?',
    expectedKeywords: ['greeting', 'hello', 'help', 'health'],
    difficulty: 'basic'
  },
  {
    id: 'conv002',
    category: 'conversational',
    question: 'I don\'t understand your last recommendation',
    expectedKeywords: ['explain', 'clarify', 'simpler', 'help'],
    difficulty: 'intermediate'
  },

  // Complex Scenarios
  {
    id: 'comp001',
    category: 'complex',
    question: 'I have PCOS and want to lose weight - create a comprehensive plan',
    expectedKeywords: ['PCOS', 'weight', 'insulin', 'diet', 'exercise', 'hormones', 'plan'],
    difficulty: 'advanced'
  },
  {
    id: 'comp002',
    category: 'complex',
    question: 'I\'m pre-diabetic with high stress - what\'s my action plan?',
    expectedKeywords: ['pre-diabetes', 'stress', 'glucose', 'diet', 'exercise', 'mindfulness'],
    difficulty: 'advanced'
  }
];

export class ChatbotTester {
  private userId: string;
  private healthContext: HealthContext;

  constructor(userId: string) {
    this.userId = userId;
    this.healthContext = {
      userId,
      recentHealthData: {
        steps: 8500,
        sleep: 7.2,
        mood: 'good',
        healthScore: 78,
        heartRate: 68
      }
    };
  }

  async runSingleTest(question: TestQuestion): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await kimiK2Service.generateHealthResponse(
        question.question,
        this.healthContext,
        []
      );
      
      const responseTime = Date.now() - startTime;
      
      // Auto-scoring based on response quality
      const scores = this.scoreResponse(response, question);
      const totalScore = Object.values(scores).reduce((sum, score) => sum + score) / 6;
      
      return {
        questionId: question.id,
        question: question.question,
        response,
        responseTime,
        scores,
        totalScore: Math.round(totalScore * 10) / 10,
        notes: this.generateNotes(response, question)
      };
      
    } catch (error) {
      console.error('Test failed:', error);
      return {
        questionId: question.id,
        question: question.question,
        response: 'ERROR: ' + String(error),
        responseTime: Date.now() - startTime,
        scores: {
          accuracy: 0,
          personalization: 0,
          conversational: 0,
          actionability: 0,
          comprehensiveness: 0,
          userExperience: 0
        },
        totalScore: 0,
        notes: 'Test failed due to error'
      };
    }
  }

  async runFullTestSuite(): Promise<TestResult[]> {
    console.log('🧪 Starting comprehensive chatbot testing...');
    const results: TestResult[] = [];
    
    for (const question of standardTestQuestions) {
      console.log(`Testing: ${question.id} - ${question.question}`);
      const result = await this.runSingleTest(question);
      results.push(result);
      
      // Brief delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  }

  private scoreResponse(response: string, question: TestQuestion): TestResult['scores'] {
    const responseLength = response.length;
    const hasKeywords = question.expectedKeywords.filter(keyword => 
      response.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    return {
      // Accuracy: Based on medical soundness and keyword coverage
      accuracy: Math.min(10, (hasKeywords / question.expectedKeywords.length) * 10),
      
      // Personalization: Check for user-specific references
      personalization: response.includes('your') || response.includes('you') ? 8 : 5,
      
      // Conversational: Natural language and engagement
      conversational: this.scoreConversationalQuality(response),
      
      // Actionability: Specific recommendations and next steps
      actionability: this.scoreActionability(response),
      
      // Comprehensiveness: Depth and breadth of response
      comprehensiveness: Math.min(10, responseLength / 100),
      
      // User Experience: Overall helpfulness and clarity
      userExperience: this.scoreUserExperience(response)
    };
  }

  private scoreConversationalQuality(response: string): number {
    let score = 5; // Base score
    
    // Positive indicators
    if (response.includes('!') || response.includes('?')) score += 1;
    if (response.match(/Good (morning|afternoon|evening)/)) score += 1;
    if (response.includes('Let me') || response.includes('I recommend')) score += 1;
    if (response.includes('What') || response.includes('How')) score += 1;
    
    // Negative indicators  
    if (response.includes('ERROR') || response.includes('unavailable')) score -= 3;
    if (response.length < 50) score -= 2;
    
    return Math.max(1, Math.min(10, score));
  }

  private scoreActionability(response: string): number {
    let score = 3; // Base score
    
    // Look for actionable elements
    const actionWords = ['should', 'try', 'start', 'avoid', 'include', 'consider', 'aim'];
    const foundActions = actionWords.filter(word => response.toLowerCase().includes(word));
    score += foundActions.length;
    
    // Look for specific recommendations
    if (response.includes('•') || response.includes('1.') || response.includes('-')) score += 2;
    if (response.includes('minutes') || response.includes('grams') || response.includes('%')) score += 1;
    
    return Math.min(10, score);
  }

  private scoreUserExperience(response: string): number {
    let score = 6; // Base score
    
    // Positive UX indicators
    if (response.includes('🎯') || response.includes('✅') || response.includes('🏃')) score += 1;
    if (response.includes('GP') || response.includes('healthcare')) score += 1;
    if (!response.includes('I\'m sorry') && !response.includes('I apologize')) score += 1;
    
    // Structure and readability
    const sentences = response.split(/[.!?]/).length;
    if (sentences > 3 && sentences < 15) score += 1;
    
    return Math.min(10, score);
  }

  private generateNotes(response: string, question: TestQuestion): string {
    const notes: string[] = [];
    
    if (response.length < 100) notes.push('Response too brief');
    if (response.length > 1000) notes.push('Response very comprehensive');
    if (response.includes('ERROR')) notes.push('Error in response generation');
    
    const keywordCoverage = question.expectedKeywords.filter(keyword => 
      response.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    if (keywordCoverage === 0) notes.push('Missing key medical terms');
    if (keywordCoverage === question.expectedKeywords.length) notes.push('Excellent keyword coverage');
    
    return notes.join('; ') || 'Standard response quality';
  }

  generateTestReport(results: TestResult[]): string {
    const avgScore = results.reduce((sum, r) => sum + r.totalScore, 0) / results.length;
    const categoryScores = this.calculateCategoryScores(results);
    
    return `
# Hodie AI Chatbot Test Report

## Overall Performance
- **Average Score**: ${avgScore.toFixed(1)}/10
- **Total Questions Tested**: ${results.length}
- **Average Response Time**: ${(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length).toFixed(0)}ms

## Category Breakdown
${Object.entries(categoryScores).map(([category, score]) => 
  `- **${category.toUpperCase()}**: ${score.toFixed(1)}/10`
).join('\n')}

## Detailed Results
${results.map(r => `
### ${r.questionId}: ${r.question}
- **Score**: ${r.totalScore}/10
- **Response Time**: ${r.responseTime}ms
- **Notes**: ${r.notes}
`).join('\n')}

## Recommendations for Improvement
${this.generateRecommendations(results)}
    `;
  }

  private calculateCategoryScores(results: TestResult[]): Record<string, number> {
    const categories = ['genetic', 'bloodwork', 'lifestyle', 'conversational', 'complex'];
    const categoryScores: Record<string, number> = {};
    
    categories.forEach(category => {
      const categoryResults = results.filter(r => 
        standardTestQuestions.find(q => q.id === r.questionId)?.category === category
      );
      
      if (categoryResults.length > 0) {
        categoryScores[category] = categoryResults.reduce((sum, r) => sum + r.totalScore, 0) / categoryResults.length;
      }
    });
    
    return categoryScores;
  }

  private generateRecommendations(results: TestResult[]): string {
    const recommendations: string[] = [];
    
    // Analyze weak areas
    const avgScores = results.reduce((acc, r) => {
      Object.entries(r.scores).forEach(([key, value]) => {
        acc[key] = (acc[key] || 0) + value;
      });
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(avgScores).forEach(([metric, total]) => {
      const avg = total / results.length;
      if (avg < 6) {
        recommendations.push(`Improve ${metric} (current: ${avg.toFixed(1)}/10)`);
      }
    });
    
    // Check for common issues
    const errorResults = results.filter(r => r.response.includes('ERROR'));
    if (errorResults.length > 0) {
      recommendations.push(`Fix ${errorResults.length} error responses`);
    }
    
    const slowResults = results.filter(r => r.responseTime > 3000);
    if (slowResults.length > 0) {
      recommendations.push(`Optimise response time for ${slowResults.length} slow responses`);
    }
    
    return recommendations.length > 0 ? recommendations.map(r => `- ${r}`).join('\n') : '- Overall performance is strong!';
  }
}

export default ChatbotTester;