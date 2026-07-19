# Grandezza server

Backend implementation of the two-engine pipeline described in
[`../docs/backend-architecture.md`](../docs/backend-architecture.md): the
Acquisition Engine (lead → scored → AI outreach → sent → replied → deal
closed) and the Client Delivery Engine (onboarded → AI site generated →
deployed → ongoing AI marketing).

## Run it

No external services required. SQLite stands in for Postgres, an in-process
job runner stands in for Redis + BullMQ, and every third-party integration
(LLM, email, direct mail, deploy) runs in a deterministic **mock mode** by
default.

```bash
cd server
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

The server logs its active provider modes on boot, e.g.:

```
[providers] LLM=mock EMAIL=mock MAIL=mock DEPLOY=mock
```

Then either drive it by hand with curl (see the sequence in
`scripts/verify.ts`, or the plan this was built from) or run:

```bash
npm run verify
```

which scripts the full lead → client → live site → marketing post flow
against the running server and prints pass/fail per step.

To reset to a clean seeded state: `npm run db:reset`.

## Going from mock to real

Every external integration is an interface (`src/providers/types.ts`) with a
mock implementation and, where one exists, a real one. `src/providers/registry.ts`
is the *only* place that decides which loads — purely based on which env var
is set in `.env`. Nothing else in the app branches on mock-vs-real.

| Integration | Env var | Mock behavior | Real behavior |
|---|---|---|---|
| LLM (all 3 AI agents) | `ANTHROPIC_API_KEY` | Deterministic templated text | Calls Claude, validates JSON response |
| Email send | `POSTMARK_API_KEY` (+ `POSTMARK_FROM_EMAIL`) | Logs + fake id | Calls Postmark's REST API |
| Direct mail | `LOB_API_KEY` | Writes a `.txt` stand-in to `storage/letters/` | Calls Lob's REST API |
| Deploy | — | Confirms the generated file on disk, serves it at `/sites/:slug.html` | *(not implemented — see below)* |

Drop a key into `.env` and restart; no code changes needed.

## Admin auth

Every internal/business endpoint (leads, campaigns, clients, jobs, the admin
dashboard) requires an `x-admin-key` header matching `ADMIN_API_KEY`. If you
don't set one in `.env`, a random key is generated at boot and printed to the
log — copy it from there, or set a stable one yourself:

```
[admin] ADMIN_API_KEY not set -- generated one for this run: <key>
```

Three things stay public on purpose: `POST /api/leads` (the website's own
contact form), `POST /api/webhooks/*` (provider callbacks), and
`GET /api/portal/:token` (the client dashboard — see below).

## Client dashboard (portal)

Each `Client` gets a `dashboardToken` at creation. `GET /portal/:token`
serves a real HTML page (`public/portal.html`) showing that client's own
site status, live URL, and marketing posts — scoped to just that client,
no admin key needed, no way to see anyone else's data. Get a client's link
via `GET /api/clients/:id` (admin) and combine `PUBLIC_BASE_URL` +
`/portal/` + `dashboardToken`.

## Lead notifications

A `POST /api/leads` submission with `"source": "WEBSITE"` (what the site's
contact form sends) fires an email to `STUDIO_NOTIFY_EMAIL` via the same
email provider used for outreach — mock-logged locally, real once
`POSTMARK_API_KEY` is set. Bulk imports/seeding don't notify, only real
inbound inquiries.

## Analytics

`POST /api/analytics/pageview` records a path + referrer with **no cookie,
no visitor id** — the site's own beacon script calls it once per page load.
Because nothing identifying is stored, this doesn't require a cookie-consent
banner. Aggregate counts show up in `GET /api/dashboard` under `pageViews`.

## What's intentionally not built yet

This is an MVP scoped to run fully offline. Not implemented:

- Live lead sourcing (Google Places/OSM) — leads are seeded or imported via `POST /api/leads` / `/import`.
- A real deploy provider (Vercel/Cloudflare Pages) and domain connection.
- Real Stripe billing — `Client.billingStatus` exists as a field with no Stripe calls.
- Real PDF letter generation — mock mail writes plain text.
- Real provider webhook signature verification — `/api/webhooks/*` trusts
  the payload as-is; fine for mock mode, worth revisiting before wiring real
  Postmark/Lob webhooks.
- CI/CD and a test framework (`scripts/verify.ts` is a smoke script, not a
  test suite).

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for what's needed to actually host this.

## API surface

See `src/app.ts` for the full route list. The whole pipeline in order:

```
POST /api/leads/import                     seed/import leads                          [admin]
POST /api/leads/score-all                   rule-based scoring                        [admin]
POST /api/leads/:id/outreach                Outreach AI Agent → drafts email + letter [admin]
POST /api/campaigns/:id/send                queues the send jobs                      [admin]
POST /api/webhooks/email  (or /mail)         simulate a reply
POST /api/campaigns/:id/close               deal closed → provisions a Client         [admin]
POST /api/clients/:id/onboarding             intake                                   [admin]
POST /api/clients/:id/site                    Site Generation Agent → writes a real HTML file [admin]
POST /api/sites/:id/deploy                     mock deploy → servable at /sites/:slug.html    [admin]
POST /api/clients/:id/marketing-posts          Ongoing Marketing Agent                [admin]
GET  /api/dashboard                            aggregate view of the whole pipeline, incl. page views [admin]
GET  /api/portal/:token                          a client's own scoped view (public, token-gated)
GET  /portal/:token                              the client dashboard page itself (public, token-gated)
POST /api/analytics/pageview                     cookieless page-view beacon (public)
```

## Job visibility

`GET /api/jobs` / `GET /api/jobs/:id` show every send job's status
(`PENDING → RUNNING → SUCCEEDED|FAILED`). This in-process queue
(`src/lib/jobQueue.ts`) has no retries, no concurrency control, and no
durability across restarts — it's a direct stand-in for the Redis + BullMQ
queue in the architecture doc, not a production job runner.
