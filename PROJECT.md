# Arte del Lusso — project status

Prototype website for Arte del Lusso (curtains, blinds, outdoor shading, carpets; showrooms in San Pedro de Alcántara, Marbella). Static Vite site with GSAP/Lenis/Barba; see `README.md` for setup. Creative rules: `CREATIVE.md`. Agent rules: `PROJECT_INSTRUCTIONS.md`.

## Current phase and next action
- **Phase 4 — Creative evolution** (Fantasive Project Standard v2.1). Phases 1–2 done (Lenval principles reference, runnable prototype); phase 3 rules were implicit and are now recorded in `CREATIVE.md`.
- **Next action:** review the first Visual & Motion QA report (`qa/reports/`), decide which findings to fix (owner: creative director → agent). In parallel: client decision on dark vs light theme (owner: creative director with client).

## Confirmed decisions (creative director, Oct 2026)
- Content/structure from the client handoff document; English UI copy; home copy revised per CD review (hero “Your space, in a new light.”).
- Palette indigo `#2e2c47` + teal `#62c4ca`; client logo mark vectorised from supplied PNG.
- Hero text left, shaded hero media; header auto-hides; preloader thumbnail grows into hero.
- Stacked project cards with dwell and soft dimming (GSAP pin); larger titles; stronger bottom fade.
- Plain light sections for showrooms and final CTA; FAQ; two showrooms with own pages (Google Maps embed, Call/WhatsApp/Directions).
- Projects page: clean staggered grid (bbf-inspired). Booking: 5-step wizard (Square-inspired).
- Footer wordmark removed; wider side gutter.
- Light theme added with Dark/Light switcher for comparison (`?theme=light|dark`).

## Open questions and blockers
| Item | Owner | Next step |
|---|---|---|
| Dark vs light theme | CD + client | Choose; then remove switcher and unused theme |
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
- QA 2026-10-23 (Chromium only; WebKit unavailable): first run 89/5/7 → after fixes 94 pass / 0 fail / 7 skip. D1 Prev/Next and D2 reduced motion fixed; cookie banner overlap = proposal pending approval. Reports: `qa/reports/2026-10-23.md`, `qa/reports/2026-10-23-fixes.md`.

## Session handoff
Last meaningful change: Fantasive v2.1 docs + QA harness (`qa/`). Resume by reading the QA report and the open-items table above.
