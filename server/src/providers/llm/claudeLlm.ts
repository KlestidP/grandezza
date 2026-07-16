import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { env } from "../../env.js";
import type {
  LLMProvider,
  MarketingInput,
  MarketingPostDraft,
  OutreachDraft,
  OutreachInput,
  SiteCopy,
  SiteCopyInput,
} from "../types.js";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-5";

async function askForJson<T extends z.ZodTypeAny>(
  prompt: string,
  schema: T,
): Promise<z.infer<T>> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Claude response did not contain a JSON object");
  }

  return schema.parse(JSON.parse(jsonMatch[0]));
}

const outreachSchema = z.object({
  emailSubject: z.string(),
  emailBody: z.string(),
  letterBody: z.string(),
});

const siteCopySchema = z.object({
  tagline: z.string(),
  heroHeadline: z.string(),
  aboutParagraph: z.string(),
  services: z.array(z.object({ name: z.string(), description: z.string() })),
});

const marketingSchema = z.object({
  content: z.string(),
});

export const claudeLlm: LLMProvider = {
  name: "claude",

  async draftOutreach(input: OutreachInput): Promise<OutreachDraft> {
    const prompt = `You are writing cold outreach for Grandezza, a studio that builds websites and runs AI-driven marketing for small businesses. Write a short, warm, non-pushy outreach email and a separate short physical-letter version for this prospect:

Business: ${input.businessName}
Industry: ${input.industry}
Contact: ${input.contactName ?? "unknown"}
City: ${input.city ?? "unknown"}

Respond with ONLY a JSON object: {"emailSubject": string, "emailBody": string, "letterBody": string}`;

    return askForJson(prompt, outreachSchema);
  },

  async generateSiteCopy(input: SiteCopyInput): Promise<SiteCopy> {
    const prompt = `Write website copy for a small business. Business: ${input.businessName}, industry: ${input.industry}. Description: ${input.businessDescription}. Services: ${input.services.join(", ")}.

Respond with ONLY a JSON object: {"tagline": string, "heroHeadline": string, "aboutParagraph": string, "services": [{"name": string, "description": string}]}`;

    return askForJson(prompt, siteCopySchema);
  },

  async generateMarketingPost(input: MarketingInput): Promise<MarketingPostDraft> {
    const prompt = `Write a short ${input.channel === "SOCIAL" ? "social media post" : "marketing email"} for ${input.businessName}, a ${input.industry} business.

Respond with ONLY a JSON object: {"content": string}`;

    return askForJson(prompt, marketingSchema);
  },
};
