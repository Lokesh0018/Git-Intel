import mongoose, { Schema } from 'mongoose';

export interface GithubProfileDocument extends mongoose.Document {
  username: string;
  avatarUrl: string;
  name?: string;
  bio?: string;
  followers: number;
  following: number;
  publicRepos: number;
  analyzedAt: Date;
  shareToken: string;
}

const githubProfileSchema = new Schema<GithubProfileDocument>({
  username: { type: String, required: true, unique: true, index: true },
  avatarUrl: String,
  name: String,
  bio: String,
  followers: Number,
  following: Number,
  publicRepos: Number,
  analyzedAt: { type: Date, default: Date.now },
  shareToken: { type: String, required: true, unique: true, index: true }
});

export const GithubProfile = mongoose.model<GithubProfileDocument>('GithubProfile', githubProfileSchema);
