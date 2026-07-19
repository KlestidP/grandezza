import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { getPortalView } from "./portal.service.js";

export const portalRouter = Router();

// Public: access is controlled by possession of the token itself, not the
// admin key -- this is what the client-facing dashboard page fetches.
portalRouter.get(
  "/:token",
  asyncHandler(async (req, res) => {
    res.json(await getPortalView(req.params.token));
  }),
);
