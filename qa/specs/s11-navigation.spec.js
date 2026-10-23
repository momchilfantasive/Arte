// S11 Barba page transitions, history, mobile menu, theme switcher.
import { test, expect, open, frameRecorder } from '../helpers.js';

test.use({ video: 'on' });
const pages = ['curtains.html', 'villa-albinoni.html', 'outdoor.html', 'projects.html', 'showrooms.html', 'showroom-interiors.html', 'showroom-outdoor.html', 'professionals.html', 'contact.html'];

test('S11 every page loads through the page transition and history works', async ({ page }, testInfo) => {
  await open(page, '/');
  const rec = frameRecorder(testInfo, 'S11-navigation');
  const results = [];
  for (const p of pages) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate((href) => { const a = document.createElement('a'); a.href = href; document.querySelector('[data-barba="container"]').appendChild(a); a.click(); }, p);
    await page.waitForTimeout(450);
    await rec.shot(page, `${p.replace('.html', '')}-transition`);
    await page.waitForTimeout(2600);
    const st = await page.evaluate(() => ({ containers: document.querySelectorAll('[data-barba="container"]').length,
      path: location.pathname, overlay: getComputedStyle(document.querySelector('[data-transition]')).visibility,
      h1: document.querySelector('h1')?.textContent.trim().slice(0, 40) }));
    results.push({ p, ...st });
    await rec.shot(page, `${p.replace('.html', '')}-landed`);
  }
  await page.goBack(); await page.waitForTimeout(3200);
  const back = await page.evaluate(() => location.pathname);
  rec.save();
  testInfo.annotations.push({ type: 'S11 pages', description: JSON.stringify(results) });
  for (const r of results) {
    expect(r.containers, `${r.p}: one container`).toBe(1);
    expect(r.path, `${r.p}: URL`).toContain(r.p);
    expect(r.overlay, `${r.p}: overlay hidden after transition`).toBe('hidden');
    expect(r.h1, `${r.p}: has a heading`).toBeTruthy();
  }
  expect(back, 'history back returns to the previous page').toContain('professionals');
});

test('S11 mobile menu opens and closes', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('phone'), 'menu button only on phones');
  await open(page, '/');
  await page.click('[data-menu-open]'); await page.waitForTimeout(1200);
  expect(await page.getAttribute('[data-menu-open]', 'aria-expanded')).toBe('true');
  await page.keyboard.press('Escape'); await page.waitForTimeout(1000);
  expect(await page.getAttribute('[data-menu-open]', 'aria-expanded')).toBe('false');
});

test('Theme switcher flips surfaces and persists', async ({ page }) => {
  await open(page, '/');
  await page.click('[data-site-set="dark"]');
  expect(await page.evaluate(() => document.documentElement.dataset.site)).toBe('dark');
  await page.click('[data-site-set="light"]');
  expect(await page.evaluate(() => [document.documentElement.dataset.site, localStorage.getItem('arte:site')])).toEqual(['light', 'light']);
});
