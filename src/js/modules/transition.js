import { gsap, SplitText } from '../core.js';

const overlay = () => document.querySelector('[data-transition]');

export function transitionLeave() {
  const el = overlay();
  return gsap
    .timeline()
    .set(el, { visibility: 'visible', clipPath: 'inset(100% 0 0 0)' })
    .to(el, { clipPath: 'inset(0% 0 0 0)', duration: 0.9, ease: 'arte' })
    .fromTo(el.querySelectorAll('.line-v'), { scaleY: 0 }, { scaleY: 1, duration: 0.9, stagger: 0.06, ease: 'arte' }, 0.2)
    .fromTo(el.querySelector('.transition_logo'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0.45)
    .then();
}

export function transitionEnter() {
  const el = overlay();
  return gsap
    .timeline()
    .to(el.querySelector('.transition_logo'), { opacity: 0, y: -20, duration: 0.5, ease: 'power2.in' })
    .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'arte' }, 0.15)
    .set(el, { visibility: 'hidden' })
    .then();
}

// Intro for the new page's hero (title lines rise, small labels fade in)
export function pageIn(container) {
  const title = container.querySelector('[data-hero-title]');
  const tl = gsap.timeline();
  if (title) {
    gsap.set(title, { visibility: 'visible' });
    const split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    tl.from(split.lines, { yPercent: 110, duration: 1.4, stagger: 0.1, ease: 'arte.out', onComplete: () => split.revert() });
  }
  tl.from(container.querySelectorAll('[data-hero-fade]'), { opacity: 0, y: 12, duration: 1, stagger: 0.1 }, 0.3);
  tl.from(document.querySelectorAll('.header_nav .nav-item, .header_logo, .header_cta > *, .header_menu'), {
    opacity: 0, y: -10, duration: 0.9, stagger: 0.05, clearProps: 'all',
  }, 0.1);
  return tl;
}
