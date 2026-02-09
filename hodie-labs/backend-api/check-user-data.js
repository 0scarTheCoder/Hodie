require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkUserData() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('hodie_app');

    const userId = 'google-oauth2|107079532866425468543';

    // Check lab results
    const labResults = await db.collection('labresults')
      .find({ userId })
      .toArray();

    console.log(`\n📊 Found ${labResults.length} lab result datasets\n`);

    labResults.forEach((result, idx) => {
      console.log(`Dataset ${idx + 1}:`);
      console.log(`  Test Type: ${result.testType || 'Unknown'}`);
      console.log(`  Records: ${result.results ? result.results.length : 0}`);
      if (result.results && result.results.length > 0) {
        const sampleRecord = result.results[0];
        console.log(`  Fields:`, Object.keys(sampleRecord).join(', '));
      }
      console.log('');
    });

  } finally {
    await client.close();
  }
}

checkUserData().catch(console.error);
