# Design study: Nudot Creative Studio

Source: reel by @hassenzerasoft (instagram.com/reel/DaXvg6Rv5PK) showing the
Nudot Creative Studio site ("$2M in sales" example). Caption thesis:
**"Nothing fought for attention. Everything guided it."** — the site won on
trust and hierarchy, not on animation count.

## Observed design elements

### 1. The logo IS the hero
A chrome/liquid-metal 3D "N" mark sits center stage — rendered like a physical
object with reflections and soft studio lighting. The brand mark isn't in the
corner; it's the product being sold.

### 2. Depth-layered typography
Oversized display type ("STUDIO … DIGITAL") is split left/right of the 3D
object and partially *behind* the floating elements — type and scene interleave,
creating real depth instead of flat text-on-background.

### 3. Floating glass & obsidian spheres
Transparent glass orbs (with refraction) and black glossy spheres drift through
the scene at different scales — some blurred (shallow depth of field). Adds
life and dimensionality without carrying any information.

### 4. Warm restrained palette
Greige/taupe/silver + charcoal. Luxurious through material (chrome, glass),
not through color count.

### 5. Corner-anchored interface
All UI lives at the edges: contact info bottom-left, service list stacked on the
right edge (Creative Strategy / Brand Identity / Creative Content / Design),
socials bottom-right, slide counter bottom-center. The center belongs to the
brand object alone.

### 6. Bracketed micro-labels, bilingual
Small editorial metadata in brackets — ( 品牌核心視覺 ) style — mixing
Chinese and English. Reads like captions in a design annual; signals precision.

### 7. Hero carousel with counter
"01 / 06" counter implies the hero is a slideshow of six scenes with
transitions between them.

### 8. Filmstrip work gallery
A horizontal strip of small project thumbnails above the footer — a marquee
of proof, kept tiny and quiet.

### 9. Decorative ticker/waveform strip
A thin seismograph-like strip along the bottom — texture, not content.

### Not verifiable from the still (video playback blocked)
Cursor behavior, hover states, scene motion, and page transitions could not be
observed directly. Typical for this genre (and consistent with the reel's
framing): slow rotation/float of the 3D mark, mouse-parallax on the scene,
custom cursor dot, magnetic buttons. Treat as educated inference, not fact.

## Carry-over to Grandezza Design

What we already have that matches the playbook:
- Logo-as-hero (particle ring-G monogram assembling center stage)
- Restrained luxury palette (charcoal / champagne gold / ivory)
- Corner-anchored meta (coordinates bottom-left, scroll cue bottom-right)
- Scroll-scrubbed transitions; nothing pops, everything blends
- Bilingual identity (DE/EN — echoes their CJK/EN mix)

Worth adopting (in order of impact vs. effort):
1. **Depth-layered wordmark** — split "GRANDEZZA / DESIGN" left and right of
   the monogram, with some particles drifting *in front of* the letters
   (second canvas layer above the text) → instant depth.
2. **Mouse-parallax on the hero scene** — monogram and dust shift subtly
   (a few px, opposite directions) with cursor position; cheap, big effect.
3. **Custom cursor** — small gold dot + thin ring that expands over links/CTAs;
   the single most "luxury site" cursor effect, easy in vanilla JS.
4. **Bracketed micro-labels** — ( Branding ) ( Webdesign ) ( Kampagnen ) as
   gold editorial captions in section headers.
5. **Filmstrip marquee** — slow auto-scrolling strip of work thumbnails above
   the footer once real projects exist.
6. **Gold-material monogram moment** — a slow specular "sheen" sweep across
   the assembled particle monogram every ~8s (gradient mask), suggesting metal
   without WebGL.
7. **(Bigger bet) True 3D hero** — three.js gilded ring-G with champagne-glass
   orbs and environment reflections. Highest fidelity to Nudot; also the most
   weight/complexity. Only worth it if the particle hero ever feels too subtle.

Guiding rule from the reel, adopted as ours: every addition must guide
attention toward the brand, never compete with it. If an effect is noticeable
as an effect, it's too loud.
