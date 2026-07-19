// The one place that decides mock-vs-real for every external integration,
// based purely on which env vars are present. Nothing else in the app
// branches on "are we mocked".

import { env, providerModes } from "../env.js";
import { logger } from "../lib/logger.js";
import { mockDeploy } from "./deploy/mockDeploy.js";
import { vercelDeploy } from "./deploy/vercelDeploy.js";
import { mockEmail } from "./email/mockEmail.js";
import { postmarkEmail } from "./email/postmarkEmail.js";
import { claudeLlm } from "./llm/claudeLlm.js";
import { mockLlm } from "./llm/mockLlm.js";
import { lobMail } from "./mail/lobMail.js";
import { mockMail } from "./mail/mockMail.js";
import type { DeployProvider, EmailProvider, LLMProvider, MailProvider } from "./types.js";

export const llmProvider: LLMProvider = env.ANTHROPIC_API_KEY ? claudeLlm : mockLlm;
export const emailProvider: EmailProvider = env.POSTMARK_API_KEY ? postmarkEmail : mockEmail;
export const mailProvider: MailProvider = env.LOB_API_KEY ? lobMail : mockMail;
export const deployProvider: DeployProvider = env.VERCEL_TOKEN ? vercelDeploy : mockDeploy;

export function logProviderModes() {
  logger.info(
    `[providers] LLM=${providerModes.llm} EMAIL=${providerModes.email} MAIL=${providerModes.mail} DEPLOY=${providerModes.deploy} BILLING=${providerModes.billing}`,
  );
}
