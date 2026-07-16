import { db } from "../../db.js";
import { NotFoundError } from "../../lib/errors.js";

export async function listClients(status?: string) {
  return db.client.findMany({
    where: status ? { onboardingStatus: status } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function getClient(id: string) {
  const client = await db.client.findUnique({
    where: { id },
    include: { onboarding: true, sites: true, marketingPosts: true, lead: true },
  });
  if (!client) throw new NotFoundError("Client");
  return client;
}
