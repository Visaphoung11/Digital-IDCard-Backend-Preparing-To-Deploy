/**
 *  @comyright 2025 dencodes
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import { rateLimit } from 'express-rate-limit';

//Configure rate limiting middleware to prevent abuse
const limiter = rateLimit({
  windowMs: 60000, // 1 minute time window for request limiting
  limit: 60, // Allow a maximun of 60 requests per window per IP
  standardHeaders: 'draft-8', // Use the latest standard draft headers for rate limiting
  legacyHeaders: false, // Disable the legacy headers for rate limiting
  message: {
    error: 'Your have sent too many requests, please try again after a minute',
  },
});
export default limiter;
