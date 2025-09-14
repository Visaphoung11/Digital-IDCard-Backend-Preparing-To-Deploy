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

/**
 * Initialize database connection (only once)
 */
let isDbInitialized = false;
let isDbInitializedChecked = false;

const initializeDatabase = async () => {
  if (!isDbInitializedChecked) {
    try {
      await config.DATA_SOURCE.initialize();
      console.log('✅ Database connection successful');

      // Test database with a simple query
      const result = await config.DATA_SOURCE.query('SELECT version()');
      console.log('✅ Database query successful');

      isDbInitialized = true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    } finally {
      isDbInitializedChecked = true;
    }
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Initialize database on first request
    await initializeDatabase();

    const { pathname, searchParams } = new URL(req.url || '', `http://${req.headers.host}`);
    const method = req.method;

    console.log(`📍 ${method} ${pathname}`);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');

    // Handle preflight OPTIONS requests
    if (method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Health check
    if (pathname === '/health') {
      return res.status(200).json({
        status: 'ok',
        message: 'Digital ID Card API is healthy',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        database: 'connected'
      });
    }

    // Root endpoint
    if (pathname === '/' || pathname === '') {
      return res.status(200).json({
        message: 'Digital ID Card API',
        status: '✅ Running on Vercel Serverless',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          auth: '/api/v1/auth - login/register',
          users: '/api/v1/users - user management',
          cards: '/api/v1/cards - digital cards',
        }
      });
    }

    // API Auth routes
    if (pathname === '/api/v1/auth/register' && method === 'POST') {
      return res.status(201).json({
        message: 'Registration functionality coming soon',
        note: 'Full Express integration pending'
      });
    }

    if (pathname === '/api/v1/auth/login' && method === 'POST') {
      return res.status(200).json({
        message: 'Login functionality coming soon',
        note: 'Full Express integration pending',
        test_credentials: {
          email: 'admin@test.com',
          password: 'admin123'
        }
      });
    }

    if (pathname.startsWith('/api/v1')) {
      return res.status(501).json({
        error: 'Not implemented',
        message: 'API route available but not yet integrated with Express',
        method: method,
        path: pathname,
        status: 'work in progress'
      });
    }

    // Default 404
    return res.status(404).json({
      error: 'Route not found',
      path: pathname,
      method: method
    });

  } catch (error: any) {
    console.error('❌ Handler error:', error);

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Server configuration error',
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
