import { gsap } from '../core.js';

const KEY = 'arte:cookies';
const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const write = (v) => { try { localStorage.setItem(KEY, v); } catch { /* storage unavailable */ } };

export function initCookies() {
  const el = document.querySelector('[data-cookies]');
  if (!el || read()) return el?.remove();
  el.classList.add('is-visible');
  // rises and fades in place (it sits above the HUD lane, so it never slides across it)
  gsap.from(el, { yPercent: 40, opacity: 0, duration: 1.2, delay: 5, ease: 'arte' });
  el.querySelectorAll('[data-cookies-btn]').forEach((btn) =>
    btn.addEventListener('click', () => {
      write(btn.dataset.cookiesBtn);
      gsap.to(el, { yPercent: 40, opacity: 0, duration: 0.6, ease: 'arte', onComplete: () => el.remove() });
    })
  );
}
