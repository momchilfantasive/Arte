import { gsap, Flip, lenis, reducedMotion } from '../core.js';

// Resolves when every <img> on the page has loaded (or failed)
const imagesLoaded = () =>
  Promise.all(
    [...document.images].map((img) =>
      img.complete ? Promise.resolve() : new Promise((r) => img.addEventListener('load', r, { once: true }) || img.addEventListener('error', r, { once: true }))
    )
  );

export function runPreloader() {
  const el = document.querySelector('[data-preloader]');
  if (!el) return Promise.resolve();
  if (reducedMotion) return quickPreloader(el);

  lenis.stop();
  const title = el.querySelector('[data-pl-title]');
  const words = el.querySelectorAll('[data-pl-word]');
  const inner = el.querySelectorAll('[data-pl-word] > span');
  const percent = el.querySelector('[data-pl-percent]');
  const bar = el.querySelector('[data-pl-bar]');
  const imgWrap = el.querySelector('[data-pl-img]');
  // The thumbnail is a scaled-down copy of the page's hero layer (same media, same crop,
  // same shading). At the end it simply scales back to 1:1, so the hand-off is seamless.
  const heroBg = document.querySelector('[data-barba="container"] [data-hero-bg]');
  const layer = heroBg ? buildLayer(heroBg) : null;
  if (layer) {
    imgWrap.style.visibility = 'hidden';
    el.appendChild(layer);
  }
  const progress = { v: 0 };

  return new Promise((resolve) => {
    const tl = gsap.timeline({ defaults: { ease: 'arte' } });

    tl.to(el.querySelectorAll('[data-pl-line]'), { scaleY: 1, duration: 1.4, stagger: 0.1 })
      .to(el.querySelector('[data-pl-logo]'), { opacity: 1, duration: 1 }, 0.3)
      .to(inner, { y: 0, duration: 1.2, stagger: 0.08, ease: 'arte.out' }, 0.5)
      .to(el.querySelectorAll('[data-pl-fade]'), { opacity: 1, duration: 0.8, stagger: 0.1 }, 0.8)
      // Loading counter: first 80% on a timer, the rest once images are in
      .to(progress, {
        v: 80, duration: 2, ease: 'power1.inOut',
        onUpdate: () => {
          percent.textContent = String(Math.round(progress.v)).padStart(2, '0') + '%';
          bar.style.transform = `scaleX(${progress.v / 100})`;
        },
      }, 0.8)
      .add(() => {
        tl.pause();
        imagesLoaded().then(() => tl.resume());
      })
      .to(progress, {
        v: 100, duration: 0.6, ease: 'power2.out',
        onUpdate: () => {
          percent.textContent = String(Math.round(progress.v)).padStart(2, '0') + '%';
          bar.style.transform = `scaleX(${progress.v / 100})`;
        },
      })
      // Words drift apart across the grid (FLIP), image opens in the centre
      .add(() => {
        const state = Flip.getState(words);
        title.classList.add('is-spread');
        Flip.from(state, { duration: 1.4, ease: 'arte' });
      })
      .add(() => (layer ? placeThumb() : null), '+=0.4')
      .to(layer || imgWrap, { clipPath: 'inset(0% 0%)', duration: 1.2 })
      .to(layer ? layer.querySelector('.img') : imgWrap.querySelector('img'), { scale: 1, duration: 1.6, startAt: { scale: 1.3 } }, '<')
      .add(() => (layer ? growIntoHero() : wipeUp()), '+=0.3');

    // Shrink the full-screen layer onto the thumbnail slot, keeping the viewport's proportions
    function placeThumb() {
      const r = imgWrap.getBoundingClientRect();
      const s = r.width / window.innerWidth;
      gsap.set(layer, {
        x: r.left + r.width / 2 - window.innerWidth / 2,
        y: r.top + r.height / 2 - window.innerHeight / 2,
        scale: s, clipPath: 'inset(0% 50%)', visibility: 'visible',
      });
    }

    function growIntoHero() {
      const shades = layer.querySelectorAll('.hero_shade, .grad-top, .grad-bot');
      gsap.timeline({ defaults: { ease: 'arte' } })
        .to(el.querySelectorAll('[data-pl-word], [data-pl-fade], [data-pl-logo], [data-pl-line], .preloader_bar'), { opacity: 0, duration: 0.6, ease: 'power2.out' }, 0)
        .to(layer, { x: 0, y: 0, scale: 1, duration: 1.6 }, 0.1)
        .fromTo(shades, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'power1.inOut' }, 0.2)
        .add(() => {
          syncVideo();
          resolve();
          lenis.start();
        }, 1.6)
        // the layer now matches the hero pixel for pixel: drop the preloader
        .add(() => el.remove(), 1.75);
    }

    function wipeUp() {
      gsap.timeline()
        .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 1.4, ease: 'arte' })
        .add(() => {
          resolve();
          lenis.start();
        }, 0.3)
        .add(() => el.remove());
    }
  });
}

// Reduced motion: no choreography. Show the static loader briefly, then fade it out
// (images get at most ~1 s; the page lays out fine while the rest finish).
function quickPreloader(el) {
  gsap.set(el.querySelectorAll('[data-pl-line]'), { scaleY: 1 });
  gsap.set(el.querySelectorAll('[data-pl-logo], [data-pl-fade]'), { opacity: 1 });
  gsap.set(el.querySelectorAll('[data-pl-word] > span'), { y: 0 });
  const wait = Promise.race([imagesLoaded(), new Promise((r) => setTimeout(r, 1000))]);
  return wait.then(() => new Promise((resolve) => {
    gsap.to(el, {
      opacity: 0, duration: 0.4, ease: 'power1.out',
      onComplete: () => { el.remove(); resolve(); },
    });
  }));
}

// Full-viewport copy of the hero background (image or video + its shading layers)
function buildLayer(heroBg) {
  const layer = heroBg.cloneNode(true);
  layer.removeAttribute('data-hero-bg');
  layer.className = 'preloader_layer';
  const video = layer.querySelector('video');
  if (video) {
    video.muted = true;
    video.play?.().catch(() => {});
  }
  return layer;
}

// Keep the real hero video in step with the copy that was playing in the preloader
function syncVideo() {
  const copy = document.querySelector('.preloader_layer video');
  const real = document.querySelector('[data-hero-bg] video');
  if (copy && real && copy.currentTime) {
    try { real.currentTime = copy.currentTime; } catch { /* not seekable yet */ }
    real.play?.().catch(() => {});
  }
}

