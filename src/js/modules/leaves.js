import { gsap, ScrollTrigger, reducedMotion } from '../core.js';

// Palm-frond shadow overlay, drawn procedurally (original artwork, no image asset).
// Each frond is its own softly blurred SVG layer anchored at its stem, so the breeze
// only changes transforms (cheap to composite): a slow sway per frond, a gentle
// breathing of length, and an occasional gust that leans the whole canopy.

// Seeded random so each section always gets the same composition
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// One frond with its base at (0,0): a bending rib with tapered leaflets on both sides.
function frondPath(r, { len = 1000, angle = 200, bend = 0.18, count = 24 } = {}) {
  const a = (angle * Math.PI) / 180;
  const dir = [Math.cos(a), Math.sin(a)];
  const nrm = [-dir[1], dir[0]];
  const at = (t) => [dir[0] * len * t + nrm[0] * bend * len * t * t, dir[1] * len * t + nrm[1] * bend * len * t * t];
  const tangent = (t) => { const d = [dir[0] + nrm[0] * 2 * bend * t, dir[1] + nrm[1] * 2 * bend * t]; const m = Math.hypot(...d); return [d[0] / m, d[1] / m]; };
  const pts = [];
  const f = (n) => n.toFixed(1);
  let d = '';
  // rib
  const w0 = len * 0.012;
  const ribL = [], ribR = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20; const [x, y] = at(t); const [tx, ty] = tangent(t); const w = w0 * (1 - t * 0.85);
    ribL.push([x - ty * w, y + tx * w]); ribR.push([x + ty * w, y - tx * w]); pts.push([x, y]);
  }
  d += `M${ribL.map((p) => p.map(f).join(' ')).join('L')}L${ribR.reverse().map((p) => p.map(f).join(' ')).join('L')}Z`;
  // leaflets
  for (let i = 0; i < count; i++) {
    const t = 0.1 + (0.9 * i) / count + (r() - 0.5) * 0.012;
    const [x, y] = at(t); const [tx, ty] = tangent(t);
    const L = len * 0.42 * Math.sin(Math.PI * (0.16 + t * 0.8)) * (0.85 + r() * 0.3);
    for (const side of [-1, 1]) {
      const spread = ((58 - t * 26 + (r() - 0.5) * 12) * Math.PI) / 180;    // angle from the rib
      const droop = 0.18 + r() * 0.12;                                         // leaflets hang a little
      const ca = Math.cos(spread), sa = Math.sin(spread) * side;
      const ux = tx * ca - ty * sa, uy = tx * sa + ty * ca;                    // leaflet direction
      const px = -uy * side, py = ux * side;                                   // its normal (towards droop)
      const tip = [x + ux * L + px * L * droop * 0.5, y + uy * L + py * L * droop * 0.5];
      const mid = [x + ux * L * 0.5 + px * L * droop * 0.25, y + uy * L * 0.5 + py * L * droop * 0.25];
      const w = L * (0.032 + r() * 0.016);
      const nx = -uy, ny = ux;
      d += `M${f(x)} ${f(y)}Q${f(mid[0] + nx * w)} ${f(mid[1] + ny * w)} ${f(tip[0])} ${f(tip[1])}Q${f(mid[0] - nx * w)} ${f(mid[1] - ny * w)} ${f(x)} ${f(y)}Z`;
      pts.push(tip);
    }
  }
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const pad = len * 0.04;
  return { d, box: [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + pad * 2, Math.max(...ys) - Math.min(...ys) + pad * 2] };
}

// Composition: 2–3 fronds entering from a top corner, crossing towards the opposite side
function compose(seed) {
  const r = rng(seed);
  const fromRight = r() < 0.6;
  const base = fromRight ? 360 : 0;
  return Array.from({ length: 2 + (r() < 0.5 ? 1 : 0) }, (_, i) => ({
    x: fromRight ? 92 + r() * 14 : -6 + r() * 14,                   // stem position, % of section
    y: -8 + r() * 30,
    width: 62 + r() * 30,                                           // frond size, % of section width
    angle: fromRight ? 148 + i * 18 + r() * 10 : base + 32 - i * 18 - r() * 10,
    bend: (fromRight ? -1 : 1) * (0.1 + r() * 0.14),
    blur: 6 + r() * 8,
    opacity: 0.6 + r() * 0.4,
    seed: Math.floor(r() * 1e6) + 1,
  }));
}

export function initLeaves(container) {
  container.querySelectorAll('[data-leaves]').forEach((el, n) => {
    if (el.children.length) return;
    const seed = 7919 * (n + 1) + [...(el.closest('section')?.className || '')].reduce((s, c) => s + c.charCodeAt(0), 0);
    const fronds = compose(seed).map((c) => {
      const { d, box } = frondPath(rng(c.seed), { angle: c.angle, bend: c.bend });
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', box.map((v) => v.toFixed(1)).join(' '));
      svg.setAttribute('class', 'frond');
      svg.innerHTML = `<path d="${d}"/>`;
      const ox = -box[0] / box[2], oy = -box[1] / box[3];   // stem position inside the svg (0–1)
      const hw = box[3] / box[2];
      Object.assign(svg.style, {
        width: `${c.width}cqw`,
        left: `calc(${c.x}cqw - ${(ox * c.width).toFixed(2)}cqw)`,
        top: `calc(${c.y}cqh - ${(oy * hw * c.width).toFixed(2)}cqw)`,
        transformOrigin: `${(ox * 100).toFixed(1)}% ${(oy * 100).toFixed(1)}%`,
        filter: `blur(${c.blur.toFixed(1)}px)`,
        opacity: c.opacity.toFixed(2),
      });
      el.appendChild(svg);
      return svg;
    });
    if (reducedMotion) return;

    const rand = gsap.utils.random;
    const tweens = fronds.flatMap((f) => [
      gsap.to(f, { rotation: rand(1.2, 2.6) * (Math.random() < 0.5 ? -1 : 1), duration: rand(3.5, 6), ease: 'sine.inOut', repeat: -1, yoyo: true, delay: rand(0, 2) }),
      gsap.to(f, { scale: rand(0.985, 1.02), duration: rand(2.2, 3.4), ease: 'sine.inOut', repeat: -1, yoyo: true }),
    ]);
    tweens.push(gsap.timeline({ repeat: -1, repeatRefresh: true, delay: rand(1, 4) })
      .to(el, { rotation: () => rand(-1.6, -0.8), xPercent: () => rand(0.6, 1.4), duration: () => rand(1.4, 2), ease: 'sine.inOut' })
      .to(el, { rotation: 0, xPercent: 0, duration: () => rand(2.6, 3.6), ease: 'sine.inOut' })
      .to({}, { duration: () => rand(4, 9) }));

    // only animate while the section is on screen
    ScrollTrigger.create({
      trigger: el.parentElement, start: 'top bottom', end: 'bottom top',
      onToggle: ({ isActive }) => tweens.forEach((t) => (isActive ? t.resume() : t.pause())),
    });
    if (!ScrollTrigger.isInViewport(el.parentElement)) tweens.forEach((t) => t.pause());
  });
}
