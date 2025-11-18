import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
// import rateLimit from 'express-rate-limit'; // Temporarily disabled
import { testConnection } from './config/database';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

/**
 * Express Application Setup
 */
const app: Application = express();
const PORT = process.env.PORT || 8080;
const API_VERSION = process.env.API_VERSION || 'v1';

/**
 * Security Middleware
 */

// Trust proxy - Required for ALB (Application Load Balancer)
app.set('trust proxy', true);

// Helmet - Security headers
app.use(helmet());

// CORS - Cross-Origin Resource Sharing
// Allow multiple origins: with and without www
const allowedOrigins = [
  'https://medwegbavaria.com',
  'https://www.medwegbavaria.com',
  'http://localhost:3000', // for local development
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Don't throw error, just reject the origin
        callback(null, false);
      }
    },
    credentials: true, // Za HTTP-Only cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiting - Global
// TEMPORARILY DISABLED - causing segfault with trust proxy
// const globalLimiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
//   message: 'Zu viele Anfragen, bitte später erneut versuchen.',
//   standardHeaders: true,
//   legacyHeaders: false,
//   validate: false,
// });

// app.use(`/api/${API_VERSION}`, globalLimiter);

/**
 * Body Parsing Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

/**
 * Compression Middleware
 */
app.use(compression());

/**
 * Static Files Middleware
 * Serve public assets (logos, images) for email embedding
 */
app.use('/assets', express.static('public/assets'));

/**
 * Request Logging Middleware (Development)
 */
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.debug(`${req.method} ${req.path}`);
    if (req.path.includes('/orders') && req.method === 'POST') {
      console.log('RAW REQUEST BODY in app.ts middleware:', req.body);
      console.log('req.body type:', typeof req.body);
      console.log('req.body.scheduled_date:', req.body.scheduled_date);
      console.log('JSON.stringify(req.body):', JSON.stringify(req.body, null, 2));
    }
    next();
  });
}

/**
 * Health Check Endpoints
 */

// Root health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'MEDWEG Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Database health check
app.get('/health/db', async (_req: Request, res: Response) => {
  const isConnected = await testConnection();

  if (isConnected) {
    res.status(200).json({
      status: 'OK',
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: 'ERROR',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * API Routes
 */
app.get(`/api/${API_VERSION}`, (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to MEDWEG API',
    version: API_VERSION,
    endpoints: {
      health: '/health',
      healthDb: '/health/db',
      api: `/api/${API_VERSION}`,
    },
  });
});

// Import route modules
import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patient.routes';
import workerRoutes from './routes/worker.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import invoiceRoutes from './routes/invoice.routes';
import institutionRoutes from './routes/institution.routes';
import adminRoutes from './routes/admin.routes';
import warehouseRoutes from './routes/warehouse.routes';
import recurringOrderRoutes from './routes/recurringOrder.routes';
import contactRoutes from './routes/contact.routes';
import { errorHandler } from './middleware/errorHandler';
import { startScheduledJobs } from './services/scheduledOrderService';

// Use routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/patients`, patientRoutes);
app.use(`/api/${API_VERSION}/workers`, workerRoutes);
app.use(`/api/${API_VERSION}/products`, productRoutes);
app.use(`/api/${API_VERSION}/orders`, orderRoutes);
app.use(`/api/${API_VERSION}/invoices`, invoiceRoutes);
app.use(`/api/${API_VERSION}/institutions`, institutionRoutes);
app.use(`/api/${API_VERSION}/admin`, adminRoutes);
app.use(`/api/${API_VERSION}/warehouse`, warehouseRoutes);
app.use(`/api/${API_VERSION}/recurring-orders`, recurringOrderRoutes);
app.use(`/api/${API_VERSION}/contact`, contactRoutes); // Public contact form endpoint

/**
 * 404 Handler
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Die angeforderte Ressource wurde nicht gefunden.',
  });
});

/**
 * Global Error Handler
 */
app.use(errorHandler);

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Test database connection
    logger.info('Testing database connection...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start scheduled jobs for automatic order creation
    startScheduledJobs();

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`MEDWEG Backend API started successfully`);
      logger.info(`Server running on: http://localhost:${PORT}`);
      logger.info(`API Base URL: http://localhost:${PORT}/api/${API_VERSION}`);
      logger.info(`Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
if (require.main === module) {
  startServer();
}

export default app;
