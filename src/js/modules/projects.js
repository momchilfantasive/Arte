import { gsap, ScrollTrigger, lenis } from '../core.js';

// Sticky stacked project cards. Each card holds fully visible for a moment (the CSS
// margin under it), then the next card slides over while this one eases back and dims.
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
    lenis.scrollTo(cards[i], { duration: 1.6 });
  };
  root.querySelector('[data-projects-prev]')?.addEventListener('click', () => go(-1));
  root.querySelector('[data-projects-next]')?.addEventListener('click', () => go(1));

  // Pin each card with GSAP instead of CSS sticky: Safari/iOS lets a sticky card drift
  // away during the dwell gap. Pinned cards stay put until the last card arrives on top.
  const last = cards[cards.length - 1];
  cards.forEach((card, i) => {
    card.style.zIndex = i + 1;
    if (card !== last) {
      ScrollTrigger.create({
        trigger: card, start: 'top top', endTrigger: last, end: 'top top',
        pin: true, pinSpacing: false, anticipatePin: 1,
      });
    }
  });

  cards.forEach((card, i) => {
    const img = card.querySelector('[data-project-img]');
    gsap.fromTo(img, { yPercent: -6 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
    });

    const next = cards[i + 1];
    if (next) {
      // A dimming layer (cheaper and smoother than a CSS filter, esp. on iPad)
      const dim = document.createElement('div');
      dim.className = 'project-card_dim';
      card.querySelector('.project-card_img').after(dim);

      gsap.timeline({
        scrollTrigger: { trigger: next, start: 'top 85%', end: 'top top', scrub: 0.8 },
        defaults: { ease: 'sine.inOut' },
      })
        .to(card.querySelector('.project-card_img'), { scale: 0.94 }, 0)
        .fromTo(dim, { opacity: 0 }, { opacity: 0.55 }, 0)
        .to(card.querySelector('.project-card_c'), { opacity: 0, y: -40, ease: 'power1.in', duration: 0.6 }, 0);
    }

    ScrollTrigger.create({
      trigger: card,
      start: 'top center',
      end: () => `+=${card.offsetHeight + parseFloat(getComputedStyle(card).marginBottom)}`,
      onToggle: ({ isActive }) => {
        if (!isActive) return;
        active = i;
        if (index) index.textContent = `P${i + 1}`;
      },
    });
  });
}
