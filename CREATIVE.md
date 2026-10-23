# Creative direction — Arte del Lusso

## North Star
- **Primary reference:** lenvalproperties.com — learned *principles* only: full-bleed media hero, calm serif display type with small sans labels, generous whitespace, stacked full-screen project cards, scroll-led reveals, preloader that hands off into the hero. No Lenval code, assets, copy, fonts or branding were used.
- **Client direction:** content and structure from the client handoff document (English UI copy), refined by the creative director's copy review (Oct 2026).
- **Desired feeling:** calm, light, crafted — “your space, in a new light”. Premium but approachable; concrete about products and service.
- **Distinctly ours:** Arte del Lusso mark and indigo/teal palette, interior/curtain-led imagery, showroom and consultation focus, booking flow.
- **Secondary references:** bbf.com/projects (clean staggered project grid), Square Appointments (step-by-step booking + live summary). Used for single sections only.

## Visual DNA
- **Palette:** indigo `#2e2c47` (dark surfaces, dark text), teal `#62c4ca` (accent on dark/media), deep teal `#2a8a90` (accent on light), off-white `#f6f5f2`; light theme uses white `#ffffff`. Dark/Light switcher is a temporary A/B tool pending client choice.
- **Type:** Newsreader 300 (display: `.a2` 8rem, `.h1` 4rem, `.h2` 2.5rem; hero title and project names +40%) + Inter Tight 400/500 (body ≥16px, labels ≥11.5px uppercase +0.04em).
- **Grid:** 12 columns (4 on phones), 16px gap, side gutter `clamp(20px, 2.5rem, 48px)`; fluid rem (`1rem` = 16 design px at 1440 / 375). Tablet range 768–1279px widens narrow text columns.
- **Composition:** media full-bleed or tall portrait (4:5, 9:16 reels); text left, one compact column; offset/staggered pairs; thin lines and leaf-shadow texture on light sections.
- **Avoid:** arrow glyphs in buttons (iOS renders some as emoji), dark overlays on plain sections, text against screen edges, background photos behind long copy.

## Motion DNA
- **Easing:** `arte` = cubic-bezier(0.65, 0.05, 0, 1) for wipes/transforms; `arte.out` = (0.16, 1, 0.3, 1) for reveals. Typical 0.9–1.6s; staggers 0.05–0.1s.
- **Smooth scroll:** Lenis (lerp 0.085) driven by the GSAP ticker; ScrollTrigger for scroll links.
- **Signature interactions:** preloader thumbnail → hero handoff; stacked pinned project cards; masked line reveals.
- **Reduced motion:** content must stay readable and reachable; parallax/scrub/large transforms should be removed or shortened (see QA findings for current gaps).

## Choreography map
Scene IDs are used in `qa/` tests and reports.

| ID | Scene / trigger | Entry → active → exit | Timing / range | Layers / pins | Reverse / interruption | Mobile / reduced motion |
|---|---|---|---|---|---|---|
| S01 | Preloader (first load) | Grid lines draw, words rise, counter 00→100 → words spread (Flip), hero-media thumbnail opens centre → thumbnail (copy of hero layer, viewport ratio) scales to 1:1, preloader removed | ≈7–9 s total; grow 1.6 s | Fixed overlay z100 over page; layer copy of hero media | Not scroll-driven; scroll locked until hand-off | Same on phone. Reduced motion: should shorten (gap) |
| S02 | Hero (home/projects/project) | Title lines rise, labels fade → readable → bg drifts down 35%, content fades/rises out | Load intro 1.4 s; scrub over hero height | Hero media + shade + gradients | Scrub reverses exactly | Text full width on phone |
| S03 | Header | Visible → hides on scroll down (>120px) → returns on scroll up/top; colour follows section `data-bg` and site theme | 0.7 s transform | Fixed z50 | Direction-based | Menu button replaces nav <768px |
| S04 | Approach (home #discover) | Lines draw, heading lines rise, copy fades up | Reveal once at 88–92% viewport | 9:16 media with inner parallax | Reveal once (no reverse) | Media 3 cols, copy full width |
| S05 | Inside & out cards | Clip reveal of 4 cards, inner parallax | Once at 85% | Offset 2nd/4th card | Once | 2×2 on tablet, stacked on phone |
| S06 | Selected projects stack | Card pins at top; dwell (45vh) fully visible → next card slides over; previous scales 0.94 and dims ≤55%, meta fades → last card releases into next section | Pin from card top to last card top; dim from next-card top 85% → top | GSAP pin (pinSpacing false), z by order; HUD (P1/03, Prev/Next) sticky bottom | Must reverse cleanly; no blank gaps; Prev/Next scroll to card | Same choreography; HUD buttons hidden on phone |
| S07 | “What are you planning?” tabs | Tab click/arrow → image steady (single reel), title lines rise, copy fades | 1.1 s; autoplay 7 s until interaction | Panels stacked absolute | Rapid switching must not clip CTA | Reel 3 cols, list then panel on phone |
| S08 | Showrooms (“A closer look.”) | Two showroom cards, staggered; reel plays on hover (desktop) / in view (touch) | Parallax ±5–6% | Video posters until play | Pause on leave/out of view | Stacked on phone |
| S09 | FAQ | Accordion one-open, height animates | 0.7 s | — | Toggle anytime | Same |
| S10 | Final consultation + footer | Plain light CTA → footer | Reveal once | — | — | — |
| S11 | Page transition (Barba) | Overlay wipes up with lines + logo → new page, hero intro | 0.9 s + 1 s | Fixed overlay z100 | Back/forward history | Same |
| S12 | Booking wizard (contact) | Step fades in, summary updates live; validation inline; done screen | 0.6 s per step | Sticky summary (desktop/tablet) | Back/step tabs | Summary above form on phone |
| S13 | Showroom page | Hero, quick actions, reel, facts, embedded Google Map | Reveal once | iframe map | — | Stacked |

## Creative lock
Status: **not yet approved.** Open creative decisions: dark vs light theme, final reels/hero video, client copy approval. When approved, record commit, date, approver, locked scope and accepted QA gaps here.
