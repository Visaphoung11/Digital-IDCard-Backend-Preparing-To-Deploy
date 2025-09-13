import { DataSource } from 'typeorm';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { User } from '@/entities/user';
import { IdCard } from '@/entities/id-card';
import { SocialLink } from '@/entities/social-link';
import { Favorite } from '@/entities/favorite';
import { Device } from '@/entities/device';

dotenv.config();
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, //false in production
  logging: true,
  // entities: ["src/entity/**/*.ts"],
  entities: [User, IdCard, SocialLink, Favorite, Device],
});
