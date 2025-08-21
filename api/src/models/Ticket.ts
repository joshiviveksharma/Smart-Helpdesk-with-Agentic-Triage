import mongoose, { Schema, InferSchemaType, Model } from 'mongoose';

export const TICKET_CATEGORIES = ['billing', 'tech', 'shipping', 'other'] as const;
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const TICKET_STATUS = ['open', 'triaged', 'waiting_human', 'resolved', 'closed'] as const;
export type TicketStatus = (typeof TICKET_STATUS)[number];

const TicketSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, enum: TICKET_CATEGORIES, default: 'other', index: true },
    status: { type: String, enum: TICKET_STATUS, default: 'open', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    agentSuggestionId: { type: Schema.Types.ObjectId, ref: 'AgentSuggestion' },
    attachments: { type: [String], default: [] }
  },
  { timestamps: true }
);

TicketSchema.index({ status: 1, updatedAt: -1 });

export type TicketDocument = InferSchemaType<typeof TicketSchema> & { _id: mongoose.Types.ObjectId };

export const Ticket: Model<TicketDocument> =
  mongoose.models.Ticket || mongoose.model<TicketDocument>('Ticket', TicketSchema);


