import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { db } from "../../db.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";
import { deployProvider, llmProvider } from "../../providers/registry.js";
import { renderSiteHtml } from "./siteTemplate.js";

const SITES_DIR = path.resolve(process.cwd(), "storage", "generated-sites");

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function generateSiteForClient(clientId: string) {
  const client = await db.client.findUnique({
    where: { id: clientId },
    include: { onboarding: true },
  });
  if (!client) throw new NotFoundError("Client");
  if (!client.onboarding) {
    throw new BadRequestError("Client has not completed onboarding yet");
  }

  const copy = await llmProvider.generateSiteCopy({
    businessName: client.name,
    industry: client.lead ? "" : "small business",
    businessDescription: client.onboarding.businessDescription,
    services: JSON.parse(client.onboarding.servicesJson),
  });

  const baseSlug = slugify(client.name) || `client-${client.id.slice(0, 8)}`;
  let slug = baseSlug;
  let n = 1;
  while (await db.site.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++n}`;
  }

  const html = renderSiteHtml(client.name, copy);
  await mkdir(SITES_DIR, { recursive: true });
  const filePath = path.join(SITES_DIR, `${slug}.html`);
  await writeFile(filePath, html, "utf-8");

  const site = await db.site.create({
    data: {
      clientId,
      slug,
      status: "GENERATED",
      copyJson: JSON.stringify(copy),
      htmlFilePath: filePath,
      generatedAt: new Date(),
    },
  });

  await db.client.update({
    where: { id: clientId },
    data: { onboardingStatus: "SITE_GENERATED" },
  });

  return site;
}

export async function getSite(id: string) {
  const site = await db.site.findUnique({ where: { id } });
  if (!site) throw new NotFoundError("Site");
  return site;
}

export async function deploySite(id: string) {
  const site = await db.site.findUnique({ where: { id } });
  if (!site) throw new NotFoundError("Site");
  if (!site.htmlFilePath) throw new BadRequestError("Site has not been generated yet");

  const result = await deployProvider.deploy({ slug: site.slug, filePath: site.htmlFilePath });

  const updated = await db.site.update({
    where: { id },
    data: { status: "DEPLOYED", deployedUrl: result.url, deployedAt: new Date() },
  });

  await db.client.update({
    where: { id: site.clientId },
    data: { onboardingStatus: "LIVE" },
  });

  return updated;
}
