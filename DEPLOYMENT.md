# Vercel Deployment Guide

## Overview
This guide explains how to deploy your Digital ID Card API to Vercel serverless platform.

## Files Created/Modified for Deployment

### 1. `package.json`
- Added build scripts: `build`, `start`, and `vercel-build`
- Added `@vercel/node` dependency for TypeScript support

### 2. `vercel.json`
- Configured Vercel deployment settings
- Set up API routing and function configuration
- Configured 30-second maximum duration for functions

### 3. `api/index.ts`
- Created serverless-compatible entry point
- Modified server initialization for serverless environment
- Added database connection pooling for serverless functions

### 4. `.vercelignore`
- Configured files to ignore during deployment
- Excludes development files and source code

## Environment Variables Required

You'll need to set these environment variables in your Vercel dashboard:

```
NODE_ENV=production
DB_HOST=your-database-host
DB_PORT=5432
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=your-database-name

PASSWORD_ADMIN=your-admin-password
FULL_NAME_ADMIN=Admin Name
USER_NAME_ADMIN=admin
EMAIL_ADMIN=admin@example.com

JWT_SECRET=your-jwt-secret-key
REFRESH_TOKEN_SECRET=your-refresh-token-secret
ACCESS_TOKEN_SECRET=your-access-token-secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

## Deployment Steps

### 1. Prerequisites
- Ensure you have a Vercel account
- Install Vercel CLI: `npm install -g vercel`
- Have your database hosted (recommend PostgreSQL on services like Neon, Supabase, or Railway)

### 2. Database Setup
- Make sure your PostgreSQL database is accessible from external connections
- Update your database connection settings for production
- Ensure your database allows SSL connections

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install dependencies
npm install

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts to configure your project
```

#### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the configuration
5. Add your environment variables in the "Environment Variables" section
6. Click "Deploy"

### 4. Configure Environment Variables
In your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all required environment variables listed above
4. Redeploy if necessary

### 5. Test Your Deployment
- Your API will be available at: `https://your-project-name.vercel.app`
- Test the root endpoint: `https://your-project-name.vercel.app/`
- Test API endpoints: `https://your-project-name.vercel.app/api/v1/...`

## Important Notes

### Database Connections
- Serverless functions have connection limits
- Use connection pooling in your database configuration
- Consider using a database service that supports serverless (like PlanetScale, Neon, or Supabase)

### Function Limitations
- Maximum execution time: 30 seconds (configurable up to 900s on Pro plans)
- Cold start latency may occur
- File system is read-only except for `/tmp`

### CORS Configuration
- Update your CORS whitelist origins to include your Vercel domain
- Add your production domain to the `WHITELIST_ORIGINS` environment variable

### Monitoring
- Check function logs in Vercel dashboard
- Monitor performance and errors
- Set up alerting if needed

## Troubleshooting

### Common Issues
1. **Database Connection Timeout**: Ensure your database allows external connections and has proper connection pooling
2. **Environment Variables Not Found**: Double-check all required environment variables are set in Vercel dashboard
3. **Cold Start Issues**: Consider upgrading to Vercel Pro for faster cold starts
4. **CORS Errors**: Verify your domain is in the WHITELIST_ORIGINS

### Local Testing
Before deploying, test locally:
```bash
npm run build
npm start
```

## Security Considerations
- Never commit `.env` files
- Use strong, unique secrets for JWT tokens
- Enable database SSL connections
- Regularly rotate API keys and secrets

## Performance Optimization
- Consider implementing Redis for caching
- Optimize database queries
- Use CDN for static assets
- Monitor function execution times
