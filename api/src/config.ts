import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('8080'),
  MONGO_URI: z.string().default('mongodb://127.0.0.1:27017/helpdesk'),
  JWT_SECRET: z.string().min(1).default('change-me'),
  AUTO_CLOSE_ENABLED: z.string().default('true'),
  CONFIDENCE_THRESHOLD: z.string().default('0.78'),
  STUB_MODE: z.string().default('true'),
  OPENAI_API_KEY: z.string().optional()
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // Aggregate errors for readability
  const message = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
  throw new Error(`Invalid environment configuration: ${message}`);
}

const env = parsed.data;

export const appConfig = {
  nodeEnv: env.NODE_ENV,
  port: Number(env.PORT),
  mongoUri: env.MONGO_URI,
  jwtSecret: env.JWT_SECRET,
  autoCloseEnabled: env.AUTO_CLOSE_ENABLED.toLowerCase() === 'true',
  confidenceThreshold: Number(env.CONFIDENCE_THRESHOLD),
  stubMode: env.STUB_MODE.toLowerCase() === 'true',
  openaiApiKey: env.OPENAI_API_KEY
} as const;


