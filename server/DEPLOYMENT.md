# Deploying Grandezza

This covers getting the backend and the marketing site onto the internet.
**I can't create accounts or click through hosting dashboards on your
behalf** — that needs your own login and payment details — but everything
below is written so you can follow it yourself in about 20 minutes.

## Backend → Render (or any Docker host: Railway, Fly.io, etc.)

The backend ships with a `Dockerfile`, so any container host works. Render's
free/starter tier is a reasonable default.

1. **Switch the database from SQLite to Postgres.** SQLite is a single file
   on disk — most hosts wipe or don't persist that file across deploys, so
   production needs a real database.
   - In `prisma/schema.prisma`, change:
     ```
     datasource db {
       provider = "sqlite"
       url      = env("DATABASE_URL")
     }
     ```
     to:
     ```
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - Delete the `prisma/migrations` folder and run `npx prisma migrate dev --name init`
     once locally against a throwaway Postgres instance (or just against Render's
     database directly) to generate fresh Postgres-flavored migrations — the
     SQLite migrations won't replay against Postgres as-is.
2. **Create a Postgres database** on Render (or Railway/Neon/Supabase — any
   managed Postgres works). Copy its connection string.
3. **Create a new Web Service on Render**, pointing at this repo's `server/`
   directory, with the Docker runtime (it'll pick up the `Dockerfile`
   automatically).
4. **Set environment variables** on the service (Render → your service →
   Environment):
   - `DATABASE_URL` — the Postgres connection string from step 2
   - `PUBLIC_BASE_URL` — the `https://your-service.onrender.com` URL Render gives you
   - `ADMIN_API_KEY` — make up a long random string; this is what protects
     every internal endpoint (leads list, clients, dashboard, etc.) — keep
     it secret, you'll need it yourself to use those endpoints
   - `STUDIO_NOTIFY_EMAIL` — where new website inquiries should be emailed
   - Only once you have them: `ANTHROPIC_API_KEY`, `POSTMARK_API_KEY` +
     `POSTMARK_FROM_EMAIL`, `LOB_API_KEY` — each flips one provider from
     mock to real, independently, no code changes needed
5. **Deploy.** Render builds the Dockerfile and runs it; the container's
   `CMD` applies migrations and starts the server automatically.
6. **Update the frontend.** In `index.html`, change the `API_BASE` fallback
   from `https://api.grandezza.design` to whatever real URL Render gave you.

## Frontend → Netlify or GitHub Pages

No build step, so this is close to drag-and-drop:

- **Netlify:** drag the repo root folder onto [netlify.com](https://netlify.com)'s
  deploy area, or connect the GitHub repo and set the publish directory to `/`
  (repo root). Done.
- **GitHub Pages:** repo Settings → Pages → deploy from the `main` branch,
  root directory. `index.html` is already at the repo root, so it serves as-is.

Either way, once you have a real domain, revisit `robots.txt` and
`sitemap.xml` — both currently hardcode `https://grandezza.design` as
placeholders.

## Before this is actually "live"

None of the above is legally launch-ready by itself. Also needed:

- Fill in every `[bracketed placeholder]` in `impressum.html` and
  `datenschutz.html` with your real business details.
- Point `STUDIO_NOTIFY_EMAIL` and the Postmark "from" address at real,
  monitored inboxes.
- Decide on real pricing figures if you want to show them (the pricing
  section currently deliberately shows no numbers).
