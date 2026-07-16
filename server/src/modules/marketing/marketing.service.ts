import { db } from "../../db.js";
import { NotFoundError } from "../../lib/errors.js";
import { llmProvider } from "../../providers/registry.js";

export async function createMarketingPost(clientId: string, channel: "SOCIAL" | "EMAIL") {
  const client = await db.client.findUnique({ where: { id: clientId } });
  if (!client) throw new NotFoundError("Client");

  const draft = await llmProvider.generateMarketingPost({
    businessName: client.name,
    industry: "small business",
    channel,
  });

  return db.marketingPost.create({
    data: { clientId, channel, content: draft.content },
  });
}

export async function listMarketingPosts(clientId: string) {
  const client = await db.client.findUnique({ where: { id: clientId } });
  if (!client) throw new NotFoundError("Client");
  return db.marketingPost.findMany({ where: { clientId }, orderBy: { createdAt: "desc" } });
}
