import mongoose, { Schema, InferSchemaType, Model } from 'mongoose';

export const AUDIT_ACTORS = ['system', 'agent', 'user'] as const;
export type AuditActor = (typeof AUDIT_ACTORS)[number];

const AuditLogSchema = new Schema(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
    traceId: { type: String, required: true, index: true },
    actor: { type: String, enum: AUDIT_ACTORS, required: true },
    action: { type: String, required: true },
    meta: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: () => new Date() }
  },
  { timestamps: false }
);

AuditLogSchema.index({ ticketId: 1, timestamp: 1 });

export type AuditLogDocument = InferSchemaType<typeof AuditLogSchema> & { _id: mongoose.Types.ObjectId };

export const AuditLog: Model<AuditLogDocument> =
  mongoose.models.AuditLog || mongoose.model<AuditLogDocument>('AuditLog', AuditLogSchema);


