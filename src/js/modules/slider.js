import Swiper from 'swiper';
import { FreeMode, Mousewheel } from 'swiper/modules';
import 'swiper/css';

export function initSlider(container) {
  const instances = [...container.querySelectorAll('[data-swiper]')].map(
    (el) =>
      new Swiper(el, {
        modules: [FreeMode, Mousewheel],
        slidesPerView: 'auto',
        spaceBetween: 16,
        grabCursor: true,
        freeMode: { enabled: true, momentumRatio: 0.6 },
        mousewheel: { forceToAxis: true },
        speed: 900,
      })
  );
  return () => instances.forEach((s) => s.destroy(true, true));
}
