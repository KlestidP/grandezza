import { db } from "../../db.js";
import { env } from "../../env.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import { emailProvider } from "../../providers/registry.js";
import { scoreLead } from "./scoring.js";

export interface CreateLeadInput {
  businessName: string;
  industry: string;
  contactName?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  source?: string;
}

export async function createLead(input: CreateLeadInput) {
  if (!input.businessName || !input.industry) {
    throw new BadRequestError("businessName and industry are required");
  }
  const lead = await db.lead.create({ data: { ...input, source: input.source ?? "MANUAL" } });

  // Only the public website form (WEBSITE) triggers a notification -- bulk
  // imports/seeding (MANUAL/SEED) would otherwise spam an inbox. Fire and
  // forget: a notification failure must never fail the lead creation itself.
  if (lead.source === "WEBSITE") {
    notifyNewWebsiteLead(lead).catch((err) =>
      logger.error("Failed to send new-lead notification", { error: String(err) }),
    );
  }

  return lead;
}

async function notifyNewWebsiteLead(lead: { businessName: string; contactName: string | null; email: string | null; notes: string | null }) {
  await emailProvider.send({
    to: env.STUDIO_NOTIFY_EMAIL,
    subject: `New website inquiry: ${lead.businessName}`,
    bodyText:
      `New inquiry from the contact form:\n\n` +
      `Name/Business: ${lead.businessName}\n` +
      `Contact: ${lead.contactName ?? "—"}\n` +
      `Email: ${lead.email ?? "—"}\n\n` +
      `Message:\n${lead.notes ?? "—"}`,
  });
}

export async function importLeads(inputs: CreateLeadInput[]) {
  if (!Array.isArray(inputs) || inputs.length === 0) {
    throw new BadRequestError("Body must be a non-empty array of leads");
  }
  const created = [];
  for (const input of inputs) {
    created.push(await createLead(input));
  }
  return created;
}

export async function listLeads(status?: string) {
  return db.lead.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function getLead(id: string) {
  const lead = await db.lead.findUnique({
    where: { id },
    include: { campaigns: { include: { messages: true } }, client: true },
  });
  if (!lead) throw new NotFoundError("Lead");
  return lead;
}

export async function scoreOneLead(id: string) {
  const lead = await db.lead.findUnique({ where: { id } });
  if (!lead) throw new NotFoundError("Lead");

  const { score, reason } = scoreLead(lead);
  return db.lead.update({
    where: { id },
    data: { score, scoreReason: reason, status: "SCORED" },
  });
}

export async function scoreAllNewLeads() {
  const newLeads = await db.lead.findMany({ where: { status: "NEW" } });
  const results = [];
  for (const lead of newLeads) {
    results.push(await scoreOneLead(lead.id));
  }
  return results;
}
