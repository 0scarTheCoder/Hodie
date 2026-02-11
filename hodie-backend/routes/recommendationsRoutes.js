/**
 * Health Recommendations Routes
 * Endpoints for storing and managing AI-generated health recommendations
 */

const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const { validateRecommendations } = require('../schemas/validationSchemas');

/**
 * GET /api/recommendations/:userId
 * Get health recommendations for a specific user
 */
router.get('/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is accessing their own data
    if (userId !== req.auth.userId && !req.auth.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own recommendations'
      });
    }

    const recommendationsCollection = req.app.locals.db.collection('recommendations');
    const recommendations = await recommendationsCollection
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    // If no recommendations found, return empty array
    if (!recommendations || recommendations.length === 0) {
      return res.json([]);
    }

    // Return the most recent set of recommendations
    // Each document contains an array of recommendations
    const latestDoc = recommendations[0];
    res.json(latestDoc.recommendations || []);

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      error: 'Failed to fetch recommendations',
      message: error.message
    });
  }
});

/**
 * POST /api/recommendations/:userId
 * Save AI-generated health recommendations
 */
router.post('/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { recommendations } = req.body;

    // Verify user is saving their own data
    if (userId !== req.auth.userId && !req.auth.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only save your own recommendations'
      });
    }

    if (!recommendations || !Array.isArray(recommendations)) {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'Please provide recommendations as an array'
      });
    }

    // Validate recommendations
    const validatedRecommendations = validateRecommendations(recommendations);

    const recommendationsCollection = req.app.locals.db.collection('recommendations');

    // Create new recommendations document
    const doc = {
      userId: userId,
      recommendations: validatedRecommendations,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await recommendationsCollection.insertOne(doc);

    console.log(`✅ Saved ${recommendations.length} recommendations for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Recommendations saved successfully',
      count: recommendations.length,
      id: result.insertedId
    });

  } catch (error) {
    console.error('Error saving recommendations:', error);
    res.status(500).json({
      error: 'Failed to save recommendations',
      message: error.message
    });
  }
});

/**
 * PATCH /api/recommendations/:userId/:recId
 * Update a specific recommendation (e.g., mark as completed)
 */
router.patch('/:userId/:recId', authenticateUser, async (req, res) => {
  try {
    const { userId, recId } = req.params;
    const { completed } = req.body;

    // Verify user is updating their own data
    if (userId !== req.auth.userId && !req.auth.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own recommendations'
      });
    }

    const recommendationsCollection = req.app.locals.db.collection('recommendations');

    // Find the latest recommendations document for this user
    const doc = await recommendationsCollection.findOne(
      { userId: userId },
      { sort: { createdAt: -1 } }
    );

    if (!doc) {
      return res.status(404).json({
        error: 'Not found',
        message: 'No recommendations found for this user'
      });
    }

    // Update the specific recommendation by ID
    const updatedRecommendations = doc.recommendations.map(rec => {
      if (rec.id === recId) {
        return { ...rec, completed: completed !== undefined ? completed : true };
      }
      return rec;
    });

    // Update the document
    await recommendationsCollection.updateOne(
      { _id: doc._id },
      {
        $set: {
          recommendations: updatedRecommendations,
          updatedAt: new Date()
        }
      }
    );

    console.log(`✅ Updated recommendation ${recId} for user ${userId}`);

    res.json({
      success: true,
      message: 'Recommendation updated successfully'
    });

  } catch (error) {
    console.error('Error updating recommendation:', error);
    res.status(500).json({
      error: 'Failed to update recommendation',
      message: error.message
    });
  }
});

/**
 * DELETE /api/recommendations/:userId
 * Clear all recommendations for a user
 */
router.delete('/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is deleting their own data
    if (userId !== req.auth.userId && !req.auth.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own recommendations'
      });
    }

    const recommendationsCollection = req.app.locals.db.collection('recommendations');
    const result = await recommendationsCollection.deleteMany({ userId: userId });

    console.log(`✅ Deleted ${result.deletedCount} recommendation documents for user ${userId}`);

    res.json({
      success: true,
      message: 'Recommendations deleted successfully',
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error deleting recommendations:', error);
    res.status(500).json({
      error: 'Failed to delete recommendations',
      message: error.message
    });
  }
});

module.exports = router;
