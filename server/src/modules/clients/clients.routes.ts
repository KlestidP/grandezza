import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import * as marketingService from "../marketing/marketing.service.js";
import * as onboardingService from "../onboarding/onboarding.service.js";
import * as sitesService from "../sites/sites.service.js";
import * as clientsService from "./clients.service.js";

export const clientsRouter = Router();

clientsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    res.json(await clientsService.listClients(status));
  }),
);

clientsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await clientsService.getClient(req.params.id));
  }),
);

clientsRouter.post(
  "/:id/onboarding",
  asyncHandler(async (req, res) => {
    res.status(201).json(await onboardingService.submitOnboarding(req.params.id, req.body));
  }),
);

clientsRouter.post(
  "/:id/site",
  asyncHandler(async (req, res) => {
    res.status(201).json(await sitesService.generateSiteForClient(req.params.id));
  }),
);

clientsRouter.post(
  "/:id/marketing-posts",
  asyncHandler(async (req, res) => {
    const channel = req.query.channel === "EMAIL" ? "EMAIL" : "SOCIAL";
    res.status(201).json(await marketingService.createMarketingPost(req.params.id, channel));
  }),
);

clientsRouter.get(
  "/:id/marketing-posts",
  asyncHandler(async (req, res) => {
    res.json(await marketingService.listMarketingPosts(req.params.id));
  }),
);
