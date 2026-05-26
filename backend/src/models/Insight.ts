import mongoose, { Schema, Types } from 'mongoose';

const roleMatchSchema = new Schema(
  {
    role: String,
    matchPercentage: Number,
    evidence: [String],
    recommendations: [String]
  },
  { _id: false }
);

export interface InsightDocument extends mongoose.Document {
  profileId: Types.ObjectId;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendedRoles: Array<{
    role: string;
    matchPercentage: number;
    evidence: string[];
    recommendations: string[];
  }>;
}

const insightSchema = new Schema<InsightDocument>({
  profileId: { type: Schema.Types.ObjectId, ref: 'GithubProfile', required: true, unique: true, index: true },
  summary: String,
  strengths: [String],
  weaknesses: [String],
  recommendedRoles: [roleMatchSchema]
});

export const Insight = mongoose.model<InsightDocument>('Insight', insightSchema);
