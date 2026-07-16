// Simple rule-based scoring -- not an AI agent. A lead scores higher the
// more contactable and complete its record is, since that's what actually
// determines whether outreach can reach them at all.

export function scoreLead(lead: {
  email?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  contactName?: string | null;
  industry: string;
}) {
  let score = 0;
  const reasons: string[] = [];

  if (lead.email) {
    score += 35;
    reasons.push("has email (+35)");
  }
  if (lead.addressLine1) {
    score += 30;
    reasons.push("has mailing address (+30)");
  }
  if (lead.phone) {
    score += 15;
    reasons.push("has phone (+15)");
  }
  if (lead.contactName) {
    score += 15;
    reasons.push("has named contact (+15)");
  }
  if (["restaurant"].includes(lead.industry.toLowerCase())) {
    score += 5;
    reasons.push("core target industry (+5)");
  }

  return { score, reason: reasons.join(", ") || "no contact info on file" };
}
