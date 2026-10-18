import { gsap, ScrollTrigger, reducedMotion } from '../core.js';

// Accordion: one open at a time, height animated, aria-expanded kept in sync
export function initAccordion(container) {
  container.querySelectorAll('[data-accordion]').forEach((root) => {
    const buttons = [...root.querySelectorAll('[data-accordion-btn]')];
    const panelOf = (btn) => btn.closest('.accordion_item').querySelector('[data-accordion-panel]');

    const toggle = (btn, open) => {
      const panel = panelOf(btn);
      btn.setAttribute('aria-expanded', open);
      btn.closest('.accordion_item').classList.toggle('is-open', open);
      if (open) panel.hidden = false;
      if (reducedMotion) {
        panel.hidden = !open;
        return ScrollTrigger.refresh();
      }
      gsap.fromTo(panel, { height: open ? 0 : panel.offsetHeight }, {
        height: open ? 'auto' : 0, duration: 0.7, ease: 'arte',
        onComplete: () => {
          if (!open) panel.hidden = true;
          gsap.set(panel, { clearProps: 'height' });
          ScrollTrigger.refresh();
        },
      });
    };

    buttons.forEach((btn) => {
      const panel = panelOf(btn);
      panel.id ||= `acc-${Math.random().toString(36).slice(2, 8)}`;
      btn.setAttribute('aria-controls', panel.id);
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') !== 'true';
        buttons.forEach((b) => b !== btn && b.getAttribute('aria-expanded') === 'true' && toggle(b, false));
        toggle(btn, open);
      });
    });
    if (buttons[0]) toggle(buttons[0], true);
  });
}
