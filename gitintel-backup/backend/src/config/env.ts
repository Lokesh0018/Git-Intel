import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/gitintel'),
  JWT_SECRET: z.string().min(16).default('development-secret-change-before-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  GITHUB_TOKEN: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  CACHE_TTL_SECONDS: z.coerce.number().default(900)
});

export const env = envSchema.parse(process.env);
