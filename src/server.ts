/**
 *  @comyright 2025 dencodes
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';

/**
 * Custom Modules
 */
import config from './config';
import limiter from './lib/express_rate_limit';

/**
 * Router
 */
import v1Router from './routes/v1';

/**
 * Types
 */
import type { CorsOptions } from 'cors';
import { errorHandler } from './util/error-handler';
import { seedAdminUser } from './data/seed-admin';

/**
 * Express app initalization
 */
const app = express();

//Configure cors options
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // callback(new Error('CORS Error'), false);
    if (
      config.NODE_ENV === 'development' ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      //Reject the request
      callback(
        new Error(`CORS Error : ${origin} is not allowed by CORS`),
        false,
      );
      console.log(`CORS Error : ${origin} is not allowed by CORS`);
    }
  },
  credentials: true,
};

//Apply cors middleware
app.use(cors(corsOptions));
app.use(errorHandler);

//Enable json parsing body
app.use(express.json());

//Enable URL-encoded parsing body parsing with extended mode
//`extended : true` allow rich objects and arrays vai query string library
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

//Set trust proxy to false for local development to avoid rate limiting errors
app.set('trust proxy', false);

//Enable response compression to reduce payload size and improve performance
app.use(compression({ threshold: 1024 })); // only compress responses larger than 1kb

// Use Helmet to enhance security by setting various HTTP headers
app.use(helmet());

//Apply rate limiting middleware to prevent excessive requests and enhance security
app.use(limiter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Digital ID Card API',
    status: '✅ Running on Vercel Serverless',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    endpoints: {
      health: '/health (GET)',
      api: {
        auth: '/api/v1/auth/login (POST), /api/v1/auth/register (POST)',
        users: '/api/v1/users/*',
        cards: '/api/v1/cards/*',
        dashboard: '/api/v1/dashboard/*',
        upload: '/api/v1/upload/*'
      }
    },
    deployed_at: new Date().toISOString()
  });
});

// Health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Digital ID Card API is healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api/v1', v1Router);

// Initialize database connection for local development
let isDatabaseInitialized = false;
let isDatabaseInitializing = false;

const initializeDatabase = async () => {
  if (isDatabaseInitialized || isDatabaseInitializing) {
    return;
  }

  isDatabaseInitializing = true;
  try {
    await config.DATA_SOURCE.initialize();
    console.log('✅ Database connection successful');
    await seedAdminUser(); // ⬅️ Seed admin user
    isDatabaseInitialized = true;
  } catch (error: any) {
    console.error('❌ Database connection failed:', error);
    throw error;
  } finally {
    isDatabaseInitializing = false;
  }
};

// Serverless first request handler
export const handler = async (req: any, res: any) => {
  try {
    // Initialize database on first cold start
    await initializeDatabase();

    // Let Express handle the request
    return app(req, res);
  } catch (error: any) {
    console.error('Handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Database connection failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Local development server
if (require.main === module) {
  // Only start server when run directly (not as serverless function)
  initializeDatabase()
    .then(() => {
      app.listen(config.PORT, () => {
        console.log(`🚀 Local server running on port ${config.PORT}`);
      });
    })
    .catch((error) => {
      console.error('❌ Failed to start local server:', error);
      process.exit(1);
    });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    await config.DATA_SOURCE.destroy();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    await config.DATA_SOURCE.destroy();
    process.exit(0);
  });
}

/**
 * Handle server shutdown gracefully by disconnecting from the database
 *
 *  - Attempts to disconnect from the database before shutting down the server
 *  - Logs a success message if the disconnection is successful.
 *  - If an error occurs during disconnection, it is logged to the console.
 *  - Exist the process with status code `0` (indicating a successfully shutdown)
 *
 */

const handleServerShutdown = async () => {
  try {
    console.log('Server SHUTDOWN');
    process.exit(0);
  } catch (error) {
    console.log('Error during server shutdown', error);
    process.exit(1);
  }
};

/**
 * Listen for termination signals(`SIGTERM` and `SIGINT`)
 *
 * - `SIGTERM` : is typically sent when stopping a process (e.g. , `kill` command or container shutdonw)
 * - `SIGINT` : is triggered when the user interrupts the process (e.g., Ctrl+C)
 *
 * - when either signal is received, the `handleServerShutdown` function is called to gracefully handle the shutdown process
 */

process.on('SIGTERM', handleServerShutdown);
process.on('SIGINT', handleServerShutdown);

export default app;
