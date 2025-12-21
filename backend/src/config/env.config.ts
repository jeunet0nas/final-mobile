import dotenv from 'dotenv';
import env from 'env-var';

// Load environment variables
dotenv.config();

export const config = {
  // Server
  env: env.get('NODE_ENV').default('development').asString(),
  port: env.get('PORT').default('5000').asPortNumber(),
  apiVersion: env.get('API_VERSION').default('v1').asString(),

  // Gemini AI
  gemini: {
    apiKey: env.get('GEMINI_API_KEY').required().asString(),
  },

  // Firebase
  firebase: {
    projectId: env.get('FIREBASE_PROJECT_ID').required().asString(),
    clientEmail: env.get('FIREBASE_CLIENT_EMAIL').required().asString(),
    privateKey: env
      .get('FIREBASE_PRIVATE_KEY')
      .required()
      .asString()
      .replace(/\\n/g, '\n'), // Fix newlines in private key
    databaseURL: env.get('FIREBASE_DATABASE_URL').asString(),
    storageBucket: env.get('FIREBASE_STORAGE_BUCKET').asString(),
  },

  // CORS
  cors: {
    allowedOrigins: env
      .get('ALLOWED_ORIGINS')
      .default('http://localhost:3000')
      .asArray(','),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: env.get('RATE_LIMIT_WINDOW_MS').default('900000').asInt(), // 15 minutes
    maxRequests: env.get('RATE_LIMIT_MAX_REQUESTS').default('100').asInt(),
  },

  // Cache
  cache: {
    ttl: env.get('CACHE_TTL_SECONDS').default('3600').asInt(), // 1 hour
    enabled: env.get('ENABLE_CACHE').default('true').asBool(),
  },

  // File Upload
  upload: {
    maxFileSizeMB: env.get('MAX_FILE_SIZE_MB').default('10').asInt(),
    allowedTypes: env
      .get('ALLOWED_FILE_TYPES')
      .default('image/jpeg,image/png,image/jpg')
      .asArray(','),
  },

  // Webhook
  webhook: {
    url: env.get('WEBHOOK_URL').asString(),
  },

  // JWT (if needed)
  jwt: {
    secret: env.get('JWT_SECRET').asString(),
  },

  // Logging
  logging: {
    level: env.get('LOG_LEVEL').default('info').asString(),
    filePath: env.get('LOG_FILE_PATH').default('./logs/app.log').asString(),
  },
};

// Validate required environment variables on startup
export const validateConfig = (): void => {
  const required = ['GEMINI_API_KEY', 'FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};
