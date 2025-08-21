import { Router } from 'express';
import { z } from 'zod';
import { Ticket } from '../models/Ticket';
import { TicketMessage } from '../models/TicketMessage';
import { validateBody } from '../middleware/validate';
import { requireAuth, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { appendAuditLog } from '../utils/audit';
import { triageTicket } from '../services/agentWorkflow';
import { v4 as uuidv4 } from 'uuid';
import { mutationLimiter } from '../middleware/rateLimit';

const router = Router();

const CreateTicketSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['billing', 'tech', 'shipping', 'other']).optional(),
  attachments: z.array(z.string().url()).optional()
});

router.post('/', requireAuth, mutationLimiter, validateBody(CreateTicketSchema), asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof CreateTicketSchema>;
  const ticket = await Ticket.create({ ...body, createdBy: req.authUser!.id, status: 'open' });
  await TicketMessage.create({ ticketId: ticket._id, author: 'user', body: body.description });
  const traceId = uuidv4();
  await appendAuditLog({ ticketId: ticket._id.toString(), traceId, actor: 'user', action: 'TICKET_CREATED', meta: { title: ticket.title } });
  // Fire-and-forget triage
  setImmediate(() => {
    triageTicket(ticket._id.toString(), { traceId }).catch(() => void 0);
  });
  return res.status(201).json(ticket);
}));

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const status = (req.query.status as string) || undefined;
  const mine = (req.query.mine as string) === 'true';
  const filter: any = {};
  if (status) filter.status = status;
  if (mine) filter.createdBy = req.authUser!.id;
  const items = await Ticket.find(filter).sort({ updatedAt: -1 }).limit(50);
  return res.json({ items });
}));

router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'NotFound' });
  const messages = await TicketMessage.find({ ticketId: ticket._id }).sort({ createdAt: 1 });
  return res.json({ ticket, messages });
}));

const ReplySchema = z.object({ body: z.string().min(1) });
router.post('/:id/reply', requireAuth, requireRole(['agent', 'admin']), mutationLimiter, validateBody(ReplySchema), asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'NotFound' });
  await TicketMessage.create({ ticketId: ticket._id, author: 'agent', body: req.body.body });
  ticket.status = 'triaged';
  await ticket.save();
  return res.status(200).json({ ok: true });
}));

const AssignSchema = z.object({ assigneeId: z.string().min(1) });
router.post('/:id/assign', requireAuth, requireRole(['agent', 'admin']), mutationLimiter, validateBody(AssignSchema), asyncHandler(async (req, res) => {
  const ticket = await Ticket.findByIdAndUpdate(req.params.id, { assignee: req.body.assigneeId }, { new: true });
  if (!ticket) return res.status(404).json({ error: 'NotFound' });
  return res.json(ticket);
}));

export default router;


