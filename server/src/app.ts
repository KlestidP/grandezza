import express from "express";
import path from "node:path";
import { NotFoundError, HttpError } from "./lib/errors.js";

import { leadsRouter } from "./modules/leads/leads.routes.js";
import { campaignsRouter } from "./modules/outreach/campaigns.routes.js";
import { webhooksRouter } from "./modules/webhooks/webhooks.routes.js";
import { clientsRouter } from "./modules/clients/clients.routes.js";
import { sitesRouter } from "./modules/sites/sites.routes.js";
import { jobsRouter } from "./modules/jobs/jobs.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { providerModes } from "./env.js";

export function createApp() {
  const app = express();
  app.use(express.json());

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

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, providers: providerModes });
  });

  app.use("/api/leads", leadsRouter);
  app.use("/api/campaigns", campaignsRouter);
  app.use("/api/webhooks", webhooksRouter);
  app.use("/api/clients", clientsRouter);
  app.use("/api/sites", sitesRouter);
  app.use("/api/jobs", jobsRouter);
  app.use("/api/dashboard", dashboardRouter);

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
