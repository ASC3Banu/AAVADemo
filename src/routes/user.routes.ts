import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

const userLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100
});

router.get('/me', authenticate, userLimiter, (req, res) => {
  res.status(200).json({ message: 'User profile endpoint - implementation pending' });
});

router.patch('/me', authenticate, userLimiter, (req, res) => {
  res.status(200).json({ message: 'Update user profile - implementation pending' });
});

export { router as userRouter };