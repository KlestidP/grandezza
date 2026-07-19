import { createApp } from "./app.js";
import { env } from "./env.js";
import { logger } from "./lib/logger.js";
import { logAdminKeyStatus } from "./lib/adminAuth.js";
import { logProviderModes } from "./providers/registry.js";

// Import order matters: job handlers register themselves as a side effect
// of this import (each send-job handler registers with the queue at module
// load). Site generation, deploy, and marketing posts are synchronous
// service calls, not queue jobs -- only email/letter sending goes through
// the Send Queue, matching docs/backend-architecture.md.
import "./modules/outreach/sendJobs.js";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`Grandezza server listening on http://localhost:${env.PORT}`);
  logProviderModes();
  logAdminKeyStatus();
});
