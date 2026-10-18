import { gsap, ScrollTrigger, lenis } from '../core.js';

// Sticky stacked project cards: each card scales back and darkens as the next one slides over it
export function initProjects(container) {
  const root = container.querySelector('[data-projects]');
  if (!root) return;
  const cards = [...root.querySelectorAll('[data-project-card]')];
  const index = root.querySelector('[data-projects-index]');
  const total = root.querySelector('[data-projects-total]');
  if (total) total.textContent = `/ ${String(cards.length).padStart(2, '0')}`;
  let active = 0;

  // Previous / Next buttons jump between the stacked cards
  const go = (d) => {
    const i = Math.max(0, Math.min(cards.length - 1, active + d));
    const top = root.getBoundingClientRect().top + window.scrollY + i * window.innerHeight;
    lenis.scrollTo(top, { duration: 1.4 });
  };
  root.querySelector('[data-projects-prev]')?.addEventListener('click', () => go(-1));
  root.querySelector('[data-projects-next]')?.addEventListener('click', () => go(1));

  cards.forEach((card, i) => {
    const img = card.querySelector('[data-project-img]');
    gsap.fromTo(img, { yPercent: -8 }, {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
    });

    const next = cards[i + 1];
    if (next) {
      gsap.to(card.querySelector('.project-card_img'), {
        scale: 0.9, filter: 'brightness(0.4)', ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true },
      });
      gsap.to(card.querySelector('.project-card_c'), {
        opacity: 0, yPercent: -40, ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 40%', scrub: true },
      });
    }

    ScrollTrigger.create({
      trigger: card,
      start: 'top center',
      end: 'bottom center',
      onToggle: ({ isActive }) => {
        if (!isActive) return;
        active = i;
        if (index) index.textContent = `P${i + 1}`;
      },
    });
  });
}
