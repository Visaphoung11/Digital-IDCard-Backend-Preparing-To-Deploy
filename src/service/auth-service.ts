import { AppDataSource } from '@/config/data-source';
import { User } from '@/entities/user';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '@/util';
import { UserRole } from '@/enum';
import { Request, Response } from 'express';
import { verifyRefreshToken } from '@/util/jwt';
import { saveDeviceService } from './device-service';
import { RegisterInput } from '@/types/inputRegister';
import { Device } from '@/entities/device';

/** Script for add new users from users.json */
export const runRegisterService = async (input: RegisterInput) => {
  const userRepo = AppDataSource.getRepository(User);

  // Check for existing user by email
  const existingUser = await userRepo.findOne({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new Error(`User with email "${input.email}" already exists.`);
  }
  // Hash the password
  const hashedPassword = await bcrypt.hash(input.password, 12);

  // Create and save the user
  const newUser = userRepo.create({
    email: input.email,
    password: hashedPassword,
    user_name: input.user_name,
    full_name: input.full_name,
  });

  await userRepo.save(newUser);

  // Generate tokens
  const accessToken = generateAccessToken({
    user_id: newUser.id.toString(),
    roles: newUser.roles as UserRole[],
    email: newUser.email,
    username: newUser.user_name,
  });

  const refreshToken = generateRefreshToken({
    user_id: newUser.id.toString(),
    roles: newUser.roles as UserRole[],
    email: newUser.email,
    username: newUser.user_name,
  });

  //call device service
  // const device = await saveDeviceService(newUser.id, req);
  const deviceRepo = AppDataSource.getRepository(Device);
  const device = deviceRepo.create({
    device_name: input.device_name,
    device_type: input.device_type,
    ip_address: input.ip_address,
    browser: input.browser,
    os: input.os,
    user: { id: newUser.id },
  });
  return {
    status: 201,
    message: 'Register success',
    data: {
      newUser,
      accessToken,
      refreshToken,
      device,
    },
  };
};

export const registerService = async (req: Request, res: Response) => {
  try {
    const { email, password, user_name, full_name } = req.body;
    const userRepo = AppDataSource.getRepository(User);
    const existingUser = await userRepo.findOne({
      where: {
        email: email,
      },
    });
    if (existingUser) {
      return {
        status: 400,
        message: 'Email already exists',
      };
    }
    const hashPassword = await bcrypt.hash(password, 12);
    const user = userRepo.create({
      full_name: full_name,
      email: email,
      password: hashPassword,
      user_name: user_name,
    });
    await userRepo.save(user);
    const accessToken = generateAccessToken({
      user_id: user.id.toString(),
      roles: user.roles as UserRole[],
      email: user.email,
      username: user.user_name,
    });
    const refreshToken = generateRefreshToken({
      user_id: user.id.toString(),
      roles: user.roles as UserRole[],
      email: user.email,
      username: user.user_name,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    //call device service
    const device = await saveDeviceService(user.id, req);
    return {
      status: 201,
      message: 'Register success',
      data: {
        user,
        accessToken,
        refreshToken,
        device,
      },
    };
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /auth/login
export const loginService = async (req: Request, res: Response) => {
  const { email, password, user_name } = req.body;
  const userRepo = AppDataSource.getRepository(User);
  try {
    const existUser = await userRepo.findOne({
      where: {
        email,
        user_name,
      },
    });
    if (!existUser) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, existUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const accessToken = generateAccessToken({
      user_id: existUser?.id.toString(),
      roles: existUser.roles as UserRole[],
      email: existUser.email,
      username: existUser.user_name,
    });
    const refreshToken = generateRefreshToken({
      user_id: existUser.id.toString(),
      roles: existUser.roles as UserRole[],
      email: existUser.email,
      username: existUser.user_name,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      // secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      // secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return {
      status: 200,
      message: 'Login success',
      data: {
        existUser,
        accessToken,
        refreshToken,
      },
    };
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /auth/refresh-token
export const refreshTokenHandler = async (req: Request, res: Response) => {
  const userRepo = AppDataSource.getRepository(User);
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    // 1. Verify the refresh token
    const payload = verifyRefreshToken(refreshToken) as any;

    // 2. (Optional) Check if token is in database
    const user = await userRepo.findOneBy({ id: payload.user_id });

    if (!user) return res.status(401).json({ message: 'Invalid token' });

    // 3. Generate a new access toke
    // const newAccessToken = jwt.sign(
    //   { userId: user.id },
    //   process.env.ACCESS_TOKEN_SECRET as string,
    //   { expiresIn: '15m' },
    // );
    const accessToken = generateAccessToken({
      user_id: user.id.toString(),
      roles: user.roles as UserRole[],
      email: user.email,
      username: user.user_name,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: false,
      // secure: process.env.NODE_ENV === 'production' ? true : false,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    const newRefreshToken = generateRefreshToken({
      user_id: user.id.toString(),
      roles: user.roles as UserRole[],
      email: user.email,
      username: user.user_name,
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: false,
      // secure: process.env.NODE_ENV === 'production' ? true : false,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { accessToken: accessToken, refreshToken: newRefreshToken, user };
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logoutService = async (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');
  return res.json({ message: 'Logged out successfully' });
};
