/**
 * Groq AI Service (FREE Tier)
 * Uses Groq's free API with Llama 3 8B model
 * Perfect for free tier users - zero AI costs
 */

const Groq = require('groq-sdk');
const { buildCondensedRangesPrompt } = require('../utils/clinicalRangesPrompt');

class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;

    if (!this.apiKey) {
      console.warn('⚠️ GROQ_API_KEY not configured. Free tier will use fallback.');
      // For now, we'll use a simple fallback for free tier
      this.useFallback = true;
    } else {
      this.client = new Groq({
        apiKey: this.apiKey
      });
      this.useFallback = false;
    }

    this.model = 'llama3-8b-8192'; // Llama 3 8B with 8K context
    console.log(`✅ Groq Service initialized: ${this.model}`);
  }

  /**
   * Generate health response using Groq Llama 3
   */
  async generateResponse(message, conversationHistory = [], healthContext = null) {
    // If Groq not configured, use simple fallback responses
    if (this.useFallback) {
      return this.getFallbackResponse(message);
    }

    try {
      // Build system prompt (simpler than Claude for free tier)
      const systemPrompt = this.buildSystemPrompt(healthContext);

      // Format messages for Groq API
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        }
      ];

      // Add conversation history (limit to last 5 messages to save tokens)
      if (conversationHistory && conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-5);
        recentHistory.forEach(msg => {
          if (msg.role === 'user' || msg.role === 'assistant') {
            messages.push({
              role: msg.role,
              content: msg.content || msg.text
            });
          }
        });
      }

      // Add current message
      messages.push({
        role: 'user',
        content: message
      });

      // Call Groq API
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1
      });

      const responseText = response.choices[0]?.message?.content || 'No response generated';

      // Estimate tokens (Groq API doesn't return usage in free tier)
      const tokensUsed = this.estimateTokens(message, responseText);

      return {
        text: responseText,
        tokensUsed: tokensUsed,
        model: this.model
      };

    } catch (error) {
      console.error('Groq API error:', error);

      // Fallback to simple responses on error
      return this.getFallbackResponse(message);
    }
  }

  /**
   * Build system prompt for Groq (simpler than Claude)
   */
  buildSystemPrompt(healthContext) {
    let prompt = `You are Hodie Health Assistant, a helpful Australian health and wellness advisor.

Guidelines:
- Use Australian English
- Be friendly and supportive
- Recommend consulting a GP for medical decisions
- Provide practical, actionable advice
- Use metric units

You can help with:
- Nutrition and diet advice
- Exercise and fitness tips
- Sleep and recovery guidance
- Mental wellbeing support
- General health questions
- Lab results interpretation using HODIE clinical ranges

${buildCondensedRangesPrompt()}`;

    // Add minimal context (save tokens on free tier)
    if (healthContext?.recentHealthData) {
      prompt += `\n\nUser's recent health data: ${JSON.stringify(healthContext.recentHealthData)}`;
    }

    return prompt;
  }

  /**
   * Fallback responses when Groq API is not available
   * Simple rule-based responses for common health questions
   */
  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Simple keyword matching for common questions
    const responses = {
      sleep: "For better sleep, try maintaining a consistent bedtime, avoiding screens 1 hour before bed, keeping your room cool and dark, and avoiding caffeine after 2pm. If sleep issues persist, consult your GP. 😴",

      exercise: "Aim for 150 minutes of moderate exercise per week, or 75 minutes of vigorous activity. This could be brisk walking, swimming, cycling, or sports. Start small and gradually increase. Check with your GP before starting a new exercise program. 🏃",

      diet: "A balanced Australian diet includes plenty of vegetables, fruits, whole grains, lean proteins, and healthy fats. Try to limit processed foods, sugary drinks, and excess salt. The Australian Dietary Guidelines recommend 5 serves of vegetables and 2 serves of fruit daily. 🍎",

      water: "Aim for 2-3 litres of water daily in Australia's climate. Drink more when exercising or in hot weather. Water is best, but herbal teas count too. Signs of good hydration include pale yellow urine. 💧",

      stress: "To manage stress, try regular exercise, mindfulness or meditation, adequate sleep, social connection, and time outdoors. Deep breathing exercises can help in the moment. If stress is overwhelming, speak with your GP about mental health support options. 🧘",

      weight: "Healthy weight management combines balanced nutrition with regular physical activity. Focus on sustainable changes rather than quick fixes. Consult your GP or a dietitian for personalised advice based on your health status and goals. ⚖️"
    };

    // Check for keyword matches
    for (const [keyword, response] of Object.entries(responses)) {
      if (lowerMessage.includes(keyword)) {
        return {
          text: response + "\n\n_This is a basic response. Upgrade to a paid plan for personalised AI-powered health analysis._",
          tokensUsed: 200,
          model: 'fallback'
        };
      }
    }

    // Default response
    return {
      text: "I'm here to help with your health questions! I can provide advice on sleep, exercise, nutrition, stress management, and general wellness. For personalised AI-powered analysis of your health data, consider upgrading to a paid plan.\n\nWhat would you like to know about? 😊\n\n_Free tier: Limited to 10 messages/month. Upgrade for unlimited AI conversations._",
      tokensUsed: 150,
      model: 'fallback'
    };
  }

  /**
   * Estimate tokens used (rough calculation)
   */
  estimateTokens(inputMessage, outputMessage) {
    // Rough estimate: 1 token ≈ 4 characters
    const inputTokens = Math.ceil(inputMessage.length / 4);
    const outputTokens = Math.ceil(outputMessage.length / 4);
    return inputTokens + outputTokens;
  }
}

module.exports = GroqService;
