import { gsap } from '../core.js';

const KEY = 'arte:cookies';
const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const write = (v) => { try { localStorage.setItem(KEY, v); } catch { /* storage unavailable */ } };

export function initCookies() {
  const el = document.querySelector('[data-cookies]');
  if (!el || read()) return el?.remove();
  el.classList.add('is-visible');
  gsap.from(el, { yPercent: 120, duration: 1.2, delay: 5, ease: 'arte' });
  el.querySelectorAll('[data-cookies-btn]').forEach((btn) =>
    btn.addEventListener('click', () => {
      write(btn.dataset.cookiesBtn);
      gsap.to(el, { yPercent: 120, duration: 0.9, ease: 'arte', onComplete: () => el.remove() });
    })
  );
}
