import { gsap, ScrollTrigger } from '../core.js';

// Sticky stacked project cards: each card scales back and darkens as the next one slides over it
export function initProjects(container) {
  const root = container.querySelector('[data-projects]');
  if (!root) return;
  const cards = [...root.querySelectorAll('[data-project-card]')];
  const index = root.querySelector('[data-projects-index]');
  const total = root.querySelector('[data-projects-total]');
  if (total) total.textContent = `/ ${String(cards.length).padStart(2, '0')}`;

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
      onToggle: ({ isActive }) => isActive && index && (index.textContent = `P${i + 1}`),
    });
  });
}
