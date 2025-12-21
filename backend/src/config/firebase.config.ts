import admin from 'firebase-admin';
import { config } from './env.config';

/**
 * Validate Firebase configuration before initialization
 * Prevents cryptic errors if env vars are missing or invalid
 */
const validateFirebaseConfig = (): void => {
  const requiredFields = {
    projectId: config.firebase.projectId,
    clientEmail: config.firebase.clientEmail,
    privateKey: config.firebase.privateKey,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value || value.trim() === '')
    .map(([key, _]) => key);

  if (missingFields.length > 0) {
    throw new Error(
      `❌ Firebase config validation failed: Missing required fields: ${missingFields.join(', ')}\n` +
        'Please check your .env file and ensure all FIREBASE_* variables are set correctly.'
    );
  }

  // Validate private key format
  if (!config.firebase.privateKey.includes('BEGIN PRIVATE KEY')) {
    throw new Error(
      '❌ Firebase private key format is invalid. It should contain "-----BEGIN PRIVATE KEY-----".\n' +
        'Make sure to include the full private key with line breaks (\\n) in your .env file.'
    );
  }
};

// Validate before initialization
validateFirebaseConfig();

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId,
      clientEmail: config.firebase.clientEmail,
      privateKey: config.firebase.privateKey,
    }),
    databaseURL: config.firebase.databaseURL,
    storageBucket: config.firebase.storageBucket,
  });

  console.log('✅ Firebase Admin SDK initialized successfully');
  console.log(`   Project: ${config.firebase.projectId}`);
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization failed:', error);
  console.error('   Please check your Firebase service account credentials in .env file');
  throw error;
}

// Export Firebase services
export const firestore = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export const FieldValue = admin.firestore.FieldValue;

// Firestore settings for better performance
firestore.settings({
  ignoreUndefinedProperties: true,
});

export default admin;
