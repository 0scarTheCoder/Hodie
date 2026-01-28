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
  heartRate: Number,
  aiProcessed: { type: Boolean, default: false },
  confidence: Number
}, { timestamps: true });

// Lab Results Schema
const labResultsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  testDate: { type: Date, default: Date.now },
  testType: String,
  results: mongoose.Schema.Types.Mixed,
  biomarkers: [{
    name: String,
    value: mongoose.Schema.Types.Mixed,
    unit: String,
    referenceRange: String,
    status: String
  }],
  aiProcessed: { type: Boolean, default: false },
  confidence: Number,
  notes: String
}, { timestamps: true });

// Genetic Data Schema
const geneticDataSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  provider: String,
  uploadDate: { type: Date, default: Date.now },
  variants: [{
    rsid: String,
    chromosome: String,
    position: Number,
    genotype: String,
    trait: String,
    significance: String
  }],
  rawData: mongoose.Schema.Types.Mixed,
  aiProcessed: { type: Boolean, default: false },
  confidence: Number
}, { timestamps: true });

// Wearable Data Schema
const wearableDataSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  device: String,
  syncDate: { type: Date, default: Date.now },
  dataType: String,
  metrics: mongoose.Schema.Types.Mixed,
  aiProcessed: { type: Boolean, default: false },
  confidence: Number
}, { timestamps: true });

// Medical Reports Schema
const medicalReportsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  reportType: String,
  reportDate: { type: Date, default: Date.now },
  provider: String,
  content: mongoose.Schema.Types.Mixed,
  extractedData: mongoose.Schema.Types.Mixed,
  aiProcessed: { type: Boolean, default: false },
  confidence: Number,
  fileName: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
const HealthMetrics = mongoose.model('HealthMetrics', healthMetricsSchema);
const LabResults = mongoose.model('LabResults', labResultsSchema);
const GeneticData = mongoose.model('GeneticData', geneticDataSchema);
const WearableData = mongoose.model('WearableData', wearableDataSchema);
const MedicalReports = mongoose.model('MedicalReports', medicalReportsSchema);

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

// Lab Results routes
app.post('/api/lab-results', async (req, res) => {
  try {
    const labResult = new LabResults(req.body);
    await labResult.save();
    res.status(201).json(labResult);
  } catch (error) {
    console.error('Error saving lab results:', error);
    res.status(500).json({ error: 'Failed to save lab results' });
  }
});

app.get('/api/lab-results/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await LabResults.find({ userId }).sort({ testDate: -1 });
    res.json(results);
  } catch (error) {
    console.error('Error getting lab results:', error);
    res.status(500).json({ error: 'Failed to get lab results' });
  }
});

// Genetic Data routes
app.post('/api/genetic-data', async (req, res) => {
  try {
    const geneticData = new GeneticData(req.body);
    await geneticData.save();
    res.status(201).json(geneticData);
  } catch (error) {
    console.error('Error saving genetic data:', error);
    res.status(500).json({ error: 'Failed to save genetic data' });
  }
});

app.get('/api/genetic-data/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await GeneticData.find({ userId }).sort({ uploadDate: -1 });
    res.json(data);
  } catch (error) {
    console.error('Error getting genetic data:', error);
    res.status(500).json({ error: 'Failed to get genetic data' });
  }
});

// Wearable Data routes
app.post('/api/wearable-data', async (req, res) => {
  try {
    const wearableData = new WearableData(req.body);
    await wearableData.save();
    res.status(201).json(wearableData);
  } catch (error) {
    console.error('Error saving wearable data:', error);
    res.status(500).json({ error: 'Failed to save wearable data' });
  }
});

app.get('/api/wearable-data/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await WearableData.find({ userId }).sort({ syncDate: -1 });
    res.json(data);
  } catch (error) {
    console.error('Error getting wearable data:', error);
    res.status(500).json({ error: 'Failed to get wearable data' });
  }
});

// Medical Reports routes
app.post('/api/medical-reports', async (req, res) => {
  try {
    const report = new MedicalReports(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    console.error('Error saving medical report:', error);
    res.status(500).json({ error: 'Failed to save medical report' });
  }
});

app.get('/api/medical-reports/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const reports = await MedicalReports.find({ userId }).sort({ reportDate: -1 });
    res.json(reports);
  } catch (error) {
    console.error('Error getting medical reports:', error);
    res.status(500).json({ error: 'Failed to get medical reports' });
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