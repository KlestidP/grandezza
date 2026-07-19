import { readFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../../env.js";
import type { DeployInput, DeployProvider, DeployResult } from "../types.js";

// Publishes a generated client site as a real Vercel deployment using
// Vercel's v13 Deployments API. This is written against Vercel's publicly
// documented API shape but has not been exercised against a real Vercel
// account (no token was available while building this) -- verify it
// against a real VERCEL_TOKEN and VERCEL_PROJECT_ID before relying on it,
// and check Vercel's current API docs if anything here has drifted.
export const vercelDeploy: DeployProvider = {
  name: "vercel",

  async deploy(input: DeployInput): Promise<DeployResult> {
    const html = await readFile(input.filePath, "utf-8");
    const fileName = path.basename(input.filePath);

    const teamQuery = env.VERCEL_TEAM_ID ? `?teamId=${env.VERCEL_TEAM_ID}` : "";

    const res = await fetch(`https://api.vercel.com/v13/deployments${teamQuery}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: input.slug,
        project: env.VERCEL_PROJECT_ID,
        target: "production",
        files: [{ file: fileName, data: Buffer.from(html, "utf-8").toString("base64"), encoding: "base64" }],
        projectSettings: { framework: null },
      }),
    });

    if (!res.ok) {
      throw new Error(`Vercel deploy failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as { url: string };
    return { providerName: "vercel", url: `https://${data.url}` };
  },
};
