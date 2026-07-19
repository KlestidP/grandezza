import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { createCheckoutSession } from "./billing.service.js";

export const billingRouter = Router();

// Admin-protected (mounted under /api/clients, which already requires the
// admin key) -- an admin triggers this to send a client their checkout link.
billingRouter.post(
  "/:id/billing/checkout",
  asyncHandler(async (req, res) => {
    res.json(await createCheckoutSession(req.params.id));
  }),
);
