import { gsap, ScrollTrigger, reducedMotion } from '../core.js';

// Procedural "leaf shadow" overlay: blurred elongated shapes moved by a light breeze.
// Three layers of motion: slow drift per leaf, a quicker flutter per leaf, and an
// occasional soft gust that leans the whole canopy and lets it settle back.
// To use a real shadow video instead, put a <video> inside [data-leaves].
export function initLeaves(container) {
  container.querySelectorAll('[data-leaves]').forEach((el) => {
    if (el.children.length) return;
    const rand = gsap.utils.random;
    const tweens = [];
    for (let i = 0; i < 14; i++) {
      const leaf = document.createElement('i');
      gsap.set(leaf, {
        left: `${rand(0, 100)}%`, top: `${rand(-10, 90)}%`,
        width: `${rand(6, 18)}rem`, height: `${rand(1.2, 3)}rem`,
        rotation: rand(-50, -20), opacity: rand(0.4, 1),
      });
      el.appendChild(leaf);
      if (reducedMotion) continue;
      // drift
      tweens.push(gsap.to(leaf, {
        x: rand(-30, 30), y: rand(-20, 20),
        duration: rand(4, 7), ease: 'sine.inOut', repeat: -1, yoyo: true,
      }));
      // flutter
      tweens.push(gsap.to(leaf, {
        rotation: `+=${rand(3, 7) * (Math.random() < 0.5 ? -1 : 1)}`, scaleX: rand(0.94, 1.04),
        duration: rand(1.4, 2.6), ease: 'sine.inOut', repeat: -1, yoyo: true, delay: rand(0, 2),
      }));
    }
    if (reducedMotion) return;

    // gust: lean, hold briefly, settle; then calm for a random while
    const gust = gsap.timeline({ repeat: -1, repeatRefresh: true, delay: rand(1, 4) })
      .to(el, { xPercent: () => rand(1, 2.2), skewX: () => rand(-2.5, -1), duration: () => rand(1.4, 2), ease: 'sine.inOut' })
      .to(el, { xPercent: 0, skewX: 0, duration: () => rand(2.6, 3.6), ease: 'sine.inOut' })
      .to({}, { duration: () => rand(4, 9) });
    tweens.push(gust);

    // only animate while the section is on screen
    ScrollTrigger.create({
      trigger: el.parentElement, start: 'top bottom', end: 'bottom top',
      onToggle: ({ isActive }) => tweens.forEach((t) => (isActive ? t.resume() : t.pause())),
    });
    if (!ScrollTrigger.isInViewport(el.parentElement)) tweens.forEach((t) => t.pause());
  });
}
