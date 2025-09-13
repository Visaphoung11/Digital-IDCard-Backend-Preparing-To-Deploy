import { AppDataSource } from '@/config/data-source';
import { Device } from '@/entities/device';
import { User } from '@/entities/user';
import { UserRole } from '@/enum';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

export const seedAdminUser = async () => {
  const userRepo = AppDataSource.getRepository(User);
  const deviceRepo = AppDataSource.getRepository(Device);

  const existingAdmin = await userRepo.findOne({
    where: [
      { email: process.env.EMAIL_ADMIN as string },
      { user_name: process.env.USER_NAME_ADMIN as string },
    ],
  });
  if (existingAdmin) {
    existingAdmin.roles = [UserRole.ADMIN, UserRole.USER];
    existingAdmin.password = await bcrypt.hash(
      process.env.PASSWORD_ADMIN as string,
      10,
    );
    await userRepo.save(existingAdmin);
    console.log('♻️ Admin user updated');
  }

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(
      process.env.PASSWORD_ADMIN as string,
      10,
    );

    const adminUser = userRepo.create({
      full_name: process.env.FULL_NAME_ADMIN as string,
      user_name: process.env.USER_NAME_ADMIN as string,
      email: process.env.EMAIL_ADMIN as string,
      password: hashedPassword,
      roles: [UserRole.ADMIN, UserRole.USER],
      is_active: true,
      is_deleted: false,
    });
    await userRepo.save(adminUser);
    const deviceUser = deviceRepo.create({
      device_name: 'Galaxy s25 ultra',
      device_type: 'Samsung',
      os: 'android',
      browser: 'chrome',
      ip_address: '0.0.0.128',
      user: { id: adminUser.id },
    });

    await deviceRepo.save(deviceUser);

    console.log('✅ Admin user seeded successfully');
  } else {
    console.log('ℹ️ Admin user already exists (by email or username)');
  }
};
