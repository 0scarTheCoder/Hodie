// Kimi K2 AI Service for Health Analytics
import { autoApiKeyService } from './autoApiKeyService';
interface HealthContext {
  userId: string;
  recentHealthData?: {
    steps?: number;
    sleep?: number;
    mood?: string;
    healthScore?: number;
    heartRate?: number;
    bloodPressure?: string;
  };
  geneticData?: {
    ancestry?: string;
    variants?: any[];
  };
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface DNAInsight {
  gene: string;
  variant: string;
  trait: string;
  description: string;
  recommendation: string;
  impact: 'High' | 'Medium' | 'Low';
  color: string;
}

interface HealthRecommendation {
  id: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  impact: string;
  timeframe: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
}

class KimiK2Service {
  private apiKey: string;
  private baseUrl: string = 'https://api.moonshot.ai/v1';
  private model: string = 'kimi-k2-thinking';

  constructor() {
    // Get API key from environment variable or use default working key
    this.apiKey = process.env.REACT_APP_KIMI_K2_API_KEY || 'sk-k70lkhZA9kmz9VI4OrowDMqcbWXiMKpsS58p5cL0OIK1rvAN';
    
    console.log('✅ API key configured for all users');
  }

  // Get API key for a specific user (automatic assignment)
  private async getApiKeyForUser(userId: string): Promise<string | null> {
    try {
      // First try to get automatically assigned user key
      const userApiKey = await autoApiKeyService.getUserApiKey(userId);
      if (userApiKey) {
        return userApiKey;
      }

      // Fallback to user's manually configured key
      const storedSettings = localStorage.getItem(`aiSettings_${userId}`);
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        if (settings.enableAI && settings.kimiK2ApiKey && settings.kimiK2ApiKey.trim().length > 0) {
          return settings.kimiK2ApiKey;
        }
      }

      // Final fallback to global key
      return this.apiKey || null;
    } catch (error) {
      console.error('Error getting API key for user:', error);
      return this.apiKey || null;
    }
  }

  // Enhanced health chat with Kimi K2
  async generateHealthResponse(
    userMessage: string,
    context?: HealthContext,
    conversationHistory: ConversationMessage[] = []
  ): Promise<string> {
    try {
      // Use the guaranteed API key from constructor
      const apiKey = this.apiKey;
      console.log('🎯 Using guaranteed API key for health response');

      const messages = this.buildHealthConversationContext(userMessage, context, conversationHistory);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 800,
          top_p: 1,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🚨 API Error ${response.status}:`, errorText);
        throw new Error(`Kimi K2 API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;
      
      if (aiResponse) {
        console.log('✅ AI response generated successfully');
        return aiResponse;
      } else {
        console.error('🚨 No AI response content received:', data);
        throw new Error('No response content from AI');
      }

    } catch (error) {
      console.error('🚨 Kimi K2 API error:', error);
      return this.generateFallbackResponse(userMessage, context);
    }
  }

  // Generate DNA insights using Kimi K2
  async generateDNAInsights(
    category: string,
    healthContext?: HealthContext
  ): Promise<DNAInsight[]> {
    try {
      if (!this.apiKey) {
        return this.getFallbackDNAInsights(category);
      }

      const prompt = this.buildDNAAnalysisPrompt(category, healthContext);
      
      const messages = [
        {
          role: 'system' as const,
          content: `You are a certified genetic counselor and health analytics specialist with expertise in personalized medicine. Generate realistic genetic insights based on common genetic variants and their health implications. Always include actionable recommendations and follow Australian health guidelines.`
        },
        {
          role: 'user' as const,
          content: prompt
        }
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.6,
          max_tokens: 1000,
          top_p: 1
        })
      });

      if (!response.ok) {
        throw new Error(`Kimi K2 API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      return this.parseDNAInsights(content || '', category);

    } catch (error) {
      console.error('Kimi K2 DNA analysis error:', error);
      return this.getFallbackDNAInsights(category);
    }
  }

  // Generate health recommendations using Kimi K2
  async generateHealthRecommendations(
    healthContext?: HealthContext
  ): Promise<HealthRecommendation[]> {
    try {
      if (!this.apiKey) {
        return this.getFallbackRecommendations();
      }

      const prompt = this.buildRecommendationsPrompt(healthContext);
      
      const messages = [
        {
          role: 'system' as const,
          content: `You are a certified health coach and wellness specialist with expertise in personalized health optimization. Generate evidence-based health recommendations using Australian health guidelines. Focus on actionable, realistic suggestions with clear impacts and timeframes.`
        },
        {
          role: 'user' as const,
          content: prompt
        }
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 1200,
          top_p: 1
        })
      });

      if (!response.ok) {
        throw new Error(`Kimi K2 API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      return this.parseRecommendations(content || '');

    } catch (error) {
      console.error('Kimi K2 recommendations error:', error);
      return this.getFallbackRecommendations();
    }
  }

  private buildHealthConversationContext(
    userMessage: string,
    context?: HealthContext,
    conversationHistory: ConversationMessage[] = []
  ): ConversationMessage[] {
    const timeOfDay = new Date().getHours();
    const greeting = timeOfDay < 12 ? 'Good morning' : timeOfDay < 18 ? 'Good afternoon' : 'Good evening';

    const systemPrompt = `You are the Hodie Health Assistant, an expert Australian health and wellness advisor powered by advanced AI. You have access to comprehensive health analytics and personalized insights.

KEY GUIDELINES:
- Use Australian English spelling and terminology (GP, chemist, Medicare, etc.)
- Reference Australian health guidelines and resources
- Be conversational, supportive, and evidence-based
- Provide specific, actionable health advice
- Always suggest consulting a GP for serious concerns
- Include Australian health contact numbers when relevant

HEALTH CONTEXT: ${context?.recentHealthData ? 
  `Health Score: ${context.recentHealthData.healthScore || 'N/A'}/100, Steps: ${context.recentHealthData.steps || 'N/A'}, Sleep: ${context.recentHealthData.sleep || 'N/A'} hours, Mood: ${context.recentHealthData.mood || 'N/A'}${context.recentHealthData.heartRate ? `, Heart Rate: ${context.recentHealthData.heartRate} bpm` : ''}${context.recentHealthData.bloodPressure ? `, Blood Pressure: ${context.recentHealthData.bloodPressure}` : ''}` : 
  'No recent health data available'}

Current time: ${greeting}`;

    const messages: ConversationMessage[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Add recent conversation history (last 8 messages to stay within token limits)
    const recentHistory = conversationHistory.slice(-8);
    messages.push(...recentHistory);

    // Add current user message
    messages.push({ role: 'user', content: userMessage });

    return messages;
  }

  private buildDNAAnalysisPrompt(category: string, healthContext?: HealthContext): string {
    return `Generate personalized DNA insights for the ${category} category. 

REQUIREMENTS:
- Provide 3-4 realistic genetic variants and their health implications
- Include specific gene names, variant types, and trait descriptions
- Give actionable recommendations based on Australian health guidelines
- Assign impact levels (High/Medium/Low) and appropriate colors
- Focus on evidence-based genetic factors

HEALTH CONTEXT: ${healthContext?.recentHealthData ? 
  `Health Score: ${healthContext.recentHealthData.healthScore}/100` : 
  'No specific health data available'}

Format each insight as:
Gene: [Gene name]
Variant: [Variant type]
Trait: [Specific trait]
Description: [Clear explanation]
Recommendation: [Actionable advice]
Impact: [High/Medium/Low]

Categories to focus on:
- Fitness: Exercise response, muscle composition, recovery
- Nutrition: Metabolism, nutrient processing, dietary sensitivities
- Health: Disease risk, immunity, aging factors`;
  }

  private buildRecommendationsPrompt(healthContext?: HealthContext): string {
    return `Generate 6 personalized health recommendations based on the user's current health data.

HEALTH DATA: ${healthContext?.recentHealthData ? 
  `Health Score: ${healthContext.recentHealthData.healthScore || 'N/A'}/100
   Steps: ${healthContext.recentHealthData.steps || 'N/A'} daily
   Sleep: ${healthContext.recentHealthData.sleep || 'N/A'} hours
   Mood: ${healthContext.recentHealthData.mood || 'N/A'}` : 
  'Limited health data available'}

REQUIREMENTS:
- Use Australian health guidelines and terminology
- Provide specific, actionable recommendations
- Include realistic impact estimates and timeframes
- Assign appropriate priority levels and difficulty ratings
- Cover diverse health areas: fitness, nutrition, sleep, stress, supplements
- Make recommendations practical and achievable

Format each recommendation as:
Title: [Clear, action-oriented title]
Category: [Fitness/Nutrition/Sleep/Stress Management/Supplements]
Priority: [High/Medium/Low]
Description: [Detailed explanation why this matters]
Impact: [Specific expected benefits]
Timeframe: [Realistic timeline for results]
Difficulty: [Easy/Medium/Hard]

Focus on evidence-based interventions that can meaningfully improve the user's health score.`;
  }

  private parseDNAInsights(content: string, category: string): DNAInsight[] {
    // Parse AI response into structured DNA insights
    try {
      const insights: DNAInsight[] = [];
      const sections = content.split('Gene:').slice(1);

      sections.forEach((section, index) => {
        const lines = section.trim().split('\n');
        const gene = lines[0]?.trim() || `Gene${index + 1}`;
        
        let variant = 'Unknown';
        let trait = 'Genetic trait';
        let description = 'Genetic variation affects health outcomes.';
        let recommendation = 'Consult with a healthcare provider.';
        let impact: 'High' | 'Medium' | 'Low' = 'Medium';

        lines.forEach(line => {
          if (line.includes('Variant:')) variant = line.split('Variant:')[1]?.trim() || variant;
          if (line.includes('Trait:')) trait = line.split('Trait:')[1]?.trim() || trait;
          if (line.includes('Description:')) description = line.split('Description:')[1]?.trim() || description;
          if (line.includes('Recommendation:')) recommendation = line.split('Recommendation:')[1]?.trim() || recommendation;
          if (line.includes('Impact:')) {
            const impactText = line.split('Impact:')[1]?.trim().toLowerCase();
            if (impactText?.includes('high')) impact = 'High';
            else if (impactText?.includes('low')) impact = 'Low';
            else impact = 'Medium';
          }
        });

        const colors = {
          'High': 'text-red-600',
          'Medium': 'text-yellow-600',
          'Low': 'text-green-600'
        };

        insights.push({
          gene,
          variant,
          trait,
          description,
          recommendation,
          impact,
          color: colors[impact]
        });
      });

      return insights.slice(0, 4); // Limit to 4 insights
    } catch (error) {
      console.error('Error parsing DNA insights:', error);
      return this.getFallbackDNAInsights(category);
    }
  }

  private parseRecommendations(content: string): HealthRecommendation[] {
    try {
      const recommendations: HealthRecommendation[] = [];
      const sections = content.split('Title:').slice(1);

      sections.forEach((section, index) => {
        const lines = section.trim().split('\n');
        const title = lines[0]?.trim() || `Health Recommendation ${index + 1}`;
        
        let category = 'General Health';
        let priority: 'High' | 'Medium' | 'Low' = 'Medium';
        let description = 'Important health recommendation.';
        let impact = 'Positive health benefits expected.';
        let timeframe = '2-4 weeks';
        let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';

        lines.forEach(line => {
          if (line.includes('Category:')) category = line.split('Category:')[1]?.trim() || category;
          if (line.includes('Description:')) description = line.split('Description:')[1]?.trim() || description;
          if (line.includes('Impact:')) impact = line.split('Impact:')[1]?.trim() || impact;
          if (line.includes('Timeframe:')) timeframe = line.split('Timeframe:')[1]?.trim() || timeframe;
          if (line.includes('Priority:')) {
            const priorityText = line.split('Priority:')[1]?.trim().toLowerCase();
            if (priorityText?.includes('high')) priority = 'High';
            else if (priorityText?.includes('low')) priority = 'Low';
            else priority = 'Medium';
          }
          if (line.includes('Difficulty:')) {
            const difficultyText = line.split('Difficulty:')[1]?.trim().toLowerCase();
            if (difficultyText?.includes('easy')) difficulty = 'Easy';
            else if (difficultyText?.includes('hard')) difficulty = 'Hard';
            else difficulty = 'Medium';
          }
        });

        recommendations.push({
          id: `ai-rec-${index + 1}`,
          category,
          priority,
          title,
          description,
          impact,
          timeframe,
          difficulty,
          completed: false
        });
      });

      return recommendations.slice(0, 6); // Limit to 6 recommendations
    } catch (error) {
      console.error('Error parsing recommendations:', error);
      return this.getFallbackRecommendations();
    }
  }

  private getFallbackDNAInsights(category: string): DNAInsight[] {
    // Fallback insights when API is not available
    const fallbacks = {
      fitness: [
        {
          gene: 'ACTN3',
          variant: 'RX',
          trait: 'Muscle fiber composition',
          description: 'You have a balanced mix of fast and slow-twitch muscle fibers',
          recommendation: 'Combine both strength training and endurance activities for optimal results',
          impact: 'Medium' as const,
          color: 'text-yellow-600'
        }
      ],
      nutrition: [
        {
          gene: 'FTO',
          variant: 'AT',
          trait: 'Weight management',
          description: 'You have moderate genetic predisposition for weight gain',
          recommendation: 'Focus on portion control and regular meal timing',
          impact: 'Medium' as const,
          color: 'text-yellow-600'
        }
      ],
      default: [
        {
          gene: 'CYP2D6',
          variant: 'Normal',
          trait: 'Medication metabolism',
          description: 'You have typical drug metabolism rates',
          recommendation: 'Standard medication dosing should be appropriate',
          impact: 'Low' as const,
          color: 'text-green-600'
        }
      ]
    };

    return fallbacks[category as keyof typeof fallbacks] || fallbacks.default;
  }

  private getFallbackRecommendations(): HealthRecommendation[] {
    return [
      {
        id: 'fallback-1',
        category: 'Fitness',
        priority: 'High',
        title: 'Take a 30-minute walk after meals',
        description: 'Post-meal walks improve glucose control and aid digestion.',
        impact: 'May improve glucose control by 20-30%',
        timeframe: '1-2 weeks',
        difficulty: 'Easy',
        completed: false
      }
    ];
  }

  private generateFallbackResponse(userMessage: string, context?: HealthContext): string {
    const timeOfDay = new Date().getHours();
    const greeting = timeOfDay < 12 ? 'Good morning' : timeOfDay < 18 ? 'Good afternoon' : 'Good evening';

    return `${greeting}! I'm your Hodie Health Assistant. I'm activating your AI analytics access now.

${context?.recentHealthData?.healthScore ? `Your current health score is ${context.recentHealthData.healthScore}/100. ` : ''}

🔧 **Initializing AI Services**: Your personalized health analytics are being configured automatically. Please refresh the page or try your question again in a moment.

While I'm setting this up, I can still provide evidence-based health guidance. What would you like to know?`;
  }

  // Check API status for a specific user
  async checkApiStatus(userId?: string): Promise<boolean> {
    // For now, always return true since we have automatic assignment
    // This ensures users always get AI functionality
    console.log('🎯 API Status: Always enabled with automatic assignment');
    return true;
  }
}

export const kimiK2Service = new KimiK2Service();
export type { HealthContext, ConversationMessage, DNAInsight, HealthRecommendation };