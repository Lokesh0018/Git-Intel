import mongoose, { Schema } from 'mongoose';

export interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
  role: 'recruiter' | 'admin';
  createdAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['recruiter', 'admin'], default: 'recruiter' }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const User = mongoose.model<UserDocument>('User', userSchema);
