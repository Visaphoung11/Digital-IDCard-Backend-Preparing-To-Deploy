import {
  DeleteUserController,
  getUsersController,
  meController,
  updateProfileController,
  updateUserByAdminController,
} from '@/controller';
import { UserRole } from '@/enum';
import { authMiddleware } from '@/middleware/auth-middleware';
import { roleCheck } from '@/middleware/role-middleware';
import { Router } from 'express';
const router = Router();

router.get(
  '/',
  authMiddleware,
  roleCheck([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  getUsersController,
);
router.get(
  '/me',
  authMiddleware,
  meController,
  // roleCheck([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER]),
);
router.put('/update-profile', authMiddleware, updateProfileController);
router.delete(
  '/delete-user/:id',
  authMiddleware,
  roleCheck([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  DeleteUserController,
);

router.put(
  '/update-user/:id',
  authMiddleware,
  roleCheck([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  updateUserByAdminController,
);

export default router;
