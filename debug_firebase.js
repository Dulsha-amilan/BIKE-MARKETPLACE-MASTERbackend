require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

async function test() {
    console.log('Testing Firebase Connection...');
    const p = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    console.log('ENV PATH:', p);

    if (!p) {
        console.error('No FIREBASE_SERVICE_ACCOUNT_PATH set in .env');
        return;
    }

    const resolved = path.resolve(process.cwd(), p);
    console.log('Resolved Path:', resolved);

    try {
        const raw = fs.readFileSync(resolved, 'utf8');
        const json = JSON.parse(raw);
        console.log('Service Account Project ID:', json.project_id);

        const app = admin.initializeApp({
            credential: admin.credential.cert(json)
        });
        console.log('App initialized.');

        const db = app.firestore();
        console.log('Firestore initialized. Attempting write...');

        // Attempt a write
        await db.collection('test_debug').doc('ping').set({ timestamp: Date.now() });
        console.log('Write success!');

        // Attempt a read
        const doc = await db.collection('test_debug').doc('ping').get();
        console.log('Read success:', doc.data());

    } catch (err) {
        console.error('Make sure to install dotenv: npm install dotenv');
        console.error('ERROR:', err);
    }
}

test();
