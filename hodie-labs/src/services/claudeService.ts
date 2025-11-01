import Anthropic from '@anthropic-ai/sdk';

interface HealthContext {
  userId: string;
  recentHealthData?: {
    steps?: number;
    sleep?: number;
    mood?: string;
    healthScore?: number;
  };
}

class ClaudeService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.REACT_APP_CLAUDE_API_KEY,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });
  }

  async generateHealthResponse(
    userMessage: string, 
    context?: HealthContext,
    conversationHistory?: { role: 'user' | 'assistant'; content: string }[]
  ): Promise<string> {
    try {
      // Build system prompt with health context
      const systemPrompt = this.buildSystemPrompt(context);
      
      // Build conversation messages
      const messages: Anthropic.Messages.MessageParam[] = [];
      
      // Add conversation history if provided
      if (conversationHistory && conversationHistory.length > 0) {
        conversationHistory.slice(-10).forEach(msg => { // Keep last 10 messages for context
          messages.push({
            role: msg.role,
            content: msg.content
          });
        });
      }
      
      // Add current user message
      messages.push({
        role: 'user',
        content: userMessage
      });

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.7,
        system: systemPrompt,
        messages: messages
      });

      // Extract text from response
      const textContent = response.content.find(
        (content): content is Anthropic.TextBlock => content.type === 'text'
      );

      return textContent?.text || 'I apologize, but I encountered an error processing your request.';

    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error('Failed to get response from Claude AI');
    }
  }

  private buildSystemPrompt(context?: HealthContext): string {
    let systemPrompt = `You are a helpful health and wellness assistant for Hodie Labs, a health tracking platform. 

Key guidelines:
- Provide helpful, evidence-based health information
- Always remind users that your advice is general and they should consult healthcare professionals for medical concerns
- Be encouraging and supportive about health goals
- If you don't know something, admit it rather than guessing
- Keep responses concise but informative
- Focus on preventive health, wellness, and lifestyle improvements
- Never diagnose medical conditions or prescribe treatments

You can help with:
- General health and wellness questions
- Exercise and fitness guidance
- Nutrition and diet information
- Sleep hygiene tips
- Stress management techniques
- Interpreting general health metrics and trends
- Goal setting for health improvements`;

    // Add user-specific context if available
    if (context) {
      systemPrompt += `\n\nUser Context (User ID: ${context.userId}):`;
      
      if (context.recentHealthData) {
        const { steps, sleep, mood, healthScore } = context.recentHealthData;
        systemPrompt += `\nRecent health data:`;
        if (steps) systemPrompt += `\n- Steps: ${steps.toLocaleString()}`;
        if (sleep) systemPrompt += `\n- Sleep: ${sleep} hours`;
        if (mood) systemPrompt += `\n- Mood: ${mood}`;
        if (healthScore) systemPrompt += `\n- Health Score: ${healthScore}/100`;
        
        systemPrompt += `\n\nYou can reference this data when providing personalized advice, but remember to keep suggestions general and encourage professional consultation for specific health concerns.`;
      }
    }

    return systemPrompt;
  }

  // Health-specific prompt templates
  generateHealthQuestion(topic: string): string {
    const templates = {
      sleep: "I'd like to improve my sleep quality. What are some evidence-based strategies?",
      exercise: "What's a good exercise routine for someone just starting their fitness journey?",
      nutrition: "Can you help me understand the basics of healthy eating?",
      stress: "I've been feeling stressed lately. What are some healthy ways to manage stress?",
      hydration: "How much water should I be drinking daily, and why is it important?"
    };
    
    return templates[topic as keyof typeof templates] || `Tell me about ${topic} and how it affects my health.`;
  }
}

export const claudeService = new ClaudeService();