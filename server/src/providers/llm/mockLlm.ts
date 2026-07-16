import type {
  LLMProvider,
  MarketingInput,
  MarketingPostDraft,
  OutreachDraft,
  OutreachInput,
  SiteCopy,
  SiteCopyInput,
} from "../types.js";

// Deterministic, templated output built straight from typed input -- no
// prompt-string parsing needed to fake it. Same return shape as the real
// Claude-backed provider, so callers never know which is active.
export const mockLlm: LLMProvider = {
  name: "mock",

  async draftOutreach(input: OutreachInput): Promise<OutreachDraft> {
    const greeting = input.contactName ? `Hi ${input.contactName},` : "Hello,";
    const city = input.city ? ` in ${input.city}` : "";
    const body =
      `${greeting}\n\n` +
      `I came across ${input.businessName}${city} and noticed you don't have a website that ` +
      `does the place justice yet. We build sites for ${input.industry} businesses like yours, ` +
      `paired with outreach and marketing that runs itself -- no agency retainer.\n\n` +
      `Worth a 10-minute call this week?\n\n` +
      `-- Grandezza`;

    return {
      emailSubject: `A website for ${input.businessName}?`,
      emailBody: body,
      letterBody: body,
    };
  },

  async generateSiteCopy(input: SiteCopyInput): Promise<SiteCopy> {
    return {
      tagline: `${input.businessName} -- ${input.industry}, done properly.`,
      heroHeadline: `Welcome to ${input.businessName}`,
      aboutParagraph: input.businessDescription,
      services: input.services.map((name) => ({
        name,
        description: `${name}, the way ${input.businessName} does it.`,
      })),
    };
  },

  async generateMarketingPost(input: MarketingInput): Promise<MarketingPostDraft> {
    const content =
      input.channel === "SOCIAL"
        ? `Stop by ${input.businessName} this week -- fresh ${input.industry} favorites waiting for you.`
        : `Subject: What's new at ${input.businessName}\n\nA quick update from the ${input.businessName} team on what we've been up to this week.`;

    return { content };
  },
};
