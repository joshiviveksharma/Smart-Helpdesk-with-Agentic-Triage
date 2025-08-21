import mongoose, { Schema, InferSchemaType, Model } from 'mongoose';

export const MESSAGE_AUTHORS = ['system', 'agent', 'user'] as const;
export type MessageAuthor = (typeof MESSAGE_AUTHORS)[number];

const TicketMessageSchema = new Schema(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
    author: { type: String, enum: MESSAGE_AUTHORS, required: true },
    body: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

TicketMessageSchema.index({ ticketId: 1, createdAt: 1 });

export type TicketMessageDocument = InferSchemaType<typeof TicketMessageSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TicketMessage: Model<TicketMessageDocument> =
  mongoose.models.TicketMessage ||
  mongoose.model<TicketMessageDocument>('TicketMessage', TicketMessageSchema);


