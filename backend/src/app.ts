/**
 * DermaScan Backend - Main Application Entry Point
 * Express REST API for React Native Mobile App
 *
 * Architecture:
 * - Express 4.x with TypeScript
 * - Firebase Authentication
 * - Google Gemini 2.5 AI
 * - RESTful API design
 * - Comprehensive error handling
 * - Request logging & tracing
 * - Rate limiting & security
 *
 * API Structure:
 * - /api/v1/analysis - Skin analysis endpoints (3)
 * - /api/v1/skincare - Skincare recommendations (3)
 * - /api/v1/chatbot - RAG Q&A & chat (3)
 * - /api/v1/report - Report generation (2)
 * - /health - Health check endpoint
 */

import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';

import { config, validateConfig } from './config/env.config';
import { corsOptions } from './config/cors.config';
import { logger } from './config/logger.config';
import './config/firebase.config';

import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware';
import {
  attachRequestMetadata,
  detailedRequestLogger,
} from './middlewares/requestLogger.middleware';

// Routes
import analysisRoutes from './routes/analysis.routes';
import chatbotRoutes from './routes/chatbot.routes';

// Utils
import { successResponse } from './utils/apiResponse';

/**
 * Initialize Express Application
 * Apply middleware stack and mount routes
 */
const createApp = (): Application => {
  const app = express();

  // ========================================
  // 1. SECURITY MIDDLEWARE
  // ========================================

  /**
   * Helmet: Security headers
   * - Sets various HTTP headers to prevent common attacks
   * - XSS protection, MIME type sniffing prevention, etc.
   */
  app.use(helmet());

  /**
   * CORS: Cross-Origin Resource Sharing
   * - Allow mobile app to make requests
   * - Configure allowed origins, methods, headers
   * - Enable credentials for authentication
   */
  app.use(cors(corsOptions));

  // ========================================
  // 2. PARSING MIDDLEWARE
  // ========================================

  /**
   * Body parsers
   * - JSON: Parse application/json
   * - URL-encoded: Parse application/x-www-form-urlencoded
   * - Limit: 10MB for image upload (base64)
   */
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  /**
   * Compression: Gzip response compression
   * - Reduces response size
   * - Improves performance for mobile clients
   */
  app.use(compression());

  // ========================================
  // 3. LOGGING MIDDLEWARE
  // ========================================

  /**
   * Morgan: HTTP request logger
   * - Log format: combined (Apache style)
   * - Stream to Winston logger
   * - Production: log to file, Development: log to console
   */
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
    })
  );

  /**
   * Request metadata: Attach unique ID and timestamp
   * - requestId: UUID for request tracing
   * - timestamp: Request start time
   * - Used in all logs and responses
   */
  app.use(attachRequestMetadata);

  /**
   * Detailed request logger: Log request details
   * - Method, URL, IP, User-Agent
   * - Body (sanitized - no sensitive data)
   * - Query params, headers
   */
  app.use(detailedRequestLogger);

  // ========================================
  // 4. HEALTH CHECK ENDPOINT
  // ========================================

  /**
   * GET /health
   * Health check endpoint for monitoring
   *
   * Returns:
   * - status: 'ok' | 'error'
   * - timestamp: ISO 8601
   * - uptime: Process uptime in seconds
   * - environment: NODE_ENV
   * - version: API version
   *
   * Use cases:
   * - Load balancer health checks
   * - Monitoring systems (Pingdom, Uptime Robot)
   * - CI/CD deployment verification
   * - Developer debugging
   */
  app.get('/health', (_req: Request, res: Response) => {
    const healthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.env,
      version: config.apiVersion,
      service: 'DermaScan Backend API',
    };

    logger.info('Health check requested', healthCheck);

    return successResponse(res, healthCheck, 200);
  });

  // ========================================
  // 5. API ROUTES
  // ========================================

  /**
   * Mount all API routes under /api/v1
   *
   * Route structure:
   * - /api/v1/analysis/* - Skin analysis endpoints
   * - /api/v1/chatbot/* - Chatbot & RAG Q&A
   *
   * Middleware chain per route:
   * 1. Authentication (optional or required)
   * 2. Rate limiting (per endpoint type)
   * 3. Validation (Zod schemas)
   * 4. Controller handler
   * 5. Error handler (global)
   */
  const apiPrefix = `/api/${config.apiVersion}`;

  app.use(`${apiPrefix}/analysis`, analysisRoutes);
  app.use(`${apiPrefix}/chatbot`, chatbotRoutes);

  /**
   * API root endpoint
   * GET /api/v1
   *
   * Returns API information and available endpoints
   * Useful for API discovery and documentation
   */
  app.get(apiPrefix, (_req: Request, res: Response) => {
    const apiInfo = {
      service: 'DermaScan Backend API',
      version: config.apiVersion,
      description: 'AI-powered skin analysis API for React Native mobile app',
      endpoints: {
        health: '/health',
        analysis: {
          analyzeSkin: 'POST /api/v1/analysis/skin',
          analyzeAdvanced: 'POST /api/v1/analysis/advanced',
        },
        skincare: {
          getDirection: 'POST /api/v1/skincare/direction',
          getRoutine: 'POST /api/v1/skincare/routine',
          getCoaching: 'POST /api/v1/skincare/coaching',
        },
        chatbot: {
          answerQuestion: 'POST /api/v1/chatbot/question',
          getExpertInfo: 'POST /api/v1/chatbot/expert-info',
          chat: 'POST /api/v1/chatbot/chat',
        },
        report: {
          sendWebhook: 'POST /api/v1/report/webhook',
          emailConfirm: 'POST /api/v1/report/email-confirm',
        },
      },
      documentation: 'https://github.com/yourusername/dermascan-backend',
      support: 'support@dermascan.com',
    };

    return successResponse(res, apiInfo, 200);
  });

  // ========================================
  // 6. ERROR HANDLING
  // ========================================

  /**
   * 404 Not Found Handler
   * - Catches all undefined routes
   * - Must be placed AFTER all valid routes
   * - Returns standardized error response
   */
  app.use(notFoundHandler);

  /**
   * Global Error Handler
   * - Catches all errors from routes and middleware
   * - Formats error response based on error type
   * - Logs error with stack trace
   * - Must be placed LAST in middleware chain
   *
   * Handles:
   * - ApiError (custom errors)
   * - ZodError (validation errors)
   * - FirebaseError (auth errors)
   * - SyntaxError (JSON parse errors)
   * - Unexpected errors (500)
   */
  app.use(errorHandler);

  return app;
};

/**
 * Start Server
 * - Validate environment config
 * - Create Express app
 * - Start listening on port
 * - Log server info
 */
const startServer = async (): Promise<void> => {
  try {
    // Validate environment variables
    validateConfig();
    logger.info('✅ Environment configuration validated');

    // Create Express app
    const app = createApp();

    // Start listening
    const PORT = config.port;
    app.listen(PORT, () => {
      logger.info('🚀 DermaScan Backend Server Started', {
        port: PORT,
        environment: config.env,
        apiVersion: config.apiVersion,
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
      });

      logger.info('📋 Available endpoints:', {
        health: '/health',
        api: `/api/${config.apiVersion}`,
        analysis: `/api/${config.apiVersion}/analysis/*`,
        chatbot: `/api/${config.apiVersion}/chatbot/*`,
      });

      logger.info('🔒 Security features enabled:', {
        helmet: true,
        cors: true,
        rateLimiting: true,
        firebaseAuth: true,
        inputValidation: true,
        compression: true,
      });

      if (config.env === 'development') {
        logger.info('🔧 Development mode - CORS allows all origins, detailed logging enabled');
      }
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

/**
 * Handle process termination signals
 * - SIGTERM: Sent by process manager (PM2, Docker)
 * - SIGINT: Ctrl+C in terminal
 *
 * Graceful shutdown steps:
 * 1. Stop accepting new requests
 * 2. Wait for ongoing requests to complete
 * 3. Close database connections (if any)
 * 4. Exit process
 */
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

/**
 * Handle uncaught exceptions
 * - Log error with full stack trace
 * - Exit process (let PM2/Docker restart)
 */
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

/**
 * Handle unhandled promise rejections
 * - Log error with full stack trace
 * - Exit process (let PM2/Docker restart)
 */
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection:', {
    reason,
  });
  process.exit(1);
});

// ========================================
// EXPORT & START
// ========================================

// Export app for testing
export { createApp };

// Start server if running directly (not imported for tests)
if (require.main === module) {
  startServer();
}
