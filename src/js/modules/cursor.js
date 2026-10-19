import { gsap, isTouch, reducedMotion } from '../core.js';

// 1) Floating tip: a frosted circle follows the pointer and shows the label
//    of any element with data-tip="…" (event delegation, survives page swaps)
function initFloatingTip() {
  const tip = document.querySelector('[data-floating-tip]');
  if (!tip) return;
  const circle = tip.querySelector('.floating-tip_circle');
  const label = tip.querySelector('[data-floating-tip-label]');
  const xTo = gsap.quickTo(tip, 'x', { duration: 0.5, ease: 'power3' });
  const yTo = gsap.quickTo(tip, 'y', { duration: 0.5, ease: 'power3' });
  let active = null;

  window.addEventListener('mousemove', (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
    const target = e.target.closest?.('[data-tip]');
    if (target === active) return;
    active = target;
    if (target) {
      label.textContent = target.dataset.tip;
      gsap.to(circle, { scale: 1, duration: 0.6, ease: 'arte.out' });
    } else {
      gsap.to(circle, { scale: 0, duration: 0.4, ease: 'power2.in' });
    }
  });
  document.addEventListener('page:change', () => {
    active = null;
    gsap.to(circle, { scale: 0, duration: 0.3 });
  });
}

// 2) Soft light trail on a full-screen canvas (cheap 2D take on a fluid cursor)
function initFluidCursor() {
  const canvas = document.querySelector('[data-fluid-cursor]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio, 2);
  const points = [];
  const resize = () => {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  let last = null;
  window.addEventListener('mousemove', (e) => {
    const p = { x: e.clientX, y: e.clientY };
    const speed = last ? Math.hypot(p.x - last.x, p.y - last.y) : 0;
    last = p;
    points.push({ ...p, r: 40 + Math.min(speed, 80), life: 1 });
    if (points.length > 60) points.shift();
  });

  gsap.ticker.add(() => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = points.length - 1; i >= 0; i--) {
      const p = points[i];
      p.life -= 0.025;
      p.r *= 1.015;
      if (p.life <= 0) {
        points.splice(i, 1);
        continue;
      }
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(150, 220, 225, ${0.12 * p.life})`);
      g.addColorStop(1, 'rgba(150, 220, 225, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

export function initCursor() {
  if (isTouch) return;
  initFloatingTip();
  if (!reducedMotion) initFluidCursor();
}
