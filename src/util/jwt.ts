// src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserRole } from '@/enum';
dotenv.config();

const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} = process.env;

interface JwtPayload {
  user_id: string;
  email: string;
  roles: UserRole[];
  username: string;
}

if (
  !ACCESS_TOKEN_SECRET ||
  !REFRESH_TOKEN_SECRET ||
  !ACCESS_TOKEN_EXPIRES_IN ||
  !REFRESH_TOKEN_EXPIRES_IN
) {
  throw new Error('Missing JWT environment variables');
}

const generateAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: '30m',
  });
};

const generateRefreshToken = (payload: JwtPayload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET as string, {
    expiresIn: '7d',
  });
};

const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET!);
};

const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET!);
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
