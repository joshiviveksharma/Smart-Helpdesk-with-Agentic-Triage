import mongoose, { Schema, InferSchemaType, Model } from 'mongoose';

export const USER_ROLES = ['admin', 'agent', 'user'] as const;
export type UserRole = (typeof USER_ROLES)[number];

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, default: 'user', index: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type UserDocument = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);


