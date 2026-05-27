import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

const predictionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200
});

router.post('/delivery', authenticate, predictionLimiter, (req, res) => {
  res.status(200).json({ message: 'Delivery prediction endpoint - implementation pending' });
});

export { router as predictionRouter };