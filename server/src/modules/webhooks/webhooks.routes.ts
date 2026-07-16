import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import * as webhooksService from "./webhooks.service.js";

export const webhooksRouter = Router();

webhooksRouter.post(
  "/email",
  asyncHandler(async (req, res) => {
    res.json(await webhooksService.handleSignal(req.body));
  }),
);

webhooksRouter.post(
  "/mail",
  asyncHandler(async (req, res) => {
    res.json(await webhooksService.handleSignal(req.body));
  }),
);
