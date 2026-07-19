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

  // Webhook verification -- separate from the API keys above, issued by
  // each provider specifically for verifying inbound webhook calls.
  LOB_WEBHOOK_SECRET: z.string().optional(),
  POSTMARK_WEBHOOK_USERNAME: z.string().optional(),
  POSTMARK_WEBHOOK_PASSWORD: z.string().optional(),

  // Real deploy provider (Vercel)
  VERCEL_TOKEN: z.string().optional(),
  VERCEL_PROJECT_ID: z.string().optional(),
  VERCEL_TEAM_ID: z.string().optional(),

  // Real billing (Stripe)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_ID: z.string().optional(),
});

export const env = schema.parse(process.env);

export const providerModes = {
  llm: env.ANTHROPIC_API_KEY ? "real" : "mock",
  email: env.POSTMARK_API_KEY ? "real" : "mock",
  mail: env.LOB_API_KEY ? "real" : "mock",
  deploy: env.VERCEL_TOKEN ? "real" : "mock",
  billing: env.STRIPE_SECRET_KEY ? "real" : "mock",
} as const;
