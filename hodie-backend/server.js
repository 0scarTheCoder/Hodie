const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

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