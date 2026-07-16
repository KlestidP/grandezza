// End-to-end smoke script: exercises the whole Acquisition -> Delivery
// pipeline against a running server (npm run dev) using nothing but fetch
// and node:assert. Prints a pass/fail summary per step.

import assert from "node:assert/strict";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

let passed = 0;

async function step<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    const result = await fn();
    passed++;
    console.log(`PASS  ${label}`);
    return result;
  } catch (err) {
    console.error(`FAIL  ${label}`);
    console.error(err);
    process.exit(1);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollJob(jobId: string, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(`${BASE}/api/jobs/${jobId}`);
    const job = (await res.json()) as { status: string };
    if (job.status === "SUCCEEDED" || job.status === "FAILED") return job;
    await sleep(100);
  }
  throw new Error(`Job ${jobId} did not finish within ${timeoutMs}ms`);
}

async function main() {
  console.log(`Verifying against ${BASE}\n`);

  await step("GET /api/health", async () => {
    const res = await fetch(`${BASE}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    console.log("  providers:", body.providers);
  });

  const leads = await step("GET /api/leads returns seeded leads", async () => {
    const res = await fetch(`${BASE}/api/leads`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as unknown[];
    assert.ok(body.length > 0, "expected at least one seeded lead");
    return body as { id: string; status: string }[];
  });

  await step("POST /api/leads/score-all scores every NEW lead", async () => {
    const res = await fetch(`${BASE}/api/leads/score-all`, { method: "POST" });
    assert.equal(res.status, 200);
  });

  const lead = leads[0];

  const campaign = await step("POST /api/leads/:id/outreach drafts a campaign", async () => {
    const res = await fetch(`${BASE}/api/leads/${lead.id}/outreach`, { method: "POST" });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.messages.length, 2);
    return body as { id: string; messages: { id: string; channel: string }[] };
  });

  const sendResult = await step("POST /api/campaigns/:id/send enqueues jobs", async () => {
    const res = await fetch(`${BASE}/api/campaigns/${campaign.id}/send`, { method: "POST" });
    assert.equal(res.status, 202);
    const body = await res.json();
    assert.equal(body.jobs.length, 2);
    return body as { jobs: { id: string }[] };
  });

  await step("send jobs reach SUCCEEDED", async () => {
    for (const job of sendResult.jobs) {
      const finished = await pollJob(job.id);
      assert.equal(finished.status, "SUCCEEDED");
    }
  });

  const sentCampaign = await step("campaign messages now show SENT + providerId", async () => {
    const res = await fetch(`${BASE}/api/campaigns/${campaign.id}`);
    const body = await res.json();
    for (const m of body.messages) {
      assert.equal(m.status, "SENT");
      assert.ok(m.providerId);
    }
    return body as { messages: { providerId: string; channel: string }[] };
  });

  await step("POST /api/webhooks/email simulates a reply", async () => {
    const emailMessage = sentCampaign.messages.find((m) => m.channel === "EMAIL")!;
    const res = await fetch(`${BASE}/api/webhooks/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerId: emailMessage.providerId,
        event: "replied",
        replyText: "Sounds interesting, let's talk.",
      }),
    });
    assert.equal(res.status, 200);
  });

  const client = await step("POST /api/campaigns/:id/close provisions a Client", async () => {
    const res = await fetch(`${BASE}/api/campaigns/${campaign.id}/close`, { method: "POST" });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.id);
    assert.equal(body.onboardingStatus, "PENDING");
    return body as { id: string };
  });

  await step("POST /api/clients/:id/onboarding submits intake", async () => {
    const res = await fetch(`${BASE}/api/clients/${client.id}/onboarding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessDescription: "A family-run trattoria serving Bremen since 2004.",
        services: ["Dine-in", "Catering", "Private events"],
      }),
    });
    assert.equal(res.status, 201);
  });

  const site = await step("POST /api/clients/:id/site generates a real HTML file", async () => {
    const res = await fetch(`${BASE}/api/clients/${client.id}/site`, { method: "POST" });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.status, "GENERATED");
    assert.ok(body.htmlFilePath);
    console.log("  generated file:", body.htmlFilePath);
    return body as { id: string; slug: string; htmlFilePath: string };
  });

  const deployed = await step("POST /api/sites/:id/deploy serves the site", async () => {
    const res = await fetch(`${BASE}/api/sites/${site.id}/deploy`, { method: "POST" });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "DEPLOYED");
    assert.ok(body.deployedUrl);
    return body as { deployedUrl: string };
  });

  await step("GET /sites/:slug.html returns 200", async () => {
    const res = await fetch(deployed.deployedUrl);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes(lead.id) === false); // sanity: not echoing raw ids
  });

  await step("POST /api/clients/:id/marketing-posts generates a post", async () => {
    const res = await fetch(`${BASE}/api/clients/${client.id}/marketing-posts`, {
      method: "POST",
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.content);
  });

  await step("GET /api/dashboard reflects the full run", async () => {
    const res = await fetch(`${BASE}/api/dashboard`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.counts.totalSites >= 1);
    assert.ok(body.counts.totalMarketingPosts >= 1);
  });

  console.log(`\n${passed} steps passed.`);
}

main();
