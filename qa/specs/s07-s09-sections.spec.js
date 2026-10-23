// S07 audience tabs, S08 showroom reels, S09 FAQ accordion.
import { test, expect, open, scrollToY, topOf, stateShot, frameRecorder } from '../helpers.js';

test('S07 tabs survive rapid switching (CTA never clipped) and support arrow keys', async ({ page }, testInfo) => {
  await open(page, '/');
  await scrollToY(page, (await topOf(page, '.services_grid')) - 100, 1000);
  for (const id of ['tab-rental', 'tab-sale', 'tab-trade', 'tab-home', 'tab-sale', 'tab-rental']) {
    await page.click(`#${id}`); await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1800);
  const cta = await page.evaluate(() => {
    const panel = document.querySelector('.services_panel.is-active');
    const link = panel.querySelector('.link-line');
    const box = link.querySelector('.nav-item_label').getBoundingClientRect();
    const label = link.querySelector('.nav-item_label > *').getBoundingClientRect();
    return { active: panel.getAttribute('aria-labelledby'), clipped: label.top < box.top - 0.5 || label.bottom > box.bottom + 0.5,
      transform: getComputedStyle(link.querySelector('.nav-item_label > *')).transform,
      opacity: +getComputedStyle(link).opacity };
  });
  await stateShot(page, testInfo, 'S07-tabs-after-rapid');
  expect(cta.active).toBe('tab-rental');
  expect(cta.clipped, 'CTA label clipped').toBe(false);
  expect(cta.opacity, 'CTA visible').toBeGreaterThan(0.95);
  await page.focus('#tab-rental');
  await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(() => document.activeElement.id)).toBe('tab-sale');
  await page.keyboard.press('End');
  expect(await page.evaluate(() => document.activeElement.getAttribute('aria-selected'))).toBe('true');
});

test('S08 showroom reels load and play on hover (desktop) or in view (touch)', async ({ page }, testInfo) => {
  await open(page, '/');
  const y = await topOf(page, '.sr-grid');
  const vh = await page.evaluate(() => innerHeight);
  const rec = frameRecorder(testInfo, 'S08-showrooms');
  await scrollToY(page, y - vh * 0.3, 1500);
  await rec.shot(page, 'cards-in-view');
  const touch = testInfo.project.use.hasTouch;
  if (!touch) {
    const box = await page.locator('.sr-card').first().boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + 100);
    await page.waitForTimeout(1500);
    await rec.shot(page, 'hover-first');
  }
  const vids = await page.evaluate(() => [...document.querySelectorAll('.sr-card video')].map((v) => ({
    src: v.currentSrc.split('/').pop(), ready: v.readyState, paused: v.paused, err: v.error?.code || null })));
  rec.save();
  testInfo.annotations.push({ type: 'S08 videos', description: JSON.stringify(vids) });
  expect(vids.every((v) => !v.err), 'videos decode').toBe(true);
  expect(vids.some((v) => !v.paused), touch ? 'a reel plays when in view' : 'hovered reel plays').toBe(true);
  // the card text (address + actions) must be readable
  const txt = await page.evaluate(() => [...document.querySelectorAll('.sr-card .sr-addr')].map((e) => +getComputedStyle(e).opacity));
  expect(Math.min(...txt)).toBeGreaterThan(0.9);
});

test('S09 FAQ accordion keeps one item open', async ({ page }, testInfo) => {
  await open(page, '/');
  await scrollToY(page, (await topOf(page, '#faq')) - 60, 1200);
  const btns = page.locator('#faq [data-accordion-btn]');
  await btns.nth(2).click(); await page.waitForTimeout(900);
  await btns.nth(3).click(); await page.waitForTimeout(900);
  const state = await page.evaluate(() => [...document.querySelectorAll('#faq [data-accordion-btn]')].map((b) => b.getAttribute('aria-expanded')));
  await stateShot(page, testInfo, 'S09-faq');
  expect(state).toEqual(['false', 'false', 'false', 'true']);
});
