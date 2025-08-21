import mongoose, { Schema, InferSchemaType, Model } from 'mongoose';

const AgentSuggestionSchema = new Schema(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
    predictedCategory: { type: String, required: true },
    articleIds: { type: [Schema.Types.ObjectId], ref: 'Article', default: [] },
    draftReply: { type: String, required: true },
    confidence: { type: Number, required: true },
    autoClosed: { type: Boolean, default: false },
    modelInfo: {
      provider: String,
      model: String,
      promptVersion: String,
      latencyMs: Number
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type AgentSuggestionDocument = InferSchemaType<typeof AgentSuggestionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AgentSuggestion: Model<AgentSuggestionDocument> =
  mongoose.models.AgentSuggestion ||
  mongoose.model<AgentSuggestionDocument>('AgentSuggestion', AgentSuggestionSchema);


