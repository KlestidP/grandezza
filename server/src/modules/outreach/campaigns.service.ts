import { db } from "../../db.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";
import { enqueue } from "../../lib/jobQueue.js";

export async function listCampaigns(status?: string) {
  return db.campaign.findMany({
    where: status ? { status } : undefined,
    include: { messages: true, lead: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCampaign(id: string) {
  const campaign = await db.campaign.findUnique({
    where: { id },
    include: { messages: true, lead: true },
  });
  if (!campaign) throw new NotFoundError("Campaign");
  return campaign;
}

export async function sendCampaign(id: string) {
  const campaign = await db.campaign.findUnique({
    where: { id },
    include: { messages: true },
  });
  if (!campaign) throw new NotFoundError("Campaign");

  const jobs = [];
  for (const message of campaign.messages) {
    if (message.status !== "DRAFTED") continue;
    await db.outreachMessage.update({ where: { id: message.id }, data: { status: "QUEUED" } });
    const jobType = message.channel === "EMAIL" ? "OUTREACH_EMAIL_SEND" : "OUTREACH_LETTER_SEND";
    jobs.push(await enqueue(jobType, message.id, { messageId: message.id }));
  }

  await db.campaign.update({ where: { id }, data: { status: "QUEUED" } });
  return { campaignId: id, jobs };
}

export async function closeCampaign(id: string) {
  const campaign = await db.campaign.findUnique({
    where: { id },
    include: { lead: true },
  });
  if (!campaign) throw new NotFoundError("Campaign");
  if (campaign.lead.status === "DEAL_CLOSED") {
    throw new BadRequestError("Deal already closed for this lead");
  }

  const [, , client] = await db.$transaction([
    db.campaign.update({ where: { id }, data: { status: "DEAL_CLOSED" } }),
    db.lead.update({ where: { id: campaign.leadId }, data: { status: "DEAL_CLOSED" } }),
    db.client.create({
      data: {
        leadId: campaign.leadId,
        name: campaign.lead.businessName,
        contactName: campaign.lead.contactName,
        email: campaign.lead.email,
        phone: campaign.lead.phone,
      },
    }),
  ]);

  return client;
}
