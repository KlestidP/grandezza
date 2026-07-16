import { access } from "node:fs/promises";
import { env } from "../../env.js";
import type { DeployInput, DeployProvider, DeployResult } from "../types.js";

// The only deploy provider in this MVP -- "deploy" means confirming the
// generated HTML file exists on disk and is reachable via the server's own
// static file mount. A real Vercel/Cloudflare Pages provider can implement
// the same DeployProvider interface later without touching sites.service.ts.
export const mockDeploy: DeployProvider = {
  name: "mock",

  async deploy(input: DeployInput): Promise<DeployResult> {
    await access(input.filePath);
    return {
      providerName: "mock",
      url: `${env.PUBLIC_BASE_URL}/sites/${input.slug}.html`,
    };
  },
};
