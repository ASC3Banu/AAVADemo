import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

const notificationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200
});

router.get('/', authenticate, notificationLimiter, (req, res) => {
  res.status(200).json({ message: 'Notifications endpoint - implementation pending' });
});

router.patch('/:notification_id/read', authenticate, notificationLimiter, (req, res) => {
  res.status(200).json({ message: 'Mark notification as read - implementation pending' });
});

export { router as notificationRouter };