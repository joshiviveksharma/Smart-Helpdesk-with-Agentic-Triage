import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { validateBody } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimit';
import { signAccessToken } from '../utils/jwt';

const router = Router();

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/register', authLimiter, validateBody(RegisterSchema), async (req, res) => {
  const { name, email, password } = req.body as z.infer<typeof RegisterSchema>;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'EmailExists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role: 'user' });
  const token = signAccessToken(user._id.toString(), user.role);
  return res.status(201).json({ token });
});

const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

router.post('/login', authLimiter, validateBody(LoginSchema), async (req, res) => {
  const { email, password } = req.body as z.infer<typeof LoginSchema>;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'InvalidCredentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'InvalidCredentials' });
  const token = signAccessToken(user._id.toString(), user.role);
  return res.json({ token });
});

export default router;


