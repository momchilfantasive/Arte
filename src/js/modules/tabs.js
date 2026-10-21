import { gsap, SplitText, reducedMotion } from '../core.js';

// Accessible tabs: image wipes in (when there is one image per tab), title lines rise,
// list marker moves. Arrow keys / Home / End move between tabs.
// Add data-tabs-autoplay to cycle until the visitor interacts.
export function initTabs(container) {
  const timers = [];
  container.querySelectorAll('[data-tabs]').forEach((root) => {
    const triggers = [...root.querySelectorAll('[data-tab-trigger]')];
    const panels = [...root.querySelectorAll('[data-tab-content]')];
    const images = [...root.querySelectorAll('[data-tab-img]')];
    const perTabImages = images.length === triggers.length && images.length > 1;
    let current = -1;
    let timer;

    triggers.forEach((t, k) => t.setAttribute('aria-controls', panels[k].id || (panels[k].id = `${t.id}-panel`)));

    const show = (i, { focus = false, animate = true } = {}) => {
      if (i === current) return;
      const prev = current;
      current = i;
      triggers.forEach((t, k) => {
        const on = k === i;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
      });
      if (focus) triggers[i].focus();

      if (perTabImages) {
        images.forEach((img, k) => {
          img.style.zIndex = k === i ? 2 : k === prev ? 1 : 0;
          img.classList.toggle('is-active', k === i);
        });
        if (animate && !reducedMotion) {
          gsap.fromTo(images[i], { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'arte' });
          gsap.fromTo(images[i].querySelector('img'), { scale: 1.2 }, { scale: 1, duration: 1.6 });
        } else gsap.set(images[i], { clipPath: 'inset(0% 0 0 0)' });
      } else if (images[0]) {
        images[0].classList.add('is-active');
      }

      panels.forEach((p, k) => {
        p.classList.toggle('is-active', k === i);
        p.hidden = k !== i;
      });
      if (!animate || reducedMotion) return;
      const panel = panels[i];
      const title = panel.querySelector('.h1');
      const split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
      gsap.from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.08, onComplete: () => split.revert() });
      // only the panel's own blocks: animating the labels inside a button would clip them
      const blocks = panel.querySelectorAll(':scope > .p1, :scope > .l1, :scope > .link-line, :scope > button');
      gsap.killTweensOf(blocks);
      gsap.fromTo(blocks, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1, delay: 0.15, stagger: 0.05, clearProps: 'transform' });
    };

    const stop = () => clearInterval(timer);
    triggers.forEach((t, i) => {
      t.addEventListener('click', () => {
        stop();
        show(i);
      });
      t.addEventListener('keydown', (e) => {
        const n = triggers.length;
        const map = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: n - 1 };
        if (!(e.key in map)) return;
        e.preventDefault();
        stop();
        show((map[e.key] + n) % n, { focus: true });
      });
    });
    root.addEventListener('pointerdown', stop);

    show(0, { animate: false });
    if (root.hasAttribute('data-tabs-autoplay') && !reducedMotion) {
      timer = setInterval(() => show((current + 1) % triggers.length), 7000);
      timers.push(() => clearInterval(timer));
    }
  });
  return () => timers.forEach((fn) => fn());
}
