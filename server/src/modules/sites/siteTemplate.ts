import type { SiteCopy } from "../../providers/types.js";

// Reuses the same brand tokens as the root index.html (charcoal/ivory/gold,
// Playfair Display + Jost) so generated client sites read as "made by
// Grandezza" without duplicating the marketing site's own particle-hero,
// language-gate, or scroll-choreography -- those are Grandezza's own brand
// flourishes, not a template every client site should inherit.
export function renderSiteHtml(businessName: string, copy: SiteCopy): string {
  const serviceCards = copy.services
    .map(
      (s) => `
        <div class="service">
          <h3>${escapeHtml(s.name)}</h3>
          <p>${escapeHtml(s.description)}</p>
        </div>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(businessName)}</title>
<meta name="description" content="${escapeHtml(copy.tagline)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
:root{
  --charcoal:#1C1917;
  --ivory:#F6F1E8;
  --gold:#B08D57;
  --gold-light:#D4B678;
  --serif:'Playfair Display', Didot, serif;
  --sans:'Jost', 'Helvetica Neue', sans-serif;
}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--ivory);color:var(--charcoal);font-family:var(--sans);font-weight:300;line-height:1.7}
header{padding:8vh 6vw 6vh;text-align:center;background:var(--charcoal);color:var(--ivory)}
header h1{font-family:var(--serif);font-weight:400;font-size:clamp(32px,6vw,56px);letter-spacing:.03em}
header p{margin-top:18px;color:var(--gold-light);letter-spacing:.08em;text-transform:uppercase;font-size:13px}
main{max-width:860px;margin:0 auto;padding:8vh 6vw}
section{margin-bottom:8vh}
section h2{font-family:var(--serif);font-weight:400;font-size:clamp(24px,3vw,34px);margin-bottom:20px;color:var(--charcoal)}
section p{color:#4a453d;max-width:65ch}
.services{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;margin-top:12px}
.service{border:1px solid rgba(28,25,23,.14);padding:22px;border-radius:3px}
.service h3{font-family:var(--sans);font-weight:500;font-size:17px;margin-bottom:8px;color:var(--charcoal)}
.service p{font-size:14px;color:#5c554b}
footer{text-align:center;padding:6vh 6vw;background:var(--charcoal);color:rgba(246,241,232,.6);font-size:12px;letter-spacing:.1em;text-transform:uppercase}
</style>
</head>
<body>
<header>
  <h1>${escapeHtml(businessName)}</h1>
  <p>${escapeHtml(copy.tagline)}</p>
</header>
<main>
  <section>
    <h2>${escapeHtml(copy.heroHeadline)}</h2>
    <p>${escapeHtml(copy.aboutParagraph)}</p>
  </section>
  <section>
    <h2>What we offer</h2>
    <div class="services">${serviceCards}
    </div>
  </section>
</main>
<footer>Site by Grandezza</footer>
</body>
</html>
`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
