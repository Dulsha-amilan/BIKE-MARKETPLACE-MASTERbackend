const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

async function test() {
  try {
    const keyPath = path.resolve(__dirname, 'secrets/serviceAccountKey.json');
    console.log('Loading key from:', keyPath);
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    const db = admin.firestore();
    console.log('Attempting to write to firestore...');
    await db.collection('test_connection').doc('test').set({
      connected: true,
      timestamp: new Date().toISOString()
    });
    console.log('Successfully wrote to Firestore!');
  } catch (error) {
    console.error('Firestore connection failed!');
    console.error(error);
  }
}

test();
