# Backend Architecture

This document explains the backend flowchart in [`backend-flowchart.html`](backend-flowchart.html)
(open it in a browser, or view it rendered on GitHub Pages / by downloading and
opening locally — GitHub's file viewer shows raw HTML source, not the rendered page).

Grandezza's backend is planned as **two engines sharing one platform spine**:

1. **Acquisition Engine** — finds small businesses/restaurants and turns cold
   leads into signed clients.
2. **Client Delivery Engine** — builds the client's website and keeps their
   marketing running afterward.

Both read and write through the same data/infra layer, and both call out to a
shared handful of third-party APIs.

## 1. Acquisition Engine

| Step | What it does |
|---|---|
| **Business Data Sources** | Pulls prospect businesses from Google Places / OpenStreetMap exports. |
| **Prospect List + Scoring** | Enriches, dedupes, and ranks leads so outreach is prioritized. |
| **Outreach AI Agent** *(AI)* | Drafts a personalized cold email and physical letter per prospect. |
| **Send Queue** | Queues and sends the email + physical-mail jobs. |
| **Reply + Signal Tracker** | Listens for opens, replies, and mail scans (inbound webhooks). |

Two loops close this engine:
- **Re-engage / score update** — a reply that isn't a "yes" feeds back into
  Prospect List + Scoring to re-prioritize or re-attempt later.
- **Deal Closed** (the pivotal gold line) — a reply that turns into a booked
  deal is the *only* connection that crosses from the Acquisition Engine into
  the rest of the system. It provisions a client record through the API
  Gateway and lands directly in Onboarding.

## 2. Platform Spine

The shared backbone both engines depend on:

- **API Gateway + Auth** — the internal REST edge everything talks through.
- **Postgres** — clients, leads, campaigns, sites, billing.
- **Redis** — cache + job queue (e.g. BullMQ).
- **Object Storage (S3)** — generated assets, site bundles, letter PDFs.

## 3. Client Delivery Engine

Split into a **launch** path and an **ongoing** path:

**Launch**
| Step | What it does |
|---|---|
| **Onboarding Portal** | Collects business info, branding, menu/services from the new client. |
| **Site Generation Agent** *(AI)* | Generates site copy and assembles the layout. |
| **Deploy Pipeline** | Builds, publishes, and connects the domain. |

**Ongoing** (kicks off once the client is onboarded and the site is live)
| Step | What it does |
|---|---|
| **Ongoing Marketing Agent** *(AI)* | Produces recurring social + email content. |
| **Analytics Collector** | Rolls up traffic, opens, and reservations. |
| **Client Dashboard** | Shows the client their performance and billing status, and loops results back to them. |

## 4. Third-Party Services

The whole system leans on a small set of outside APIs rather than building
any of this in-house:

- **Business Data API** (Google Places / OSM) — lead sourcing
- **LLM API — Claude** — reasoning behind all three AI agents (Outreach,
  Site Generation, Ongoing Marketing)
- **Email Delivery API** (Postmark / Resend) — outbound send + inbound opens/replies
- **Direct Mail API** (Lob / PostGrid) — physical letters + scan/response webhooks
- **Hosting / Deploy API** (Vercel / Cloudflare Pages) — publishing client sites
- **Domain Registrar** (Cloudflare / Namecheap) — connecting client domains
- **Payments — Stripe** — subscription billing, gates dashboard access

## Reading the diagram

- **Gold border** = an AI/LLM agent step.
- **Slate fill** = shared platform infrastructure (the spine).
- **Dashed line** = a call out to a third-party API.
- **Thick gold line** = the one pivotal moment: a prospect becomes a paying client.

## Open questions / assumptions to revisit

These were reasonable defaults picked while sketching the diagram, not final
decisions:

- Direct mail is assumed to go through an API (Lob/PostGrid) rather than a
  manual/print-shop process.
- One shared LLM handles all three agent roles (outreach, site copy, ongoing
  marketing) rather than separate models per task.
- Postgres/Redis/S3 is the assumed data layer — swap freely for whatever
  stack the team prefers.

Next step: pick one box (e.g. the Outreach AI Agent, or Site Generation
Agent) and turn it into an actual implementation plan.
