// S12 booking wizard: prefill, validation, calendar/slots, review, confirmation, responsive summary.
import { test, expect, open, stateShot } from '../helpers.js';

test('S12 booking wizard full flow with prefill and validation', async ({ page }, testInfo) => {
  await open(page, '/contact.html', { q: '&visit=outdoor&interest=outdoor' });
  const form = page.locator('[data-booking]');
  await form.scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
  const pre = await page.evaluate(() => ({ m: document.querySelector('[name=meeting]:checked')?.value, s: document.querySelector('[name=showroom]:checked')?.value }));
  expect(pre).toEqual({ m: 'showroom', s: 'outdoor' });
  await stateShot(page, testInfo, 'S12-1-meeting');
  await page.click('[data-next]'); await page.waitForTimeout(800);
  await page.click('label.chip:has(input[name=products][value=motorisation])');
  await page.click('[data-next]'); await page.waitForTimeout(800);
  // validation: cannot continue without date/time
  await page.click('[data-next]');
  await expect(page.locator('[data-err="3"]')).toBeVisible();
  await page.locator('.cal_day:not([disabled])').first().click();
  const slots = await page.locator('.slot').allTextContents();
  // Outdoor showroom opens 10:00–14:00: last start must be 13:00
  expect(slots.at(-1), 'slots follow outdoor showroom hours').toBe('13:00');
  await page.locator('.slot:not([disabled])').first().click();
  await stateShot(page, testInfo, 'S12-3-datetime');
  await page.click('[data-next]'); await page.waitForTimeout(800);
  await page.fill('#b-name', 'QA Test'); await page.fill('#b-email', 'qa@example.com'); await page.fill('#b-phone', '+34 600 000 000');
  await page.click('[data-next]');
  await expect(page.locator('[data-err="4"]'), 'consent required').toBeVisible();
  await page.click('label.chip-wide:has(input[name=consent])');
  await page.click('[data-next]'); await page.waitForTimeout(800);
  const review = await page.locator('[data-review]').textContent();
  expect(review).toContain('República Checa');
  expect(review).toContain('Motorisation');
  await stateShot(page, testInfo, 'S12-5-review');
  await page.click('[data-next]'); await page.waitForTimeout(1200);
  await expect(page.locator('[data-done]')).toBeVisible();
  await stateShot(page, testInfo, 'S12-done');
  // inputs must be ≥16px to avoid iOS focus zoom
  const fs = await page.evaluate(() => Math.min(...[...document.querySelectorAll('.booking input:not([type=radio]):not([type=checkbox]):not([type=file]), .booking textarea')].map((i) => parseFloat(getComputedStyle(i).fontSize))));
  expect(fs, 'form input font-size ≥16px (iOS zoom)').toBeGreaterThanOrEqual(16);
});

test('S12 summary placement per breakpoint', async ({ page }, testInfo) => {
  await open(page, '/contact.html');
  const r = await page.evaluate(() => {
    const f = document.querySelector('.booking_form').getBoundingClientRect();
    const s = document.querySelector('.booking_summary').getBoundingClientRect();
    return { summaryAbove: s.bottom <= f.top + 1, side: s.left >= f.right - 1 };
  });
  if (testInfo.project.name.includes('phone')) expect(r.summaryAbove, 'summary above form on phones').toBe(true);
  else expect(r.side, 'summary beside form').toBe(true);
});
