import { gsap } from '../core.js';

// Hero: slow settle on load, then pushes back while the next section covers it
export function initHero(container) {
  const bg = container.querySelector('[data-hero-bg]');
  if (!bg) return;
  const hero = bg.closest('section');
  gsap.fromTo(bg, { scale: 1.25 }, { scale: 1, duration: 3, ease: 'arte.out', delay: 0.2 });
  gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
    .to(bg, { yPercent: 35, ease: 'none' }, 0)
    .to(hero.querySelector('.hero_c'), { yPercent: 40, opacity: 0, ease: 'none' }, 0);
}
