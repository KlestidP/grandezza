import { db } from "../../db.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";

export interface WebhookEventInput {
  providerId: string;
  event: "opened" | "replied";
  replyText?: string;
}

export async function handleSignal(input: WebhookEventInput) {
  if (!input.providerId || !input.event) {
    throw new BadRequestError("providerId and event are required");
  }

  const message = await db.outreachMessage.findFirst({
    where: { providerId: input.providerId },
    include: { campaign: { include: { lead: true } } },
  });
  if (!message) throw new NotFoundError("Message for that providerId");

  const now = new Date();

  if (input.event === "opened") {
    await db.outreachMessage.update({
      where: { id: message.id },
      data: { status: "OPENED", openedAt: now },
    });
    return { messageId: message.id, event: "opened" };
  }

  // replied
  await db.outreachMessage.update({
    where: { id: message.id },
    data: { status: "REPLIED", repliedAt: now },
  });
  await db.campaign.update({
    where: { id: message.campaignId },
    data: { status: "REPLIED" },
  });
  await db.lead.update({
    where: { id: message.campaign.leadId },
    data: { status: "REPLIED" },
  });

  return { messageId: message.id, event: "replied", replyText: input.replyText ?? null };
}
