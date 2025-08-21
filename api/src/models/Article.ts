import mongoose, { Schema, InferSchemaType, Model } from 'mongoose';

export const ARTICLE_STATUS = ['draft', 'published'] as const;
export type ArticleStatus = (typeof ARTICLE_STATUS)[number];

const ArticleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, index: 'text' },
    body: { type: String, required: true },
    tags: { type: [String], default: [], index: true },
    status: { type: String, enum: ARTICLE_STATUS, default: 'draft', index: true }
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

ArticleSchema.index({ title: 'text', body: 'text', tags: 1 });

export type ArticleDocument = InferSchemaType<typeof ArticleSchema> & { _id: mongoose.Types.ObjectId };

export const Article: Model<ArticleDocument> =
  mongoose.models.Article || mongoose.model<ArticleDocument>('Article', ArticleSchema);


