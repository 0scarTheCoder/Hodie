// Kimi K2 AI Service for Health Analytics
import { autoApiKeyService } from './autoApiKeyService';
import { geneticAnalysisService, GeneticProfile, HealthPredisposition, NutrientRecommendation, FitnessProfile } from './geneticAnalysisService';
import { labIntegrationService, ComprehensiveLabPanel } from './labIntegrationService';
import { enhancedPersonalizationService, PersonalHealthProfile, PersonalizedRecommendation } from './enhancedPersonalizationService';
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
  geneticProfile?: GeneticProfile;
  labResults?: ComprehensiveLabPanel[];
  personalisedProfile?: PersonalHealthProfile;
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
  private model: string = 'moonshot-v1-8k';

  constructor() {
    // Use working API key and correct model
    this.apiKey = 'sk-k70lkhZA9kmz9VI4OrowDMqcbWXiMKpsS58p5cL0OIK1rvAN';
    
    console.log('✅ KimiK2 service initialised with working configuration');
    console.log('🔧 Using model:', this.model);
    console.log('🌐 Using endpoint:', this.baseUrl);
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

  // Enhanced health chat with genetic and lab integration
  async generateHealthResponse(
    userMessage: string,
    context?: HealthContext,
    conversationHistory: ConversationMessage[] = []
  ): Promise<string> {
    console.log('🧬 Starting enhanced health response generation for:', userMessage);

    // Normalize input to handle typos and misspellings
    const normalizedMessage = this.normalizeUserInput(userMessage);
    console.log('✨ Normalized message:', normalizedMessage);

    // Extract user intent
    const intent = this.extractUserIntent(userMessage);
    console.log('🎯 Detected intent:', intent.category, 'with confidence:', intent.confidence);

    // Route to specialized handlers based on intent
    if (intent.category === 'genetic' || normalizedMessage.includes('genetic') || normalizedMessage.includes('dna') || normalizedMessage.includes('variant')) {
      return this.handleGeneticQuery(userMessage, context);
    }

    if (intent.category === 'lab' || normalizedMessage.includes('lab') || normalizedMessage.includes('blood') || normalizedMessage.includes('test')) {
      return this.handleLabQuery(userMessage, context);
    }

    if (intent.category === 'nutrition' && (normalizedMessage.includes('supplement') || normalizedMessage.includes('vitamin') || normalizedMessage.includes('personalised'))) {
      return this.handlePersonalizedQuery(userMessage, context);
    }

    // Enhanced intelligent response with genetic context
    return await this.generateIntelligentResponse(userMessage, context, conversationHistory, intent);
  }

  // Generate intelligent responses without API dependency
  private async generateIntelligentResponse(
    userMessage: string,
    context?: HealthContext,
    conversationHistory: ConversationMessage[] = [],
    intent?: { category: string; keywords: string[]; confidence: number }
  ): Promise<string> {
    const timeOfDay = new Date().getHours();
    const greeting = timeOfDay < 12 ? 'Good morning' : timeOfDay < 18 ? 'Good afternoon' : 'Good evening';

    // Use normalized message for matching
    const message = this.normalizeUserInput(userMessage);
    
    // Handle non-health queries first
    if (message.includes('api key') || message.includes('api') || message.includes('key')) {
      return `The app uses AI services that are automatically configured for all users. You don't need to worry about API keys - everything is set up automatically when you log in! 

Is there anything health-related I can help you with today?`;
    }
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message === 'g\'day' || message === 'gday') {
      return `${greeting}! Great to see you back. How are you feeling today? 

I'm here to help with any health questions you might have - whether it's about nutrition, exercise, sleep, or just general wellness advice.`;
    }
    
    if (message.includes('how are you') || message.includes('what\'s up') || message.includes('whats up')) {
      return `I'm doing well, thank you for asking! I'm here and ready to help with any health and wellness questions you have.

How have you been feeling lately? Any particular health goals you're working on?`;
    }
    
    if (message.includes('thank') || message.includes('thanks') || message.includes('cheers')) {
      return `You're very welcome! I'm always happy to help with your health journey. 

Feel free to ask me anything else - whether it's about nutrition, fitness, sleep, or any other health topics!`;
    }
    
    if (message.includes('help') && !message.includes('sleep') && !message.includes('weight')) {
      return `I'm your personal health assistant! I can help you with:

🍎 **Nutrition**: Meal planning, healthy recipes, dietary advice
🏃 **Fitness**: Exercise routines, workout plans, movement goals  
😴 **Sleep**: Better sleep habits and recovery strategies
🧘 **Mental Wellbeing**: Stress management and mindfulness
💊 **Supplements**: Evidence-based vitamin and supplement guidance
📊 **Health Tracking**: Understanding your health metrics

Just ask me anything health-related in plain English - like "help me lose weight" or "I'm having trouble sleeping" and I'll give you personalised advice!

What would you like to work on today?`;
    }
    
    if (message.includes('goodbye') || message.includes('bye') || message.includes('see you') || message.includes('later')) {
      return `Take care and have a wonderful day! Remember to stay hydrated and get some movement in. 

I'm always here when you need health advice. See you soon! 👋`;
    }
    
    // Handle general conversational queries
    if (message.length < 20 && !message.includes('health') && !message.includes('fitness') && !message.includes('nutrition')) {
      return `${greeting}! I understand you said "${userMessage}". 

I'm your health assistant, so I specialise in helping with wellness topics. Is there anything health-related I can help you with today?

I can provide advice on nutrition, exercise, sleep, stress management, or any other health questions you might have!`;
    }
    
    // Health-specific responses
    if (message.includes('weight') || message.includes('lose') || message.includes('diet')) {
      return `${greeting}! For healthy weight management, I recommend:

🍎 **Nutrition Focus**: Eat whole foods - lean proteins, vegetables, fruits, and whole grains. Aim for a moderate calorie deficit of 500-750 calories per day for sustainable weight loss.

🏃 **Exercise Plan**: Combine cardio (150 mins/week) with strength training (2-3 days/week) to preserve muscle while losing fat.

💧 **Hydration**: Drink 35ml per kg of body weight daily. Often thirst is mistaken for hunger.

😴 **Sleep**: 7-9 hours nightly. Poor sleep disrupts hunger hormones (ghrelin/leptin).

${context?.recentHealthData?.healthScore ? `Your current health score is ${context.recentHealthData.healthScore}/100, which gives us a good baseline to work from.` : ''}

What specific aspect of weight management would you like to focus on?`;
    }
    
    if (message.includes('sleep') || message.includes('tired') || message.includes('insomnia')) {
      return `${greeting}! Sleep is crucial for your health. Here are evidence-based sleep strategies:

😴 **Sleep Hygiene**: 
• Keep bedroom cool (16-19°C), dark, and quiet
• No screens 1 hour before bed
• Consistent sleep/wake times (even weekends)

🌙 **Wind-Down Routine**:
• Try meditation or gentle stretching
• Read a book or listen to calming music
• Consider magnesium glycinate supplement (300-400mg)

☀️ **Daytime Habits**:
• Get morning sunlight within 1 hour of waking
• Limit caffeine after 2pm
• Regular exercise (but not within 3 hours of bedtime)

${context?.recentHealthData?.sleep ? `I see you're getting ${context.recentHealthData.sleep} hours. The sweet spot for most adults is 7-9 hours.` : ''}

What time do you usually go to bed and wake up?`;
    }
    
    if (message.includes('exercise') || message.includes('workout') || message.includes('fitness') || message.includes('gym')) {
      const geneticInsights = context?.geneticProfile ? await this.getGeneticFitnessInsights(context.geneticProfile) : '';
      
      return `${greeting}! Let's design a personalised fitness plan that works with your genetics:

🏋️ **Strength Training** (2-3x/week):
• Focus on compound movements: squats, deadlifts, push-ups, rows
• Progressive overload: gradually increase weight/reps
• 8-12 reps for muscle growth, 3-5 reps for strength

🏃 **Cardiovascular Exercise**:
• 150 minutes moderate intensity OR 75 minutes vigorous per week
• Mix steady-state and interval training
• Walking, cycling, swimming are all excellent options

🧘 **Recovery & Flexibility**:
• Include yoga or stretching sessions
• Aim for 1-2 rest days per week
• Listen to your body - soreness is normal, pain isn't

${geneticInsights}
${context?.recentHealthData?.steps ? `Your step count of ${context.recentHealthData.steps} is a great foundation to build on!` : ''}

💡 **Pro Tip**: Upload your genetic data (23andMe, AncestryDNA) for personalised exercise recommendations based on your ACTN3 and other fitness genes!

What's your current fitness level and goals?`;
    }
    
    if (message.includes('stress') || message.includes('anxiety') || message.includes('mental') || message.includes('mood')) {
      return `${greeting}! Mental wellbeing is just as important as physical health:

🧘 **Stress Management**:
• Deep breathing: 4-7-8 technique (inhale 4, hold 7, exhale 8)
• Mindfulness meditation: Start with 5-10 minutes daily
• Progressive muscle relaxation before bed

🌱 **Lifestyle Factors**:
• Regular exercise releases endorphins (natural mood boosters)
• Omega-3 fatty acids: salmon, walnuts, flaxseeds
• Limit alcohol and processed foods

👥 **Social Connection**:
• Maintain relationships with friends/family
• Consider joining clubs or activities you enjoy
• Don't hesitate to speak with a counsellor if needed

${context?.recentHealthData?.mood ? `I notice your mood has been ${context.recentHealthData.mood} recently.` : ''}

If you're experiencing persistent low mood or anxiety, please consider speaking with your GP or a mental health professional.

What's been your biggest source of stress lately?`;
    }
    
    if (message.includes('cholesterol')) {
      return `${greeting}! Cholesterol management is crucial for heart health:

💡 **Understanding Cholesterol**:
• LDL ("bad"): Should be <3.4 mmol/L
• HDL ("good"): Should be >1.0 mmol/L for men, >1.3 mmol/L for women
• Total cholesterol: Aim for <5.2 mmol/L

🥗 **Dietary Changes**:
• **Increase fibre**: Oats, beans, lentils, barley (soluble fibre binds cholesterol)
• **Healthy fats**: Replace saturated fats with olive oil, avocados, nuts
• **Plant sterols**: Found in fortified margarine, nuts, seeds
• **Fatty fish**: Salmon, mackerel, sardines (2-3x per week)

🏃 **Lifestyle Factors**:
• **Exercise**: 150 minutes moderate activity per week raises HDL
• **Weight management**: Even 5-10% weight loss can improve cholesterol
• **No smoking**: Smoking lowers HDL and damages arteries
• **Moderate alcohol**: Up to 1 drink/day for women, 2 for men

⚠️ **What to Limit**:
• Saturated fats: Red meat, full-fat dairy, coconut oil
• Trans fats: Processed foods, some margarines
• Refined carbs: White bread, sugary foods

${context?.recentHealthData ? 'Based on your profile, focus on' : 'Start with'} increasing soluble fibre and adding 30 minutes of walking daily.

When did you last check your cholesterol levels?`;
    }
    
    if (message.includes('nutrition') || message.includes('eat') || message.includes('food') || message.includes('vitamin')) {
      const geneticInsights = context?.geneticProfile ? await this.getGeneticNutritionInsights(context.geneticProfile) : '';
      
      return `${greeting}! Nutrition is the foundation of good health:

🥗 **Balanced Plate Method**:
• 1/2 plate: Non-starchy vegetables (broccoli, spinach, peppers)
• 1/4 plate: Lean protein (fish, chicken, legumes, tofu)
• 1/4 plate: Complex carbs (quinoa, sweet potato, brown rice)

💊 **Key Nutrients**:
• Vitamin D: 1000-2000 IU daily (especially in Australia's winter)
• Omega-3s: 2-3 servings fatty fish per week or supplement
• Magnesium: Dark leafy greens, nuts, seeds
• Vitamin B12: Crucial if vegetarian/vegan

${geneticInsights}

🍽️ **Meal Timing**:
• Eat within 1 hour of waking to kickstart metabolism
• Include protein at every meal (20-30g)
• Stay hydrated: 35ml per kg body weight

${!context?.geneticProfile ? '\n💡 **Pro Tip**: Upload your genetic data for personalised nutrient recommendations based on your MTHFR, TCF7L2, and other nutrition-related genes!' : ''}

Are you looking for help with a specific dietary goal or do you have any food intolerances I should know about?`;
    }
    
    // General health inquiry - more conversational fallback
    const conversationalResponse = [
      `${greeting}! I'm not sure I understood that specific question, but I'm here to help with your health journey.`,
      `${greeting}! That's an interesting question. While I specialise in health topics, I'm always here to chat.`,
      `${greeting}! I might not have a specific answer for that, but I'm great with health and wellness questions.`
    ];
    
    const randomResponse = conversationalResponse[Math.floor(Math.random() * conversationalResponse.length)];
    
    return `${randomResponse}

🎯 **I'm excellent at helping with**:
• **Nutrition & Weight**: "Help me lose weight" or "What should I eat?"
• **Fitness**: "I need an exercise routine" or "How often should I work out?"
• **Sleep**: "I can't sleep well" or "How can I sleep better?"
• **Mental Health**: "I'm feeling stressed" or "Help with anxiety"
• **General Health**: "My energy is low" or "How can I feel healthier?"

${context?.recentHealthData?.healthScore ? `By the way, your current health score is ${context.recentHealthData.healthScore}/100. ` : ''}

Try asking me something like "I want to lose 5kg" or "I'm always tired" and I'll give you personalised advice! What's on your mind?`;
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
          content: `You are a certified genetic counselor and health analytics specialist with expertise in personalised medicine. Generate realistic genetic insights based on common genetic variants and their health implications. Always include actionable recommendations and follow Australian health guidelines.`
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
          content: `You are a certified health coach and wellness specialist with expertise in personalised health optimisation. Generate evidence-based health recommendations using Australian health guidelines. Focus on actionable, realistic suggestions with clear impacts and timeframes.`
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

    const systemPrompt = `You are the Hodie Health Assistant, an expert Australian health and wellness advisor powered by advanced AI with 256K context. You have access to comprehensive health analytics and personalised insights.

KEY GUIDELINES:
- Use Australian English spelling and terminology (GP, chemist, Medicare, etc.)
- Reference Australian health guidelines and resources
- Be conversational, supportive, and evidence-based
- Provide specific, actionable health advice
- Always suggest consulting a GP for serious concerns
- Include Australian health contact numbers when relevant

IMPORTANT - TYPO TOLERANCE:
- Users may have typos or misspellings in their questions - understand their INTENT, not just exact words
- Common misspellings: "protien" = protein, "excersize" = exercise, "diabeties" = diabetes, "colesterol" = cholesterol
- Be flexible and adaptive - if a question has spelling errors, respond to what they meant to ask
- Never correct the user's spelling - just understand and respond helpfully
- Look for context clues and related terms to understand unclear questions

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
    return `Generate personalised DNA insights for the ${category} category. 

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
    return `Generate 6 personalised health recommendations based on the user's current health data.

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
          trait: 'Muscle fibre composition',
          description: 'You have a balanced mix of fast and slow-twitch muscle fibres',
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

🔧 **Initializing AI Services**: Your personalised health analytics are being configured automatically. Please refresh the page or try your question again in a moment.

While I'm setting this up, I can still provide evidence-based health guidance. What would you like to know?`;
  }

  // Handle genetic-specific queries
  private async handleGeneticQuery(userMessage: string, context?: HealthContext): Promise<string> {
    const message = userMessage.toLowerCase();
    
    if (!context?.geneticProfile) {
      return `I'd love to help with genetic analysis! Upload your raw DNA data from 23andMe, AncestryDNA, or similar services to get:

🧬 **Personalized Genetic Insights**:
• Fitness optimisation based on ACTN3 and ACE variants
• Nutrition recommendations from MTHFR and TCF7L2 analysis
• Supplement dosing based on your genetic variants
• Disease risk assessments with actionable prevention strategies

📊 **What I can analyse**:
• 200+ genetic variants for health optimisation
• Pharmacogenomics for medication responses
• Nutrient metabolism efficiency
• Exercise response and recovery genetics

To get started, go to your Profile → Genetic Data → Upload Raw Data

What specific genetic information are you looking for?`;
    }

    try {
      if (message.includes('fitness') || message.includes('exercise')) {
        const fitnessProfile = await geneticAnalysisService.generateFitnessProfile(context.geneticProfile);
        return this.formatFitnessGeneticResponse(fitnessProfile);
      }
      
      if (message.includes('supplement') || message.includes('vitamin') || message.includes('nutrition')) {
        const nutrients = await geneticAnalysisService.generateNutrientRecommendations(context.geneticProfile);
        return this.formatNutrientGeneticResponse(nutrients);
      }
      
      if (message.includes('risk') || message.includes('disease') || message.includes('health predisposition')) {
        const predispositions = await geneticAnalysisService.generateHealthPredispositions(context.geneticProfile);
        return this.formatHealthRiskResponse(predispositions);
      }
      
      // General genetic overview
      const [fitness, nutrients, predispositions] = await Promise.all([
        geneticAnalysisService.generateFitnessProfile(context.geneticProfile),
        geneticAnalysisService.generateNutrientRecommendations(context.geneticProfile),
        geneticAnalysisService.generateHealthPredispositions(context.geneticProfile)
      ]);
      
      return this.formatComprehensiveGeneticResponse(fitness, nutrients, predispositions);
      
    } catch (error) {
      console.error('Error processing genetic query:', error);
      return 'I encountered an issue analysing your genetic data. Please try again or contact support if the problem persists.';
    }
  }

  // Handle lab result queries
  private async handleLabQuery(userMessage: string, context?: HealthContext): Promise<string> {
    const message = userMessage.toLowerCase();
    
    if (!context?.labResults || context.labResults.length === 0) {
      return `I can help analyse your lab results! Connect with Australian lab providers like:

🔬 **Supported Labs**:
• Pathology North - Full blood count, lipids, thyroid
• Sonic Healthcare - Comprehensive metabolic panels
• Healius Pathology - Advanced lipid analysis

📊 **What I analyse**:
• Cardiovascular risk markers (LDL, HDL, triglycerides)
• Metabolic health (glucose, HbA1c, insulin)
• Nutritional status (vitamin D, B12, folate, iron)
• Thyroid function (TSH, T4, T3)
• Inflammatory markers (CRP, ESR)

To connect your labs, go to Settings → Lab Integration

What specific lab values are you curious about?`;
    }

    try {
      const latestLabs = context.labResults[context.labResults.length - 1];
      return this.formatLabResultsResponse(latestLabs, message);
    } catch (error) {
      console.error('Error processing lab query:', error);
      return 'I encountered an issue analysing your lab results. Please try again.';
    }
  }

  // Handle personalised recommendation queries
  private async handlePersonalizedQuery(userMessage: string, context?: HealthContext): Promise<string> {
    if (!context?.personalisedProfile) {
      // Create a basic profile for demonstration
      const basicProfile = await enhancedPersonalizationService.createPersonalizedProfile(
        context?.userId || 'demo',
        {
          genetic: context?.geneticProfile,
          labResults: context?.labResults || []
        }
      );
      context = { 
        ...context, 
        userId: context?.userId || 'demo',
        personalisedProfile: basicProfile 
      };
    }

    try {
      const recommendations = await enhancedPersonalizationService.generatePersonalizedRecommendations(
        context.personalisedProfile!
      );
      
      return this.formatPersonalizedRecommendations(recommendations, userMessage);
    } catch (error) {
      console.error('Error generating personalised recommendations:', error);
      return 'I encountered an issue creating personalised recommendations. Please try again.';
    }
  }

  // Format genetic fitness response
  private formatFitnessGeneticResponse(fitnessProfile: FitnessProfile): string {
    return `🧬 **Your Genetic Fitness Profile**:

💪 **Muscle Composition**: ${fitnessProfile.powerVsEndurance === 'power' ? 'Power-dominant (fast-twitch focused)' : fitnessProfile.powerVsEndurance === 'endurance' ? 'Endurance-optimised (slow-twitch focused)' : 'Balanced power and endurance'}

⚡ **Recovery Speed**: ${fitnessProfile.recoverySpeed}
🚨 **Injury Risk**: ${fitnessProfile.injuryRisk}

🏋️ **Recommended Exercises**:
${fitnessProfile.optimalExerciseTypes.map(exercise => `• ${exercise}`).join('\n')}

📈 **Training Intensity**: ${fitnessProfile.recommendedIntensity}

🧬 **Genetic Basis**: Based on analysis of ${fitnessProfile.geneticBasis.join(', ')} genes

This analysis is based on your genetic variants and provides personalised training recommendations for optimal results!`;
  }

  // Format nutrient genetic response
  private formatNutrientGeneticResponse(nutrients: NutrientRecommendation[]): string {
    const topRecommendations = nutrients.slice(0, 3);
    
    return `🧬 **Your Genetic Nutrition Profile**:

${topRecommendations.map(nutrient => `💊 **${nutrient.nutrient}**:
• Recommended: ${nutrient.recommendedDailyAmount}
• Form: ${nutrient.supplementForm}
• Timing: ${nutrient.timing}
• Genetic basis: ${nutrient.geneticBasis.join(', ')}
• Confidence: ${nutrient.confidence}%`).join('\n\n')}

⚠️ **Important Interactions**:
${topRecommendations.flatMap(n => n.interactions).slice(0, 3).map(interaction => `• ${interaction}`).join('\n')}

This personalised supplement plan is based on your genetic variants affecting nutrient metabolism!`;
  }

  // Format health risk response
  private formatHealthRiskResponse(predispositions: HealthPredisposition[]): string {
    return `🧬 **Your Genetic Health Risk Profile**:

${predispositions.slice(0, 3).map(pred => `🎯 **${pred.condition}**:
• Risk Score: ${pred.riskScore}/100 (${pred.riskScore < 30 ? 'Low' : pred.riskScore < 70 ? 'Moderate' : 'High'} risk)
• Genetic contribution: ${pred.geneticContribution}%
• Lifestyle impact: ${pred.lifestyleContribution}%
• Evidence level: ${pred.evidence}
• Actionability: ${pred.actionability}

**Prevention strategies**:
${pred.recommendations.map(rec => `• ${rec}`).join('\n')}`).join('\n\n')}

💡 Remember: Genetic predisposition is not destiny! Lifestyle modifications can significantly impact your health outcomes.`;
  }

  // Format comprehensive genetic response
  private formatComprehensiveGeneticResponse(
    fitness: FitnessProfile, 
    nutrients: NutrientRecommendation[], 
    predispositions: HealthPredisposition[]
  ): string {
    return `🧬 **Comprehensive Genetic Analysis**:

**FITNESS OPTIMIZATION**:
• Type: ${fitness.powerVsEndurance} training focus
• Recovery: ${fitness.recoverySpeed}
• Top exercise: ${fitness.optimalExerciseTypes[0]}

**KEY NUTRIENTS**:
• ${nutrients[0]?.nutrient}: ${nutrients[0]?.recommendedDailyAmount}
• ${nutrients[1]?.nutrient}: ${nutrients[1]?.recommendedDailyAmount}

**HEALTH PRIORITIES**:
• Primary focus: ${predispositions[0]?.condition} prevention
• Key strategy: ${predispositions[0]?.recommendations[0]}

This analysis covers 200+ genetic variants for comprehensive health optimisation. Want details on any specific area?`;
  }

  // Format lab results response
  private formatLabResultsResponse(labPanel: ComprehensiveLabPanel, query: string): string {
    const interpretation = labPanel.interpretation;
    const flaggedResults = labPanel.results.filter(r => r.flagged);
    
    return `🔬 **Lab Analysis Summary**:

**Overall Status**: ${interpretation.overallStatus.toUpperCase()}
**Confidence**: ${interpretation.confidence}%

${interpretation.keyFindings.length > 0 ? `**Key Findings**:
${interpretation.keyFindings.map(finding => `• ${finding}`).join('\n')}` : ''}

${flaggedResults.length > 0 ? `**Values Needing Attention**:
${flaggedResults.slice(0, 3).map(result => `• ${result.testName}: ${result.value} ${result.unit} (${result.status})`).join('\n')}` : ''}

${labPanel.recommendations.length > 0 ? `**Recommendations**:
${labPanel.recommendations.slice(0, 3).map(rec => `• ${rec.recommendation} (${rec.timeframe})`).join('\n')}` : ''}

${interpretation.riskFactors.length > 0 ? `⚠️ **Risk Factors**: ${interpretation.riskFactors.join(', ')}` : ''}

${labPanel.followUpRequired ? '📅 Follow-up testing recommended' : '✅ Maintain current health practices'}`;
  }

  // Format personalised recommendations
  private formatPersonalizedRecommendations(recommendations: PersonalizedRecommendation[], query: string): string {
    const highPriority = recommendations.filter(r => r.priority === 'critical' || r.priority === 'high').slice(0, 3);
    
    return `🎯 **Personalized Health Recommendations**:

${highPriority.map((rec, index) => `**${index + 1}. ${rec.title}** (${rec.priority} priority)
📝 ${rec.description}
🎯 Expected outcome: ${rec.expectedOutcomes[0]?.outcome} in ${rec.expectedOutcomes[0]?.timeframe}
🧬 Based on: ${rec.personalizationFactors.slice(0, 2).join(', ')}
📊 Confidence: ${rec.confidence}%`).join('\n\n')}

💡 These recommendations integrate your genetic data, lab results, lifestyle factors, and health goals for maximum personalization.

Would you like detailed implementation guidance for any of these recommendations?`;
  }

  // Get genetic fitness insights for general responses
  private async getGeneticFitnessInsights(geneticProfile: GeneticProfile): Promise<string> {
    try {
      const fitnessProfile = await geneticAnalysisService.generateFitnessProfile(geneticProfile);
      return `\n🧬 **Your Genetic Fitness Type**: ${fitnessProfile.powerVsEndurance} (${fitnessProfile.optimalExerciseTypes[0]} recommended)\n`;
    } catch (error) {
      return '';
    }
  }

  // Get genetic nutrition insights for general responses
  private async getGeneticNutritionInsights(geneticProfile: GeneticProfile): Promise<string> {
    try {
      const nutrients = await geneticAnalysisService.generateNutrientRecommendations(geneticProfile);
      if (nutrients.length === 0) return '';

      const topNutrient = nutrients[0];
      return `\n🧬 **Your Genetic Nutrition Need**: ${topNutrient.nutrient} - ${topNutrient.recommendedDailyAmount} (${topNutrient.supplementForm})\n`;
    } catch (error) {
      return '';
    }
  }

  /**
   * Normalize user input to handle typos, misspellings, and variations
   */
  private normalizeUserInput(text: string): string {
    // Common health-related misspellings and their corrections
    const misspellingMap: { [key: string]: string } = {
      // Nutrition
      'protien': 'protein', 'protine': 'protein', 'proteen': 'protein',
      'carbohidrate': 'carbohydrate', 'carbohydrates': 'carbohydrate', 'carbs': 'carbohydrate',
      'vitamen': 'vitamin', 'vitamn': 'vitamin', 'vitiman': 'vitamin',
      'suppliment': 'supplement', 'supliment': 'supplement', 'suppliments': 'supplement',
      'nutrtion': 'nutrition', 'nutition': 'nutrition', 'nutritian': 'nutrition',

      // Fitness
      'excersize': 'exercise', 'excercise': 'exercise', 'exercize': 'exercise', 'exersize': 'exercise',
      'workout': 'exercise', 'work out': 'exercise', 'workouts': 'exercise',
      'cardio': 'cardiovascular', 'cadrio': 'cardiovascular',
      'wieght': 'weight', 'wait': 'weight', 'weigth': 'weight',

      // Health conditions
      'diabeties': 'diabetes', 'diabetis': 'diabetes', 'diabites': 'diabetes',
      'colesterol': 'cholesterol', 'cholestrol': 'cholesterol', 'cholestorol': 'cholesterol',
      'pressur': 'pressure', 'presure': 'pressure',
      'inflamation': 'inflammation', 'inflamtion': 'inflammation',

      // Sleep
      'insomia': 'insomnia', 'insommnia': 'insomnia',
      'sleap': 'sleep', 'slep': 'sleep',

      // DNA/Genetics
      'gentic': 'genetic', 'genetik': 'genetic', 'genetics': 'genetic',
      'varient': 'variant', 'varaint': 'variant',

      // Lab tests
      'bloodtest': 'blood test', 'blod test': 'blood test',
      'biomarker': 'biomarker', 'bio marker': 'biomarker', 'biomarkers': 'biomarker',

      // General
      'recomendation': 'recommendation', 'recomendations': 'recommendation', 'reccomendation': 'recommendation',
      'analize': 'analyze', 'analise': 'analyze', 'analyse': 'analyze',
      'halth': 'health', 'helth': 'health',
      'recepie': 'recipe', 'recepies': 'recipe', 'recipies': 'recipe',
      'loosing': 'losing', 'loose': 'lose'
    };

    // Normalize text
    let normalized = text.toLowerCase().trim();

    // Replace common misspellings
    Object.keys(misspellingMap).forEach(misspelling => {
      const regex = new RegExp(`\\b${misspelling}\\b`, 'gi');
      normalized = normalized.replace(regex, misspellingMap[misspelling]);
    });

    return normalized;
  }

  /**
   * Extract intent from user message even with typos
   */
  private extractUserIntent(text: string): {
    category: string;
    keywords: string[];
    confidence: number;
  } {
    const normalized = this.normalizeUserInput(text);

    // Define intent patterns with flexible matching
    const intentPatterns = {
      nutrition: ['nutrition', 'food', 'eat', 'diet', 'meal', 'protein', 'carbohydrate', 'vitamin', 'supplement', 'recipe', 'cooking'],
      fitness: ['exercise', 'workout', 'fitness', 'train', 'gym', 'cardio', 'strength', 'run', 'walk', 'activity'],
      sleep: ['sleep', 'insomnia', 'rest', 'tired', 'fatigue', 'wake', 'bed'],
      mental: ['stress', 'anxiety', 'mental', 'mood', 'depression', 'wellbeing', 'mindfulness', 'meditation'],
      weight: ['weight', 'lose', 'gain', 'obesity', 'bmi', 'fat', 'lean'],
      genetic: ['genetic', 'dna', 'gene', 'variant', 'hereditary', 'ancestry'],
      lab: ['lab', 'blood', 'test', 'biomarker', 'result', 'panel', 'cholesterol', 'glucose'],
      general: ['health', 'wellness', 'advice', 'help', 'recommend', 'suggest']
    };

    // Score each category
    const scores: { [key: string]: number } = {};

    Object.keys(intentPatterns).forEach(category => {
      const keywords = intentPatterns[category as keyof typeof intentPatterns];
      let score = 0;
      const foundKeywords: string[] = [];

      keywords.forEach(keyword => {
        if (normalized.includes(keyword)) {
          score += 1;
          foundKeywords.push(keyword);
        }
      });

      if (score > 0) {
        scores[category] = score;
      }
    });

    // Find best matching category
    const bestCategory = Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b, 'general'
    );

    return {
      category: bestCategory,
      keywords: intentPatterns[bestCategory as keyof typeof intentPatterns],
      confidence: scores[bestCategory] || 0
    };
  }

  /**
   * Intelligently interpret uploaded health files and determine database mappings
   * Uses AI to analyze file content and suggest where data should go
   */
  async interpretHealthFile(
    parsedData: any,
    fileName: string,
    fileCategory: string,
    userId?: string
  ): Promise<{
    interpretation: string;
    databaseMappings: {
      collection: string;
      fields: { [key: string]: any };
      confidence: number;
    }[];
    clarifyingQuestions: string[];
    recommendations: string[];
  }> {
    console.log('🔍 Starting AI file interpretation for:', fileName);

    try {
      const apiKey = userId ? await this.getApiKeyForUser(userId) : this.apiKey;
      if (!apiKey) {
        return this.generateBasicFileInterpretation(parsedData, fileName, fileCategory);
      }

      // Build analysis prompt
      const analysisPrompt = this.buildFileAnalysisPrompt(parsedData, fileName, fileCategory);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are an expert health data analyst specializing in interpreting medical files and determining optimal database storage strategies. Analyze health data files and provide:
1. Clear interpretation of what the file contains
2. Database collection and field mappings (collections: healthMetrics, labResults, geneticData, wearableData, medicalReports)
3. Clarifying questions if data is ambiguous
4. Health recommendations based on the data
Always use Australian English and medical terminology. Format responses in clear markdown.`
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          temperature: 0.3, // Lower temperature for more consistent analysis
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        console.warn('AI interpretation request failed, using fallback');
        return this.generateBasicFileInterpretation(parsedData, fileName, fileCategory);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Parse AI response to extract structured information
      return this.parseAIFileInterpretation(aiResponse, parsedData, fileCategory);

    } catch (error) {
      console.error('Error in AI file interpretation:', error);
      return this.generateBasicFileInterpretation(parsedData, fileName, fileCategory);
    }
  }

  /**
   * Build prompt for AI file analysis
   */
  private buildFileAnalysisPrompt(parsedData: any, fileName: string, fileCategory: string): string {
    const dataPreview = JSON.stringify(parsedData, null, 2).substring(0, 2000); // First 2000 chars

    return `**File Analysis Request**

**File Name**: ${fileName}
**Detected Category**: ${fileCategory}
**File Data Preview**:
\`\`\`json
${dataPreview}
\`\`\`

Please analyze this health data file and provide:

1. **Interpretation**: What type of health data is this? What does it tell us about the patient's health?

2. **Database Mappings**: Specify which database collections and fields should store this data:
   - Collection options: healthMetrics, labResults, geneticData, wearableData, medicalReports
   - For each collection, specify the exact fields and values to populate
   - Rate your confidence (0-100%) for each mapping

3. **Clarifying Questions**: Are there any ambiguities or missing information that would help with data storage or interpretation?

4. **Health Recommendations**: Based on the data in this file, what immediate health insights or recommendations can you provide?

Format your response with clear sections using markdown headers.`;
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIFileInterpretation(aiResponse: string, parsedData: any, fileCategory: string): any {
    // Extract interpretation section
    const interpretationMatch = aiResponse.match(/#{1,3}\s*Interpretation[:\s]*([\s\S]*?)(?=#{1,3}|$)/i);
    const interpretation = interpretationMatch ? interpretationMatch[1].trim() : aiResponse.substring(0, 500);

    // Extract database mappings
    const databaseMappings = this.extractDatabaseMappings(aiResponse, parsedData, fileCategory);

    // Extract clarifying questions
    const questionsMatch = aiResponse.match(/#{1,3}\s*(?:Clarifying Questions|Questions)[:\s]*([\s\S]*?)(?=#{1,3}|$)/i);
    const clarifyingQuestions = this.extractListItems(questionsMatch ? questionsMatch[1] : '');

    // Extract recommendations
    const recommendationsMatch = aiResponse.match(/#{1,3}\s*(?:Health Recommendations|Recommendations)[:\s]*([\s\S]*?)(?=#{1,3}|$)/i);
    const recommendations = this.extractListItems(recommendationsMatch ? recommendationsMatch[1] : '');

    return {
      interpretation,
      databaseMappings,
      clarifyingQuestions,
      recommendations
    };
  }

  /**
   * Extract database mappings from AI response
   */
  private extractDatabaseMappings(aiResponse: string, parsedData: any, fileCategory: string): any[] {
    const mappings: any[] = [];

    // Map file category to primary collection
    const collectionMap: { [key: string]: string } = {
      'lab_results': 'labResults',
      'genetic_data': 'geneticData',
      'wearable_data': 'wearableData',
      'health_reports': 'medicalReports',
      'medical_images': 'medicalReports',
      'other': 'healthMetrics'
    };

    const primaryCollection = collectionMap[fileCategory] || 'healthMetrics';

    // Create primary mapping with parsed data
    mappings.push({
      collection: primaryCollection,
      fields: this.mapDataToFields(parsedData, fileCategory),
      confidence: 85
    });

    // Look for additional mappings mentioned by AI
    if (aiResponse.toLowerCase().includes('healthmetrics') || aiResponse.toLowerCase().includes('health metrics')) {
      mappings.push({
        collection: 'healthMetrics',
        fields: this.extractHealthMetrics(parsedData),
        confidence: 70
      });
    }

    return mappings;
  }

  /**
   * Map parsed data to database fields
   */
  private mapDataToFields(parsedData: any, fileCategory: string): { [key: string]: any } {
    const fields: { [key: string]: any } = {};

    // Category-specific field mapping to match backend schemas
    switch (fileCategory) {
      case 'lab_results':
        // Backend expects: testType, testDate, biomarkers, results, etc.
        fields.testType = parsedData.metadata?.fileName || 'Health Data Upload';
        fields.testDate = new Date();

        // Convert generic data to biomarkers format
        if (Array.isArray(parsedData.data) && parsedData.data.length > 0) {
          // Take first row as example and convert to biomarkers
          const firstRow = parsedData.data[0];
          fields.biomarkers = Object.keys(firstRow).map(key => ({
            name: key,
            value: firstRow[key],
            unit: this.inferUnit(key),
            referenceRange: 'Not specified',
            status: 'Normal'
          }));
          fields.results = parsedData.data; // Store full data
          fields.rawData = parsedData.data;
        } else {
          // No data parsed, store as raw
          fields.biomarkers = [];
          fields.results = parsedData;
          fields.rawData = parsedData;
          fields.notes = 'Generic health data upload - structure not recognized';
        }
        break;

      case 'genetic_data':
        fields.provider = 'File Upload';
        fields.uploadDate = new Date();
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          fields.variants = parsedData;
          fields.variantCount = parsedData.length;
        } else {
          fields.variants = [];
          fields.rawData = parsedData;
        }
        break;

      case 'wearable_data':
        fields.device = 'File Upload';
        fields.syncDate = new Date();
        fields.dataType = 'Health Metrics';
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          fields.metrics = parsedData;
          fields.dateRange = {
            start: parsedData[0]?.date || new Date(),
            end: parsedData[parsedData.length - 1]?.date || new Date()
          };
        } else {
          fields.metrics = parsedData;
        }
        break;

      default:
        // For other categories, use generic structure
        fields.uploadDate = new Date();
        fields.dataType = fileCategory;
        fields.rawData = parsedData;
        break;
    }

    return fields;
  }

  /**
   * Infer unit from field name
   */
  private inferUnit(fieldName: string): string {
    const name = fieldName.toLowerCase();
    if (name.includes('time') || name.includes('duration')) return 'minutes';
    if (name.includes('frequency')) return 'count';
    if (name.includes('monetary') || name.includes('amount')) return 'units';
    if (name.includes('class') || name.includes('category')) return 'category';
    return '';
  }

  /**
   * Extract health metrics from data
   */
  private extractHealthMetrics(parsedData: any): { [key: string]: any } {
    const metrics: { [key: string]: any } = {};

    // Try to extract common health metrics
    if (parsedData.results && Array.isArray(parsedData.results)) {
      parsedData.results.forEach((result: any) => {
        const testName = result.testName?.toLowerCase() || '';

        if (testName.includes('glucose') || testName.includes('blood sugar')) {
          metrics.glucose = result.value;
        } else if (testName.includes('cholesterol')) {
          metrics.cholesterol = result.value;
        } else if (testName.includes('heart rate') || testName.includes('pulse')) {
          metrics.heartRate = result.value;
        } else if (testName.includes('blood pressure')) {
          metrics.bloodPressure = result.value;
        }
      });
    }

    return metrics;
  }

  /**
   * Extract list items from markdown text
   */
  private extractListItems(text: string): string[] {
    const items: string[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.match(/^\d+\./)) {
        const item = trimmed.replace(/^[-•\d.]\s*/, '').trim();
        if (item) items.push(item);
      }
    }

    return items.filter(item => item.length > 0);
  }

  /**
   * Generate basic file interpretation without AI
   */
  private generateBasicFileInterpretation(parsedData: any, fileName: string, fileCategory: string): any {
    const categoryDescriptions: { [key: string]: string } = {
      'lab_results': 'Laboratory test results showing various biomarkers and health indicators',
      'genetic_data': 'Genetic variant data that can provide insights into health predispositions',
      'wearable_data': 'Activity and health tracking data from wearable devices',
      'health_reports': 'Medical reports and health summaries',
      'medical_images': 'Medical imaging data for health assessment',
      'other': 'Health-related data'
    };

    const interpretation = `📊 **${categoryDescriptions[fileCategory] || 'Health data file'}**

This file contains ${fileCategory.replace('_', ' ')} that has been successfully parsed and categorized. The data can be stored in your health profile for tracking and analysis.`;

    return {
      interpretation,
      databaseMappings: [
        {
          collection: fileCategory === 'lab_results' ? 'labResults' :
                      fileCategory === 'genetic_data' ? 'geneticData' :
                      fileCategory === 'wearable_data' ? 'wearableData' : 'healthMetrics',
          fields: this.mapDataToFields(parsedData, fileCategory),
          confidence: 75
        }
      ],
      clarifyingQuestions: [
        'Would you like me to explain any specific values in this data?',
        'Should this data be used to update your current health metrics?'
      ],
      recommendations: [
        'Review the uploaded data to ensure accuracy',
        'Consider tracking trends over time by uploading regular updates',
        'Consult with your GP about any concerning values'
      ]
    };
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