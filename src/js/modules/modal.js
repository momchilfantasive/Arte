import { gsap, lenis } from '../core.js';

// Modals: [data-modal-open="name"] opens [data-modal="name"]; [data-modal-close] or Esc closes.
let openModal = null;

function open(name) {
  const modal = document.querySelector(`[data-modal="${name}"]`);
  if (!modal || openModal === modal) return;
  closeModals(true);
  openModal = modal;
  lenis.stop();
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  gsap.timeline()
    .to(modal.querySelector('.modal_over'), { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0)
    .fromTo(modal.querySelector('[data-modal-panel]'), { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'arte' }, 0)
    .from(modal.querySelectorAll('[data-modal-p]'), { opacity: 0, y: 20, duration: 0.9, stagger: 0.05 }, 0.3);
}

export function closeModals(instant = false) {
  const modal = openModal;
  if (!modal) return;
  openModal = null;
  lenis.start();
  const done = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  };
  if (instant) return done();
  gsap.timeline({ onComplete: done })
    .to(modal.querySelector('.modal_over'), { opacity: 0, duration: 0.5 }, 0)
    .to(modal.querySelector('[data-modal-panel]'), { clipPath: 'inset(0 0 100% 0)', duration: 0.8, ease: 'arte' }, 0);
}

export function initModals() {
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-modal-open]');
    if (opener) {
      e.preventDefault();
      return open(opener.dataset.modalOpen);
    }
    if (e.target.closest('[data-menu-open]')) return open('menu');
    if (e.target.closest('[data-modal-close]')) closeModals();
  });
  document.addEventListener('keydown', (e) => e.key === 'Escape' && closeModals());

  // Demo form handler — replace with your endpoint (Formspree, API route, …)
  document.querySelectorAll('[data-form]').forEach((form) =>
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.classList.add('is-sent');
      gsap.from(form.querySelector('[data-form-success]'), { opacity: 0, duration: 0.8 });
    })
  );
}
