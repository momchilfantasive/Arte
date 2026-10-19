import { gsap, Flip, lenis } from '../core.js';

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

  lenis.stop();
  const title = el.querySelector('[data-pl-title]');
  const words = el.querySelectorAll('[data-pl-word]');
  const inner = el.querySelectorAll('[data-pl-word] > span');
  const percent = el.querySelector('[data-pl-percent]');
  const bar = el.querySelector('[data-pl-bar]');
  const imgWrap = el.querySelector('[data-pl-img]');
  // Use the page's hero image (or video poster) as the thumbnail, so it can grow into it
  const heroMedia = document.querySelector('[data-barba="container"] [data-hero-bg] img, [data-barba="container"] [data-hero-bg] video');
  const heroSrc = heroMedia && (heroMedia.getAttribute('poster') || heroMedia.getAttribute('src'));
  if (heroSrc) imgWrap.querySelector('img').src = heroSrc;
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
      .to(imgWrap, { clipPath: 'inset(0 0%)', duration: 1.2 }, '+=0.5')
      .to(imgWrap.querySelector('img'), { scale: 1, duration: 1.6, startAt: { scale: 1.4 } }, '<')
      .add(() => (heroSrc ? growIntoHero() : wipeUp()), '+=0.3');

    // The thumbnail expands to fill the screen and becomes the hero background
    function growIntoHero() {
      const r = imgWrap.getBoundingClientRect();
      const shade = document.createElement('div');
      shade.className = 'hero_shade';
      shade.style.opacity = 0;
      imgWrap.appendChild(shade);
      gsap.set(imgWrap, { position: 'fixed', top: r.top, left: r.left, width: r.width, height: r.height, margin: 0, zIndex: 2 });
      gsap.timeline({ defaults: { ease: 'arte' } })
        .to(el.querySelectorAll('[data-pl-word], [data-pl-fade], [data-pl-logo], [data-pl-line], .preloader_bar'), { opacity: 0, duration: 0.6, ease: 'power2.out' }, 0)
        .to(imgWrap, { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight, duration: 1.6 }, 0.1)
        .to(shade, { opacity: 1, duration: 1.2 }, 0.5)
        .add(() => {
          resolve();
          lenis.start();
        }, 1.1)
        .to(el, { opacity: 0, duration: 0.5, ease: 'power1.out' }, 1.7)
        .add(() => el.remove());
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
