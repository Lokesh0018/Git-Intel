import mongoose, { Schema, Types } from 'mongoose';

const evidenceSchema = new Schema(
  {
    label: String,
    value: Schema.Types.Mixed,
    repositories: [String]
  },
  { _id: false }
);

const scoredCategorySchema = new Schema(
  {
    score: Number,
    evidence: [evidenceSchema]
  },
  { _id: false }
);

export interface ScoreDocument extends mongoose.Document {
  profileId: Types.ObjectId;
  backend: { score: number; evidence: unknown[] };
  frontend: { score: number; evidence: unknown[] };
  ai: { score: number; evidence: unknown[] };
  devops: { score: number; evidence: unknown[] };
  testing: { score: number; evidence: unknown[] };
  security: { score: number; evidence: unknown[] };
  impact: { score: number; evidence: unknown[] };
  consistency: { score: number; evidence: unknown[] };
  collaboration: { score: number; evidence: unknown[] };
}

const scoreSchema = new Schema<ScoreDocument>({
  profileId: { type: Schema.Types.ObjectId, ref: 'GithubProfile', required: true, unique: true, index: true },
  backend: scoredCategorySchema,
  frontend: scoredCategorySchema,
  ai: scoredCategorySchema,
  devops: scoredCategorySchema,
  testing: scoredCategorySchema,
  security: scoredCategorySchema,
  impact: scoredCategorySchema,
  consistency: scoredCategorySchema,
  collaboration: scoredCategorySchema
});

export const Score = mongoose.model<ScoreDocument>('Score', scoreSchema);
