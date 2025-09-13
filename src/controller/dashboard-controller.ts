import { getDashboardAnalyticsService } from '@/service/dashboard-service';
import { Request, Response } from 'express';

export const getDashboardAnalyticsController = async (
  req: Request,
  res: Response,
) => {
  const data = await getDashboardAnalyticsService(req, res);
  res.status(201).json({
    data,
  });
};
