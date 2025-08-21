import mongoose, { Schema, InferSchemaType, Model } from 'mongoose';

const ConfigSchema = new Schema(
  {
    autoCloseEnabled: { type: Boolean, default: true },
    confidenceThreshold: { type: Number, default: 0.78 },
    slaHours: { type: Number, default: 24 }
  },
  { timestamps: false }
);

export type ConfigDocument = InferSchemaType<typeof ConfigSchema> & { _id: mongoose.Types.ObjectId };

export const Config: Model<ConfigDocument> =
  mongoose.models.Config || mongoose.model<ConfigDocument>('Config', ConfigSchema);


