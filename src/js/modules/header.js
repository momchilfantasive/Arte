import { ScrollTrigger, lenis } from '../core.js';

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

// Hide the header while scrolling down, bring it back on scroll up or near the top
function initAutoHide() {
  const h = header();
  if (!h) return;
  let last = 0;
  lenis.on('scroll', ({ scroll }) => {
    const delta = scroll - last;
    if (Math.abs(delta) < 4) return;
    const menuOpen = document.querySelector('.modal.is-open');
    h.classList.toggle('is-hidden', delta > 0 && scroll > 120 && !menuOpen);
    last = scroll;
  });
  // keyboard users: reveal the header when focus moves into it
  h.addEventListener('focusin', () => h.classList.remove('is-hidden'));
}

export function initHeader() {
  initClock();
  initAutoHide();
}

// Mark the current section in the main nav
const NAV = { home: null, curtains: 'solutions', outdoor: 'solutions', project: 'projects', projects: 'projects', showrooms: 'showrooms', professionals: 'professionals', contact: null };
export function markNav(namespace) {
  document.querySelectorAll('[data-nav]').forEach((a) => {
    const on = a.dataset.nav === NAV[namespace];
    a.classList.toggle('is-current', on);
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
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
