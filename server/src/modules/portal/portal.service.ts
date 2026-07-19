import { db } from "../../db.js";
import { NotFoundError } from "../../lib/errors.js";

// Deliberately scoped: this is what a client sees about themselves, keyed
// by possession of their own unguessable dashboardToken -- never their
// internal id, never anything about the lead/acquisition side.
export async function getPortalView(token: string) {
  const client = await db.client.findUnique({
    where: { dashboardToken: token },
    include: { sites: true, marketingPosts: { orderBy: { createdAt: "desc" } } },
  });
  if (!client) throw new NotFoundError("Portal");

  return {
    name: client.name,
    billingStatus: client.billingStatus,
    onboardingStatus: client.onboardingStatus,
    sites: client.sites.map((s) => ({
      status: s.status,
      url: s.deployedUrl,
      generatedAt: s.generatedAt,
      deployedAt: s.deployedAt,
    })),
    marketingPosts: client.marketingPosts.map((p) => ({
      channel: p.channel,
      content: p.content,
      createdAt: p.createdAt,
    })),
  };
}
