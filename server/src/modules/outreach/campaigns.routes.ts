import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import * as campaignsService from "./campaigns.service.js";

export const campaignsRouter = Router();

campaignsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    res.json(await campaignsService.listCampaigns(status));
  }),
);

campaignsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await campaignsService.getCampaign(req.params.id));
  }),
);

campaignsRouter.post(
  "/:id/send",
  asyncHandler(async (req, res) => {
    res.status(202).json(await campaignsService.sendCampaign(req.params.id));
  }),
);

campaignsRouter.post(
  "/:id/close",
  asyncHandler(async (req, res) => {
    res.status(201).json(await campaignsService.closeCampaign(req.params.id));
  }),
);
