// Enhanced Intelligent Health Chat Service
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
  role: 'user' | 'assistant';
  content: string;
}

class EnhancedChatService {
  constructor() {
    console.log('🇦🇺 Hodie Health Assistant ready with Australian health guidance');
  }

  async generateHealthResponse(
    userMessage: string, 
    context?: HealthContext,
    conversationHistory?: ConversationMessage[]
  ): Promise<string> {
    try {
      return this.generateIntelligentResponse(userMessage, context, conversationHistory);
    } catch (error) {
      console.error('Chat error:', error);
      return 'I apologise, but I encountered an error processing your request. Please try asking your question again.';
    }
  }

  private generateIntelligentResponse(
    message: string, 
    healthContext?: HealthContext, 
    conversationHistory: ConversationMessage[] = []
  ): string {
    const lowerMessage = message.toLowerCase();
    const timeOfDay = new Date().getHours();
    const greeting = timeOfDay < 12 ? 'Good morning' : timeOfDay < 18 ? 'Good afternoon' : 'Good evening';
    
    // Personalisation based on health context
    let personalisation = '';
    if (healthContext?.recentHealthData?.healthScore) {
      const { healthScore } = healthContext.recentHealthData;
      personalisation = `\n\n📊 **Your Health Score**: ${healthScore}/100`;
    }

    // Handle greetings and basic conversation
    if (this.isGreeting(lowerMessage)) {
      return `${greeting}! I'm your Hodie Health Assistant. I'm here to help with health and wellness questions using Australian health guidelines. 

🍎 I can help with nutrition, exercise, sleep, stress management, and general health advice.

What would you like to know about your health today?${personalisation}`;
    }

    // Handle thank you messages
    if (this.isThankYou(lowerMessage)) {
      return `You're very welcome! I'm here whenever you need health guidance. Take care and remember - small consistent changes make the biggest difference to your health! 🌟${personalisation}`;
    }

    // Handle non-health related questions
    if (this.isNonHealthQuestion(lowerMessage)) {
      return this.handleNonHealthQuestion(message, greeting, personalisation);
    }

    // Check for health topics with more flexible matching
    const healthTopic = this.identifyHealthTopic(lowerMessage);
    if (healthTopic) {
      return this.getHealthAdvice(healthTopic, message, greeting, personalisation);
    }

    // Default response for unclear questions
    return this.getDefaultResponse(message, greeting, personalisation);
  }

  private isGreeting(message: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'g\'day', 'howdy'];
    return greetings.some(greeting => message.includes(greeting));
  }

  private isThankYou(message: string): boolean {
    const thanks = ['thank', 'thanks', 'cheers', 'appreciate', 'grateful'];
    return thanks.some(thank => message.includes(thank));
  }

  private isNonHealthQuestion(message: string): boolean {
    const nonHealthKeywords = [
      'weather', 'time', 'date', 'movie', 'music', 'sport', 'football', 'cricket', 'politics', 
      'travel', 'holiday', 'work', 'job', 'school', 'university', 'car', 'computer', 'phone',
      'shopping', 'restaurant', 'recipe', 'cooking', 'baking', 'pet', 'dog', 'cat', 'news'
    ];
    return nonHealthKeywords.some(keyword => message.includes(keyword));
  }

  private handleNonHealthQuestion(message: string, greeting: string, personalisation: string): string {
    const responses = [
      `${greeting}! That's an interesting question, but I'm specifically designed to help with health and wellness topics. 

🏥 I can provide advice on nutrition, exercise, sleep, stress management, and general health using Australian guidelines.

Is there anything health-related I can help you with today?`,
      
      `${greeting}! While that sounds like a great topic, I focus on health and wellness guidance.

🍎 I'd love to help with questions about diet, fitness, sleep, mental wellbeing, or any other health concerns you might have.

What would you like to know about your health?`,
      
      `${greeting}! I'm your health assistant, so I'm best at answering health and wellness questions.

💡 I can help with things like meal planning, exercise routines, sleep improvement, stress management, or general health advice.

How can I support your health journey today?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + personalisation;
  }

  private identifyHealthTopic(message: string): string | null {
    const topicMap = {
      'nutrition': ['food', 'eat', 'diet', 'nutrition', 'meal', 'hungry', 'snack', 'vitamin', 'protein', 'carb', 'fat'],
      'exercise': ['exercise', 'workout', 'gym', 'fitness', 'training', 'run', 'walk', 'swim', 'sport', 'muscle', 'strength'],
      'sleep': ['sleep', 'tired', 'rest', 'insomnia', 'dream', 'nap', 'bed', 'wake'],
      'stress': ['stress', 'anxiety', 'worried', 'overwhelmed', 'mental health', 'depression', 'mood'],
      'hydration': ['water', 'drink', 'hydrat', 'thirst', 'fluid'],
      'general': ['health', 'wellness', 'advice', 'tips', 'help', 'doctor', 'medical']
    };

    for (const [topic, keywords] of Object.entries(topicMap)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        return topic;
      }
    }
    return null;
  }

  private getHealthAdvice(topic: string, originalMessage: string, greeting: string, personalisation: string): string {
    const message = originalMessage.toLowerCase();
    
    switch (topic) {
      case 'nutrition':
        return this.getNutritionAdvice(message, greeting, personalisation);
      case 'exercise':
        return this.getExerciseAdvice(message, greeting, personalisation);
      case 'sleep':
        return this.getSleepAdvice(message, greeting, personalisation);
      case 'stress':
        return this.getStressAdvice(message, greeting, personalisation);
      case 'hydration':
        return this.getHydrationAdvice(message, greeting, personalisation);
      default:
        return this.getGeneralHealthAdvice(message, greeting, personalisation);
    }
  }

  private getNutritionAdvice(message: string, greeting: string, personalisation: string): string {
    if (message.includes('weight loss') || message.includes('lose weight')) {
      return `${greeting}! For healthy weight management:

🥗 **Focus on these foods:**
• Plenty of vegetables (aim for variety and colour)
• Lean proteins (chicken, fish, legumes, tofu)
• Wholegrains (brown rice, quinoa, oats)
• Healthy fats in moderation (avocado, nuts, olive oil)

💡 **Key strategies:**
• Eat slowly and mindfully
• Stay hydrated
• Regular meal times
• Fill half your plate with vegetables

Always consult your GP before starting any weight loss program.${personalisation}`;
    }

    if (message.includes('muscle') || message.includes('protein') || message.includes('gain')) {
      return `${greeting}! For muscle building:

💪 **Protein sources** (1.6-2.2g per kg body weight):
• Lean meats, fish, eggs
• Greek yoghurt, cottage cheese
• Lentils, chickpeas, quinoa
• Nuts and protein powder

⏰ **Timing:** Include protein with each meal and especially after workouts.

🥤 **Stay hydrated:** Extra water during training days.${personalisation}`;
    }

    return `${greeting}! For optimal nutrition:

🥬 **Vegetables:** 5+ serves daily (mix of colours and types)
🍎 **Fruits:** 2+ serves daily (fresh Australian seasonal options)
🐟 **Proteins:** Include with each meal (fish, chicken, legumes, nuts)
🌾 **Wholegrains:** Choose brown rice, quinoa, wholemeal bread

Consider seeing an Accredited Practising Dietitian for personalised advice.${personalisation}`;
  }

  private getExerciseAdvice(message: string, greeting: string, personalisation: string): string {
    if (message.includes('beginner') || message.includes('start')) {
      return `${greeting}! Great decision to start exercising!

🚶 **Week 1-2:** 15-20 minutes walking daily
💪 **Week 3-4:** Add bodyweight exercises (squats, push-ups)
🏃 **Week 5+:** Build up to 150+ minutes moderate activity weekly

Start slowly and consult your GP before beginning any new exercise program.${personalisation}`;
    }

    return `${greeting}! For a balanced fitness approach:

🏃 **Cardio:** 150+ minutes moderate activity weekly (walking, swimming, cycling)
💪 **Strength:** 2-3 times per week (weights or bodyweight exercises)
🧘 **Flexibility:** Daily stretching or yoga

Find activities you enjoy - that's the key to consistency!${personalisation}`;
  }

  private getSleepAdvice(message: string, greeting: string, personalisation: string): string {
    return `${greeting}! Quality sleep is essential for health:

🌙 **Sleep hygiene:**
• Consistent bedtime and wake time
• Cool bedroom (18-21°C)
• Dark, quiet environment
• No screens 1-2 hours before bed

⏰ **Aim for 7-9 hours** nightly.

If sleep problems persist, consult your GP.${personalisation}`;
  }

  private getStressAdvice(message: string, greeting: string, personalisation: string): string {
    return `${greeting}! For stress management:

🧘 **Immediate relief:**
• Deep breathing exercises
• 10-minute walk
• Mindfulness or meditation

💬 **Support available:**
• Your GP for assessment
• Lifeline: 13 11 14
• Beyond Blue: 1300 22 4636

Remember: Seeking help is a sign of strength.${personalisation}`;
  }

  private getHydrationAdvice(message: string, greeting: string, personalisation: string): string {
    return `${greeting}! For proper hydration:

💧 **Daily target:** 8-10 glasses (2-2.5L)
🏃 **Exercise days:** Extra 500-750ml per hour of activity
🌡️ **Hot weather:** Increase intake (important in Australian climate)

Australian tap water is excellent quality!${personalisation}`;
  }

  private getGeneralHealthAdvice(message: string, greeting: string, personalisation: string): string {
    return `${greeting}! Here are key health fundamentals:

🍎 **Nutrition:** Balanced diet with plenty of vegetables and fruits
🏃 **Exercise:** 150+ minutes moderate activity weekly
😴 **Sleep:** 7-9 hours with good sleep hygiene
💧 **Hydration:** 8-10 glasses of water daily
🧘 **Mental health:** Stress management and social connections

For specific concerns, consult your GP or call Healthdirect: 1800 022 222${personalisation}`;
  }

  private getDefaultResponse(message: string, greeting: string, personalisation: string): string {
    return `${greeting}! I'm not quite sure how to help with that specific question, but I'm here to provide health and wellness guidance.

🏥 **I can help with:**
• Nutrition and healthy eating
• Exercise and fitness advice
• Sleep improvement strategies
• Stress management techniques
• General health and wellness tips

💡 **Try asking:** "What should I eat for better health?" or "How can I improve my sleep?"

Is there a health topic I can help you with?${personalisation}`;
  }

  // Health-specific question templates for quick buttons
  generateHealthQuestion(topic: string): string {
    const templates = {
      sleep: "How can I improve my sleep quality?",
      exercise: "What exercise routine should I start with?", 
      nutrition: "What foods should I eat for optimal health?",
      stress: "How can I manage stress better?",
      hydration: "How much water should I drink daily?"
    };
    
    return templates[topic as keyof typeof templates] || `Tell me about ${topic} and how it affects my health.`;
  }
}

export const enhancedChatService = new EnhancedChatService();
export type { HealthContext, ConversationMessage };