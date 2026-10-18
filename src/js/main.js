import '../css/main.css';
import barba from '@barba/core';
import { gsap, ScrollTrigger, lenis } from './core.js';
import { runPreloader } from './modules/preloader.js';
import { pageIn, transitionLeave, transitionEnter } from './modules/transition.js';
import { initHeader, initHeaderTheme, markNav } from './modules/header.js';
import { initReveals } from './modules/reveal.js';
import { initParallax } from './modules/parallax.js';
import { initHero } from './modules/hero.js';
import { initProjects } from './modules/projects.js';
import { initSketch } from './modules/sketch.js';
import { initPurpose } from './modules/purpose.js';
import { initTabs } from './modules/tabs.js';
import { initLeaves } from './modules/leaves.js';
import { initFooter } from './modules/footer.js';
import { initProjectList } from './modules/project-list.js';
import { initSlider } from './modules/slider.js';
import { initCursor } from './modules/cursor.js';
import { initModals, closeModals } from './modules/modal.js';
import { initCookies } from './modules/cookies.js';
import { initAccordion } from './modules/accordion.js';
import { initLightbox, closeLightbox } from './modules/lightbox.js';
import { initContactForm } from './modules/contact-form.js';

// Each page module receives the Barba container and may return a cleanup fn.
const pageModules = [
  initHeaderTheme, initHero, initReveals, initParallax, initProjects, initSketch,
  initPurpose, initTabs, initLeaves, initFooter, initProjectList, initSlider,
  initAccordion, initContactForm,
];

let ctx;
let cleanups = [];

function initPage(container) {
  markNav(container.dataset.barbaNamespace);
  ctx = gsap.context(() => {
    cleanups = pageModules.map((init) => init(container)).filter(Boolean);
  }, container);
  container.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
  ScrollTrigger.refresh();
}

function destroyPage() {
  cleanups.forEach((fn) => fn());
  cleanups = [];
  ctx?.revert();
}

// Global, once-per-session UI (lives outside the Barba container)
initHeader();
initCursor();
initModals();
initCookies();
initLightbox();

// In-page anchors (#discover, #details…) scroll smoothly through Lenis
const scrollToHash = (hash, immediate = false) => {
  const target = hash && document.querySelector(`[data-barba="container"] ${hash}`);
  if (target) lenis.scrollTo(target, { offset: -48, duration: immediate ? 0 : 1.6, immediate });
};
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  e.preventDefault();
  scrollToHash(a.getAttribute('href'));
});
document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

barba.init({
  preventRunning: true,
  prevent: ({ el }) =>
    el.closest('[data-barba-prevent]') || el.target === '_blank' || /^(#|mailto:|tel:)/.test(el.getAttribute('href') || ''),
  transitions: [
    {
      name: 'overlay',
      once: async ({ next }) => {
        initPage(next.container);
        await runPreloader();
        pageIn(next.container);
        if (location.hash) scrollToHash(location.hash);
      },
      leave: async () => {
        closeModals();
        closeLightbox();
        lenis.stop();
        await transitionLeave();
      },
      afterLeave: ({ current }) => {
        destroyPage();
        current.container.remove();
        lenis.scrollTo(0, { immediate: true, force: true });
      },
      enter: async ({ next }) => {
        initPage(next.container);
        lenis.start();
        await transitionEnter();
        pageIn(next.container);
        if (location.hash) scrollToHash(location.hash);
      },
    },
  ],
});

// Keep current nav state in sync
barba.hooks.after(() => document.dispatchEvent(new CustomEvent('page:change')));
