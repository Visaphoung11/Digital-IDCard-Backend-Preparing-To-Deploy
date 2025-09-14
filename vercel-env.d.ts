/// <reference types="@vercel/node" />

// This file ensures TypeScript recognizes Vercel's environment variables
declare namespace NodeJS {
  export interface ProcessEnv {
    // Add your environment variables here for TypeScript support
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    
    // Database
    DATABASE_URL: string;
    
    // JWT
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    
    // Add other environment variables as needed
    [key: string]: string | undefined;
  }
}
