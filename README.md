# Grandezza Design

Marketing- und Webdesign-Studio aus Bremen. / Web & marketing design studio from Bremen.

One-page site with a bilingual (DE/EN) language gate, a real-time particle
monogram in the hero, and scroll-scrubbed transitions between sections.

## Contents

| Path | Description |
|------|-------------|
| `index.html` | The complete website — self-contained, no build step |
| `logo/` | Brand marks as vector SVG (primary, inverse, horizontal, monogram) |
| `docs/backend-architecture.md` | Backend system design: acquisition engine, platform spine, delivery engine |
| `docs/backend-flowchart.html` | Visual flowchart of the backend architecture (open in a browser) |

## Running it

No build tools, bundler, or dependencies to install. Either:

- **Open directly:** double-click `index.html` in any modern browser, or
- **Serve locally** (recommended, so fonts and the language gate behave exactly as in production):

  ```bash
  python3 -m http.server 4173
  # then visit http://localhost:4173
  ```

## Dependencies

The site has **no local libraries**. Everything is vanilla HTML/CSS/JS. The only
external resource is the typeface, loaded at runtime from Google Fonts
(`Playfair Display` + `Jost`). An internet connection is needed for the fonts to
render; the rest works fully offline.

## Features

- **Language gate** — first-time visitors choose Deutsch or English; the choice
  is remembered in `localStorage` and can be switched anytime via the nav toggle.
- **Particle hero** — the ring-G monogram assembles from ~600–800 animated
  particles that twinkle, drift, and scatter away from the cursor.
- **Scroll transitions** — the hero pins while sections blend in; the monogram
  disperses as you scroll away and reassembles on the way back; a gold progress
  bar tracks position.

## Brand

- Charcoal `#1C1917` · Champagne gold `#B08D57` / `#D4B678` · Ivory `#F6F1E8`
- Display serif: Playfair Display · Sans: Jost

## Deployment

Drop the folder onto [Netlify](https://netlify.com) or enable GitHub Pages
(Settings → Pages → deploy from branch) — `index.html` is at the repo root, so it
serves as-is.

---

> Note for a live German launch: an *Impressum* and *Datenschutzerklärung* are
> legally required before publishing. The footer links are placeholders.
