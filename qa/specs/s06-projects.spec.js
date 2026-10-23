// S06 stacked pinned project cards: dwell, slide-over, no blank gaps, reverse, interruption, reload, resize.
import { test, expect, open, frameRecorder, scrollToY, topOf, probe, QUICK } from '../helpers.js';

test.use({ video: QUICK ? 'retain-on-failure' : 'on' }); // full runs keep video as evidence

async function sectionRange(page) {
  const top = await topOf(page, '[data-projects]');
  const h = await page.evaluate(() => document.querySelector('[data-projects]').offsetHeight);
  const vh = await page.evaluate(() => innerHeight);
  return { top, end: top + h - vh, vh };
}

test('S06 forward and reverse scroll keep a card on screen (no blank gaps)', { tag: '@quick' }, async ({ page }, testInfo) => {
  await open(page, '/');
  const { top, end, vh } = await sectionRange(page);
  const rec = frameRecorder(testInfo, 'S06-projects');
  const steps = [];
  for (let y = top; y <= end; y += vh * (QUICK ? 0.35 : 0.2)) steps.push(y);
  const gaps = [];
  for (const y of steps) {
    await scrollToY(page, y, 600);
    const p = await probe(page);
    if (p.some((x) => x.bare)) gaps.push({ dir: 'fwd', y: Math.round(y - top), p });
    await rec.shot(page, `fwd-${Math.round(y - top)}`, { probe: p, hud: await page.textContent('[data-projects-index]') });
  }
  for (const y of [...steps].reverse()) {
    await scrollToY(page, y, 600);
    const p = await probe(page);
    if (p.some((x) => x.bare)) gaps.push({ dir: 'rev', y: Math.round(y - top), p });
    await rec.shot(page, `rev-${Math.round(y - top)}`, { probe: p });
  }
  const m = rec.save();
  testInfo.annotations.push({ type: 'S06 HUD sequence', description: m.filter((f) => f.hud).map((f) => f.hud).join(' ') });
  expect(gaps, 'blank section background visible between cards').toEqual([]);
  expect(m.filter((f) => f.hud).map((f) => f.hud), 'HUD index reaches the last card').toContain('P3');
});

test('S06 rapid interrupted wheel scrolling settles without gaps', async ({ page }, testInfo) => {
  await open(page, '/');
  const { top, end, vh } = await sectionRange(page);
  await scrollToY(page, top - vh * 0.3, 600);
  await page.mouse.move(200, 300);
  const rec = frameRecorder(testInfo, 'S06-rapid');
  const pattern = [900, 700, -500, 1200, -900, 1500, 600, -1400, 1100];
  const gaps = [];
  for (const [i, d] of pattern.entries()) {
    await page.mouse.wheel(0, d);
    await page.waitForTimeout(140); // interrupt mid-transition
    const p = await probe(page);
    const y = await page.evaluate(() => scrollY);
    if (y > top && y < end && p.some((x) => x.bare)) gaps.push({ i, y: Math.round(y - top), p });
    await rec.shot(page, `burst-${i}`, { probe: p });
  }
  await page.waitForTimeout(1500);
  await rec.shot(page, 'settled', { probe: await probe(page) });
  rec.save();
  expect(gaps, 'blank gaps during rapid scrolling').toEqual([]);
});

test('S06 Previous / Next buttons step through cards', { tag: '@quick' }, async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('phone'), 'HUD buttons are hidden on phones by design');
  await open(page, '/');
  const { top, end } = await sectionRange(page);
  await scrollToY(page, top + 5, 800);
  const idx = () => page.textContent('[data-projects-index]');
  const n = await page.locator('[data-project-card]').count();
  const rec = frameRecorder(testInfo, 'S06-prevnext');
  const step = async (sel, want, label) => {
    await page.click(sel); await page.waitForTimeout(2200);
    const p = await probe(page);
    await rec.shot(page, `${label}-${want}`, { probe: p });
    expect.soft(await idx(), `${label} → ${want}`).toBe(want);
    expect.soft(p.some((x) => x.bare), `blank gap after ${label}`).toBe(false);
  };
  expect(await idx()).toBe('P1');
  // Forward to the last card, then all the way back
  for (let i = 2; i <= n; i++) await step('[data-projects-next]', `P${i}`, 'next');
  await step('[data-projects-next]', `P${n}`, 'next-at-end');
  for (let i = n - 1; i >= 1; i--) await step('[data-projects-prev]', `P${i}`, 'prev');
  await step('[data-projects-prev]', 'P1', 'prev-at-start');
  // After manual scrolling: the buttons continue from the card in view
  await scrollToY(page, top + (end - top) * 0.6, 900);
  const here = await idx();
  expect(Number(here.slice(1)), 'manual scroll lands mid-stack').toBeGreaterThan(1);
  await rec.shot(page, `manual-${here}`, { probe: await probe(page) });
  const k = Number(here.slice(1));
  await step('[data-projects-prev]', `P${k - 1}`, 'manual-prev');
  await step('[data-projects-next]', `P${k}`, 'manual-next');
  rec.save();
});

test('S06 reload in the middle of the stack', async ({ page }, testInfo) => {
  await open(page, '/');
  const { top, vh } = await sectionRange(page);
  await scrollToY(page, top + vh * 1.6, 800);
  await page.reload();
  await page.waitForFunction(() => !document.querySelector('[data-preloader]'), null, { timeout: 20_000 });
  await page.waitForTimeout(1200);
  const y = await page.evaluate(() => scrollY);
  testInfo.annotations.push({ type: 'S06 reload', description: `scrollY after reload: ${y} (manual scroll restoration resets to top)` });
  await scrollToY(page, top + vh * 1.6, 900);
  const rec = frameRecorder(testInfo, 'S06-reload');
  await rec.shot(page, 'after-reload-mid');
  rec.save();
  expect((await probe(page)).some((x) => x.bare), 'no gap after reload').toBe(false);
});

test('S06 orientation change mid-stack (landscape → portrait)', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('ipad-1180'), 'run once per engine on the iPad size');
  await open(page, '/');
  const { top, vh } = await sectionRange(page);
  await scrollToY(page, top + vh * 0.8, 800);
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.waitForTimeout(1500);
  const r = await sectionRange(page);
  const rec = frameRecorder(testInfo, 'S06-rotate');
  const gaps = [];
  for (let y = r.top; y <= r.end; y += r.vh * 0.25) {
    await scrollToY(page, y, 600);
    const p = await probe(page);
    if (p.some((x) => x.bare)) gaps.push(Math.round(y - r.top));
    await rec.shot(page, `portrait-${Math.round(y - r.top)}`, { probe: p });
  }
  rec.save();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal overflow').toBe(true);
  expect(gaps, 'gaps after rotation').toEqual([]);
});
