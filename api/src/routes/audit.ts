import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { AuditLog } from '../models/AuditLog';

const router = Router();

router.get('/tickets/:id/audit', requireAuth, async (req, res) => {
  const items = await AuditLog.find({ ticketId: req.params.id }).sort({ timestamp: 1 });
  return res.json({ items });
});

export default router;


