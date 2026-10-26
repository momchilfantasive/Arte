# Arte del Lusso — project status

Prototype website for Arte del Lusso (curtains, blinds, outdoor shading, carpets; showrooms in San Pedro de Alcántara, Marbella). Static Vite site with GSAP/Lenis/Barba; see `README.md` for setup. Creative rules: `CREATIVE.md`. Agent rules: `PROJECT_INSTRUCTIONS.md`.

## Current phase and next action
- **Phase 4 — Creative evolution** (Fantasive Project Standard v2.1). Phases 1–2 done (Lenval principles reference, runnable prototype); phase 3 rules were implicit and are now recorded in `CREATIVE.md`.
- **Next action:** creative director runs the Safari device pass (iPad / Mac / iPhone checklist at the end of `qa/reports/2026-10-23-fixes.md`) and reports per item. Then: `npm run qa` (light) → creative-lock decision.

## Confirmed decisions (creative director, Oct 2026)
- Content/structure from the client handoff document; English UI copy; home copy revised per CD review (hero “Your space, in a new light.”).
- Palette indigo `#2e2c47` + teal `#62c4ca`; client logo mark vectorised from supplied PNG.
- Hero text left, shaded hero media; header auto-hides; preloader thumbnail grows into hero.
- Stacked project cards with dwell and soft dimming (GSAP pin); larger titles; stronger bottom fade.
- Plain light sections for showrooms and final CTA; FAQ; two showrooms with own pages (Google Maps embed, Call/WhatsApp/Directions).
- Projects page: clean staggered grid (bbf-inspired). Booking: 5-step wizard (Square-inspired).
- Footer wordmark removed; wider side gutter.
- **Light theme only** (CD, 2026-10-26). Switcher removed; dark CSS kept but unused.

## Open questions and blockers
| Item | Owner | Next step |
|---|---|---|
| Final hero video and showroom reels | CD | Supply files; agent optimises/replaces `public/video/*` |
| Copy approval incl. first FAQ answer (temporary treatments) | CD + client | Confirm or replace |
| Showroom addresses, hours, phones | Client | Confirm (taken from artedellusso.es/contacts) |
| Consultation durations, specialists, real availability, form backend | Client | Define before integration |
| Carpets & rugs destination page | CD | Decide (currently links to booking) |

## Prototype reality
- Booking form sends nothing; calendar slots are deterministic sample availability; `.ics` download works locally.
- Reels and hero video are cut from client footage as placeholders; showroom media marked “sample clip”.
- Contact data from client site, unconfirmed. Google Maps embed is live third-party content.
- WebKit/iOS Safari not verified by automation in this environment (see QA).

## First public preview (retroactive record)
- Public Vercel preview (`arte-woad.vercel.app`) and an earlier private Claude artifact existed before this record. Public build at time of recording: commit `d2792bc` and later.
- Originality: code written for this project; no Lenval assets/copy/fonts. Fonts: Newsreader, Inter Tight (OFL). Logo, photos, videos and copy: client sources (artedellusso.es, partners.artedellusso.es, Sanity CDN, client handoff document) — use confirmed by the user in chat, not by written client permission.
- Access control: none (public, unlisted URL).
- **Outstanding:** human publishing approval and client confirmation of media rights are not recorded. Owner: creative director.

## Baseline and evidence
- Creative lock: not yet approved (see `CREATIVE.md`).
- QA 2026-10-23 (Chromium only; WebKit unavailable here): D1 Prev/Next, D2 reduced motion, D3 cookie-banner overlap fixed and verified. Full `npm run qa` 748 s, 98 pass / 4 expected-fail (D3, before its fix) / 7 skip; after D3: overlaps + consent 16/16 (light), 8/8 (dark); `npm run qa:quick` 106 s, 19 pass / 2 skip. Open: Safari device pass, theme switch covers the hero label on the phone (temporary), dark theme full run. Reports: `qa/reports/2026-10-23.md`, `qa/reports/2026-10-23-fixes.md`. Candidate learnings: fantasive-knowledge PR #4.

## Session handoff
Last meaningful change: QA cycle closed 2026-10-23 (fixes D1–D3, `qa:quick`). Resume by reading `qa/reports/2026-10-23-fixes.md` (iteration close section) and the open-items table above.
