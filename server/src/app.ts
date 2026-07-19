import express from "express";
import path from "node:path";
import { NotFoundError, HttpError } from "./lib/errors.js";
import { requireAdminKey } from "./lib/adminAuth.js";
import { rateLimit } from "./lib/rateLimit.js";

import { leadsRouter } from "./modules/leads/leads.routes.js";
import { campaignsRouter } from "./modules/outreach/campaigns.routes.js";
import { webhooksRouter } from "./modules/webhooks/webhooks.routes.js";
import { clientsRouter } from "./modules/clients/clients.routes.js";
import { sitesRouter } from "./modules/sites/sites.routes.js";
import { jobsRouter } from "./modules/jobs/jobs.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { portalRouter } from "./modules/portal/portal.routes.js";
import { analyticsRouter } from "./modules/analytics/analytics.routes.js";
import { billingRouter } from "./modules/billing/billing.routes.js";
import { providerModes } from "./env.js";

export function createApp() {
  const app = express();

  // Most real hosts (Render, Railway, etc.) put the app behind a reverse
  // proxy -- without this, req.ip would just be the proxy's own address,
  // which breaks per-client rate limiting below.
  app.set("trust proxy", 1);

  // Stashes the raw request body alongside the parsed one -- webhook
  // signature verification needs to hash the exact bytes the provider sent,
  // not a re-serialized version of the parsed object.
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
      },
    }),
  );

  // Hand-rolled CORS instead of the `cors` package -- the frontend (static
  // site on its own port) needs to POST to this API from the browser, and
  // that's the only cross-origin need this server has.
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.use(
    "/sites",
    express.static(path.resolve(process.cwd(), "storage", "generated-sites")),
  );

  // The portal page is a single self-contained file that reads the token
  // from its own URL client-side -- serve it for any /portal/:token path
  // rather than relying on express.static, which would 404 on the token
  // segment since no file with that name exists.
  const portalHtmlPath = path.resolve(process.cwd(), "public", "portal.html");
  app.get("/portal/:token", (_req, res) => {
    res.sendFile(portalHtmlPath);
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, providers: providerModes });
  });

  // Public: the website's own contact form, provider webhooks, the
  // client-facing portal (protected by possession of its own token, not the
  // admin key), and the analytics beacon. All rate-limited per IP since
  // they're reachable by anyone on the internet, not just admin tooling.
  app.use("/api/leads", leadsRouter);
  app.use("/api/webhooks", rateLimit({ windowMs: 60 * 1000, max: 100 }), webhooksRouter);
  app.use("/api/portal", rateLimit({ windowMs: 60 * 1000, max: 30 }), portalRouter);
  app.use("/api/analytics", rateLimit({ windowMs: 60 * 1000, max: 60 }), analyticsRouter);

  // Everything else is internal business data -- admin key required.
  app.use("/api/campaigns", requireAdminKey, campaignsRouter);
  app.use("/api/clients", requireAdminKey, clientsRouter);
  app.use("/api/clients", requireAdminKey, billingRouter);
  app.use("/api/sites", requireAdminKey, sitesRouter);
  app.use("/api/jobs", requireAdminKey, jobsRouter);
  app.use("/api/dashboard", requireAdminKey, dashboardRouter);

  app.use((_req, _res, next) => next(new NotFoundError("Route")));

  app.use(
    (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      if (err instanceof HttpError) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    },
  );

  return app;
}
