import { v4 as uuidv4 } from 'uuid';
import { Ticket } from '../models/Ticket';
import { Article } from '../models/Article';
import { AgentSuggestion } from '../models/AgentSuggestion';
import { TicketMessage } from '../models/TicketMessage';
import { appendAuditLog } from '../utils/audit';
import { getLlmProvider } from './llm';
import { Config } from '../models/Config';
import { appConfig } from '../config';

export async function ensureConfig() {
  const existing = await Config.findOne({});
  if (existing) return existing;
  return Config.create({ autoCloseEnabled: appConfig.autoCloseEnabled, confidenceThreshold: appConfig.confidenceThreshold, slaHours: 24 });
}

export async function triageTicket(ticketId: string, opts?: { traceId?: string }) {
  const traceId = opts?.traceId ?? uuidv4();
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new Error('TicketNotFound');

  const llm = getLlmProvider();

  // 1) Classify
  const classification = await llm.classify(`${ticket.title}\n${ticket.description}`);
  await appendAuditLog({ ticketId, traceId, actor: 'system', action: 'AGENT_CLASSIFIED', meta: classification });

  // 2) Retrieve KB (simple text search + regex fallback)
  const query = ticket.title + ' ' + ticket.description;
  const textResults = await Article.find({ $text: { $search: query }, status: 'published' }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(3);
  let articles = textResults;
  if (articles.length === 0) {
    const regex = new RegExp(query.split(/\s+/).slice(0, 3).join('|'), 'i');
    articles = await Article.find({ status: 'published', $or: [{ title: regex }, { body: regex }, { tags: regex }] }).limit(3);
  }
  await appendAuditLog({ ticketId, traceId, actor: 'system', action: 'KB_RETRIEVED', meta: { articleIds: articles.map((a) => a._id) } });

  // 3) Draft
  const draft = await llm.draft(`${ticket.title}\n${ticket.description}`, articles.map((a) => ({ id: a._id.toString(), title: a.title })));
  await appendAuditLog({ ticketId, traceId, actor: 'system', action: 'DRAFT_GENERATED', meta: draft });

  // 4) Decision
  const cfg = await ensureConfig();
  let statusUpdate: 'resolved' | 'waiting_human';
  let autoClosed = false;
  if (cfg.autoCloseEnabled && classification.confidence >= cfg.confidenceThreshold) {
    statusUpdate = 'resolved';
    autoClosed = true;
  } else {
    statusUpdate = 'waiting_human';
  }

  const suggestion = await AgentSuggestion.create({
    ticketId: ticket._id,
    predictedCategory: classification.predictedCategory,
    articleIds: articles.map((a) => a._id),
    draftReply: draft.draftReply,
    confidence: classification.confidence,
    autoClosed,
    modelInfo: { provider: appConfig.stubMode ? 'stub' : 'openai', model: 'stub-1', promptVersion: 'v1', latencyMs: 0 }
  });

  ticket.category = classification.predictedCategory as any;
  ticket.agentSuggestionId = suggestion._id;
  ticket.status = statusUpdate;
  await ticket.save();

  if (autoClosed) {
    await TicketMessage.create({ ticketId: ticket._id, author: 'system', body: draft.draftReply });
    await appendAuditLog({ ticketId, traceId, actor: 'system', action: 'AUTO_CLOSED', meta: { suggestionId: suggestion._id } });
  } else {
    await appendAuditLog({ ticketId, traceId, actor: 'system', action: 'ASSIGNED_TO_HUMAN', meta: { suggestionId: suggestion._id } });
  }

  return { traceId, suggestionId: suggestion._id };
}


