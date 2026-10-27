import { gsap, ScrollTrigger, isTouch, reducedMotion } from '../core.js';

// Portrait reels: staggered parallax; video plays on hover (desktop) or while
// mostly in view (touch devices), and rests on its poster otherwise.
export function initReels(container) {
  const cleanups = [];

  // Section videos: play muted while in view, rest on the poster otherwise (and always under reduced motion).
  // An optional [data-video-toggle] button in the same section pauses/plays it; a manual pause sticks.
  container.querySelectorAll('video[data-inview-play]').forEach((video) => {
    const toggle = video.closest('section')?.querySelector('[data-video-toggle]');
    let userPaused = reducedMotion;
    const sync = () => {
      if (!toggle) return;
      toggle.textContent = video.paused ? 'Play video' : 'Pause video';
    };
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    sync();
    toggle?.addEventListener('click', () => {
      userPaused = !video.paused;
      if (userPaused) video.pause(); else video.play?.().catch(() => {});
    });
    const st = ScrollTrigger.create({
      trigger: video, start: 'top bottom', end: 'bottom top',
      onToggle: ({ isActive }) => (isActive && !userPaused ? video.play?.().catch(() => {}) : video.pause()),
    });
    cleanups.push(() => st.kill());
  });

  const reels = container.querySelectorAll('[data-reel]');
  if (!reels.length) return () => cleanups.forEach((fn) => fn());

  reels.forEach((reel) => {
    const video = reel.querySelector('video');
    const play = () => video.play?.().catch(() => {});
    const pause = () => video.pause();

    if (!reducedMotion) {
      gsap.fromTo(reel, { yPercent: Number(reel.dataset.speed) || 0 }, {
        yPercent: -(Number(reel.dataset.speed) || 0), ease: 'none',
        scrollTrigger: { trigger: reel, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      });
    }

    if (isTouch) {
      const st = ScrollTrigger.create({
        trigger: reel, start: 'top 70%', end: 'bottom 30%',
        onToggle: ({ isActive }) => (isActive ? play() : pause()),
      });
      cleanups.push(() => st.kill());
    } else {
      reel.addEventListener('mouseenter', play);
      reel.addEventListener('mouseleave', pause);
      cleanups.push(() => {
        reel.removeEventListener('mouseenter', play);
        reel.removeEventListener('mouseleave', pause);
      });
    }
  });
  return () => cleanups.forEach((fn) => fn());
}
