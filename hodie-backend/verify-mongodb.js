/**
 * MongoDB Verification Script
 * Checks database structure and creates indexes
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

async function verifyMongoDB() {
  console.log('🔍 Verifying MongoDB Setup...\n');

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('hodie_app');

    // Get all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    console.log('\n📋 Existing Collections:');
    collectionNames.forEach(name => {
      console.log(`   - ${name}`);
    });

    // Required collections
    const requiredCollections = [
      'clients',
      'uploads_history',
      'lab_results',
      'genetic_data',
      'wearable_data',
      'health_metrics',
      'medical_reports'
    ];

    console.log('\n🔧 Creating Missing Collections & Indexes...\n');

    for (const collectionName of requiredCollections) {
      if (!collectionNames.includes(collectionName)) {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } else {
        console.log(`✓  Collection exists: ${collectionName}`);
      }
    }

    // Create indexes for clients collection
    console.log('\n📇 Creating Indexes...\n');

    await db.collection('clients').createIndex(
      { authProviderUserId: 1 },
      { unique: true, name: 'authProviderUserId_unique' }
    );
    console.log('✅ Index: clients.authProviderUserId (unique)');

    await db.collection('clients').createIndex(
      { clientID: 1 },
      { unique: true, name: 'clientID_unique' }
    );
    console.log('✅ Index: clients.clientID (unique)');

    await db.collection('clients').createIndex(
      { email: 1 },
      { name: 'email_index' }
    );
    console.log('✅ Index: clients.email');

    // Create indexes for uploads_history
    await db.collection('uploads_history').createIndex(
      { clientID: 1, uploadDate: -1 },
      { name: 'clientID_uploadDate_index' }
    );
    console.log('✅ Index: uploads_history.clientID + uploadDate');

    await db.collection('uploads_history').createIndex(
      { clientID: 1, fileHash: 1 },
      { name: 'clientID_fileHash_index' }
    );
    console.log('✅ Index: uploads_history.clientID + fileHash (for duplicate detection)');

    // Create indexes for health data collections
    const healthCollections = ['lab_results', 'genetic_data', 'wearable_data', 'health_metrics', 'medical_reports'];

    for (const collection of healthCollections) {
      await db.collection(collection).createIndex(
        { clientID: 1, uploadDate: -1 },
        { name: 'clientID_uploadDate_index' }
      );
      console.log(`✅ Index: ${collection}.clientID + uploadDate`);
    }

    // Check if any clients exist
    const clientCount = await db.collection('clients').countDocuments();
    const uploadsCount = await db.collection('uploads_history').countDocuments();

    console.log('\n📊 Current Data:');
    console.log(`   Clients: ${clientCount}`);
    console.log(`   Uploads: ${uploadsCount}`);

    if (clientCount === 0) {
      console.log('\n💡 Tip: No clients yet. They will be auto-created when users:');
      console.log('   1. Log in with Auth0/Firebase');
      console.log('   2. Make their first API request');
      console.log('   3. Get auto-assigned a clientID (HDL-00001, HDL-00002, etc.)');
    }

    // Show example of how data will look
    console.log('\n📋 Example Client Record:');
    console.log(JSON.stringify({
      clientID: "HDL-00001",
      phoneNumber: "+61-412-345-678",
      email: "user@example.com",
      authProviderUserId: "google-oauth2|123456",
      age: 34,
      sex: "Female",
      height: 165,
      weight: 62,
      exerciseLevel: "Moderate",
      subscriptionLevel: "Free",
      amountPaid: 0.00,
      amountDue: 0.00,
      uploadsMade: 0,
      subscriptionStartDate: new Date().toISOString()
    }, null, 2));

    console.log('\n✅ MongoDB Setup Complete!');
    console.log('   All collections and indexes are ready.');
    console.log('   System is ready to accept user registrations and uploads.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

verifyMongoDB();
