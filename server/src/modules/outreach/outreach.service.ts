import { db } from "../../db.js";
import { NotFoundError } from "../../lib/errors.js";
import { llmProvider } from "../../providers/registry.js";

export async function draftOutreachForLead(leadId: string) {
  const lead = await db.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new NotFoundError("Lead");

  const draft = await llmProvider.draftOutreach({
    businessName: lead.businessName,
    industry: lead.industry,
    contactName: lead.contactName,
    city: lead.city,
  });

  const campaign = await db.campaign.create({
    data: {
      leadId: lead.id,
      status: "DRAFTING",
      messages: {
        create: [
          {
            channel: "EMAIL",
            subject: draft.emailSubject,
            bodyText: draft.emailBody,
            status: "DRAFTED",
          },
          {
            channel: "LETTER",
            bodyText: draft.letterBody,
            status: "DRAFTED",
          },
        ],
      },
    },
    include: { messages: true },
  });

  await db.lead.update({ where: { id: lead.id }, data: { status: "CONTACTED" } });

  return campaign;
}
