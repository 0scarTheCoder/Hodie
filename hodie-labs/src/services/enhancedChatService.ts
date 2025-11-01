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
    if (healthContext?.recentHealthData) {
      const { healthScore } = healthContext.recentHealthData;
      if (healthScore) {
        personalisation = `\n\n📊 **Your Current Health Score**: ${healthScore}/100\n`;
        if (healthScore >= 80) personalisation += "You're doing brilliantly! Keep up the excellent work.";
        else if (healthScore >= 60) personalisation += "You're on the right track! A few tweaks could help you reach your goals.";
        else personalisation += "There's room for improvement, but every small step counts!";
      }
    }

    // Advanced Food & Nutrition Responses
    if (lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('nutrition') || lowerMessage.includes('diet')) {
      
      // Weight loss specific
      if (lowerMessage.includes('weight loss') || lowerMessage.includes('lose weight')) {
        return `${greeting}! For healthy weight management, here's what I recommend:

🥗 **Nutrient-Dense Foods:**
• Leafy greens (spinach, kale, rocket, lettuce)
• Lean proteins (white fish, chicken breast, tofu, legumes)
• Complex carbohydrates (sweet potato, quinoa, brown rice)
• Healthy fats in moderation (avocado, nuts, olive oil)

🍽️ **Smart Eating Strategies:**
• Fill half your plate with vegetables
• Eat slowly and mindfully
• Drink water before meals
• Regular meal times to maintain metabolism
• Portion control using smaller plates

⚖️ **Australian Guidelines:** Aim for sustainable weight loss of 0.5-1kg per week. Always consult your GP before starting any weight loss program, especially if you have underlying health conditions.

💡 **Top Tip:** Focus on adding nutritious foods rather than just removing foods - this creates sustainable habits!${personalisation}`;
      }
      
      // Muscle building specific
      if (lowerMessage.includes('muscle') || lowerMessage.includes('protein') || lowerMessage.includes('gym') || lowerMessage.includes('building')) {
        return `${greeting}! For muscle building and recovery, here's your nutrition guide:

💪 **High-Quality Protein Sources** (aim for 1.6-2.2g per kg body weight):
• **Animal proteins:** Lean beef, chicken, turkey, fish (barramundi, salmon)
• **Dairy:** Greek yoghurt, cottage cheese, milk, whey protein
• **Plant proteins:** Lentils, chickpeas, tofu, tempeh, quinoa
• **Convenient options:** Eggs, nuts, protein powder

⏰ **Timing Strategy:**
• **Pre-workout:** Light carbs + protein (banana with Greek yoghurt)
• **Post-workout:** Protein within 30-60 minutes (protein shake or meal)
• **Throughout day:** Spread protein across all meals and snacks

🥤 **Hydration for Training:** Extra important during training - aim for 2.5-3L daily, more in hot Australian weather.

🍎 **Supporting Foods:** Complex carbs for energy (oats, brown rice), healthy fats for hormone production (nuts, avocado), and plenty of vegetables for micronutrients.${personalisation}`;
      }

      // General healthy eating
      return `${greeting}! For optimal health, I'd recommend these nutritious Australian foods:

🥬 **Fresh Vegetables** (aim for 5+ serves daily):
• **Leafy greens:** Spinach, kale, rocket, lettuce
• **Colourful varieties:** Carrots, capsicum, beetroot, broccoli, tomatoes
• **Local seasonal options:** Pumpkin, zucchini, sweet potato, corn

🍎 **Fresh Fruits** (aim for 2+ serves daily):
• **Australian favourites:** Apples, bananas, oranges, pears
• **Seasonal berries:** Strawberries, blueberries, raspberries
• **Tropical options:** Mango, pineapple, kiwi fruit, papaya

🐟 **Quality Proteins:**
• **Australian seafood:** Barramundi, salmon, prawns, tuna
• **Lean meats:** Grass-fed beef, free-range chicken, lamb
• **Plant proteins:** Legumes, nuts, seeds, tofu

🌾 **Wholegrains:** Oats, brown rice, quinoa, wholemeal bread

💧 **Stay Hydrated:** 8-10 glasses of water daily (our Australian tap water is excellent!)

🏥 **Professional Advice:** Consider seeing your GP or an Accredited Practising Dietitian for personalised nutrition advice tailored to your specific needs.${personalisation}`;
    }

    // Enhanced Exercise & Fitness Responses
    if (lowerMessage.includes('exercise') || lowerMessage.includes('fitness') || lowerMessage.includes('workout') || lowerMessage.includes('gym') || lowerMessage.includes('training')) {
      
      // Beginner-specific advice
      if (lowerMessage.includes('beginner') || lowerMessage.includes('start') || lowerMessage.includes('new')) {
        return `${greeting}! Perfect time to start your fitness journey! Here's a beginner-friendly approach:

🚶 **Week 1-2: Foundation Building**
• 15-20 minutes walking daily (great excuse to explore your neighbourhood!)
• Basic bodyweight exercises: squats, push-ups (wall or knee), planks
• 2-3 times per week, focusing on form over intensity

💪 **Week 3-4: Building Momentum**
• Increase to 30 minutes activity daily
• Add light weights or resistance bands
• Include stretching or beginner yoga (YouTube has great free sessions)

🏃 **Week 5+: Progressive Challenge**
• Mix cardio and strength training
• Aim for 150+ minutes moderate activity per week (Australian Physical Activity Guidelines)
• Find activities you actually enjoy - dancing, swimming, bushwalking!

⚠️ **Important Safety Note:** Start slowly, listen to your body, and consult your GP before beginning any new exercise program, especially if you have health conditions or haven't exercised in a while.

🎯 **Success Tips:** Set realistic goals, track your progress, find a workout buddy for motivation!${personalisation}`;
      }

      // General fitness advice
      return `${greeting}! Here's a balanced approach to fitness that works for most Australians:

🏃 **Cardio Options** (150+ minutes/week moderate intensity):
• **Local activities:** Walking/jogging in parks, beach walks, bushwalking
• **Community facilities:** Swimming at local pools, cycling on bike paths
• **Social options:** Tennis, basketball, dancing, team sports

💪 **Strength Training** (2-3 times/week):
• **At home:** Bodyweight exercises, resistance bands, YouTube workouts
• **Gym options:** Free weights, machines, group fitness classes
• **Functional training:** Lifting, carrying, climbing stairs

🧘 **Recovery & Flexibility:**
• Gentle yoga or stretching (10-15 minutes daily)
• Rest days between intense sessions
• Quality sleep (7-9 hours) for muscle recovery

🎯 **Set SMART Goals:** Specific, Measurable, Achievable, Relevant, Time-bound. For example: "Walk 30 minutes, 5 days a week for the next month."

📱 **Track Progress:** Use a fitness app, journal, or simple calendar to stay motivated!${personalisation}`;
    }

    // Enhanced Sleep Responses
    if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('insomnia') || lowerMessage.includes('rest')) {
      return `${greeting}! Quality sleep is crucial for both physical and mental health. Here are evidence-based strategies:

🌙 **Sleep Hygiene Essentials:**
• **Consistent schedule:** Same bedtime and wake time, even on weekends
• **Cool environment:** Keep bedroom at 18-21°C (ideal for Australian climate)
• **Dark & quiet:** Block out light, consider earplugs if needed
• **Comfortable setup:** Quality mattress, supportive pillows

📱 **Evening Wind-Down Routine:**
• No screens 1-2 hours before bed (blue light disrupts melatonin)
• Try reading, gentle stretching, meditation, or warm bath
• Avoid large meals, caffeine after 2pm, and alcohol before bedtime
• Herbal teas like chamomile can be relaxing

☀️ **Daytime Habits for Better Sleep:**
• Get natural sunlight in the morning (helps regulate circadian rhythm)
• Regular exercise, but not within 3 hours of bedtime
• Limit daytime naps to 20-30 minutes before 3pm

⏰ **Target:** 7-9 hours nightly for most adults

🏥 **When to See Your GP:** If sleep problems persist for more than 2-3 weeks, or if you experience sleep apnoea symptoms, chronic insomnia, or daytime fatigue affecting your life.${personalisation}`;
    }

    // Mental Health & Stress Management
    if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('mental health') || lowerMessage.includes('worried') || lowerMessage.includes('overwhelmed')) {
      return `${greeting}! Mental health is just as important as physical health. Here are evidence-based strategies:

🧘 **Immediate Stress Relief Techniques:**
• **4-7-8 Breathing:** Inhale for 4, hold for 7, exhale for 8
• **Progressive muscle relaxation:** Tense and release muscle groups
• **Mindfulness:** Focus on present moment, not past worries or future fears
• **Physical activity:** Even a 10-minute walk can reduce stress hormones

🌿 **Daily Lifestyle Support:**
• **Social connections:** Call a friend, spend time with loved ones
• **Nature therapy:** Spend time outdoors, beach walks, park visits
• **Limit stressors:** Reduce news/social media if overwhelming
• **Work-life balance:** Set boundaries, take regular breaks

💬 **Professional Support in Australia:**
• **Start with your GP:** For assessment and Mental Health Care Plan
• **Crisis support:** Lifeline 13 11 14 (24/7), Beyond Blue 1300 22 4636
• **Online resources:** Beyond Blue, Headspace, MindSpot
• **Medicare rebates:** Available for psychology sessions with referral

🎯 **Remember:** Seeking help is a sign of strength, not weakness. Many Australians experience mental health challenges - you're not alone.

⚠️ **Emergency:** If you're having thoughts of self-harm, call 000 or go to your nearest emergency department immediately.${personalisation}`;
    }

    // Hydration & Water
    if (lowerMessage.includes('water') || lowerMessage.includes('hydrat') || lowerMessage.includes('drink')) {
      return `${greeting}! Proper hydration is essential for optimal health, especially in Australia's climate:

💧 **Daily Hydration Targets:**
• **General guideline:** 8-10 glasses (2-2.5L) daily
• **Exercise days:** Extra 500-750ml per hour of activity
• **Hot weather:** Increase by 1-2 glasses (important in Australian summers!)
• **Pregnancy/breastfeeding:** Consult your GP for specific needs

🥤 **Best Hydration Sources:**
• **Plain water:** Australian tap water is excellent quality and safe
• **Alternatives:** Herbal teas, sparkling water with lemon
• **Water-rich foods:** Cucumber, watermelon, oranges, lettuce

⚠️ **Limit These:**
• Sugary drinks (soft drinks, fruit juices with added sugar)
• Excessive caffeine (can be dehydrating)
• Alcohol (dehydrating effect)

📊 **Hydration Check:** Your urine should be pale yellow. Dark yellow indicates dehydration.

🌡️ **Australian Climate Tip:** In hot weather or if you're sweating a lot, you may need electrolytes too - consider adding a pinch of salt to water or eating fruits.${personalisation}`;
    }

    // General Health & Wellness
    if (lowerMessage.includes('health') || lowerMessage.includes('wellness') || lowerMessage.includes('tips') || lowerMessage.includes('advice')) {
      return `${greeting}! Here are the key pillars of good health, based on Australian health guidelines:

🍎 **Nutrition Foundation:**
• Balanced diet with plenty of vegetables (5+ serves) and fruits (2+ serves)
• Lean proteins, wholegrains, healthy fats
• Stay hydrated with 8-10 glasses of water daily

🏃 **Physical Activity:**
• 150+ minutes moderate exercise weekly (brisk walking, swimming)
• Strength training 2-3 times per week
• Reduce sedentary time - stand and move regularly

😴 **Quality Sleep:**
• 7-9 hours nightly with consistent sleep schedule
• Cool, dark, quiet bedroom environment
• Wind-down routine without screens

🧠 **Mental Wellbeing:**
• Stress management techniques (meditation, breathing exercises)
• Social connections and community involvement
• Work-life balance and regular relaxation

🩺 **Preventive Healthcare:**
• Regular GP check-ups and health screenings
• Dental visits every 6 months
• Stay up-to-date with vaccinations

🚭 **Lifestyle Factors:**
• Don't smoke (or quit if you do - Quitline 13 7848)
• Limit alcohol to Australian guidelines
• Protect skin from UV (slip, slop, slap!)

📞 **Australian Health Resources:**
• Healthdirect: 1800 022 222 (24/7 health advice)
• Your local GP for personalised care
• Australian Department of Health website

💡 **Remember:** Small, consistent changes lead to lasting improvements. Start with one area and build from there!${personalisation}`;
    }

    // Conversation context awareness
    const previousTopics = conversationHistory.slice(-4).map(h => h.content.toLowerCase()).join(' ');
    let contextualResponse = '';
    
    if (previousTopics.includes('food') && !lowerMessage.includes('food')) {
      contextualResponse = "\n\n💡 **Following up on nutrition:** Remember, consistency is key - small changes make big differences over time!";
    } else if (previousTopics.includes('exercise') && !lowerMessage.includes('exercise')) {
      contextualResponse = "\n\n🏃 **Following up on fitness:** Remember to start gradually and listen to your body!";
    }

    // Default comprehensive response
    return `${greeting}! Thanks for your health question. While I'd love to provide more specific guidance, I recommend discussing this with your GP or a qualified health professional for personalised advice.

💡 **Quick Health Tips for Australians:**
• **Eat well:** Rainbow of fruits and vegetables, lean proteins, wholegrains
• **Move daily:** Aim for 30 minutes activity (walking, swimming, cycling)
• **Sleep quality:** 7-9 hours with good sleep hygiene
• **Stay hydrated:** 8-10 glasses water daily (more in hot weather)
• **Manage stress:** Try mindfulness, social connections, nature time
• **Regular check-ups:** See your GP for preventive care

🏥 **Australian Health Support:**
• **General health advice:** Healthdirect 1800 022 222
• **Mental health:** Lifeline 13 11 14, Beyond Blue 1300 22 4636
• **Your GP:** For personalised health advice and care plans

🇦🇺 **Remember:** This advice follows Australian health guidelines. Individual needs vary, so professional consultation is always recommended for specific health concerns.${contextualResponse}${personalisation}`;
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