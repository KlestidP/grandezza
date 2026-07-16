import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import * as sitesService from "./sites.service.js";

export const sitesRouter = Router();

sitesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await sitesService.getSite(req.params.id));
  }),
);

sitesRouter.post(
  "/:id/deploy",
  asyncHandler(async (req, res) => {
    res.json(await sitesService.deploySite(req.params.id));
  }),
);
