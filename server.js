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
  }
} catch (error) {
  console.warn('⚠️ Claude AI not initialized. Using mock responses for demo.');
}

// Mock response function for demo purposes
function generateMockResponse(message, healthContext) {
  const lowerMessage = message.toLowerCase();
  
  // Australian English responses
  if (lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('nutrition')) {
    let response = `G'day! For optimal health, I'd recommend focusing on these foods in your diet:

🥬 **Fresh Vegetables**: Aim for a colourful variety - leafy greens, carrots, capsicum, and broccoli are fantastic choices.

🍎 **Fresh Fruits**: Seasonal Australian fruits like apples, bananas, berries, and citrus fruits provide essential vitamins and fibre.

🐟 **Lean Proteins**: Fish (especially oily fish like salmon and sardines), lean chicken, legumes, and nuts.

🌾 **Wholegrains**: Oats, brown rice, quinoa, and wholemeal bread for sustained energy.

🥑 **Healthy Fats**: Avocados, olive oil, nuts, and seeds.

Remember to stay hydrated and consider seeing your GP or a qualified dietitian for personalised advice. Every person's nutritional needs are different!`;

    if (healthContext?.recentHealthData?.healthScore) {
      response += `\n\nBased on your current health score of ${healthContext.recentHealthData.healthScore}/100, you're doing well! Keep up the good work with your health journey.`;
    }
    
    return response;
  }
  
  if (lowerMessage.includes('sleep')) {
    return `Here are some evidence-based strategies to improve your sleep quality:

🌙 **Sleep Schedule**: Stick to consistent bedtimes and wake times, even on weekends.

📱 **Screen Time**: Avoid screens 1-2 hours before bed, or use blue light filters.

🛏️ **Sleep Environment**: Keep your bedroom cool (18-21°C), dark, and quiet.

☕ **Caffeine**: Avoid caffeine after 2 PM, as it can stay in your system for 6-8 hours.

🧘 **Relaxation**: Try meditation, gentle stretching, or reading before bed.

If sleep problems persist, consider speaking with your GP for further guidance.`;
  }
  
  if (lowerMessage.includes('exercise') || lowerMessage.includes('fitness')) {
    return `For someone starting their fitness journey, here's what I'd recommend:

🚶 **Start Small**: Begin with 15-30 minutes of walking daily.

💪 **Strength Training**: 2-3 times per week with bodyweight exercises or light weights.

❤️ **Cardio**: Activities you enjoy - swimming, cycling, dancing, or brisk walking.

📅 **Consistency**: Aim for at least 150 minutes of moderate activity per week (as per Australian guidelines).

🎯 **Goals**: Set realistic, measurable goals and celebrate small wins.

Always consult with a healthcare professional before starting a new exercise program, especially if you have any health concerns.`;
  }
  
  if (lowerMessage.includes('stress')) {
    return `Here are some healthy strategies to manage stress:

🧘 **Mindfulness**: Practice meditation or deep breathing exercises daily.

🏃 **Physical Activity**: Regular exercise is one of the best stress relievers.

😴 **Quality Sleep**: Prioritise 7-9 hours of quality sleep each night.

👥 **Social Support**: Connect with friends, family, or consider counselling.

⏰ **Time Management**: Break large tasks into smaller, manageable steps.

🌿 **Nature**: Spend time outdoors - even a short walk can help.

If stress becomes overwhelming, don't hesitate to speak with your GP or a mental health professional.`;
  }
  
  // General health response
  return `Thanks for your health question! While I'd love to provide more specific guidance, I recommend discussing this with a qualified healthcare professional who can give you personalised advice.

In the meantime, focus on the fundamentals:
• Balanced nutrition with plenty of fresh fruits and vegetables
• Regular physical activity
• Quality sleep (7-9 hours)
• Staying hydrated
• Managing stress

For specific medical concerns, please consult your GP or relevant healthcare specialist.`;
}

// Security middleware
app.use(helmet());

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3005', 
  'https://hodie-labs-webapp.web.app',
  'https://hodie-labs-webapp.firebaseapp.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

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

// User Schema
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
    goals: [String]
  }
}, { timestamps: true });

// Chat Session Schema
const chatSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: [{
    id: String,
    text: String,
    sender: { type: String, enum: ['user', 'assistant'] },
    timestamp: { type: Date, default: Date.now }
  }],
  title: String,
  category: String
}, { timestamps: true });

// Health Metrics Schema
const healthMetricsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  steps: Number,
  calories: Number,
  distance: Number,
  sleepHours: Number,
  sleepQuality: String,
  mood: String,
  weight: Number,
  bloodPressure: {
    systolic: Number,
    diastolic: Number
  },
  heartRate: Number
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
const HealthMetrics = mongoose.model('HealthMetrics', healthMetricsSchema);

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Hodie API is running', timestamp: new Date() });
});

// User routes
app.post('/api/users', async (req, res) => {
  try {
    const { uid, email, preferences } = req.body;
    
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return res.status(200).json(existingUser);
    }
    
    const user = new User({
      uid,
      email,
      preferences: preferences || {},
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

app.patch('/api/users/:uid/login', async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOneAndUpdate(
      { uid },
      { lastLoginAt: new Date() },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating login time:', error);
    res.status(500).json({ error: 'Failed to update login time' });
  }
});

// Chat session routes
app.post('/api/chat-sessions', async (req, res) => {
  try {
    const { userId, messages, title, category } = req.body;
    
    const chatSession = new ChatSession({
      userId,
      messages,
      title: title || 'Health Chat',
      category: category || 'general'
    });
    
    await chatSession.save();
    res.status(201).json(chatSession);
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

app.get('/api/chat-sessions/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await ChatSession.find({ userId }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    res.status(500).json({ error: 'Failed to get chat sessions' });
  }
});

app.patch('/api/chat-sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { messages } = req.body;
    
    const session = await ChatSession.findByIdAndUpdate(
      id,
      { messages, updatedAt: new Date() },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error updating chat session:', error);
    res.status(500).json({ error: 'Failed to update chat session' });
  }
});

// Health metrics routes
app.post('/api/health-metrics', async (req, res) => {
  try {
    const { userId, ...metricsData } = req.body;
    
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
    const { startDate, endDate } = req.query;
    
    let query = { userId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const metrics = await HealthMetrics.find(query).sort({ date: -1 });
    res.json(metrics);
  } catch (error) {
    console.error('Error getting health metrics:', error);
    res.status(500).json({ error: 'Failed to get health metrics' });
  }
});

// Claude AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId, healthContext, conversationHistory } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build system prompt with Australian English and health context
    let systemPrompt = `You are a helpful health and wellness assistant for Hodie Labs, a health tracking platform. You communicate using Australian English spelling and terminology.

Key guidelines:
- Use Australian English spelling (e.g., "realise" not "realize", "colour" not "color", "centre" not "center")
- Use Australian terms where appropriate (e.g., "GP" for doctor, "chemist" for pharmacy)
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

    // Add user-specific health context if available
    if (healthContext && healthContext.recentHealthData) {
      const { steps, sleep, mood, healthScore } = healthContext.recentHealthData;
      systemPrompt += `\n\nUser Context (User ID: ${userId}):`;
      systemPrompt += `\nRecent health data:`;
      if (steps) systemPrompt += `\n- Steps: ${steps.toLocaleString()}`;
      if (sleep) systemPrompt += `\n- Sleep: ${sleep} hours`;
      if (mood) systemPrompt += `\n- Mood: ${mood}`;
      if (healthScore) systemPrompt += `\n- Health Score: ${healthScore}/100`;
      
      systemPrompt += `\n\nYou can reference this data when providing personalised advice, but remember to keep suggestions general and encourage professional consultation for specific health concerns.`;
    }

    // Build conversation messages
    const messages = [];
    
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
      content: message
    });

    let responseText;
    
    if (anthropic) {
      // Use real Claude AI if available
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.7,
        system: systemPrompt,
        messages: messages
      });

      // Extract text from response
      const textContent = response.content.find(
        (content) => content.type === 'text'
      );

      responseText = textContent?.text || 'I apologise, but I encountered an error processing your request.';
    } else {
      // Use mock response for demo
      responseText = generateMockResponse(message, healthContext);
    }

    res.json({ 
      response: responseText,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ 
      error: 'I apologise, but I encountered an error processing your request. Please try again or contact support.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Hodie Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;