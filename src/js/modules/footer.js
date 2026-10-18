import { gsap, lenis, isTouch } from '../core.js';

export function initFooter(container) {
  // Mark current page in the footer nav
  const page = (p) => p.split('/').pop() || 'index.html';
  const path = page(location.pathname);
  container.querySelectorAll('[data-nav-link]').forEach((a) => {
    const href = page(new URL(a.href).pathname);
    a.classList.toggle('is-current', href === path || (path === 'outdoor.html' && href === 'curtains.html') || (path === 'villa-albinoni.html' && href === 'projects.html'));
  });

  container.querySelector('[data-scroll-top]')?.addEventListener('click', () => lenis.scrollTo(0, { duration: 2 }));

  const logo = container.querySelector('[data-footer-logo]');
  if (!logo) return;

  // Giant wordmark rises from below
  gsap.from(logo.querySelectorAll('svg'), {
    yPercent: 60, duration: 1.8, ease: 'arte',
    scrollTrigger: { trigger: logo, start: 'top 95%', once: true },
  });

  // Cursor "torch" reveals a brighter copy of the wordmark
  if (isTouch) return;
  const mask = logo.querySelector('.is-mask');
  const pos = { x: -500, y: -500 };
  const setX = gsap.quickTo(pos, 'x', { duration: 0.6, onUpdate: () => mask.style.setProperty('--mx', `${pos.x}px`) });
  const setY = gsap.quickTo(pos, 'y', { duration: 0.6, onUpdate: () => mask.style.setProperty('--my', `${pos.y}px`) });
  const onMove = (e) => {
    const r = mask.getBoundingClientRect();
    setX(e.clientX - r.left);
    setY(e.clientY - r.top);
  };
  window.addEventListener('mousemove', onMove);
  return () => window.removeEventListener('mousemove', onMove);
}
