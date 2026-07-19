import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { requireAdminKey } from "../../lib/adminAuth.js";
import { draftOutreachForLead } from "../outreach/outreach.service.js";
import * as leadsService from "./leads.service.js";

export const leadsRouter = Router();

// Public: this is the endpoint the website's own contact form posts to.
leadsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const lead = await leadsService.createLead(req.body);
    res.status(201).json(lead);
  }),
);

// Everything else here is internal business data -- admin key required.
leadsRouter.post(
  "/import",
  requireAdminKey,
  asyncHandler(async (req, res) => {
    const leads = await leadsService.importLeads(req.body);
    res.status(201).json(leads);
  }),
);

leadsRouter.get(
  "/",
  requireAdminKey,
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    res.json(await leadsService.listLeads(status));
  }),
);

leadsRouter.post(
  "/score-all",
  requireAdminKey,
  asyncHandler(async (_req, res) => {
    res.json(await leadsService.scoreAllNewLeads());
  }),
);

leadsRouter.get(
  "/:id",
  requireAdminKey,
  asyncHandler(async (req, res) => {
    res.json(await leadsService.getLead(req.params.id));
  }),
);

leadsRouter.post(
  "/:id/score",
  requireAdminKey,
  asyncHandler(async (req, res) => {
    res.json(await leadsService.scoreOneLead(req.params.id));
  }),
);

leadsRouter.post(
  "/:id/outreach",
  requireAdminKey,
  asyncHandler(async (req, res) => {
    const campaign = await draftOutreachForLead(req.params.id);
    res.status(201).json(campaign);
  }),
);
