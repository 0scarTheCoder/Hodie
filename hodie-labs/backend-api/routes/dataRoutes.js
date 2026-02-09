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
      'medicalreports'
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
