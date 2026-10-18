import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, Flip);

// House eases — slow, architectural motion
CustomEase.create('arte', '0.65, 0.05, 0, 1');
CustomEase.create('arte.out', '0.16, 1, 0.3, 1');
gsap.defaults({ ease: 'arte.out', duration: 1.2 });

export const isTouch = window.matchMedia('(hover: none)').matches;
export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const mm = gsap.matchMedia();

// Smooth scroll driven by GSAP's ticker so ScrollTrigger stays in sync
export const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

export { gsap, ScrollTrigger, SplitText, Flip };
