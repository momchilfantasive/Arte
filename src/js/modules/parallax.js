import { gsap } from '../core.js';

export function initParallax(container) {
  // Image drifts inside its frame
  container.querySelectorAll('[data-parallax-img]').forEach((frame) => {
    const img = frame.querySelector('img');
    gsap.set(img, { scale: 1.15 });
    gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: frame, scrub: true } });
  });

  container.querySelectorAll('[data-parallax-inner]').forEach((img) => {
    gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: img.parentElement, scrub: true } });
  });

  // Full-bleed background moves slower than the section
  container.querySelectorAll('[data-parallax-bg]').forEach((bg) => {
    gsap.fromTo(bg, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: bg.parentElement, scrub: true } });
  });
}
