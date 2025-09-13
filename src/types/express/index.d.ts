import express from 'express';
import { JwtPayload } from 'jsonwebtoken';
// interface JwtPayload {
//   user_id: number;
//   email: string;
//   roles: UserRole[];
//   username: string;
//   user: string;
// }
declare global {
  namespace Express {
    interface Request {
      // user?: Record<JwtPayload, any>;
      user?: JwtPayload;
    }
  }
}
