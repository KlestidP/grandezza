import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { logger } from "../../lib/logger.js";
import type { LetterSendInput, MailProvider, SendResult } from "../types.js";

const LETTERS_DIR = path.resolve(process.cwd(), "storage", "letters");

export const mockMail: MailProvider = {
  name: "mock",

  async sendLetter(input: LetterSendInput): Promise<SendResult> {
    const providerId = `mock-letter-${randomUUID()}`;
    await mkdir(LETTERS_DIR, { recursive: true });
    const filePath = path.join(LETTERS_DIR, `${providerId}.txt`);

    const address = [input.addressLine1, input.city, input.region, input.postalCode, input.country]
      .filter(Boolean)
      .join(", ");

    await writeFile(
      filePath,
      `To: ${input.toName}\nAddress: ${address}\n\n${input.bodyText}\n`,
      "utf-8",
    );

    logger.info("Mock letter written", { toName: input.toName, providerId, filePath });
    return { providerName: "mock", providerId };
  },
};
