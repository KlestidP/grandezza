import { randomUUID } from "node:crypto";
import { logger } from "../../lib/logger.js";
import type { EmailProvider, EmailSendInput, SendResult } from "../types.js";

export const mockEmail: EmailProvider = {
  name: "mock",

  async send(input: EmailSendInput): Promise<SendResult> {
    const providerId = `mock-email-${randomUUID()}`;
    logger.info("Mock email send", { to: input.to, subject: input.subject, providerId });
    return { providerName: "mock", providerId };
  },
};
