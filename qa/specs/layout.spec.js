// Responsive layout & typography on every page: overflow, gutters, minimum text sizes.
import { test, expect, open, stateShot } from '../helpers.js';

const pages = ['/', '/curtains.html', '/villa-albinoni.html', '/outdoor.html', '/projects.html', '/showrooms.html', '/showroom-interiors.html', '/professionals.html', '/contact.html'];

for (const p of pages) {
  test(`Layout ${p}: no overflow, gutters, readable type`, async ({ page }, testInfo) => {
    await open(page, p);
    // walk the page so scroll-triggered content is laid out
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 700) { await page.evaluate((y) => scrollTo(0, y), y); await page.waitForTimeout(120); }
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(600);
    await stateShot(page, testInfo, `layout${p.replace(/[/.]/g, '_')}`);
    const r = await page.evaluate(() => {
      const vw = innerWidth;
      const visible = (el) => { const s = getComputedStyle(el); const b = el.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0; };
      const text = [...document.querySelectorAll('main .p1, main .l1, main .h1, main .h2, main .h3, main .a2')]
        .filter((el) => visible(el) && !el.closest('.swiper, .sr-actions, .chips, .booking_steps, .project-card, .hero'));
      const edge = text.filter((el) => { const b = el.getBoundingClientRect(); return b.left < 16 || b.right > vw - 16; })
        .map((el) => `${el.className.split(' ')[0]}:"${el.textContent.trim().slice(0, 30)}" L${Math.round(el.getBoundingClientRect().left)}`);
      const small = [...document.querySelectorAll('main .p1')].filter(visible).filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
        .map((el) => el.textContent.trim().slice(0, 30));
      return { overflow: document.documentElement.scrollWidth - vw, edge: [...new Set(edge)].slice(0, 12), small };
    });
    testInfo.annotations.push({ type: 'layout', description: JSON.stringify(r) });
    expect(r.overflow, 'horizontal overflow (px)').toBeLessThanOrEqual(0);
    expect(r.small, 'body text below 16px').toEqual([]);
    expect.soft(r.edge, 'text closer than 16px to the screen edge').toEqual([]);
  });
}
