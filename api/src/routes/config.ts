import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth';
import { Config } from '../models/Config';
import { validateBody } from '../middleware/validate';

const router = Router();

router.get('/', async (_req, res) => {
  const cfg = await Config.findOne({});
  return res.json(cfg ?? { autoCloseEnabled: true, confidenceThreshold: 0.78, slaHours: 24 });
});

const ConfigSchema = z.object({
  autoCloseEnabled: z.boolean(),
  confidenceThreshold: z.number().min(0).max(1),
  slaHours: z.number().int().positive()
});

router.put('/', requireAuth, requireRole(['admin']), validateBody(ConfigSchema), async (req, res) => {
  const existing = await Config.findOne({});
  const updated = existing ? await Config.findByIdAndUpdate(existing._id, req.body, { new: true }) : await Config.create(req.body);
  return res.json(updated);
});

export default router;


