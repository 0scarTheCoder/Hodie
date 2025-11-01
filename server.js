const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Claude AI
let anthropic;
try {
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_claude_api_key_here') {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    console.log('✅ Claude AI initialized successfully');
  } else {
    console.log('⚠️ Using mock responses - Claude API key not provided');
  }
} catch (error) {
  console.warn('⚠️ Claude AI initialization error:', error.message);
}

// Enhanced Mock Response System
function generateIntelligentResponse(message, healthContext, conversationHistory = []) {
  const lowerMessage = message.toLowerCase();
  const timeOfDay = new Date().getHours();
  const greeting = timeOfDay < 12 ? 'Good morning' : timeOfDay < 18 ? 'Good afternoon' : 'Good evening';
  
  // Personalisation based on health context
  let personalisation = '';
  if (healthContext?.recentHealthData) {
    const { steps, sleep, mood, healthScore } = healthContext.recentHealthData;
    if (healthScore) {
      personalisation = `\n\n📊 **Your Current Health Score**: ${healthScore}/100\n`;
      if (healthScore >= 80) personalisation += "You're doing brilliantly! Keep up the excellent work.";
      else if (healthScore >= 60) personalisation += "You're on the right track! A few tweaks could help you reach your goals.";
      else personalisation += "There's room for improvement, but every small step counts!";
    }
  }

  // Enhanced Food & Nutrition Responses
  if (lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('nutrition') || lowerMessage.includes('diet')) {
    if (lowerMessage.includes('weight loss') || lowerMessage.includes('lose weight')) {
      return `${greeting}! For healthy weight management, focus on:

🥗 **Nutrient-Dense Foods**:
• Leafy greens (spinach, kale, rocket)
• Lean proteins (fish, chicken breast, tofu, legumes)
• Complex carbs (sweet potato, quinoa, brown rice)
• Healthy fats in moderation (avocado, nuts, olive oil)

🍽️ **Eating Strategies**:
• Eat slowly and mindfully
• Fill half your plate with vegetables
• Stay hydrated (aim for 8-10 glasses daily)
• Regular meal times to maintain metabolism

⚖️ **Remember**: Sustainable weight loss is 0.5-1kg per week. Always consult your GP before starting any weight loss program.${personalisation}`;
    }
    
    if (lowerMessage.includes('muscle') || lowerMessage.includes('protein') || lowerMessage.includes('gym')) {
      return `${greeting}! For muscle building and recovery:

💪 **Protein Sources** (aim for 1.6-2.2g per kg body weight):
• Lean meats: chicken, turkey, lean beef
• Fish: salmon, tuna, barramundi
• Dairy: Greek yoghurt, cottage cheese, milk
• Plant-based: lentils, chickpeas, tofu, tempeh
• Eggs and nuts

⏰ **Timing**:
• Pre-workout: Light carbs + protein (banana + yoghurt)
• Post-workout: Protein within 30-60 minutes
• Spread protein intake throughout the day

🥤 **Hydration**: Extra important during training - aim for 2.5-3L daily.${personalisation}`;
    }

    return `${greeting}! For optimal health, I'd recommend these nutritious Australian foods:

🥬 **Fresh Vegetables** (5+ serves daily):
• Leafy greens: spinach, kale, rocket
• Colourful varieties: carrots, capsicum, beetroot, broccoli
• Local seasonal options: pumpkin, zucchini, tomatoes

🍎 **Fresh Fruits** (2+ serves daily):
• Australian favourites: apples, bananas, oranges
• Seasonal berries: strawberries, blueberries, raspberries
• Tropical options: mango, pineapple, kiwi fruit

🐟 **Quality Proteins**:
• Australian seafood: barramundi, salmon, prawns
• Lean meats: grass-fed beef, free-range chicken
• Plant proteins: legumes, nuts, seeds

🌾 **Wholegrains**: Oats, brown rice, quinoa, wholemeal bread

Remember to stay hydrated and consider seeing your GP or an Accredited Practising Dietitian for personalised advice!${personalisation}`;
  }

  // Enhanced Exercise Responses
  if (lowerMessage.includes('exercise') || lowerMessage.includes('fitness') || lowerMessage.includes('workout') || lowerMessage.includes('gym')) {
    if (lowerMessage.includes('beginner') || lowerMessage.includes('start')) {
      return `${greeting}! Perfect time to start your fitness journey! Here's a beginner-friendly approach:

🚶 **Week 1-2: Foundation**
• 15-20 minutes walking daily
• Basic bodyweight exercises (squats, push-ups, planks)
• 2-3 times per week

💪 **Week 3-4: Building Up**
• 30 minutes activity daily
• Add light weights or resistance bands
• Include stretching/yoga

🏃 **Week 5+: Progression**
• Mix cardio and strength training
• 150 minutes moderate activity per week (Australian guidelines)
• Find activities you enjoy!

⚠️ **Important**: Start slowly, listen to your body, and consult your GP before beginning any new exercise program.${personalisation}`;
    }

    return `${greeting}! Here's a balanced approach to fitness:

🏃 **Cardio Options** (150+ minutes/week):
• Walking/jogging in your local area
• Swimming at community pools
• Cycling on bike paths
• Dancing, tennis, or team sports

💪 **Strength Training** (2-3 times/week):
• Bodyweight exercises at home
• Gym workouts with weights
• Resistance band training
• Functional movements (lifting, carrying)

🧘 **Recovery & Flexibility**:
• Gentle yoga or stretching
• Rest days between intense sessions
• Adequate sleep (7-9 hours)

🎯 **Set SMART goals**: Specific, Measurable, Achievable, Relevant, Time-bound.${personalisation}`;
  }

  // Enhanced Sleep Responses
  if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('insomnia')) {
    return `${greeting}! Quality sleep is crucial for health. Here are evidence-based strategies:

🌙 **Sleep Hygiene**:
• Consistent bedtime and wake time (even weekends!)
• Cool bedroom temperature (18-21°C)
• Dark, quiet environment
• Comfortable mattress and pillows

📱 **Evening Routine**:
• No screens 1-2 hours before bed
• Try reading, gentle stretching, or meditation
• Avoid large meals, caffeine, and alcohol before bedtime
• Consider a warm bath or herbal tea

☀️ **Daytime Habits**:
• Natural light exposure in the morning
• Regular exercise (but not close to bedtime)
• Limit daytime naps to 20-30 minutes

⏰ **Aim for 7-9 hours** nightly. If problems persist, consult your GP.${personalisation}`;
  }

  // Mental Health & Stress
  if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('mental health')) {
    return `${greeting}! Mental health is just as important as physical health:

🧘 **Stress Management Techniques**:
• Deep breathing exercises (4-7-8 technique)
• Mindfulness meditation (start with 5-10 minutes)
• Progressive muscle relaxation
• Regular physical activity

🌿 **Lifestyle Support**:
• Maintain social connections
• Spend time in nature
• Limit news/social media if overwhelming
• Establish work-life boundaries

💬 **Professional Support**:
• GP for initial assessment
• Mental Health Care Plan for subsidised sessions
• Lifeline: 13 11 14 (24/7 crisis support)
• Beyond Blue: 1300 22 4636

Remember: Seeking help is a sign of strength, not weakness.${personalisation}`;
  }

  // General Health & Wellness
  if (lowerMessage.includes('health') || lowerMessage.includes('wellness') || lowerMessage.includes('tips')) {
    return `${greeting}! Here are key pillars of good health:

🍎 **Nutrition**: Balanced diet with plenty of vegetables, fruits, lean proteins, and wholegrains

🏃 **Physical Activity**: 150+ minutes moderate exercise weekly + strength training

😴 **Quality Sleep**: 7-9 hours nightly with good sleep hygiene

💧 **Hydration**: 8-10 glasses of water daily (more in hot weather)

🧠 **Mental Wellbeing**: Stress management, social connections, mindfulness

🩺 **Preventive Care**: Regular GP check-ups, dental visits, health screenings

🚭 **Avoid**: Smoking, excessive alcohol, processed foods

Remember: Small, consistent changes lead to lasting improvements!${personalisation}`;
  }

  // Hydration
  if (lowerMessage.includes('water') || lowerMessage.includes('hydrat')) {
    return `${greeting}! Proper hydration is essential for optimal health:

💧 **Daily Targets**:
• General: 8-10 glasses (2-2.5L) daily
• Exercise: Extra 500-750ml per hour of activity
• Hot weather: Increase by 1-2 glasses
• Pregnancy/breastfeeding: Consult your GP for specific needs

🥤 **Best Sources**:
• Plain water (tap water in Australia is excellent!)
• Herbal teas, sparkling water
• Water-rich foods: cucumber, watermelon, oranges

⚠️ **Limit**: Sugary drinks, excessive caffeine, alcohol

📊 **Hydration Check**: Pale yellow urine indicates good hydration.${personalisation}`;
  }

  // Default response with conversation awareness
  const previousTopics = conversationHistory.slice(-4).map(h => h.content.toLowerCase()).join(' ');
  let contextualResponse = '';
  
  if (previousTopics.includes('food') && !lowerMessage.includes('food')) {
    contextualResponse = "\n\nSince we were discussing nutrition, remember that consistency is key - small changes make big differences over time!";
  } else if (previousTopics.includes('exercise') && !lowerMessage.includes('exercise')) {
    contextualResponse = "\n\nFollowing up on fitness - remember to start gradually and listen to your body!";
  }

  return `${greeting}! Thanks for your health question. While I'd love to provide more specific guidance, I recommend discussing this with your GP or a qualified health professional for personalised advice.

💡 **Quick Health Tips**:
• Eat a rainbow of fruits and vegetables
• Move your body daily (aim for 30 minutes)
• Prioritise 7-9 hours of quality sleep
• Stay hydrated throughout the day
• Practice stress management techniques
• Maintain social connections

🏥 **For specific concerns**: Please consult your GP, specialist, or call Healthdirect (1800 022 222) for health advice.${contextualResponse}${personalisation}`;
}

// Security middleware
app.use(helmet());

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3005', 
  'https://hodie-labs-webapp.web.app',
  'https://hodie-labs-webapp.firebaseapp.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Enhanced rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Chat-specific rate limiting
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit to 10 chat requests per minute
  message: { error: 'Too many chat requests, please slow down.' },
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Enhanced Schemas
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: Date.now },
  preferences: { type: Object, default: {} },
  healthData: {
    weight: Number,
    height: Number,
    age: Number,
    activityLevel: String,
    goals: [String],
    medicalConditions: [String],
    allergies: [String]
  },
  onboardingCompleted: { type: Boolean, default: false },
  screeningData: {
    completedAt: Date,
    responses: Object
  }
}, { timestamps: true });

const chatSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: [{
    id: String,
    text: String,
    sender: { type: String, enum: ['user', 'assistant'] },
    timestamp: { type: Date, default: Date.now },
    context: Object
  }],
  title: String,
  category: { type: String, default: 'general' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const healthMetricsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  steps: Number,
  calories: Number,
  distance: Number,
  sleepHours: Number,
  sleepQuality: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor'] },
  mood: String,
  weight: Number,
  bloodPressure: {
    systolic: Number,
    diastolic: Number
  },
  heartRate: Number,
  notes: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
const HealthMetrics = mongoose.model('HealthMetrics', healthMetricsSchema);

// Routes

// Health check with enhanced info
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Hodie API is running', 
    timestamp: new Date(),
    version: '2.0.0',
    features: {
      claudeAI: !!anthropic,
      mongodb: mongoose.connection.readyState === 1,
      cors: true,
      rateLimit: true
    }
  });
});

// Enhanced User routes
app.post('/api/users', async (req, res) => {
  try {
    const { uid, email, preferences, healthData } = req.body;
    
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      // Update last login
      existingUser.lastLoginAt = new Date();
      await existingUser.save();
      return res.status(200).json(existingUser);
    }
    
    const user = new User({
      uid,
      email,
      preferences: preferences || {},
      healthData: healthData || {},
      createdAt: new Date(),
      lastLoginAt: new Date()
    });
    
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/api/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

app.patch('/api/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const updateData = req.body;
    
    const user = await User.findOneAndUpdate(
      { uid },
      { ...updateData, lastLoginAt: new Date() },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Enhanced Chat endpoint
app.post('/api/chat', chatLimiter, async (req, res) => {
  try {
    const { message, userId, healthContext, conversationHistory } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Enhanced system prompt with Australian context
    let systemPrompt = `You are a helpful health and wellness assistant for Hodie Labs, a health tracking platform in Australia. You communicate using Australian English spelling and terminology.

Key guidelines:
- Use Australian English spelling (e.g., "realise" not "realize", "colour" not "color", "centre" not "center")
- Use Australian terms (GP, chemist, Lifeline, Beyond Blue, Medicare)
- Provide evidence-based health information following Australian health guidelines
- Always remind users that advice is general and they should consult healthcare professionals
- Be encouraging and supportive about health goals
- Keep responses concise but informative (aim for 200-400 words)
- Use appropriate emojis and formatting for better readability
- Reference Australian health services and emergency numbers when relevant
- Consider time of day and personalise greetings accordingly

Australian Health Context:
- Emergency: 000
- Health advice: Healthdirect 1800 022 222
- Mental health: Lifeline 13 11 14, Beyond Blue 1300 22 4636
- Physical activity guidelines: 150+ minutes moderate activity per week
- Temperature references in Celsius
- Use Australian food examples and seasonal produce`;

    // Add user-specific context
    if (healthContext && healthContext.recentHealthData) {
      const { steps, sleep, mood, healthScore } = healthContext.recentHealthData;
      systemPrompt += `\n\nUser Context (User ID: ${userId}):`;
      systemPrompt += `\nRecent health data:`;
      if (steps) systemPrompt += `\n- Steps: ${steps.toLocaleString()}`;
      if (sleep) systemPrompt += `\n- Sleep: ${sleep} hours`;
      if (mood) systemPrompt += `\n- Mood: ${mood}`;
      if (healthScore) systemPrompt += `\n- Health Score: ${healthScore}/100`;
      
      systemPrompt += `\n\nUse this data to provide personalised advice while keeping suggestions general.`;
    }

    let responseText;
    
    if (anthropic) {
      // Use real Claude AI
      try {
        const messages = [];
        
        // Add conversation history
        if (conversationHistory && conversationHistory.length > 0) {
          conversationHistory.slice(-6).forEach(msg => {
            messages.push({
              role: msg.role,
              content: msg.content
            });
          });
        }
        
        // Add current message
        messages.push({
          role: 'user',
          content: message
        });

        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          temperature: 0.7,
          system: systemPrompt,
          messages: messages
        });

        const textContent = response.content.find(
          (content) => content.type === 'text'
        );

        responseText = textContent?.text || 'I apologise, but I encountered an error processing your request.';
      } catch (claudeError) {
        console.error('Claude API error:', claudeError);
        responseText = generateIntelligentResponse(message, healthContext, conversationHistory);
      }
    } else {
      // Use enhanced mock response
      responseText = generateIntelligentResponse(message, healthContext, conversationHistory);
    }

    // Save chat interaction
    try {
      let chatSession = await ChatSession.findOne({ 
        userId, 
        isActive: true 
      }).sort({ updatedAt: -1 });

      if (!chatSession) {
        chatSession = new ChatSession({
          userId,
          messages: [],
          title: message.length > 50 ? message.substring(0, 50) + '...' : message,
          category: 'health'
        });
      }

      chatSession.messages.push(
        {
          id: Date.now().toString(),
          text: message,
          sender: 'user',
          timestamp: new Date(),
          context: healthContext
        },
        {
          id: (Date.now() + 1).toString(),
          text: responseText,
          sender: 'assistant',
          timestamp: new Date()
        }
      );

      await chatSession.save();
    } catch (saveError) {
      console.error('Error saving chat session:', saveError);
      // Continue even if saving fails
    }

    res.json({ 
      response: responseText,
      timestamp: new Date().toISOString(),
      aiProvider: anthropic ? 'claude' : 'enhanced_mock'
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ 
      error: 'I apologise, but I encountered an error processing your request. Please try again or contact support.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Chat session routes
app.get('/api/chat-sessions/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await ChatSession.find({ userId, isActive: true })
      .sort({ updatedAt: -1 })
      .limit(20);
    res.json(sessions);
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    res.status(500).json({ error: 'Failed to get chat sessions' });
  }
});

// Health metrics routes with enhanced validation
app.post('/api/health-metrics', async (req, res) => {
  try {
    const { userId, ...metricsData } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Validate numeric fields
    const numericFields = ['steps', 'calories', 'distance', 'sleepHours', 'weight', 'heartRate'];
    for (const field of numericFields) {
      if (metricsData[field] !== undefined && (isNaN(metricsData[field]) || metricsData[field] < 0)) {
        return res.status(400).json({ error: `Invalid ${field} value` });
      }
    }
    
    const metrics = new HealthMetrics({
      userId,
      ...metricsData
    });
    
    await metrics.save();
    res.status(201).json(metrics);
  } catch (error) {
    console.error('Error saving health metrics:', error);
    res.status(500).json({ error: 'Failed to save health metrics' });
  }
});

app.get('/api/health-metrics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, limit } = req.query;
    
    let query = { userId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    let queryBuilder = HealthMetrics.find(query).sort({ date: -1 });
    
    if (limit) {
      queryBuilder = queryBuilder.limit(parseInt(limit));
    }
    
    const metrics = await queryBuilder;
    res.json(metrics);
  } catch (error) {
    console.error('Error getting health metrics:', error);
    res.status(500).json({ error: 'Failed to get health metrics' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Hodie Backend API v2.0 running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Provider: ${anthropic ? 'Claude AI' : 'Enhanced Mock Responses'}`);
  console.log(`💾 Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});

module.exports = app;