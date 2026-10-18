import { ScrollTrigger } from '../core.js';

const header = () => document.querySelector('[data-header]');

// Live clock in a configurable time zone (data-tz on the element)
function initClock() {
  const el = document.querySelector('[data-clock]');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: el.dataset.tz || undefined });
  const tick = () => (el.textContent = fmt.format(new Date()));
  tick();
  setInterval(tick, 10_000);
}

export function initHeader() {
  initClock();
}

// Per page: header text colour follows the section currently under it
export function initHeaderTheme(container) {
  const h = header();
  const sections = container.querySelectorAll('[data-bg]');
  const set = (bg) => h && (h.dataset.theme = bg === 'light' ? 'light' : 'dark');
  set(sections[0]?.dataset.bg);
  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: () => `top ${h.offsetHeight / 2}`,
      end: () => `bottom ${h.offsetHeight / 2}`,
      onToggle: ({ isActive }) => isActive && set(section.dataset.bg),
    });
  });
}
