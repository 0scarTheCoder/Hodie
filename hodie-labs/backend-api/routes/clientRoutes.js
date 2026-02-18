/**
 * Client Management Routes
 * Handles client profile CRUD operations
 */

const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { authenticateUser, ensureClient, requireAdmin } = require('../middleware/authMiddleware');

/**
 * POST /api/clients
 * Create new client (auto-register on first login)
 */
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { phoneNumber, age, sex, height, weight, exerciseLevel } = req.body;

    // Check if client already exists
    const existingClient = await Client.findByAuthProviderUserId(
      req.app.locals.db,
      req.auth.userId
    );

    if (existingClient) {
      return res.status(409).json({
        error: 'Client already exists',
        message: 'A client profile already exists for this user',
        clientID: existingClient.clientID
      });
    }

    // Prepare client data
    const clientData = {
      email: req.auth.email,
      authProvider: req.auth.provider,
      authProviderUserId: req.auth.userId,
      phoneNumber,
      age,
      sex,
      height,
      weight,
      exerciseLevel: exerciseLevel || 'Moderate',
      subscriptionLevel: 'Free', // Default to free
      amountPaid: 0.00,
      amountDue: 0.00
    };

    // Validate data
    const validation = Client.validate(clientData);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        message: validation.errors.join(', ')
      });
    }

    // Create client
    const client = await Client.create(req.app.locals.db, clientData);

    console.log(`✅ Created new client: ${client.clientID} (${client.email})`);

    res.status(201).json({
      success: true,
      message: 'Client profile created successfully',
      client: {
        clientID: client.clientID,
        email: client.email,
        subscriptionLevel: client.subscriptionLevel,
        createdAt: client.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      error: 'Failed to create client',
      message: error.message
    });
  }
});

/**
 * GET /api/clients/me
 * Get current user's client profile
 */
router.get('/me', authenticateUser, ensureClient, async (req, res) => {
  try {
    const client = await Client.findByAuthProviderUserId(
      req.app.locals.db,
      req.auth.userId
    );

    if (!client) {
      return res.status(404).json({
        error: 'Client not found',
        message: 'No client profile exists for this user. Please create one first.',
        needsRegistration: true
      });
    }

    // Don't send sensitive internal fields
    const { _id, authProviderUserId, ...clientData } = client;

    res.json({
      success: true,
      client: clientData
    });

  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      error: 'Failed to fetch client',
      message: error.message
    });
  }
});

/**
 * GET /api/clients/:clientID
 * Get specific client by clientID (must be owner or admin)
 */
router.get('/:clientID', authenticateUser, async (req, res) => {
  try {
    const { clientID } = req.params;

    const client = await Client.findByClientID(req.app.locals.db, clientID);

    if (!client) {
      return res.status(404).json({
        error: 'Client not found',
        message: `No client found with ID: ${clientID}`
      });
    }

    // Verify user is accessing their own data
    if (client.authProviderUserId !== req.auth.userId && !req.auth.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own client profile'
      });
    }

    const { _id, authProviderUserId, ...clientData } = client;

    res.json({
      success: true,
      client: clientData
    });

  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      error: 'Failed to fetch client',
      message: error.message
    });
  }
});

/**
 * PATCH /api/clients/:clientID
 * Update client dynamic fields
 */
router.patch('/:clientID', authenticateUser, async (req, res) => {
  try {
    const { clientID } = req.params;

    // Verify client exists and user owns it
    const client = await Client.findByClientID(req.app.locals.db, clientID);

    if (!client) {
      return res.status(404).json({
        error: 'Client not found',
        message: `No client found with ID: ${clientID}`
      });
    }

    if (client.authProviderUserId !== req.auth.userId && !req.auth.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own client profile'
      });
    }

    // Update client
    const updates = req.body;
    const success = await Client.update(req.app.locals.db, clientID, updates);

    if (!success) {
      return res.status(400).json({
        error: 'Update failed',
        message: 'No changes were made'
      });
    }

    // Fetch updated client
    const updatedClient = await Client.findByClientID(req.app.locals.db, clientID);
    const { _id, authProviderUserId, ...clientData } = updatedClient;

    console.log(`✅ Updated client: ${clientID}`);

    res.json({
      success: true,
      message: 'Client profile updated successfully',
      client: clientData
    });

  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      error: 'Failed to update client',
      message: error.message
    });
  }
});

/**
 * GET /api/clients
 * Get all clients (admin only)
 */
router.get('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const skip = parseInt(req.query.skip) || 0;

    const clients = await Client.findAll(req.app.locals.db, limit, skip);

    res.json({
      success: true,
      count: clients.length,
      clients: clients.map(c => {
        const { _id, authProviderUserId, ...clientData } = c;
        return clientData;
      })
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      error: 'Failed to fetch clients',
      message: error.message
    });
  }
});

module.exports = router;
