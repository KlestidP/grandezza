import { env } from "../../env.js";
import type { EmailProvider, EmailSendInput, SendResult } from "../types.js";

export const postmarkEmail: EmailProvider = {
  name: "postmark",

  async send(input: EmailSendInput): Promise<SendResult> {
    const res = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": env.POSTMARK_API_KEY ?? "",
      },
      body: JSON.stringify({
        From: env.POSTMARK_FROM_EMAIL,
        To: input.to,
        Subject: input.subject,
        TextBody: input.bodyText,
        HtmlBody: input.bodyHtml,
      }),
    });

    if (!res.ok) {
      throw new Error(`Postmark send failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as { MessageID: string };
    return { providerName: "postmark", providerId: data.MessageID };
  },
};
