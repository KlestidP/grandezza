import { db } from "../../db.js";
import { registerJobHandler } from "../../lib/jobQueue.js";
import { emailProvider, mailProvider } from "../../providers/registry.js";

registerJobHandler("OUTREACH_EMAIL_SEND", async (payload) => {
  const messageId = payload.messageId as string;
  const message = await db.outreachMessage.findUniqueOrThrow({ where: { id: messageId } });
  const campaign = await db.campaign.findUniqueOrThrow({
    where: { id: message.campaignId },
    include: { lead: true },
  });

  const result = await emailProvider.send({
    to: campaign.lead.email ?? "unknown@example.com",
    subject: message.subject ?? "Hello from Grandezza",
    bodyText: message.bodyText,
  });

  await db.outreachMessage.update({
    where: { id: messageId },
    data: {
      status: "SENT",
      providerName: result.providerName,
      providerId: result.providerId,
      sentAt: new Date(),
    },
  });

  return result;
});

registerJobHandler("OUTREACH_LETTER_SEND", async (payload) => {
  const messageId = payload.messageId as string;
  const message = await db.outreachMessage.findUniqueOrThrow({ where: { id: messageId } });
  const campaign = await db.campaign.findUniqueOrThrow({
    where: { id: message.campaignId },
    include: { lead: true },
  });

  const result = await mailProvider.sendLetter({
    toName: campaign.lead.contactName ?? campaign.lead.businessName,
    addressLine1: campaign.lead.addressLine1,
    city: campaign.lead.city,
    region: campaign.lead.region,
    postalCode: campaign.lead.postalCode,
    country: campaign.lead.country,
    bodyText: message.bodyText,
  });

  await db.outreachMessage.update({
    where: { id: messageId },
    data: {
      status: "SENT",
      providerName: result.providerName,
      providerId: result.providerId,
      sentAt: new Date(),
    },
  });

  return result;
});
