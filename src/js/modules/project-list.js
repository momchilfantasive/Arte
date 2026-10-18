import { gsap, isTouch } from '../core.js';

// Projects index: hovering a row reveals a floating preview that follows the cursor
export function initProjectList(container) {
  const root = container.querySelector('[data-plist]');
  if (!root) return;
  const items = root.querySelectorAll('[data-plist-item]');
  gsap.from(items, {
    opacity: 0, y: 30, duration: 1.2, stagger: 0.08,
    scrollTrigger: { trigger: root, start: 'top 80%', once: true },
  });
  if (isTouch) return;

  const preview = root.querySelector('[data-plist-preview]');
  const img = preview.querySelector('img');
  const xTo = gsap.quickTo(preview, 'x', { duration: 0.7, ease: 'power3' });
  const yTo = gsap.quickTo(preview, 'y', { duration: 0.7, ease: 'power3' });
  const onMove = (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
  };
  window.addEventListener('mousemove', onMove);

  items.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      img.src = item.dataset.img;
      gsap.to(preview, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'arte' });
      gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.2 });
    });
  });
  root.querySelector('.plist_list').addEventListener('mouseleave', () =>
    gsap.to(preview, { clipPath: 'inset(50% 50% 50% 50%)', duration: 0.6, ease: 'arte' })
  );
  return () => window.removeEventListener('mousemove', onMove);
}
