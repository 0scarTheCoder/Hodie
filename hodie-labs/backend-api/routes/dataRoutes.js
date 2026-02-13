/**
 * Health Data Routes
 * Secure endpoints for accessing uploaded health data
 */

const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { authenticateUser } = require('../middleware/authMiddleware');

/**
 * GET /api/lab-results/:userId
 * Get lab results for a specific user (must be owner)
 */
router.get('/lab-results/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is accessing their own data
    if (userId !== req.auth.userId && !req.auth.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own health data'
      });
    }

    // Fetch lab results for this user (query by userId directly)
    const labResultsCollection = req.app.locals.db.collection('labresults');
    const results = await labResultsCollection
      .find({ userId: userId })
      .sort({ uploadDate: -1 })
      .toArray();

    res.json(results);

  } catch (error) {
    console.error('Error fetching lab results:', error);
    res.status(500).json({
      error: 'Failed to fetch lab results',
      message: error.message
    });
  }
});

/**
 * POST /api/lab-results
 * Save new lab results for authenticated user
 */
router.post('/lab-results', authenticateUser, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const labData = req.body;

    // Validate required fields
    if (!labData || typeof labData !== 'object') {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'Please provide valid lab results data'
      });
    }

    const labResultsCollection = req.app.locals.db.collection('labresults');

    // Add metadata
    const document = {
      ...labData,
      userId: userId,
      uploadDate: new Date(),
      createdAt: new Date(),
      source: 'chat_interface'
    };

    const result = await labResultsCollection.insertOne(document);

    console.log(`✅ Saved lab results for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Lab results saved successfully',
      id: result.insertedId
    });

  } catch (error) {
    console.error('Error saving lab results:', error);
    res.status(500).json({
      error: 'Failed to save lab results',
      message: error.message
    });
  }
});

/**
 * GET /api/genetic-data/:userId
 * Get genetic data for a specific user
 */
router.get('/genetic-data/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.auth.userId && !req.auth.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own health data'
      });
    }

    const geneticDataCollection = req.app.locals.db.collection('geneticdatas');
    const results = await geneticDataCollection
      .find({ userId: userId })
      .sort({ uploadDate: -1 })
      .toArray();

    res.json(results);

  } catch (error) {
    console.error('Error fetching genetic data:', error);
    res.status(500).json({
      error: 'Failed to fetch genetic data',
      message: error.message
    });
  }
});

/**
 * POST /api/genetic-data
 * Save new genetic data for authenticated user
 */
router.post('/genetic-data', authenticateUser, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const geneticData = req.body;

    if (!geneticData || typeof geneticData !== 'object') {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'Please provide valid genetic data'
      });
    }

    const geneticDataCollection = req.app.locals.db.collection('geneticdatas');

    const document = {
      ...geneticData,
      userId: userId,
      uploadDate: new Date(),
      createdAt: new Date(),
      source: 'chat_interface'
    };

    const result = await geneticDataCollection.insertOne(document);

    console.log(`✅ Saved genetic data for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Genetic data saved successfully',
      id: result.insertedId
    });

  } catch (error) {
    console.error('Error saving genetic data:', error);
    res.status(500).json({
      error: 'Failed to save genetic data',
      message: error.message
    });
  }
});

/**
 * GET /api/wearable-data/:userId
 * Get wearable data for a specific user
 */
router.get('/wearable-data/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.auth.userId && !req.auth.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own health data'
      });
    }

    const wearableDataCollection = req.app.locals.db.collection('wearabledatas');
    const limit = parseInt(req.query.limit) || 30;

    const results = await wearableDataCollection
      .find({ userId: userId })
      .sort({ uploadDate: -1 })
      .limit(limit)
      .toArray();

    res.json(results);

  } catch (error) {
    console.error('Error fetching wearable data:', error);
    res.status(500).json({
      error: 'Failed to fetch wearable data',
      message: error.message
    });
  }
});

/**
 * POST /api/wearable-data
 * Save new wearable data for authenticated user
 */
router.post('/wearable-data', authenticateUser, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const wearableData = req.body;

    if (!wearableData || typeof wearableData !== 'object') {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'Please provide valid wearable data'
      });
    }

    const wearableDataCollection = req.app.locals.db.collection('wearabledatas');

    const document = {
      ...wearableData,
      userId: userId,
      uploadDate: new Date(),
      createdAt: new Date(),
      source: 'chat_interface'
    };

    const result = await wearableDataCollection.insertOne(document);

    console.log(`✅ Saved wearable data for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Wearable data saved successfully',
      id: result.insertedId
    });

  } catch (error) {
    console.error('Error saving wearable data:', error);
    res.status(500).json({
      error: 'Failed to save wearable data',
      message: error.message
    });
  }
});

/**
 * GET /api/health-metrics/:userId
 * Get health metrics for a specific user
 */
router.get('/health-metrics/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.auth.userId && !req.auth.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own health data'
      });
    }

    const healthMetricsCollection = req.app.locals.db.collection('healthmetrics');
    const limit = parseInt(req.query.limit) || 100;

    const results = await healthMetricsCollection
      .find({ userId: userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    res.json(results);

  } catch (error) {
    console.error('Error fetching health metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch health metrics',
      message: error.message
    });
  }
});

/**
 * POST /api/health-metrics
 * Save new health metrics for authenticated user
 */
router.post('/health-metrics', authenticateUser, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const metricsData = req.body;

    if (!metricsData || typeof metricsData !== 'object') {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'Please provide valid health metrics data'
      });
    }

    const healthMetricsCollection = req.app.locals.db.collection('healthmetrics');

    const document = {
      ...metricsData,
      userId: userId,
      uploadDate: new Date(),
      timestamp: metricsData.timestamp || new Date(),
      createdAt: new Date(),
      source: 'chat_interface'
    };

    const result = await healthMetricsCollection.insertOne(document);

    console.log(`✅ Saved health metrics for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Health metrics saved successfully',
      id: result.insertedId
    });

  } catch (error) {
    console.error('Error saving health metrics:', error);
    res.status(500).json({
      error: 'Failed to save health metrics',
      message: error.message
    });
  }
});

/**
 * GET /api/medical-reports/:userId
 * Get medical reports for a specific user
 */
router.get('/medical-reports/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.auth.userId && !req.auth.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own health data'
      });
    }

    const medicalReportsCollection = req.app.locals.db.collection('medicalreports');
    const results = await medicalReportsCollection
      .find({ userId: userId })
      .sort({ uploadDate: -1 })
      .toArray();

    res.json(results);

  } catch (error) {
    console.error('Error fetching medical reports:', error);
    res.status(500).json({
      error: 'Failed to fetch medical reports',
      message: error.message
    });
  }
});

/**
 * POST /api/medical-reports
 * Save new medical report for authenticated user
 */
router.post('/medical-reports', authenticateUser, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const reportData = req.body;

    if (!reportData || typeof reportData !== 'object') {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'Please provide valid medical report data'
      });
    }

    const medicalReportsCollection = req.app.locals.db.collection('medicalreports');

    const document = {
      ...reportData,
      userId: userId,
      uploadDate: new Date(),
      createdAt: new Date(),
      source: 'chat_interface'
    };

    const result = await medicalReportsCollection.insertOne(document);

    console.log(`✅ Saved medical report for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Medical report saved successfully',
      id: result.insertedId
    });

  } catch (error) {
    console.error('Error saving medical report:', error);
    res.status(500).json({
      error: 'Failed to save medical report',
      message: error.message
    });
  }
});

/**
 * GET /api/miscellaneous/:userId
 * Get miscellaneous uploads for a specific user
 */
router.get('/miscellaneous/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.auth.userId && !req.auth.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own health data'
      });
    }

    const miscCollection = req.app.locals.db.collection('miscellaneous');
    const results = await miscCollection
      .find({ userId: userId })
      .sort({ uploadDate: -1 })
      .toArray();

    res.json(results);

  } catch (error) {
    console.error('Error fetching miscellaneous data:', error);
    res.status(500).json({
      error: 'Failed to fetch miscellaneous data',
      message: error.message
    });
  }
});

/**
 * POST /api/miscellaneous
 * Save new miscellaneous data for authenticated user
 */
router.post('/miscellaneous', authenticateUser, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const miscData = req.body;

    if (!miscData || typeof miscData !== 'object') {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'Please provide valid data'
      });
    }

    const miscCollection = req.app.locals.db.collection('miscellaneous');

    const document = {
      ...miscData,
      userId: userId,
      uploadDate: new Date(),
      createdAt: new Date(),
      source: 'chat_interface'
    };

    const result = await miscCollection.insertOne(document);

    console.log(`✅ Saved miscellaneous data for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Miscellaneous data saved successfully',
      id: result.insertedId
    });

  } catch (error) {
    console.error('Error saving miscellaneous data:', error);
    res.status(500).json({
      error: 'Failed to save miscellaneous data',
      message: error.message
    });
  }
});

/**
 * DELETE /api/:collection/:recordId
 * Delete a specific health data record (must be owner)
 */
router.delete('/:collection/:recordId', authenticateUser, async (req, res) => {
  try {
    const { collection, recordId } = req.params;
    const { ObjectId } = require('mongodb');

    // Validate collection name
    const allowedCollections = [
      'labresults',
      'geneticdatas',
      'wearabledatas',
      'healthmetrics',
      'medicalreports',
      'miscellaneous'
    ];

    if (!allowedCollections.includes(collection)) {
      return res.status(400).json({
        error: 'Invalid collection',
        message: `Collection must be one of: ${allowedCollections.join(', ')}`
      });
    }

    // Get the record to verify ownership
    const dataCollection = req.app.locals.db.collection(collection);
    const record = await dataCollection.findOne({ _id: new ObjectId(recordId) });

    if (!record) {
      return res.status(404).json({
        error: 'Record not found',
        message: 'The requested record does not exist'
      });
    }

    // Verify ownership
    const client = await Client.findByClientID(req.app.locals.db, record.clientID);

    if (!client || (client.authProviderUserId !== req.auth.userId && !req.auth.isAdmin)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own health data'
      });
    }

    // Delete the record
    await dataCollection.deleteOne({ _id: new ObjectId(recordId) });

    console.log(`✅ Deleted ${collection} record ${recordId} for client ${client.clientID}`);

    res.json({
      success: true,
      message: 'Record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({
      error: 'Failed to delete record',
      message: error.message
    });
  }
});

module.exports = router;
