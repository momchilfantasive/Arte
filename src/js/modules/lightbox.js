import { gsap, lenis, reducedMotion } from '../core.js';

// Gallery lightbox (global markup in shell-bottom). Items come from the current
// page's [data-gallery-list] <li data-src data-caption>; open with [data-gallery-open="index"].
let items = [];
let index = 0;
let lastFocus = null;
const box = () => document.querySelector('[data-lightbox]');
const pad = (n) => String(n).padStart(2, '0');

function render(dir = 0) {
  const el = box();
  const img = el.querySelector('[data-lightbox-img]');
  const item = items[index];
  el.querySelector('[data-lightbox-count]').textContent = `${pad(index + 1)} / ${pad(items.length)}`;
  el.querySelector('[data-lightbox-caption]').textContent = item.caption;
  img.src = item.src;
  img.alt = item.caption;
  if (!reducedMotion) gsap.fromTo(img, { opacity: 0, x: dir * 40 }, { opacity: 1, x: 0, duration: 0.8 });
}

function open(i) {
  const list = document.querySelector('[data-barba="container"] [data-gallery-list]');
  if (!list) return;
  items = [...list.querySelectorAll('li')].map((li) => ({ src: li.dataset.src, caption: li.dataset.caption }));
  index = Math.max(0, Math.min(items.length - 1, i));
  const el = box();
  el.querySelector('[data-lightbox-title]').textContent = list.dataset.galleryTitle || 'Gallery';
  lastFocus = document.activeElement;
  el.classList.add('is-open');
  el.setAttribute('aria-hidden', 'false');
  lenis.stop();
  render();
  gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: reducedMotion ? 0 : 0.9, ease: 'arte' });
  el.querySelector('[data-lightbox-close]').focus();
}

export function closeLightbox() {
  const el = box();
  if (!el?.classList.contains('is-open')) return;
  gsap.to(el, {
    clipPath: 'inset(0 0 100% 0)', duration: reducedMotion ? 0 : 0.7, ease: 'arte',
    onComplete: () => {
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
    },
  });
  lenis.start();
  lastFocus?.focus?.();
}

const step = (d) => {
  index = (index + d + items.length) % items.length;
  render(d);
};

export function initLightbox() {
  const el = box();
  if (!el) return;
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-gallery-open]');
    if (opener) return open(Number(opener.dataset.galleryOpen) || 0);
  });
  el.querySelector('[data-lightbox-close]').addEventListener('click', closeLightbox);
  el.querySelector('[data-lightbox-prev]').addEventListener('click', () => step(-1));
  el.querySelector('[data-lightbox-next]').addEventListener('click', () => step(1));
  document.addEventListener('keydown', (e) => {
    if (!el.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'Tab') {
      // keep focus inside the dialog
      const f = [...el.querySelectorAll('button')];
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
}
