/**
 * Hodie Labs Backend API Server
 *
 * Purpose: Secure AI API proxy with tiered subscription access
 * - Hides API keys from frontend (security)
 * - Routes to different AI models based on user tier
 * - Implements rate limiting per subscription level
 * - Tracks usage for billing
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { MongoClient } = require('mongodb');

// Import AI service handlers
const ClaudeService = require('./services/claudeService');
const GroqService = require('./services/groqService');
const UsageTracker = require('./services/usageTracker');

// Import routes
const clientRoutes = require('./routes/clientRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const dataRoutes = require('./routes/dataRoutes');
const visualizationRoutes = require('./routes/visualizationRoutes');
const recommendationsRoutes = require('./routes/recommendationsRoutes');

// Import rate limiters
const {
  generalLimiter,
  uploadLimiter,
  chatLimiter,
  recommendationsLimiter,
  dataFetchLimiter
} = require('./middleware/rateLimitMiddleware');

// Import error handlers
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import auth middleware for inline routes
const { authenticateUser, ensureClient } = require('./middleware/authMiddleware');
const Client = require('./models/Client');

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB Connection
let db;
const mongoClient = new MongoClient(process.env.MONGODB_URI);

async function connectDB() {
  try {
    await mongoClient.connect();
    db = mongoClient.db('hodie_app');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'https://hodie-labs-webapp.web.app', 'https://hodie-labs-webapp.firebaseapp.com'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Hodie Labs Backend API',
    version: '2.2.0'
  });
});

// API key usage tracking stubs (used by autoApiKeyService on frontend)
app.patch('/api/users/:userId/api-key/usage', (req, res) => {
  res.json({ success: true, message: 'Usage tracked' });
});
app.get('/api/users/:userId/api-key', (req, res) => {
  res.json({ apiKey: null, message: 'API keys managed server-side' });
});

// File interpretation endpoint (for when frontend Kimi K2 fails)
// Uses backend Claude to interpret uploaded files
app.post('/api/interpret-file', chatLimiter, async (req, res) => {
  try {
    const { fileData, fileName, fileCategory, userId } = req.body;

    if (!fileData || !fileName) {
      return res.status(400).json({
        error: 'File data required',
        message: 'Please provide fileData and fileName in the request body'
      });
    }

    console.log(`📄 Interpreting file via backend Claude: ${fileName} (${fileCategory})`);

    const claudeService = new ClaudeService('haiku');
    const analysis = await claudeService.analyzeFile(fileData, fileName, fileCategory);

    console.log(`✅ File interpretation complete for: ${fileName}`);

    res.json({
      interpretation: analysis.interpretation,
      databaseMappings: analysis.databaseMappings,
      clarifyingQuestions: analysis.clarifyingQuestions,
      recommendations: analysis.recommendations
    });

  } catch (error) {
    console.error('❌ File interpretation error:', error);
    res.status(500).json({
      error: 'File interpretation failed',
      message: error.message
    });
  }
});

// Middleware to get user subscription tier
async function getUserTier(req, res, next) {
  try {
    const userId = req.body.userId || req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({
        error: 'User ID required',
        message: 'Please provide userId in request body or x-user-id header'
      });
    }

    // Fetch user subscription from MongoDB
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({
      $or: [
        { uid: userId },
        { sub: userId },
        { _id: userId }
      ]
    });

    // Determine tier (default to free if not found or no subscription)
    const tier = user?.subscription?.tier || 'free';

    req.user = {
      id: userId,
      tier: tier,
      subscription: user?.subscription || { tier: 'free', messagesUsed: 0 }
    };

    next();
  } catch (error) {
    console.error('Error fetching user tier:', error);
    // Default to free tier on error
    req.user = {
      id: req.body.userId || req.headers['x-user-id'],
      tier: 'free',
      subscription: { tier: 'free', messagesUsed: 0 }
    };
    next();
  }
}

// Middleware to check message limits
async function checkMessageLimit(req, res, next) {
  try {
    const userId = req.user.id;

    // Daily conversation limit - same for all tiers (50 per day)
    // Tiers differ by AI model quality, not message limits
    const DAILY_LIMIT = 50;

    // Get today's usage from MongoDB
    const usageCollection = db.collection('ai_usage');
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const usage = await usageCollection.findOne({
      userId: userId,
      day: startOfDay
    });

    const messagesUsed = usage?.messagesUsed || 0;

    if (messagesUsed >= DAILY_LIMIT) {
      return res.status(429).json({
        error: 'Daily limit reached',
        message: `You've reached your daily limit of ${DAILY_LIMIT} conversations. Your limit resets at midnight.`,
        messagesUsed: messagesUsed,
        limit: DAILY_LIMIT,
        tier: req.user.tier,
        resetsAt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Store usage info in request for later tracking
    req.usage = {
      messagesUsed: messagesUsed,
      limit: DAILY_LIMIT,
      remaining: DAILY_LIMIT - messagesUsed
    };

    next();
  } catch (error) {
    console.error('Error checking message limit:', error);
    // Allow request on error (fail open for better UX)
    next();
  }
}

// Rate limiter factory - creates rate limiters per tier
function createRateLimiter(tier) {
  const limits = {
    free: parseInt(process.env.FREE_TIER_RATE_LIMIT) || 5,
    basic: parseInt(process.env.BASIC_TIER_RATE_LIMIT) || 20,
    pro: parseInt(process.env.PRO_TIER_RATE_LIMIT) || 100,
    premium: parseInt(process.env.PREMIUM_TIER_RATE_LIMIT) || 200
  };

  return rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
    max: limits[tier],
    message: {
      error: 'Too many requests',
      message: `Rate limit exceeded for ${tier} tier. Please wait a moment.`
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

// Main AI chat endpoint (with rate limiting)
app.post('/api/chat', chatLimiter, getUserTier, checkMessageLimit, async (req, res) => {
  try {
    const { tier } = req.user;
    const { message, conversationHistory, healthContext } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message required',
        message: 'Please provide a message in the request body'
      });
    }

    console.log(`🤖 Processing chat request for user ${req.user.id} (${tier} tier)`);

    let response;
    let modelUsed;
    let tokensUsed = 0;

    // Route to appropriate AI model based on tier
    switch (tier) {
      case 'free':
        // Use Groq (free) for free tier
        console.log('📱 Routing to Groq Llama 3 (free tier)');
        const groqService = new GroqService();
        response = await groqService.generateResponse(message, conversationHistory, healthContext);
        modelUsed = 'groq-llama-3-8b';
        tokensUsed = response.tokensUsed || 800;
        break;

      case 'basic':
      case 'pro':
        // Use Claude Haiku for basic/pro tiers
        console.log('📱 Routing to Claude 3 Haiku');
        const claudeService = new ClaudeService('haiku');
        response = await claudeService.generateResponse(message, conversationHistory, healthContext);
        modelUsed = 'claude-3-haiku';
        tokensUsed = response.tokensUsed || 1200;
        break;

      case 'premium':
        // Use Claude 3.5 Sonnet for premium tier
        console.log('📱 Routing to Claude 3.5 Sonnet');
        const claudeSonnetService = new ClaudeService('sonnet');
        response = await claudeSonnetService.generateResponse(message, conversationHistory, healthContext);
        modelUsed = 'claude-3.5-sonnet';
        tokensUsed = response.tokensUsed || 2000;
        break;

      default:
        // Default to free tier
        console.log('📱 Routing to Groq Llama 3 (default)');
        const defaultGroqService = new GroqService();
        response = await defaultGroqService.generateResponse(message, conversationHistory, healthContext);
        modelUsed = 'groq-llama-3-8b';
        tokensUsed = response.tokensUsed || 800;
    }

    // Track usage in MongoDB
    const usageTracker = new UsageTracker(db);
    await usageTracker.trackMessage(req.user.id, tier, modelUsed, tokensUsed);

    // Return response with usage metadata
    res.json({
      response: response.text || response,
      metadata: {
        tier: tier,
        model: modelUsed,
        tokensUsed: tokensUsed,
        messagesRemaining: req.usage.remaining - 1,
        messagesUsed: req.usage.messagesUsed + 1,
        limit: req.usage.limit
      }
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({
      error: 'AI processing failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// File analysis endpoint (paid tiers only)
app.post('/api/analyze-file', getUserTier, checkMessageLimit, async (req, res) => {
  try {
    const { tier } = req.user;
    const { fileData, fileName, fileCategory } = req.body;

    if (!fileData || !fileName) {
      return res.status(400).json({
        error: 'File data required',
        message: 'Please provide fileData and fileName in the request body'
      });
    }

    console.log(`📄 Analyzing file for user ${req.user.id} (${tier} tier): ${fileName}`);

    // Use Claude for file analysis (even basic tier gets Claude for this)
    const model = tier === 'premium' ? 'sonnet' : 'haiku';
    const claudeService = new ClaudeService(model);
    const analysis = await claudeService.analyzeFile(fileData, fileName, fileCategory);

    // Track usage
    const usageTracker = new UsageTracker(db);
    await usageTracker.trackFileAnalysis(req.user.id, tier, `claude-3-${model}`, fileName);

    res.json({
      analysis: analysis,
      metadata: {
        tier: tier,
        model: `claude-3-${model}`,
        fileName: fileName,
        messagesRemaining: req.usage.remaining - 1
      }
    });

  } catch (error) {
    console.error('❌ File analysis error:', error);
    res.status(500).json({
      error: 'File analysis failed',
      message: error.message
    });
  }
});

// Get user's current usage stats
app.get('/api/usage/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const usageCollection = db.collection('ai_usage');
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Daily usage for limit tracking
    const dailyUsage = await usageCollection.findOne({
      userId: userId,
      day: startOfDay
    });

    // Get user tier
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({
      $or: [{ uid: userId }, { sub: userId }, { _id: userId }]
    });

    const tier = user?.subscription?.tier || 'free';
    const DAILY_LIMIT = 50;
    const messagesUsed = dailyUsage?.messagesUsed || 0;

    res.json({
      userId: userId,
      tier: tier,
      messagesUsed: messagesUsed,
      limit: DAILY_LIMIT,
      remaining: DAILY_LIMIT - messagesUsed,
      period: 'daily',
      date: startOfDay,
      resetsAt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      tokensUsed: dailyUsage?.tokensUsed || 0
    });

  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).json({ error: 'Failed to fetch usage data' });
  }
});

// Admin endpoint - get all usage stats (protected - add auth later)
app.get('/api/admin/usage-stats', async (req, res) => {
  try {
    const usageCollection = db.collection('ai_usage');
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = await usageCollection.aggregate([
      { $match: { month: startOfMonth } },
      {
        $group: {
          _id: '$tier',
          totalUsers: { $sum: 1 },
          totalMessages: { $sum: '$messagesUsed' },
          totalTokens: { $sum: '$tokensUsed' },
          avgMessagesPerUser: { $avg: '$messagesUsed' }
        }
      }
    ]).toArray();

    res.json({
      month: startOfMonth,
      stats: stats
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// New Client Management & Data Routes
// These routes use JWT authentication and enforce data ownership
app.use('/api/clients', generalLimiter, clientRoutes);
app.use('/api/upload', uploadLimiter, uploadRoutes);
app.use('/api/lab-results', dataFetchLimiter);
app.use('/api/genetic-data', dataFetchLimiter);
app.use('/api/medical-reports', dataFetchLimiter);
app.use('/api/wearable-data', dataFetchLimiter);
app.use('/api/health-metrics', dataFetchLimiter);
app.use('/api', dataRoutes); // General data routes
app.use('/api/recommendations', recommendationsLimiter, recommendationsRoutes);

// User profile route (for onboarding)
// Creates/updates the client record in the clients collection with onboarding data
app.post('/api/users/:userId/profile', authenticateUser, ensureClient, async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData = req.body;

    // Also save to user_profiles for backwards compatibility
    const usersCollection = db.collection('user_profiles');
    await usersCollection.updateOne(
      { userId },
      { $set: { ...profileData, userId, updatedAt: new Date() } },
      { upsert: true }
    );

    // Map onboarding profile data to client fields and update the clients collection
    const clientUpdates = {};
    if (profileData.basicInfo) {
      if (profileData.basicInfo.age) clientUpdates.age = parseInt(profileData.basicInfo.age) || null;
      if (profileData.basicInfo.gender) clientUpdates.sex = profileData.basicInfo.gender;
      if (profileData.basicInfo.height) clientUpdates.height = parseFloat(profileData.basicInfo.height) || null;
      if (profileData.basicInfo.weight) clientUpdates.weight = parseFloat(profileData.basicInfo.weight) || null;
      if (profileData.basicInfo.activityLevel) {
        // Map onboarding activity levels to Client model values
        const activityMap = {
          'sedentary': 'Low',
          'light': 'Low',
          'moderate': 'Moderate',
          'very': 'High',
          'extra': 'Very High'
        };
        clientUpdates.exerciseLevel = activityMap[profileData.basicInfo.activityLevel] || 'Moderate';
      }
    }

    // Store health goals and preferences on the client record
    if (profileData.healthGoals) clientUpdates.healthGoals = profileData.healthGoals;
    if (profileData.preferences) clientUpdates.preferences = profileData.preferences;

    // Update the client record if we have any data to update
    if (Object.keys(clientUpdates).length > 0 && req.auth.clientID) {
      const clientsCollection = db.collection('clients');
      await clientsCollection.updateOne(
        { clientID: req.auth.clientID },
        { $set: { ...clientUpdates, updatedAt: new Date() } }
      );
      console.log(`✅ Updated client ${req.auth.clientID} with onboarding profile data`);
    }

    res.json({ success: true, userId, clientID: req.auth.clientID || null });
  } catch (error) {
    console.error('Error saving user profile:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Visualization Routes (JavaScript-based chart generation)
app.use('/api/visualize', generalLimiter, visualizationRoutes);

// Error Handlers (must be after all routes)
app.use(notFoundHandler); // Handle 404s
app.use(errorHandler); // Handle all other errors

// Start server
async function startServer() {
  await connectDB();

  // Make database available to all routes
  app.locals.db = db;

  app.listen(PORT, () => {
    console.log(`🚀 Hodie Labs Backend API running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔐 Security: API keys protected server-side`);
    console.log(`🛡️  Rate limiting active on all endpoints`);
    console.log(`⚡ Ready to process AI requests with tiered access`);
    console.log(`👥 Client management endpoints ready`);
    console.log(`📤 Secure file upload system active`);
    console.log(`💡 Recommendations tracking enabled`);
    console.log(`🔒 Error sanitization enabled`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoClient.close();
  process.exit(0);
});

startServer().catch(console.error);

module.exports = app;
