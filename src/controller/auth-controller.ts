import {
  loginService,
  logoutService,
  refreshTokenHandler,
  registerService,
  runRegisterService,
} from '@/service/auth-service';
import type { Request, Response } from 'express';

export const registerController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // const { email, password, user_name, full_name } = req.body;
  const result = await registerService(req, res);
  res.status(201).json(result);
};

export const loginController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await loginService(req, res);
  res.status(200).json(result);
};

export const refreshTokenController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await refreshTokenHandler(req, res);
  res.status(200).json(result);
};

export const logoutController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await logoutService(req, res);
  res.status(200).json(result);
};
