// Load environment variables first
import './env.js';

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let serviceAccount;

// Try to load service account from file
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    // Resolve path relative to project root
    const serviceAccountPath = resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    console.log('Loading Firebase service account from:', serviceAccountPath);

    const serviceAccountData = readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(serviceAccountData);
    console.log('✓ Firebase service account loaded successfully');
    console.log('✓ Project ID:', serviceAccount.project_id);
  }
} catch (error) {
  console.warn('⚠ Firebase service account file not found:', error.message);
  console.warn('⚠ Attempting to use environment variables...');
}

// Initialize Firebase Admin SDK
let firebaseConfig;

if (serviceAccount) {
  // Use service account file
  firebaseConfig = {
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  };
} else {
  // Use environment variables as fallback
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error(
      'Firebase configuration error: Either provide FIREBASE_SERVICE_ACCOUNT_PATH or all of ' +
      'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.'
    );
  }

  firebaseConfig = {
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  };
  console.log('✓ Firebase initialized with environment variables');
  console.log('✓ Project ID:', process.env.FIREBASE_PROJECT_ID);
}

admin.initializeApp(firebaseConfig);

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

console.log('✓ Firebase Admin SDK initialized successfully');
console.log('✓ Firestore ready');
console.log('✓ Authentication ready');
console.log('✓ Storage ready');

export { admin, db, auth, storage };
