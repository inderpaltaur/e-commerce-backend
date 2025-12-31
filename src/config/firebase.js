const admin = require('firebase-admin');

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  }
} catch (error) {
  console.warn('Firebase service account file not found. Using environment variables.');
}

const firebaseConfig = {
  credential: serviceAccount
    ? admin.credential.cert(serviceAccount)
    : admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      }),
  databaseURL: process.env.FIREBASE_DATABASE_URL
};

admin.initializeApp(firebaseConfig);

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

module.exports = {
  admin,
  db,
  auth,
  storage
};
