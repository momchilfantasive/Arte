import { gsap, SplitText } from '../core.js';

// Services tabs: image wipes in, title lines rise, list marker moves; autoplays until touched
export function initTabs(container) {
  const root = container.querySelector('[data-tabs]');
  if (!root) return;
  const triggers = [...root.querySelectorAll('[data-tab-trigger]')];
  const panels = [...root.querySelectorAll('[data-tab-content]')];
  const images = [...root.querySelectorAll('[data-tab-img]')];
  let current = -1;
  let timer;

  const show = (i) => {
    if (i === current) return;
    const prev = current;
    current = i;
    triggers.forEach((t, k) => {
      t.classList.toggle('is-active', k === i);
      t.setAttribute('aria-selected', k === i);
    });

    // image: new one wipes up over the old one
    images.forEach((img, k) => (img.style.zIndex = k === i ? 2 : k === prev ? 1 : 0));
    gsap.fromTo(images[i], { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'arte' });
    gsap.fromTo(images[i].querySelector('img'), { scale: 1.2 }, { scale: 1, duration: 1.6 });

    // text
    if (prev > -1) panels[prev].classList.remove('is-active');
    const panel = panels[i];
    panel.classList.add('is-active');
    const title = panel.querySelector('.h1');
    const split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    gsap.from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.08, onComplete: () => split.revert() });
    gsap.from(panel.querySelector('.p1'), { opacity: 0, y: 12, duration: 1, delay: 0.2 });
  };

  const autoplay = () => {
    clearInterval(timer);
    timer = setInterval(() => show((current + 1) % triggers.length), 6000);
  };

  triggers.forEach((t, i) =>
    t.addEventListener('click', () => {
      show(i);
      clearInterval(timer);
    })
  );
  show(0);
  autoplay();
  return () => clearInterval(timer);
}
