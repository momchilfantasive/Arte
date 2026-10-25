import { gsap, SplitText, reducedMotion } from '../core.js';

// Scroll-triggered reveals driven by data attributes:
//   [data-reveal]       – text split into masked lines that rise in
//   [data-reveal-fade]  – soft fade + lift
//   [data-clip-reveal]  – image unveiled bottom → top
//   [data-bg-lines]     – thin diagonal/vertical lines draw in
export function initReveals(container) {
  container.querySelectorAll('[data-reveal]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.4,
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }),
    });
  });

  container.querySelectorAll('[data-reveal-fade]').forEach((el) => {
    gsap.from(el, { opacity: 0, y: 24, duration: 1.4, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });

  container.querySelectorAll('[data-clip-reveal]').forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, {
      clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'arte',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  container.querySelectorAll('[data-bg-lines]').forEach((svg) => {
    const lines = svg.querySelectorAll('line');
    lines.forEach((l) => {
      l.setAttribute('pathLength', 1);
      gsap.set(l, { strokeDasharray: 1, strokeDashoffset: 1 });
    });
    gsap.to(lines, {
      strokeDashoffset: 0, duration: 2.2, stagger: 0.15, ease: 'arte',
      scrollTrigger: { trigger: svg.parentElement, start: 'top 70%', once: true },
    });
  });

  // Outlined logo mark: the contour draws in once, like the lines
  if (reducedMotion) return;
  container.querySelectorAll('[data-bg-logo] path').forEach((path) => {
    path.setAttribute('pathLength', 1);
    gsap.fromTo(path, { strokeDasharray: 1, strokeDashoffset: 1 }, {
      strokeDashoffset: 0, duration: 3, ease: 'arte',
      scrollTrigger: { trigger: path.closest('section'), start: 'top 70%', once: true },
    });
  });
}
