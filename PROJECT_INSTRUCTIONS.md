# Project working instructions — Arte del Lusso

Shared body for `AGENTS.md` (Codex) and `CLAUDE.md` (Claude). Based on Fantasive Project Standard v2.1 (`starter/PROJECT_INSTRUCTIONS.md`), adapted to this project. These local rules apply even when the shared repository is unreachable.

## Start of session
Read `PROJECT.md` (status, decisions, open items), then `CREATIVE.md` (visual/motion rules and choreography map). Technical setup, structure and data attributes are in `README.md`. Infer the phase from `PROJECT.md`; do not restart discovery. Briefly state verified context, current issue and recommended action; ask at most one decision-critical question. The creative director owns creative judgment.

Shared guidance (load selectively; a link is not proof of reading): https://github.com/momchilfantasive/fantasive-knowledge/blob/main/START_HERE.md and the canonical phases in `standards/project-standard/README.md`. Project requirements and current evidence take precedence.

## Working rules
- Within the user's request, make ordinary reversible edits and run relevant checks without asking per edit. Ask before changing creative direction or scope, destructive actions, or publishing outside the existing Vercel preview workflow.
- Every push to `claude/lenval-properties-website-clone-yni1b1` deploys the public Vercel preview. Treat it as public; follow the preview/IP rules below.
- Preserve the established visual and motion language (`CREATIVE.md`). New references inform local solutions, not a new identity.
- Primary review device is iPad landscape (1180×820 / 1366×1024), plus phone 390×844. Check changed scenes and their neighbours; run the full QA harness after shared layout/scroll changes and before creative lock.
- Keep iteration reports short. Update `PROJECT.md` at meaningful decisions, milestones or handoff — not every tweak.

## Content, assets and IP
- Lenval Properties (lenvalproperties.com) is the primary *principle* reference only: no code, assets, copy, fonts or branding from it. Code here is original; fonts are open-licence (Google Fonts).
- Client media and copy come from the client's own sources (artedellusso.es, partners.artedellusso.es / Sanity CDN, client documents) with the user's confirmation that they may be used. Record new sources in `PROJECT.md`.
- Before new material reaches the public preview, check rights/originality and confidential data; unresolved rights block that material.

## Prototype honesty
Label mocks: the booking form sends nothing, availability and reels are samples, showroom data must be confirmed. Never present WebKit emulation as iPad/iOS Safari testing. Report checks as passed / failed / not run.

## QA
Harness: `qa/` (Playwright, Chromium + WebKit projects, scene IDs from the choreography map). Run `npm run qa:quick` (~100 s: `@quick`-tagged tests on iPad 1180, phone 390 and reduced motion, Chromium; skips the first-load preloader except in S01) for everyday iterations, `npm run qa` (full Chromium, ~15 min) before milestones and creative lock, and `npm run qa:all` (adds WebKit where installed). Reports live in `qa/reports/`; raw artifacts in `qa/artifacts/` (git-ignored). Physical iPad/iPhone Safari passes are separate and owned by the creative director. Never rebuild `dist/` while a run is using the preview server. Report before/after with the fix reverted against the same specs.

## Creative lock and knowledge
Creative lock = human approval of a named commit; record it in `CREATIVE.md`. Not a code freeze. Propose reusable learnings to fantasive-knowledge only via a reviewed PR with evidence; never push to its default branch.
