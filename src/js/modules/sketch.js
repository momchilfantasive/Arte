import { gsap } from '../core.js';

// Procedural architectural line drawing (elevation of a cantilevered house),
// drawn stroke-by-stroke as the section scrolls. Replace with your own SVG:
// any <path> inside [data-sketch] will be animated the same way.
function buildSketch(variant) {
  const W = 1440, H = 700, ground = 600;
  const p = [];
  const hatch = [];
  const line = (x1, y1, x2, y2) => `M${x1} ${y1}L${x2} ${y2}`;
  const rect = (x, y, w, h) => `M${x} ${y}h${w}v${h}h${-w}Z`;

  p.push(line(40, ground, W - 40, ground)); // ground
  // three slabs, stepping back and cantilevering
  const slabs = [
    { x: 360, w: 900, y: 470, h: 130 },
    { x: 300, w: 820, y: 330, h: 120 },
    { x: 480, w: 620, y: 210, h: 100 },
  ];
  slabs.forEach(({ x, w, y, h }) => {
    p.push(rect(x - 40, y - 14, w + 80, 14)); // roof plate
    p.push(rect(x, y, w, h)); // glazing band
    for (let mx = x + 40; mx < x + w; mx += 46) p.push(line(mx, y + 10, mx, y + h)); // mullions
    for (let hy = y - 12; hy < y; hy += 4) hatch.push(line(x - 36, hy, x + w + 36, hy)); // slab shading
  });
  // columns and stairs
  [420, 760, 1100].forEach((cx) => p.push(line(cx, 470, cx, ground)));
  for (let s = 0; s < 6; s++) p.push(line(620 - s * 14, ground - s * 10, 820 + s * 14, ground - s * 10));
  // louvres on the top floor
  for (let lx = 500; lx < 1080; lx += 12) hatch.push(line(lx, 196, lx, 210));
  // pool
  p.push(rect(200, ground + 20, 760, 28));
  for (let wx = 210; wx < 950; wx += 36) hatch.push(`M${wx} ${ground + 34}q9 -5 18 0`);
  // loose trees / planting
  const tree = (cx, cy, r) => {
    let d = `M${cx} ${ground}L${cx} ${cy + r}`;
    for (let a = 0; a < Math.PI * 2; a += 0.35) {
      const rr = r * (0.75 + 0.25 * Math.sin(a * 5));
      d += `${a === 0 ? 'M' : 'L'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
    }
    return d + 'Z';
  };
  p.push(tree(150, 420, 70), tree(1330, 380, 90), tree(1220, 470, 50));
  if (variant === 'outdoor') {
    // terrace awnings: sloped fabric with front bar and folding arms
    [[380, 470, 300], [720, 470, 300], [520, 330, 260]].forEach(([x, y, w]) => {
      p.push(`M${x} ${y - 6}L${x - 30} ${y + 60}L${x + w + 30} ${y + 60}L${x + w} ${y - 6}`);
      p.push(line(x - 30, y + 60, x - 30, y + 72), line(x + w + 30, y + 60, x + w + 30, y + 72));
      for (let fx = x; fx < x + w; fx += 18) hatch.push(line(fx, y - 4, fx - 22 + ((fx - x) / w) * 44, y + 58));
    });
    // pergola on the lawn
    p.push(rect(980, 520, 240, 8), line(990, 528, 990, ground), line(1210, 528, 1210, ground));
    for (let lx = 990; lx <= 1210; lx += 20) hatch.push(line(lx, 520, lx, 528));
  }
  for (let bx = 60; bx < W - 60; bx += 30) hatch.push(`M${bx} ${ground}q10 -14 20 0`);

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
    ${p.map((d) => `<path d="${d}"/>`).join('')}
    ${hatch.map((d) => `<path class="hatch" d="${d}"/>`).join('')}
  </svg>`;
}

export function initSketch(container) {
  const el = container.querySelector('[data-sketch]');
  if (!el) return;
  if (!el.querySelector('svg')) el.innerHTML = buildSketch(el.dataset.sketchVariant);
  const paths = el.querySelectorAll('path');
  paths.forEach((path) => path.setAttribute('pathLength', 1));
  gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.to(paths, {
    strokeDashoffset: 0,
    ease: 'none',
    stagger: { each: 0.02, from: 'start' },
    scrollTrigger: { trigger: el.closest('[data-arch]') || el, start: 'top 75%', end: 'bottom 70%', scrub: 1 },
  });
}
