// Advanced AI Chat Service using Groq API
interface HealthContext {
  userId: string;
  recentHealthData?: {
    steps?: number;
    sleep?: number;
    mood?: string;
    healthScore?: number;
  };
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class GroqChatService {
  private apiKey: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1';
  private model: string = 'llama3-70b-8192'; // Free high-performance model

  constructor() {
    // Get API key from environment variable
    this.apiKey = process.env.REACT_APP_GROQ_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ Groq API key not configured. Get one free at https://console.groq.com');
      console.warn('Add REACT_APP_GROQ_API_KEY=your_key to .env file');
    } else {
      console.log('✅ Groq AI enabled - advanced conversational responses available');
    }
  }

  async generateHealthResponse(
    userMessage: string,
    context?: HealthContext,
    conversationHistory: ConversationMessage[] = []
  ): Promise<string> {
    try {
      // If no API key, fall back to enhanced local responses
      if (!this.apiKey) {
        return this.generateFallbackResponse(userMessage, context);
      }

      // Build conversation context
      const messages = this.buildConversationContext(userMessage, context, conversationHistory);

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
          max_tokens: 500,
          top_p: 1,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || this.generateFallbackResponse(userMessage, context);

    } catch (error) {
      console.error('Groq API error:', error);
      return this.generateFallbackResponse(userMessage, context);
    }
  }

  private buildConversationContext(
    userMessage: string,
    context?: HealthContext,
    conversationHistory: ConversationMessage[] = []
  ): ConversationMessage[] {
    const timeOfDay = new Date().getHours();
    const greeting = timeOfDay < 12 ? 'Good morning' : timeOfDay < 18 ? 'Good afternoon' : 'Good evening';
    
    // System prompt with Australian health context
    const systemPrompt = `You are Hodie Health Assistant, an expert Australian health and wellness advisor. 

KEY GUIDELINES:
- Use Australian English spelling (colour, realise, GP, chemist, etc.)
- Reference Australian health guidelines, Medicare, and local resources
- Be conversational, helpful, and supportive
- Focus on evidence-based health advice
- Always suggest consulting a GP for serious concerns
- Use appropriate Australian health contact numbers (Healthdirect: 1800 022 222, Lifeline: 13 11 14)

CONVERSATION STYLE:
- Be natural and conversational, not robotic
- Remember previous messages in the conversation
- Ask follow-up questions when helpful
- Provide specific, actionable advice
- Use emojis sparingly but appropriately

HEALTH CONTEXT: ${context?.recentHealthData ? 
  `User's recent health data: ${context.recentHealthData.steps || 'N/A'} steps, ${context.recentHealthData.sleep || 'N/A'} hours sleep, mood: ${context.recentHealthData.mood || 'N/A'}, health score: ${context.recentHealthData.healthScore || 'N/A'}/100` : 
  'No recent health data available'}

Current time: ${greeting}`;

    // Build conversation with recent history
    const messages: ConversationMessage[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Add recent conversation history (last 6 messages to stay within token limits)
    const recentHistory = conversationHistory.slice(-6);
    messages.push(...recentHistory);

    // Add current user message
    messages.push({ role: 'user', content: userMessage });

    return messages;
  }

  private generateFallbackResponse(userMessage: string, context?: HealthContext): string {
    const lowerMessage = userMessage.toLowerCase();
    const timeOfDay = new Date().getHours();
    const greeting = timeOfDay < 12 ? 'Good morning' : timeOfDay < 18 ? 'Good afternoon' : 'Good evening';

    // AI Status Warning
    const aiWarning = "\n\n⚠️ **Limited AI Mode**: For advanced conversational responses, add your free Groq API key (see SETUP_REAL_AI.md)";

    // Personalization
    let personalisation = '';
    if (context?.recentHealthData?.healthScore) {
      personalisation = `\n\n📊 **Your Health Score**: ${context.recentHealthData.healthScore}/100`;
    }

    // Greetings
    if (this.isGreeting(lowerMessage)) {
      return `${greeting}! I'm your Hodie Health Assistant. I can help with nutrition, exercise, sleep, and wellness questions using Australian health guidelines. What would you like to know?${personalisation}${aiWarning}`;
    }

    // Cooking/meal prep questions
    if (lowerMessage.includes('cook') || lowerMessage.includes('recipe') || lowerMessage.includes('make') || lowerMessage.includes('prepare')) {
      return `${greeting}! Here are some healthy Australian meal ideas:

🍳 **Quick Breakfast Options:**
• Avocado toast with tomato on wholegrain bread
• Greek yoghurt with berries and nuts
• Veggie scrambled eggs with spinach

🥗 **Simple Lunch Ideas:**
• Tuna and bean salad with rocket
• Chicken and vegetable soup
• Quinoa bowl with roasted vegetables

🍽️ **Easy Dinner Meals:**
• Grilled barramundi with steamed broccoli and sweet potato
• Stir-fried tofu with Asian greens and brown rice
• Lean beef with roasted pumpkin and green beans

💡 **Cooking Tips:**
• Batch cook on weekends
• Use herbs and spices instead of salt
• Steam or grill rather than frying

Would you like a specific recipe for any of these?${personalisation}${aiWarning}`;
    }

    // Food/nutrition questions  
    if (lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('nutrition') || lowerMessage.includes('protein')) {
      return `${greeting}! For optimal nutrition:

🥬 **Vegetables:** 5+ serves daily (fill half your plate)
🍎 **Fruits:** 2+ serves daily (choose seasonal Australian varieties)
🐟 **Proteins:** Include with each meal (fish, chicken, legumes, nuts)
🌾 **Wholegrains:** Brown rice, quinoa, wholemeal bread
💧 **Water:** 8-10 glasses daily

💡 **Protein per meal:** Aim for 20-30g (palm-sized portion of meat/fish, or 1 cup legumes)

Consider seeing an Accredited Practising Dietitian for personalised meal plans.${personalisation}${aiWarning}`;
    }

    // Exercise questions
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('fitness')) {
      return `${greeting}! For a balanced fitness routine:

🏃 **Cardio:** 150+ minutes moderate activity weekly
💪 **Strength:** 2-3 times per week
🧘 **Flexibility:** Daily stretching

Start with activities you enjoy - walking, swimming, or cycling are great options!${personalisation}${aiWarning}`;
    }

    // Default health advice
    return `${greeting}! I'd be happy to help with your health question. For specific advice, I recommend consulting your GP.

🏥 **Quick Health Reminders:**
• Balanced nutrition with plenty of vegetables
• Regular physical activity
• 7-9 hours quality sleep
• Stay hydrated
• Manage stress effectively

Is there a particular health topic you'd like to discuss?${personalisation}${aiWarning}`;
  }

  private isGreeting(message: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'g\'day'];
    return greetings.some(greeting => message.includes(greeting));
  }

  // Check API status
  async checkApiStatus(): Promise<boolean> {
    if (!this.apiKey) return false;
    
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const groqChatService = new GroqChatService();
export type { HealthContext, ConversationMessage };