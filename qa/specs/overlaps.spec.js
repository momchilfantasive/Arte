// Critical overlaps: fixed UI (header, projects HUD, theme switch, cookie banner) must not cover key content.
import { test, expect, open, topOf, scrollToY, stateShot } from '../helpers.js';

// Pairs of selectors whose visible boxes intersect (hidden / zero-size elements are ignored)
const collisions = (page, pairs) =>
  page.evaluate((pairs) => {
    const box = (s) => [...document.querySelectorAll(s)].map((el) => {
      const cs = getComputedStyle(el); const b = el.getBoundingClientRect();
      return cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0 || !b.width || !b.height ? null : b;
    }).filter(Boolean);
    const hit = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    return pairs.filter(([a, b]) => box(a).some((x) => box(b).some((y) => hit(x, y)))).map((p) => p.join(' × '));
  }, pairs);

const HERO = [['.header', '.hero_c h1'], ['.header', '.hero_c a']];
const CARD = (fixed) => ['.project-card_c a', '.project-card_meta .h2', '[data-projects-index]']
  .flatMap((c) => fixed.map((f) => [f, c])).filter(([f, c]) => !(f.startsWith('[data-projects') && c.startsWith('[data-projects')));

async function atFirstCard(page) {
  await scrollToY(page, (await topOf(page, '[data-projects]')) + 5, 1200);
}

test('Critical overlaps: header, hero and projects HUD (cookie choice made)', { tag: '@quick' }, async ({ page }, testInfo) => {
  await page.addInitScript(() => { try { localStorage.setItem('arte:cookies', 'accept'); } catch { /* ignore */ } });
  await open(page, '/');
  const hero = await collisions(page, HERO);
  const inView = await page.evaluate(() => { const b = document.querySelector('.hero_c a').getBoundingClientRect(); return b.bottom <= innerHeight && b.top >= 0; });
  await atFirstCard(page);
  const card = await collisions(page, CARD(['[data-projects-prev]', '[data-projects-next]', '.site-switch']));
  await stateShot(page, testInfo, 'overlaps-card');
  expect(hero, 'header covers hero content').toEqual([]);
  expect(inView, 'hero CTA fully in the first viewport').toBe(true);
  expect(card, 'fixed UI covers project card content').toEqual([]);
});

// Known issue (qa/reports/2026-10-23-fixes.md): the banner covers card content on every viewport.
// test.fail keeps it visible in every run; when the fix lands this reports "unexpected pass" — then delete the line.

test('Cookie banner leaves hero and project card content uncovered', { tag: '@quick' }, async ({ page }, testInfo) => {
  test.fail(true, 'known: cookie banner overlap, fix pending approval');
  await open(page, '/');
  await page.waitForFunction(() => {
    const el = document.querySelector('.cookies.is-visible'); if (!el) return false;
    return getComputedStyle(el).transform === 'none' || new DOMMatrix(getComputedStyle(el).transform).f === 0;
  }, null, { timeout: 15_000 });
  const hero = await collisions(page, [['.cookies', '.hero_c h1'], ['.cookies', '.hero_c a']]);
  await atFirstCard(page);
  const card = await collisions(page, [...CARD(['.cookies']), ['.cookies', '[data-projects-prev]'], ['.cookies', '[data-projects-next]'], ['.site-switch', '.cookies_btns']]);
  await stateShot(page, testInfo, 'overlaps-cookies');
  testInfo.annotations.push({ type: 'cookie overlaps', description: JSON.stringify({ hero, card }) });
  expect([...hero, ...card], 'cookie banner covers key UI').toEqual([]);
});
