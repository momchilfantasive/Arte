// Reduced-motion pass: content must be readable and reachable without waiting for animation.
import { test, expect, url, scrollToY, topOf, stateShot } from '../helpers.js';

test('Reduced motion: preloader duration and immediate content', async ({ page }, testInfo) => {
  // Guard: fail loudly if the project stops emulating the preference (it once silently did)
  await page.goto('about:blank');
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), 'reduced motion emulated').toBe(true);
  const t0 = Date.now();
  await page.goto(url('/'));
  await page.waitForFunction(() => !document.querySelector('[data-preloader]'), null, { timeout: 20_000 });
  const preloaderMs = Date.now() - t0;
  testInfo.annotations.push({ type: 'preloader with reduce', description: `${preloaderMs} ms` });
  await stateShot(page, testInfo, 'RM-hero');
  // Jump to sections and read text opacity after a short wait (no animation should be required)
  const out = {};
  for (const sel of ['#discover h2', '.services_title', '.cta_title']) {
    await scrollToY(page, (await topOf(page, sel)) - 200, 250);
    out[sel] = await page.evaluate((s) => {
      const el = document.querySelector(s); const line = el.querySelector('.split-line > *') || el;
      return { opacity: +getComputedStyle(el).opacity, transform: getComputedStyle(line).transform };
    }, sel);
  }
  const parallax = await page.evaluate(() => {
    const t = (el) => (el ? getComputedStyle(el).transform : null);
    return {
      hero: t(document.querySelector('[data-hero-bg]')),
      parallaxImgs: [...document.querySelectorAll('[data-parallax-img] img, [data-parallax-inner], [data-parallax-bg], [data-project-img]')]
        .map(t).filter((v) => v && v !== 'none' && Math.abs(parseFloat(v.split(',').pop())) > 0.5), // translateY = parallax
    };
  });
  testInfo.annotations.push({ type: 'reduced-motion states', description: JSON.stringify({ out, parallax }) });
  expect.soft(preloaderMs, 'preloader shortened under reduced motion (<3 s)').toBeLessThan(3000);
  expect.soft(parallax.hero, 'hero background not moved by scroll').toMatch(/none|matrix\(1, 0, 0, 1, 0, 0\)/);
  expect.soft(parallax.parallaxImgs, 'no parallax transforms on images').toEqual([]);
  for (const [s, v] of Object.entries(out)) expect.soft(v.transform, `${s} not offset/hidden by a pending reveal`).toMatch(/none|matrix\(1, 0, 0, 1, 0, 0\)/);
});
