// Completely Free AI Chat Service - No Registration Required
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

class FreeChatService {
  private baseUrl: string = 'https://api-inference.huggingface.co/models'; 
  private model: string = 'microsoft/DialoGPT-medium'; // Free conversational model
  private fallbackModel: string = 'facebook/blenderbot-400M-distill';

  constructor() {
    console.log('🆓 Free AI Chat enabled - using public Hugging Face models');
  }

  async generateHealthResponse(
    userMessage: string,
    context?: HealthContext,
    conversationHistory: ConversationMessage[] = []
  ): Promise<string> {
    try {
      // First try to get an AI response
      const aiResponse = await this.tryAIResponse(userMessage, conversationHistory);
      if (aiResponse) {
        return this.refineHealthResponse(aiResponse, userMessage, context);
      }
    } catch (error) {
      console.log('AI service unavailable, using enhanced local responses');
    }
    
    // Fall back to enhanced local responses
    return this.generateEnhancedResponse(userMessage, context, conversationHistory);
  }

  private async tryAIResponse(userMessage: string, conversationHistory: ConversationMessage[]): Promise<string | null> {
    try {
      // Try the primary model first
      const healthPrompt = this.buildHealthPrompt(userMessage, conversationHistory);
      
      const response = await fetch(`${this.baseUrl}/${this.model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: healthPrompt,
          parameters: {
            max_length: 200,
            temperature: 0.7,
            do_sample: true
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data[0]?.generated_text || null;
      }
      
      // Try fallback model
      const fallbackResponse = await fetch(`${this.baseUrl}/${this.fallbackModel}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: userMessage,
          parameters: {
            max_length: 150,
            temperature: 0.8
          }
        })
      });

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        return fallbackData[0]?.generated_text || null;
      }

      return null;
    } catch {
      return null;
    }
  }

  private buildHealthPrompt(userMessage: string, conversationHistory: ConversationMessage[]): string {
    // Simple prompt for free models
    const recentContext = conversationHistory.slice(-2).map(msg => msg.content).join(' ');
    return `Australian health assistant helping with: ${userMessage}. Previous context: ${recentContext}. Provide helpful health advice using Australian terms:`;
  }

  private refineHealthResponse(aiResponse: string, userMessage: string, context?: HealthContext): string {
    // Clean and enhance AI response
    let refined = aiResponse
      .replace(/\bcolor\b/gi, 'colour')
      .replace(/\brealise\b/gi, 'realise')
      .replace(/\borganize\b/gi, 'organise')
      .replace(/\bcentre\b/gi, 'centre')
      .replace(/\bdoctor\b/gi, 'GP')
      .replace(/\bpharmacy\b/gi, 'chemist');

    // Remove any duplicate prompts that might be included
    const promptIndex = refined.indexOf('Australian health assistant');
    if (promptIndex > -1) {
      refined = refined.substring(promptIndex + 100); // Skip past prompt
    }

    // Ensure it starts properly
    if (!refined.trim()) {
      return this.generateEnhancedResponse(userMessage, context, []);
    }

    // Add proper greeting if not present
    const timeOfDay = new Date().getHours();
    const greeting = timeOfDay < 12 ? 'Good morning' : timeOfDay < 18 ? 'Good afternoon' : 'Good evening';
    
    if (!refined.toLowerCase().includes('good morning') && !refined.toLowerCase().includes('good afternoon') && !refined.toLowerCase().includes('good evening')) {
      refined = `${greeting}! ${refined}`;
    }

    // Add emoji for readability
    if (!refined.includes('🥗') && !refined.includes('🏃') && !refined.includes('💧') && !refined.includes('😴')) {
      if (userMessage.toLowerCase().includes('food') || userMessage.toLowerCase().includes('eat') || userMessage.toLowerCase().includes('protein')) {
        refined = '🥗 ' + refined;
      } else if (userMessage.toLowerCase().includes('exercise') || userMessage.toLowerCase().includes('workout')) {
        refined = '🏃 ' + refined;
      } else if (userMessage.toLowerCase().includes('sleep')) {
        refined = '😴 ' + refined;
      } else {
        refined = '🏥 ' + refined;
      }
    }

    // Add disclaimer if not present
    if (!refined.includes('GP') && !refined.includes('health professional') && !refined.includes('consult')) {
      refined += '\n\n💡 For personalised advice, consult your GP.';
    }

    return refined;
  }

  private generateEnhancedResponse(userMessage: string, context?: HealthContext, conversationHistory: ConversationMessage[] = []): string {
    const lowerMessage = userMessage.toLowerCase();
    const timeOfDay = new Date().getHours();
    const greeting = timeOfDay < 12 ? 'Good morning' : timeOfDay < 18 ? 'Good afternoon' : 'Good evening';

    // Personalization
    let personalisation = '';
    if (context?.recentHealthData?.healthScore) {
      personalisation = `\n\n📊 **Your Health Score**: ${context.recentHealthData.healthScore}/100`;
    }

    // Check conversation context for better responses
    const previousMessages = conversationHistory.slice(-3).map(msg => msg.content.toLowerCase()).join(' ');
    const isFollowUp = previousMessages.includes('food') || previousMessages.includes('eat') || previousMessages.includes('meal');

    // Protein-specific response
    if (lowerMessage.includes('protein') || (lowerMessage.includes('much') && lowerMessage.includes('per meal'))) {
      const specificResponse = isFollowUp ? 
        "Based on what we discussed about nutrition, here's how to calculate your protein per meal:" :
        "For protein intake per meal:";
        
      return `🥗 ${greeting}! ${specificResponse}

**Target**: 20-30g protein per meal for most adults

**Easy Protein Calculations**:
• **Palm-sized protein** = 20-25g (chicken, fish, lean meat)
• **1 cup cooked legumes** = 15-18g (lentils, chickpeas, beans)
• **2 large eggs** = 12g protein
• **1 cup Greek yoghurt** = 20g protein
• **100g tofu/tempeh** = 15g protein

**Quick Check**: Your protein portion should be about the size of your palm and thickness of your hand.

${isFollowUp ? 'This should help you plan those meals we talked about!' : 'Consider seeing an Accredited Practising Dietitian for personalised recommendations based on your activity level.'}${personalisation}`;
    }

    // Cooking/meal prep questions with context awareness
    if (lowerMessage.includes('cook') || lowerMessage.includes('recipe') || lowerMessage.includes('make') || lowerMessage.includes('prepare') || lowerMessage.includes('how')) {
      const isProteinFollowUp = previousMessages.includes('protein') || lowerMessage.includes('those');
      const contextualIntro = isProteinFollowUp ? 
        "Perfect! Here are some high-protein meal ideas that meet those targets:" :
        "Here are healthy meal ideas:";
        
      return `🍳 ${greeting}! ${contextualIntro}

**High-Protein Meals (20-30g protein each)**:
• **Grilled chicken breast** (100g) with quinoa and steamed broccoli = 25g protein
• **Salmon fillet** (120g) with sweet potato and green beans = 26g protein  
• **Tofu stir-fry** (150g tofu) with brown rice and mixed vegetables = 22g protein
• **Greek yoghurt bowl** (1 cup) with berries, nuts and seeds = 20g protein

**Quick Cooking Methods**:
• **Batch cooking**: Grill several chicken breasts on Sunday
• **Sheet pan meals**: Protein + vegetables roasted together
• **Meal prep containers**: Pre-portion your proteins
• **One-pot meals**: Lentil curry, chicken and vegetable soup

**Flavour boosters**: Fresh herbs (coriander, parsley), spices (turmeric, paprika), lemon juice, garlic.

${isProteinFollowUp ? 'These should give you the protein amounts we just discussed!' : 'Would you like a specific recipe for any of these?'}${personalisation}`;
    }

    // Default response
    return `🏥 ${greeting}! I'd be happy to help with your health question. For specific advice, I recommend consulting your GP.

**Quick Health Tips**:
• Balanced nutrition with plenty of vegetables
• Regular physical activity (150+ minutes weekly)
• 7-9 hours quality sleep
• Stay hydrated (8-10 glasses daily)
• Manage stress effectively

Is there a particular health topic you'd like to discuss?${personalisation}`;
  }

  // Check if service is available
  async checkServiceStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const freeChatService = new FreeChatService();
export type { HealthContext, ConversationMessage };