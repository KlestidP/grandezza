import { db } from "../../db.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";
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
  return db.lead.create({ data: { ...input, source: input.source ?? "MANUAL" } });
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
