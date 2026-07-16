import { Router } from "express";
import { db } from "../../db.js";
import { asyncHandler } from "../../lib/asyncHandler.js";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const [leads, campaigns, clients, jobs, sites, marketingPosts] = await Promise.all([
      db.lead.groupBy({ by: ["status"], _count: true }),
      db.campaign.groupBy({ by: ["status"], _count: true }),
      db.client.groupBy({ by: ["onboardingStatus"], _count: true }),
      db.jobLog.groupBy({ by: ["status"], _count: true }),
      db.site.count(),
      db.marketingPost.count(),
    ]);

    const pipeline = await db.lead.findMany({
      include: {
        campaigns: { include: { messages: true } },
        client: { include: { sites: true, marketingPosts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      counts: {
        leadsByStatus: leads,
        campaignsByStatus: campaigns,
        clientsByOnboardingStatus: clients,
        jobsByStatus: jobs,
        totalSites: sites,
        totalMarketingPosts: marketingPosts,
      },
      pipeline,
    });
  }),
);
