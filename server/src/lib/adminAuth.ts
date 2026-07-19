import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { env } from "../env.js";
import { logger } from "./logger.js";

// Every internal/business endpoint (leads, campaigns, clients, jobs, the
// admin dashboard) requires this key in an `x-admin-key` header. If
// ADMIN_API_KEY isn't set, a random one is generated at boot and printed to
// the log -- so the app is never silently wide open, even before anyone
// configures it, but still works with zero setup for local dev.
export const adminKey = env.ADMIN_API_KEY ?? randomUUID();

export function logAdminKeyStatus() {
  if (!env.ADMIN_API_KEY) {
    logger.warn(
      `[admin] ADMIN_API_KEY not set -- generated one for this run: ${adminKey}`,
    );
    logger.warn(
      "[admin] Set ADMIN_API_KEY in .env for a stable key across restarts.",
    );
  } else {
    logger.info("[admin] ADMIN_API_KEY loaded from environment.");
  }
}

export function requireAdminKey(req: Request, res: Response, next: NextFunction) {
  const provided = req.header("x-admin-key");
  if (provided !== adminKey) {
    res.status(401).json({ error: "Missing or invalid x-admin-key header" });
    return;
  }
  next();
}
