import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

function sign(user: { id: string; email: string; role: string }) {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
}

export const register = asyncHandler(async (req, res) => {
  const payload = authSchema.parse(req.body);
  const existing = await User.findOne({ email: payload.email.toLowerCase() });
  if (existing) throw new HttpError(409, 'Email already registered');
  const user = await User.create({
    email: payload.email,
    password: await bcrypt.hash(payload.password, 12),
    role: 'recruiter'
  });
  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  res.status(201).json({ user: tokenPayload, token: sign(tokenPayload) });
});

export const login = asyncHandler(async (req, res) => {
  const payload = authSchema.parse(req.body);
  const user = await User.findOne({ email: payload.email.toLowerCase() });
  if (!user || !(await bcrypt.compare(payload.password, user.password))) {
    throw new HttpError(401, 'Invalid email or password');
  }
  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  res.json({ user: tokenPayload, token: sign(tokenPayload) });
});
