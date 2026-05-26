import mongoose, { Schema, Types } from 'mongoose';

const evidenceSchema = new Schema(
  {
    label: String,
    value: Schema.Types.Mixed,
    repositories: [String]
  },
  { _id: false }
);

export interface RepositoryDocument extends mongoose.Document {
  profileId: Types.ObjectId;
  githubId: number;
  name: string;
  fullName: string;
  description?: string;
  language?: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  commits: number;
  topics: string[];
  technologies: string[];
  complexityScore: number;
  projectType: string;
  summary: string;
  evidence: Array<{ label: string; value: string | number; repositories?: string[] }>;
  pushedAt?: Date;
}

const repositorySchema = new Schema<RepositoryDocument>({
  profileId: { type: Schema.Types.ObjectId, ref: 'GithubProfile', required: true, index: true },
  githubId: { type: Number, required: true },
  name: String,
  fullName: String,
  description: String,
  language: String,
  stars: Number,
  forks: Number,
  watchers: Number,
  openIssues: Number,
  commits: Number,
  topics: [String],
  technologies: [String],
  complexityScore: Number,
  projectType: String,
  summary: String,
  evidence: [evidenceSchema],
  pushedAt: Date
});

repositorySchema.index({ profileId: 1, githubId: 1 }, { unique: true });

export const Repository = mongoose.model<RepositoryDocument>('Repository', repositorySchema);
