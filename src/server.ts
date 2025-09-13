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
import config from '@/config';
import limiter from '@/lib/express_rate_limit';

/**
 * Router
 */
import v1Router from '@/routes/v1';

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

//Enable response compression to reduce payload size and improve performance
app.use(compression({ threshold: 1024 })); // only compress responses larger than 1kb

// Use Helmet to enhance security by setting various HTTP headers
app.use(helmet());

//Apply rate limiting middleware to prevent excessive requests and enhance security
app.use(limiter);

(async () => {
  try {
    //Initialize database connection
    await config.DATA_SOURCE.initialize()
      .then(async () => {
        console.log('✅ Database connection successful');
        await seedAdminUser(); // ⬅️ Seed admin user
      })
      .catch((error) => {
        console.error('❌ Database connection failed:', error);
      });

    app.use('/api/v1', v1Router);

    app.listen(config.PORT, () => {
      console.log(`Server is running on port ${config.PORT}`);
    });
  } catch (error) {
    console.log('Failed to start server', error);

    if (config.NODE_ENV === 'production') {
      process.exit(1); // Exit the process with an error
    }
  }
})();

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
