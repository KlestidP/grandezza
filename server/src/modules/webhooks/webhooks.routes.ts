import type { Request } from "express";
import { Router } from "express";
import { env } from "../../env.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { BadRequestError } from "../../lib/errors.js";
import { verifyLobSignature, verifyPostmarkBasicAuth, verifyStripeSignature } from "../../lib/webhookVerify.js";
import { handleStripeWebhookEvent } from "../billing/billing.service.js";
import * as webhooksService from "./webhooks.service.js";

export const webhooksRouter = Router();

type RequestWithRawBody = Request & { rawBody?: Buffer };

// Verification only activates once the matching secret is configured --
// same mock-by-default pattern as every provider in this app. Skipped
// entirely in local/mock mode so nothing here needs to change to keep
// testing with simulated webhook calls.
webhooksRouter.post(
  "/email",
  asyncHandler(async (req, res) => {
    if (env.POSTMARK_WEBHOOK_USERNAME && env.POSTMARK_WEBHOOK_PASSWORD) {
      const ok = verifyPostmarkBasicAuth(
        req.header("authorization"),
        env.POSTMARK_WEBHOOK_USERNAME,
        env.POSTMARK_WEBHOOK_PASSWORD,
      );
      if (!ok) throw new BadRequestError("Invalid webhook credentials");
    }
    res.json(await webhooksService.handleSignal(req.body));
  }),
);

webhooksRouter.post(
  "/mail",
  asyncHandler(async (req, res) => {
    if (env.LOB_WEBHOOK_SECRET) {
      const rawBody = (req as RequestWithRawBody).rawBody;
      const ok =
        rawBody &&
        verifyLobSignature(
          rawBody,
          req.header("lob-signature-timestamp"),
          req.header("lob-signature"),
          env.LOB_WEBHOOK_SECRET,
        );
      if (!ok) throw new BadRequestError("Invalid webhook signature");
    }
    res.json(await webhooksService.handleSignal(req.body));
  }),
);

webhooksRouter.post(
  "/stripe",
  asyncHandler(async (req, res) => {
    if (env.STRIPE_WEBHOOK_SECRET) {
      const rawBody = (req as RequestWithRawBody).rawBody;
      const ok =
        rawBody && verifyStripeSignature(rawBody, req.header("stripe-signature"), env.STRIPE_WEBHOOK_SECRET);
      if (!ok) throw new BadRequestError("Invalid webhook signature");
    }
    await handleStripeWebhookEvent(req.body);
    res.json({ received: true });
  }),
);
