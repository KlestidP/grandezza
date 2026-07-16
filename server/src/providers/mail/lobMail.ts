import { env } from "../../env.js";
import type { LetterSendInput, MailProvider, SendResult } from "../types.js";

export const lobMail: MailProvider = {
  name: "lob",

  async sendLetter(input: LetterSendInput): Promise<SendResult> {
    const auth = Buffer.from(`${env.LOB_API_KEY}:`).toString("base64");

    const res = await fetch("https://api.lob.com/v1/letters", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "to[name]": input.toName,
        "to[address_line1]": input.addressLine1 ?? "",
        "to[address_city]": input.city ?? "",
        "to[address_state]": input.region ?? "",
        "to[address_zip]": input.postalCode ?? "",
        "to[address_country]": input.country ?? "US",
        "from[name]": "Grandezza",
        "from[address_line1]": "1 Studio Way",
        "from[address_city]": "Bremen",
        "from[address_zip]": "28195",
        "from[address_country]": "DE",
        file: `<html><body><p>${input.bodyText.replace(/\n/g, "<br/>")}</p></body></html>`,
        color: "false",
      }),
    });

    if (!res.ok) {
      throw new Error(`Lob send failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as { id: string };
    return { providerName: "lob", providerId: data.id };
  },
};
