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

// Banner visible (no consent yet): it must sit clear of hero CTAs, card content, HUD and the theme switch.
test('Cookie banner leaves hero and project card content uncovered', { tag: '@quick' }, async ({ page }, testInfo) => {
  await open(page, '/');
  await bannerShown(page);
  const hero = await collisions(page, [['.cookies', '.hero_c h1'], ['.cookies', '.hero_c a']]);
  await stateShot(page, testInfo, 'cookies-hero');
  await atFirstCard(page);
  const card = await collisions(page, [...CARD(['.cookies']), ['.cookies', '[data-projects-prev]'], ['.cookies', '[data-projects-next]'], ['.cookies', '.site-switch']]);
  const box = await page.evaluate(() => { const b = document.querySelector('.cookies').getBoundingClientRect(); return { h: Math.round(b.height), bottomGap: Math.round(innerHeight - b.bottom) }; });
  await stateShot(page, testInfo, 'cookies-card');
  testInfo.annotations.push({ type: 'cookie banner', description: JSON.stringify({ hero, card, ...box }) });
  expect([...hero, ...card], 'cookie banner covers key UI').toEqual([]);
});

const bannerShown = (page) => page.waitForFunction(() => {
  const el = document.querySelector('.cookies.is-visible');
  return el && +getComputedStyle(el).opacity === 1 && ['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(getComputedStyle(el).transform);
}, null, { timeout: 15_000 });

// Consent keeps working: reachable by keyboard, choice persists across Barba navigation and reload.
for (const choice of ['accept', 'decline']) {
  test(`Cookie consent (${choice}): keyboard, navigation and reload`, { tag: choice === 'accept' ? '@quick' : [] }, async ({ page }, testInfo) => {
    await open(page, '/');
    await bannerShown(page);
    let tabs = 0;
    while (tabs < 60 && !(await page.evaluate((c) => document.activeElement?.matches(`[data-cookies-btn="${c}"]`), choice))) { await page.keyboard.press('Tab'); tabs++; }
    testInfo.annotations.push({ type: 'tabs to reach button', description: String(tabs) });
    expect(tabs, `${choice} reachable by keyboard`).toBeLessThan(60);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(900);
    expect(await page.locator('[data-cookies]').count(), 'banner removed after choice').toBe(0);
    expect(await page.evaluate(() => localStorage.getItem('arte:cookies'))).toBe(choice);
    await page.evaluate(() => { const a = document.createElement('a'); a.href = 'projects.html'; document.querySelector('[data-barba="container"]').appendChild(a); a.click(); });
    await page.waitForTimeout(3200);
    expect(await page.locator('.cookies.is-visible').count(), 'no banner after page transition').toBe(0);
    await page.reload(); await page.waitForTimeout(6500);
    expect(await page.locator('.cookies.is-visible').count(), 'no banner after reload').toBe(0);
  });
}
