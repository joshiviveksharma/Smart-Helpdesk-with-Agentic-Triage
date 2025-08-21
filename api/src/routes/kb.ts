import { Router } from 'express';
import { z } from 'zod';
import { Article } from '../models/Article';
import { validateBody } from '../middleware/validate';
import { requireAuth, requireRole } from '../middleware/auth';
import { mutationLimiter } from '../middleware/rateLimit';

const router = Router();

router.get('/', async (req, res) => {
  const query = (req.query.query as string) || '';
  const status = (req.query.status as string) || 'published';
  if (!query) {
    const items = await Article.find({ status }).sort({ updatedAt: -1 }).limit(20);
    return res.json({ items });
  }
  const items = await Article.find({ $text: { $search: query }, status }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);
  return res.json({ items });
});

const ArticleSchema = z.object({ title: z.string().min(1), body: z.string().min(1), tags: z.array(z.string()).default([]), status: z.enum(['draft', 'published']) });

router.post('/', requireAuth, requireRole(['admin']), mutationLimiter, validateBody(ArticleSchema), async (req, res) => {
  const created = await Article.create(req.body);
  return res.status(201).json(created);
});

router.put('/:id', requireAuth, requireRole(['admin']), mutationLimiter, validateBody(ArticleSchema.partial()), async (req, res) => {
  const updated = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ error: 'NotFound' });
  return res.json(updated);
});

router.delete('/:id', requireAuth, requireRole(['admin']), mutationLimiter, async (req, res) => {
  const deleted = await Article.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'NotFound' });
  return res.status(204).send();
});

export default router;


