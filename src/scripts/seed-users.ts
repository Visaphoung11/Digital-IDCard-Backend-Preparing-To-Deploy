/**
 *  @copyright 2025 dencodes
 *  @license Apache-2.0
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import config from '@/config';
import { runRegisterService } from '@/service/auth-service';

const filePath = path.join(__dirname, '../data/users.json');
// const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const users = raw.users;
console.log(users, '===user');

if (!Array.isArray(users)) {
  throw new Error('❌ "users" must be an array in users.json');
}

const seedUsers = async () => {
  try {
    await config.DATA_SOURCE.initialize();
    console.log('✅ DB connected for seeding');

    for (const user of users) {
      console.log('Seeding user:', user);
      if (!user || !user.email) {
        console.warn('⚠️ Skipping invalid user:', user);
        continue;
      }
      try {
        console.log(user, 'user====');
        await runRegisterService(user);
        console.log(`✅ Seeded: ${user.email}`);
      } catch (err: any) {
        console.error(`❌ Failed to seed ${user.email}: ${err.message || err}`);
      }
    }

    await config.DATA_SOURCE.destroy();
    console.log('🎉 Done seeding users & DB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
};

seedUsers();

// run script
// npx ts-node -r tsconfig-paths/register src/scripts/seed-users.ts
