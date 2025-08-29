const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

async function getCollectionStats(collectionPath) {
  const snapshot = await db.collection(collectionPath).count().get();
  return snapshot.data().count;
}

async function monitorUsage() {
  console.log('=== Firebase Usage Report ===');
  
  // Count users
  const userCount = await getCollectionStats('users');
  console.log(`📊 Total Users: ${userCount}`);
  
  // Count boards (you may need to adjust this based on your security rules)
  try {
    const boardsCount = await getCollectionStats('users/*/boards');
    console.log(`📋 Total Boards: ${boardsCount}`);
  } catch (error) {
    console.log('⚠️ Could not count boards - check security rules');
  }
  
  // Add more collection counts as needed
}

// Run the monitoring
monitorUsage().catch(console.error);
