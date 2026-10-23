// S01 preloader → hero hand-off, S02 hero scroll-out, S03 header auto-hide.
import { test, expect, url, frameRecorder, stateShot, scrollToY, QUICK } from '../helpers.js';

test.use({ video: QUICK ? 'retain-on-failure' : 'on' }); // full runs keep video as evidence

test('S01 preloader hands off seamlessly into the hero', { tag: '@quick' }, async ({ page }, testInfo) => {
  const rec = frameRecorder(testInfo, 'S01-preloader');
  const t0 = Date.now();
  await page.goto(url('/'), { waitUntil: 'domcontentloaded' });
  // Read the layer's final GSAP state at the exact moment the preloader is removed
  // (frame sampling alone is unreliable under CPU load).
  const handoff = page.evaluate(() => new Promise((resolve) => {
    const start = performance.now();
    const pre = document.querySelector('[data-preloader]');
    const mo = new MutationObserver(() => {
      if (document.contains(pre)) return;
      mo.disconnect();
      const layer = pre.querySelector('.preloader_layer');
      const m = layer ? new DOMMatrix(getComputedStyle(layer).transform === 'none' ? undefined : layer.style.transform || undefined) : null;
      resolve({ removedAt: performance.now() - start, inline: layer?.style.transform || null,
        scale: m ? m.a : null, tx: m ? m.e : null, ty: m ? m.f : null });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }));
  for (let i = 0; i < 40 && await page.locator('[data-preloader]').count(); i++) {
    await rec.shot(page, `t${String(Date.now() - t0).padStart(5, '0')}ms`);
    await page.waitForTimeout(250);
  }
  const h = await handoff;
  await page.waitForTimeout(1600);
  await rec.shot(page, 'hero-settled');
  rec.save();
  testInfo.annotations.push({ type: 'S01 timing', description: `preloader removed after ${Math.round(h.removedAt)} ms` });
  expect(h.removedAt, 'preloader finishes within 12 s').toBeLessThan(12_000);
  testInfo.annotations.push({ type: 'S01 hand-off state', description: JSON.stringify(h) });
  expect(h.inline, 'hero-media layer existed for the hand-off').not.toBeNull();
  // At hand-off the layer must be at 1:1 and centred (no visible jump into the hero).
  expect(h.scale, 'layer scale at removal').toBeGreaterThan(0.995);
  expect(Math.abs(h.tx), 'layer x offset at removal').toBeLessThan(2);
  expect(Math.abs(h.ty), 'layer y offset at removal').toBeLessThan(2);

  const hero = await page.evaluate(() => {
    const t = document.querySelector('[data-hero-title]').getBoundingClientRect();
    const hd = document.querySelector('[data-header]').getBoundingClientRect();
    const v = document.querySelector('[data-hero-bg] video');
    return { titleTop: t.top, titleBottom: t.bottom, titleLeft: t.left, headerBottom: hd.bottom, vh: innerHeight,
      fs: parseFloat(getComputedStyle(document.querySelector('[data-hero-title]')).fontSize),
      video: v ? { ready: v.readyState, err: v.error?.code || null, src: v.currentSrc } : null };
  });
  await stateShot(page, testInfo, 'S02-hero');
  expect(hero.titleTop, 'hero title below header').toBeGreaterThan(hero.headerBottom);
  expect(hero.titleBottom, 'hero title inside first screen').toBeLessThan(hero.vh);
  expect(hero.titleLeft, 'hero title respects side gutter').toBeGreaterThanOrEqual(16);
  expect(hero.video?.err, 'hero video decodes').toBeNull();
  testInfo.annotations.push({ type: 'S02 hero video', description: JSON.stringify(hero.video) });
});

test('S02 hero scroll-out reverses cleanly', async ({ page }, testInfo) => {
  await page.goto(url('/'));
  await page.waitForFunction(() => !document.querySelector('[data-preloader]'), null, { timeout: 20_000 });
  await page.waitForTimeout(1600);
  const rec = frameRecorder(testInfo, 'S02-hero-scroll');
  const H = await page.evaluate(() => innerHeight);
  const read = () => page.evaluate(() => +getComputedStyle(document.querySelector('.hero_c')).opacity);
  for (const f of [0, 0.25, 0.5, 0.75]) { await scrollToY(page, H * f, 500); await rec.shot(page, `fwd-${f}`, { opacity: await read() }); }
  for (const f of [0.5, 0.25, 0]) { await scrollToY(page, H * f, 600); await rec.shot(page, `rev-${f}`, { opacity: await read() }); }
  const m = rec.save();
  expect(m.at(-1).opacity, 'hero content fully visible again at top').toBeGreaterThan(0.95);
  expect(m[3].opacity, 'hero content fades while scrolling out').toBeLessThan(0.9);
});

test('S03 header hides on scroll down and returns on scroll up', async ({ page }) => {
  await page.goto(url('/'));
  await page.waitForFunction(() => !document.querySelector('[data-preloader]'), null, { timeout: 20_000 });
  await page.waitForTimeout(1200);
  const hidden = () => page.evaluate(() => document.querySelector('[data-header]').classList.contains('is-hidden'));
  await page.mouse.move(200, 400);
  await page.mouse.wheel(0, 600); await page.waitForTimeout(900);
  expect(await hidden(), 'hidden after scrolling down').toBe(true);
  await page.mouse.wheel(0, -250); await page.waitForTimeout(900);
  expect(await hidden(), 'visible after scrolling up').toBe(false);
});
