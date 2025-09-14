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
import config from '../src/config';
import limiter from '../src/lib/express_rate_limit';

/**
 * Router
 */
import v1Router from '../src/routes/v1';

/**
 * Types
 */
import type { CorsOptions } from 'cors';
import { errorHandler } from '../src/util/error-handler';
import { seedAdminUser } from '../src/data/seed-admin';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Express app initialization
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
//`extended : true` allow rich objects and arrays via query string library
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

//Enable response compression to reduce payload size and improve performance
app.use(compression({ threshold: 1024 })); // only compress responses larger than 1kb

// Use Helmet to enhance security by setting various HTTP headers
app.use(helmet());

//Apply rate limiting middleware to prevent excessive requests and enhance security
app.use(limiter);

// Initialize database connection (only once)
let isDbInitialized = false;

const initializeDatabase = async () => {
  if (!isDbInitialized) {
    try {
      await config.DATA_SOURCE.initialize();
      console.log('✅ Database connection successful');
      await seedAdminUser();
      isDbInitialized = true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }
};

app.use('/api/v1', v1Router);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Digital ID Card API',
    status: 'Running on Vercel',
    version: '1.0.0'
  });
});

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Initialize database on first request
    await initializeDatabase();
    
    // Handle the request with Express app
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to initialize server'
    });
  }
}
