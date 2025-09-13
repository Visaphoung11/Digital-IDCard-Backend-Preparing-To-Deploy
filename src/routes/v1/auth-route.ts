import { Router } from 'express';

/**
 * Controller
 */
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
} from '@/controller/auth-controller';

const router = Router();

router.post('/register', registerController);
router.post('/refresh-token', refreshTokenController);
router.post('/login', loginController);
router.post('/logout', logoutController);

export default router;
