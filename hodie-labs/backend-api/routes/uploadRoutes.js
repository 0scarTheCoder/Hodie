/**
 * File Upload Routes
 * Handles health data file uploads with restrictions
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const Client = require('../models/Client');
const Upload = require('../models/Upload');
const { authenticateUser } = require('../middleware/authMiddleware');

// Configure multer for file uploads (store in memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = ['text/csv', 'application/json', 'application/pdf', 'text/plain'];
    const allowedExtensions = ['.csv', '.json', '.pdf', '.txt'];

    const fileExt = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));

    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: CSV, JSON, PDF, TXT'));
    }
  }
});

/**
 * POST /api/upload
 * Upload health data file with restrictions
 */
router.post('/', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    const { category } = req.body; // lab_results, genetic_data, wearable_data, etc.

    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please provide a file to upload'
      });
    }

    if (!category) {
      return res.status(400).json({
        error: 'Category required',
        message: 'Please specify the data category (lab_results, genetic_data, etc.)'
      });
    }

    // Get or create client
    let client = await Client.findByAuthProviderUserId(
      req.app.locals.db,
      req.auth.userId
    );

    if (!client) {
      // Auto-create client on first upload
      const clientData = {
        email: req.auth.email,
        authProvider: req.auth.provider,
        authProviderUserId: req.auth.userId,
        subscriptionLevel: 'Free'
      };

      client = await Client.create(req.app.locals.db, clientData);
      console.log(`✅ Auto-created client: ${client.clientID} on first upload`);
    }

    // Check upload restrictions
    const uploadCheck = await Upload.canUploadToday(req.app.locals.db, client.clientID);

    if (!uploadCheck.canUpload) {
      return res.status(429).json({
        error: 'Upload limit reached',
        message: `You've reached your daily limit of 3 uploads. Try again tomorrow.`,
        uploadsToday: uploadCheck.uploadsToday,
        remainingToday: uploadCheck.remainingToday
      });
    }

    // Calculate file hash for duplicate detection
    const fileHash = Upload.calculateFileHash(req.file.buffer);

    // Check for duplicates
    const duplicateCheck = await Upload.isDuplicate(
      req.app.locals.db,
      client.clientID,
      fileHash
    );

    if (duplicateCheck.isDuplicate) {
      return res.status(409).json({
        error: 'Duplicate file',
        message: `This file was already uploaded on ${duplicateCheck.existingUpload.uploadDate.toLocaleDateString()}`,
        existingUpload: duplicateCheck.existingUpload
      });
    }

    // Parse file content
    let parsedData;
    let recordsCount = 0;

    try {
      const fileContent = req.file.buffer.toString('utf-8');

      if (req.file.originalname.endsWith('.csv')) {
        // Parse CSV
        parsedData = parseCSV(fileContent);
        recordsCount = parsedData.length;
      } else if (req.file.originalname.endsWith('.json')) {
        // Parse JSON
        parsedData = JSON.parse(fileContent);
        recordsCount = Array.isArray(parsedData) ? parsedData.length : 1;
      } else {
        // For other types, store raw content
        parsedData = fileContent;
        recordsCount = 1;
      }
    } catch (parseError) {
      return res.status(400).json({
        error: 'File parsing failed',
        message: `Could not parse file: ${parseError.message}`
      });
    }

    // Create upload record
    const uploadRecord = await Upload.create(req.app.locals.db, {
      clientID: client.clientID,
      fileName: req.file.originalname,
      fileHash: fileHash,
      fileSize: req.file.size,
      fileType: req.file.originalname.split('.').pop(),
      category: category,
      recordsCount: recordsCount
    });

    // Store actual data in appropriate collection
    const dataCollection = req.app.locals.db.collection(category);
    await dataCollection.insertOne({
      clientID: client.clientID,
      uploadId: uploadRecord._id,
      fileName: req.file.originalname,
      uploadDate: new Date(),
      testType: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      results: parsedData,
      metadata: {
        fileSize: req.file.size,
        fileHash: fileHash,
        recordsCount: recordsCount
      }
    });

    // Update upload status to completed
    await Upload.updateStatus(req.app.locals.db, uploadRecord._id, 'completed');

    // Increment client's upload count
    await Client.incrementUploads(req.app.locals.db, client.clientID);

    console.log(`✅ Upload complete: ${client.clientID} uploaded ${req.file.originalname} (${recordsCount} records)`);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      upload: {
        uploadId: uploadRecord._id,
        fileName: req.file.originalname,
        category: category,
        recordsCount: recordsCount,
        fileSize: req.file.size,
        uploadDate: uploadRecord.uploadDate
      },
      uploadStats: {
        uploadsToday: uploadCheck.uploadsToday + 1,
        remainingToday: uploadCheck.remainingToday - 1,
        totalUploads: client.uploadsMade + 1
      }
    });

  } catch (error) {
    console.error('Upload error:', error);

    // Handle specific errors
    if (error.message.includes('Daily upload limit')) {
      return res.status(429).json({
        error: 'Upload limit reached',
        message: error.message
      });
    }

    if (error.message.includes('already uploaded')) {
      return res.status(409).json({
        error: 'Duplicate file',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

/**
 * GET /api/upload/history
 * Get current user's upload history
 */
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const client = await Client.findByAuthProviderUserId(
      req.app.locals.db,
      req.auth.userId
    );

    if (!client) {
      return res.json({
        success: true,
        uploads: [],
        message: 'No client profile found'
      });
    }

    const limit = parseInt(req.query.limit) || 50;
    const uploads = await Upload.getClientHistory(
      req.app.locals.db,
      client.clientID,
      limit
    );

    res.json({
      success: true,
      count: uploads.length,
      uploads: uploads
    });

  } catch (error) {
    console.error('Error fetching upload history:', error);
    res.status(500).json({
      error: 'Failed to fetch upload history',
      message: error.message
    });
  }
});

/**
 * GET /api/upload/today
 * Get today's uploads for current user
 */
router.get('/today', authenticateUser, async (req, res) => {
  try {
    const client = await Client.findByAuthProviderUserId(
      req.app.locals.db,
      req.auth.userId
    );

    if (!client) {
      return res.json({
        success: true,
        uploads: [],
        uploadsToday: 0,
        remainingToday: 3
      });
    }

    const uploads = await Upload.getTodayUploads(
      req.app.locals.db,
      client.clientID
    );

    res.json({
      success: true,
      uploadsToday: uploads.length,
      remainingToday: Math.max(0, 3 - uploads.length),
      uploads: uploads
    });

  } catch (error) {
    console.error('Error fetching today uploads:', error);
    res.status(500).json({
      error: 'Failed to fetch today uploads',
      message: error.message
    });
  }
});

/**
 * GET /api/upload/statistics
 * Get upload statistics for current user
 */
router.get('/statistics', authenticateUser, async (req, res) => {
  try {
    const client = await Client.findByAuthProviderUserId(
      req.app.locals.db,
      req.auth.userId
    );

    if (!client) {
      return res.json({
        success: true,
        statistics: {
          totalUploads: 0,
          todayUploads: 0,
          remainingToday: 3,
          uploadsByCategory: []
        }
      });
    }

    const statistics = await Upload.getStatistics(
      req.app.locals.db,
      client.clientID
    );

    res.json({
      success: true,
      statistics: statistics
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

/**
 * Helper function to parse CSV
 */
function parseCSV(content) {
  const lines = content.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    data.push(row);
  }

  return data;
}

module.exports = router;
