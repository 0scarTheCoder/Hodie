/**
 * Client (Master Table) Model
 * One record per user with all their profile and subscription info
 */

const { ObjectId } = require('mongodb');

class Client {
  constructor(data) {
    this.clientID = data.clientID; // HDL-00001 format
    this.phoneNumber = data.phoneNumber || null;
    this.email = data.email;
    this.authProvider = data.authProvider || 'auth0'; // auth0, google, firebase
    this.authProviderUserId = data.authProviderUserId; // The uid/sub from auth provider
    this.age = data.age || null;
    this.sex = data.sex || null; // Male, Female, Other, Prefer not to say
    this.height = data.height || null; // cm
    this.weight = data.weight || null; // kg
    this.exerciseLevel = data.exerciseLevel || 'Moderate'; // Low, Moderate, High, Very High
    this.subscriptionLevel = data.subscriptionLevel || 'Free'; // Free, Basic, Pro, Premium
    this.amountPaid = data.amountPaid || 0.00; // Total paid (AUD)
    this.amountDue = data.amountDue || 0.00; // Currently outstanding (AUD)
    this.subscriptionStartDate = data.subscriptionStartDate || new Date();
    this.uploadsMade = data.uploadsMade || 0; // Total uploads all-time
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = new Date();
  }

  /**
   * Generate next sequential clientID
   */
  static async generateClientID(db) {
    const clientsCollection = db.collection('clients');

    // Find highest clientID
    const lastClient = await clientsCollection
      .find({})
      .sort({ clientID: -1 })
      .limit(1)
      .toArray();

    if (lastClient.length === 0) {
      return 'HDL-00001'; // First client
    }

    // Extract number from HDL-00001 format
    const lastNumber = parseInt(lastClient[0].clientID.split('-')[1]);
    const nextNumber = lastNumber + 1;

    // Pad with zeros to make 5 digits
    return `HDL-${String(nextNumber).padStart(5, '0')}`;
  }

  /**
   * Create new client in database
   */
  static async create(db, clientData) {
    const clientsCollection = db.collection('clients');

    // Check if user already exists (by auth provider ID)
    const existing = await clientsCollection.findOne({
      authProviderUserId: clientData.authProviderUserId
    });

    if (existing) {
      throw new Error('Client already exists with this authentication ID');
    }

    // Generate clientID
    const clientID = await this.generateClientID(db);
    clientData.clientID = clientID;

    // Create client object
    const client = new Client(clientData);

    // Insert into database
    const result = await clientsCollection.insertOne(client);

    return { ...client, _id: result.insertedId };
  }

  /**
   * Find client by clientID
   */
  static async findByClientID(db, clientID) {
    const clientsCollection = db.collection('clients');
    return await clientsCollection.findOne({ clientID });
  }

  /**
   * Find client by auth provider user ID (uid/sub)
   */
  static async findByAuthProviderUserId(db, authProviderUserId) {
    const clientsCollection = db.collection('clients');
    return await clientsCollection.findOne({ authProviderUserId });
  }

  /**
   * Update client dynamic fields
   */
  static async update(db, clientID, updates) {
    const clientsCollection = db.collection('clients');

    // Only allow updating specific fields
    const allowedFields = [
      'phoneNumber', 'age', 'sex', 'height', 'weight',
      'exerciseLevel', 'subscriptionLevel', 'amountPaid', 'amountDue'
    ];

    const filteredUpdates = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    filteredUpdates.updatedAt = new Date();

    const result = await clientsCollection.updateOne(
      { clientID },
      { $set: filteredUpdates }
    );

    return result.modifiedCount > 0;
  }

  /**
   * Increment upload count
   */
  static async incrementUploads(db, clientID) {
    const clientsCollection = db.collection('clients');

    await clientsCollection.updateOne(
      { clientID },
      {
        $inc: { uploadsMade: 1 },
        $set: { updatedAt: new Date() }
      }
    );
  }

  /**
   * Get all clients (admin only)
   */
  static async findAll(db, limit = 100, skip = 0) {
    const clientsCollection = db.collection('clients');
    return await clientsCollection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * Validate client data
   */
  static validate(data) {
    const errors = [];

    if (!data.email) {
      errors.push('Email is required');
    }

    if (!data.authProviderUserId) {
      errors.push('Authentication provider user ID is required');
    }

    if (data.age && (data.age < 0 || data.age > 150)) {
      errors.push('Age must be between 0 and 150');
    }

    if (data.height && (data.height < 50 || data.height > 300)) {
      errors.push('Height must be between 50 and 300 cm');
    }

    if (data.weight && (data.weight < 20 || data.weight > 500)) {
      errors.push('Weight must be between 20 and 500 kg');
    }

    const validExerciseLevels = ['Low', 'Moderate', 'High', 'Very High'];
    if (data.exerciseLevel && !validExerciseLevels.includes(data.exerciseLevel)) {
      errors.push(`Exercise level must be one of: ${validExerciseLevels.join(', ')}`);
    }

    const validSubscriptionLevels = ['Free', 'Basic', 'Pro', 'Premium'];
    if (data.subscriptionLevel && !validSubscriptionLevels.includes(data.subscriptionLevel)) {
      errors.push(`Subscription level must be one of: ${validSubscriptionLevels.join(', ')}`);
    }

    return { valid: errors.length === 0, errors };
  }
}

module.exports = Client;
