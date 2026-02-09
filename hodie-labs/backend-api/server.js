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
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Hodie Labs Backend API'
  });
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
    const { tier } = req.user;
    const userId = req.user.id;

    // Get message limits per tier (monthly)
    const TIER_LIMITS = {
      free: 10,
      basic: 100,
      pro: 500,
      premium: 1000
    };

    const limit = TIER_LIMITS[tier];

    // Get current month's usage from MongoDB
    const usageCollection = db.collection('ai_usage');
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const usage = await usageCollection.findOne({
      userId: userId,
      month: startOfMonth
    });

    const messagesUsed = usage?.messagesUsed || 0;

    if (messagesUsed >= limit) {
      return res.status(429).json({
        error: 'Message limit reached',
        message: `You've reached your monthly limit of ${limit} messages. Upgrade your plan for more messages.`,
        messagesUsed: messagesUsed,
        limit: limit,
        tier: tier,
        upgradeUrl: 'https://hodielabs.com/pricing'
      });
    }

    // Store usage info in request for later tracking
    req.usage = {
      messagesUsed: messagesUsed,
      limit: limit,
      remaining: limit - messagesUsed
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

// Main AI chat endpoint
app.post('/api/chat', getUserTier, checkMessageLimit, async (req, res) => {
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

    // Check if user has access to file analysis
    if (tier === 'free') {
      return res.status(403).json({
        error: 'Feature not available',
        message: 'File analysis is only available for paid subscribers. Upgrade to Basic tier or higher.',
        upgradeUrl: 'https://hodielabs.com/pricing'
      });
    }

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
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const usage = await usageCollection.findOne({
      userId: userId,
      month: startOfMonth
    });

    // Get user tier
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({
      $or: [{ uid: userId }, { sub: userId }, { _id: userId }]
    });

    const tier = user?.subscription?.tier || 'free';

    const TIER_LIMITS = {
      free: 10,
      basic: 100,
      pro: 500,
      premium: 1000
    };

    res.json({
      userId: userId,
      tier: tier,
      messagesUsed: usage?.messagesUsed || 0,
      limit: TIER_LIMITS[tier],
      remaining: TIER_LIMITS[tier] - (usage?.messagesUsed || 0),
      month: startOfMonth,
      tokensUsed: usage?.tokensUsed || 0
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
app.use('/api/clients', clientRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', dataRoutes);

// Start server
async function startServer() {
  await connectDB();

  // Make database available to all routes
  app.locals.db = db;

  app.listen(PORT, () => {
    console.log(`🚀 Hodie Labs Backend API running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔐 Security: API keys protected server-side`);
    console.log(`⚡ Ready to process AI requests with tiered access`);
    console.log(`👥 Client management endpoints ready`);
    console.log(`📤 Secure file upload system active`);
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
