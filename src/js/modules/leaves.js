import { gsap, reducedMotion } from '../core.js';

// Procedural "leaf shadow" overlay: blurred elongated shapes that sway slowly.
// To use a real shadow video instead, put a <video> inside [data-leaves].
export function initLeaves(container) {
  container.querySelectorAll('[data-leaves]').forEach((el) => {
    if (el.children.length) return;
    const rand = gsap.utils.random;
    for (let i = 0; i < 14; i++) {
      const leaf = document.createElement('i');
      gsap.set(leaf, {
        left: `${rand(0, 100)}%`, top: `${rand(-10, 90)}%`,
        width: `${rand(6, 18)}rem`, height: `${rand(1.2, 3)}rem`,
        rotation: rand(-50, -20), opacity: rand(0.4, 1),
      });
      el.appendChild(leaf);
      if (!reducedMotion) {
        gsap.to(leaf, {
          x: rand(-30, 30), y: rand(-20, 20), rotation: `+=${rand(-8, 8)}`,
          duration: rand(4, 7), ease: 'sine.inOut', repeat: -1, yoyo: true,
        });
      }
    }
  });
}
