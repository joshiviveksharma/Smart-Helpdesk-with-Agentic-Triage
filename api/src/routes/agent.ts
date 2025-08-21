import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { requireAuth, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { triageTicket } from '../services/agentWorkflow';
import { AgentSuggestion } from '../models/AgentSuggestion';

const router = Router();

const TriageSchema = z.object({ ticketId: z.string().min(1), traceId: z.string().optional() });

router.post('/triage', requireAuth, requireRole(['admin', 'agent']), validateBody(TriageSchema), asyncHandler(async (req, res) => {
  const { ticketId, traceId } = req.body as z.infer<typeof TriageSchema>;
  const result = await triageTicket(ticketId, { traceId });
  return res.json(result);
}));

router.get('/suggestion/:ticketId', requireAuth, asyncHandler(async (req, res) => {
  const suggestion = await AgentSuggestion.findOne({ ticketId: req.params.ticketId });
  if (!suggestion) return res.status(404).json({ error: 'NotFound' });
  return res.json(suggestion);
}));

export default router;


