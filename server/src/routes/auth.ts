import express from 'express';
import { register, login, getMe } from '../controllers/auth';
import { protect } from '../middleware/auth';
import validate from '../middleware/validate';
import { registerSchema, loginSchema } from '../validators/auth';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);

export default router;
