import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().default("file:./dev.db"),
  PORT: z.coerce.number().default(3000),
  PUBLIC_BASE_URL: z.string().default("http://localhost:3000"),
  ANTHROPIC_API_KEY: z.string().optional(),
  POSTMARK_API_KEY: z.string().optional(),
  POSTMARK_FROM_EMAIL: z.string().optional(),
  LOB_API_KEY: z.string().optional(),
  STUDIO_NOTIFY_EMAIL: z.string().default("hallo@grandezza.design"),
  ADMIN_API_KEY: z.string().optional(),
});

export const env = schema.parse(process.env);

export const providerModes = {
  llm: env.ANTHROPIC_API_KEY ? "real" : "mock",
  email: env.POSTMARK_API_KEY ? "real" : "mock",
  mail: env.LOB_API_KEY ? "real" : "mock",
  deploy: "mock",
} as const;
