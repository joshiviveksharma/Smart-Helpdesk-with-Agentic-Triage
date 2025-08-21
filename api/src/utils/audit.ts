import { AuditLog } from '../models/AuditLog';

export async function appendAuditLog(params: {
  ticketId: string;
  traceId: string;
  actor: 'system' | 'agent' | 'user';
  action: string;
  meta?: unknown;
}) {
  const { ticketId, traceId, actor, action, meta } = params;
  await AuditLog.create({ ticketId, traceId, actor, action, meta, timestamp: new Date() });
}


