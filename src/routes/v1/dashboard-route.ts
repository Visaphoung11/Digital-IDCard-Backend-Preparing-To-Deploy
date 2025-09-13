import { getDashboardAnalyticsController } from '@/controller/dashboard-controller';
import { UserRole } from '@/enum';
import { authMiddleware } from '@/middleware/auth-middleware';
import { roleCheck } from '@/middleware/role-middleware';
import { Router } from 'express';

const router = Router();

router.get(
  '/analytics',
  authMiddleware,
  roleCheck([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  getDashboardAnalyticsController,
);

export default router;
