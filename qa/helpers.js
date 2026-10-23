// Shared helpers: readiness, error capture, ordered frame capture with a manifest, gap checks.
import { test as base, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export const THEME = process.env.QA_THEME || 'light';
const ART = path.resolve(import.meta.dirname, 'artifacts');

// Auto fixture: collects page errors, console errors and failed requests for every test.
export const test = base.extend({
  issues: [async ({ page }, use, testInfo) => {
    const issues = { pageErrors: [], consoleErrors: [], failedRequests: [], badResponses: [] };
    page.on('pageerror', (e) => issues.pageErrors.push(String(e.message || e)));
    page.on('console', (m) => m.type() === 'error' && issues.consoleErrors.push(m.text()));
    page.on('requestfailed', (r) => issues.failedRequests.push(`${r.failure()?.errorText} ${r.url()}`));
    page.on('response', (r) => r.status() >= 400 && issues.badResponses.push(`${r.status()} ${r.url()}`));
    await use(issues);
    await testInfo.attach('browser-issues.json', { body: JSON.stringify(issues, null, 2), contentType: 'application/json' });
    const local = (s) => s.includes('localhost');
    // Media range requests are routinely aborted (codec fallback mp4→webm, seeking, navigation): record only.
    const benign = (s) => /ERR_ABORTED|NS_BINDING_ABORTED|cancelled/i.test(s) && /\.(mp4|webm)(\?|$)/.test(s);
    // Same-origin failures and script errors fail the test; third-party noise is only recorded.
    expect.soft(issues.pageErrors, 'page errors').toEqual([]);
    expect.soft([...issues.failedRequests, ...issues.badResponses].filter((x) => local(x) && !benign(x)), 'same-origin load failures').toEqual([]);
  }, { auto: true }],
});
export { expect };

export const url = (p, q = '') => `${p}${p.includes('?') ? '&' : '?'}theme=${THEME}${q}`;

// Load a page and wait for the preloader hand-off, fonts and the hero intro.
export async function open(page, p, { q = '', preloaderTimeout = 20_000 } = {}) {
  await page.goto(url(p, q), { waitUntil: 'load' });
  await page.waitForFunction(() => !document.querySelector('[data-preloader]'), null, { timeout: preloaderTimeout });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1600);
}

export async function scrollToY(page, y, settle = 700) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(y));
  await page.waitForTimeout(settle);
}

export const topOf = (page, sel) =>
  page.evaluate((s) => { const el = document.querySelector(s); return el ? el.getBoundingClientRect().top + scrollY : null; }, sel);

// Ordered frames + manifest for temporal evidence.
export function frameRecorder(testInfo, scene) {
  const dir = path.join(ART, 'frames', testInfo.project.name, scene);
  fs.mkdirSync(dir, { recursive: true });
  const manifest = [];
  return {
    dir,
    async shot(page, label, extra = {}) {
      const i = String(manifest.length).padStart(2, '0');
      const file = path.join(dir, `${i}_${label}.png`);
      await page.screenshot({ path: file });
      manifest.push({ i: manifest.length, label, file: path.relative(ART, file), scrollY: await page.evaluate(() => Math.round(scrollY)), t: Date.now(), ...extra });
    },
    save() { fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2)); return manifest; },
  };
}

export async function stateShot(page, testInfo, name) {
  const file = path.join(ART, 'states', testInfo.project.name, `${name}.png`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await page.screenshot({ path: file });
  return file;
}

// What is painted at sample points? Detects blank section background between pinned cards.
export const probe = (page, ys = [0.04, 0.5, 0.96]) =>
  page.evaluate((ys) => ys.map((f) => {
    const el = document.elementFromPoint(innerWidth / 2, Math.round(innerHeight * f));
    const card = el?.closest('[data-project-card]');
    const section = el?.closest('section');
    return { f, card: card ? [...card.parentElement.querySelectorAll('[data-project-card]')].indexOf(card) : null,
      section: section?.className || el?.tagName, bare: !!el && el.matches('[data-projects]') };
  }), ys);
