import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  user_id: string;
  roles: string[]; // or your UserRole[]
  // other token fields...
}

// Middleware factory: takes allowed roles as argument
export const roleCheck = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.cookies?.accessToken;
      if (!authHeader) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
      }

      // const token = authHeader.split(' ')[1];
      const secret = process.env.ACCESS_TOKEN_SECRET!; // use your secret
      const decoded = jwt.verify(authHeader, secret) as JwtPayload;

      // Check if user roles exist and match allowedRoles
      if (
        !decoded.roles ||
        !decoded.roles.some((role) => allowedRoles.includes(role))
      ) {
        res.status(401).json({ message: 'Forbidden: Insufficient role' });
      }

      // Optionally attach user info to req for later use
      (req as any).user = decoded;

      next(); // role allowed, continue
    } catch (error) {
      res.status(401).json({ message: 'Unauthorized: Invalid token' });
      return;
    }
  };
};
