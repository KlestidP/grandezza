import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { recordPageView } from "./analytics.service.js";

export const analyticsRouter = Router();

// Public: the beacon script on the marketing site posts here on every page
// load. No cookie, no visitor id -- just a path and referrer, so this
// doesn't trigger a consent-banner requirement.
analyticsRouter.post(
  "/pageview",
  asyncHandler(async (req, res) => {
    const path = typeof req.body?.path === "string" ? req.body.path : "/";
    const referrer = typeof req.body?.referrer === "string" ? req.body.referrer : undefined;
    await recordPageView(path, referrer);
    res.status(204).send();
  }),
);
