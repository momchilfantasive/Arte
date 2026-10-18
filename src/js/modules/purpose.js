import { gsap, mm } from '../core.js';

// Pinned section: three words start together and drift to the edges, image breathes
export function initPurpose(container) {
  const root = container.querySelector('[data-purpose]');
  if (!root) return;
  const words = root.querySelectorAll('[data-purpose-word]');
  const img = root.querySelector('[data-purpose-img]');

  mm.add('(min-width: 768px)', () => {
    const [a, b, c] = words;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: root, start: 'top top', end: '+=120%', scrub: true, pin: true },
    });
    // collapse words to the centre, then release them outward
    tl.from(a, { x: () => root.offsetWidth / 2 - a.offsetLeft - a.offsetWidth, ease: 'none' }, 0)
      .from(c, { x: () => -(c.offsetLeft - root.offsetWidth / 2), ease: 'none' }, 0)
      .from(b, { scale: 0.8, opacity: 0.4, ease: 'none' }, 0)
      .fromTo(img, { scale: 1.2 }, { scale: 1, ease: 'none' }, 0);
  });
  mm.add('(max-width: 767px)', () => {
    gsap.fromTo(img, { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: root, scrub: true } });
  });
}
