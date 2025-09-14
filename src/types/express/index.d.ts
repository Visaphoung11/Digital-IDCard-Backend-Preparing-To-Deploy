import express from 'express';
import { JwtPayload } from '../../util/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
