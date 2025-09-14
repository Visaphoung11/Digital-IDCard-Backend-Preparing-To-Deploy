/**
 *  @comyright 2025 dencodes
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Custom Modules
 */
import config from '../src/config';
import { seedAdminUser } from '../src/data/seed-admin';

/**
 * Initialize database connection (only once)
 */
let isDbInitialized = false;

const initializeDatabase = async () => {
  if (!isDbInitialized) {
    try {
      await config.DATA_SOURCE.initialize();
      console.log('✅ Database connection successful');
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('DB_HOST present:', !!process.env.DB_HOST);
      console.log('DB_PORT:', process.env.DB_PORT);

      isDbInitialized = true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Initialize database on first request
    await initializeDatabase();

    const { pathname } = new URL(req.url || '', `http://${req.headers.host}`);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Route handling
    if (pathname === '/' || pathname === '') {
      return res.status(200).json({
        message: 'Digital ID Card API',
        status: '✅ Running on Vercel Serverless',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          api: '/api/v1',
          status: 'Database connected successfully'
        }
      });
    }

    // Health check endpoint
    if (pathname === '/health') {
      return res.status(200).json({
        status: 'ok',
        message: 'Digital ID Card API is healthy',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    }

    // API routes
    if (pathname.startsWith('/api/v1')) {
      return res.status(200).json({
        error: 'Endpoint not implemented',
        message: 'This is a simplified Vercel handler',
        path: pathname,
        available: '/health, /'
      });
    }

    // Default response for unknown routes
    return res.status(200).json({
      message: 'Digital ID Card API Serverless Function',
      path: pathname,
      method: req.method,
      note: 'Full Express app integration coming soon'
    });

  } catch (error: any) {
    console.error('❌ Handler error:', error.message);

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to initialize server',
      timestamp: new Date().toISOString()
    });
  }
};
