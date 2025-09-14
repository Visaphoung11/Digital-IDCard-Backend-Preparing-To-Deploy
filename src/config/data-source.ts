import { DataSource } from 'typeorm';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { User } from '../entities/user';
import { IdCard } from '../entities/id-card';
import { SocialLink } from '../entities/social-link';
import { Favorite } from '../entities/favorite';
import { Device } from '../entities/device';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false, //false in production
  logging: false, // Disable all logging in production
  dropSchema: false, // Prevent schema drop in production
  cache: false, // Disable query result cache for serverless
  extra: {
    // Connection pool settings for production
    connectTimeoutMS: 10000, // Wait 10s for connection
    query_timeout: 15000, // 15s query timeout
    sslmode: 'disable', // Disable SSL for this server
  },
  // entities: ["src/entity/**/*.ts"],
  entities: [User, IdCard, SocialLink, Favorite, Device],
  maxQueryExecutionTime: 15000, // 15s timeout for Vercel
});
