import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
export function usePortfolioMotion(ref: RefObject<HTMLElement>, enabled: boolean) {
  useEffect(() => {
    const main = ref.current;
    if (!main || !enabled) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.comic-eyebrow', { y: 12, opacity: 0, duration: .5 })
        .from('.comic-hero-title', { y: 34, opacity: 0, duration: .8 }, '-=.3')
        .from('.comic-intro, .comic-hero-actions, .comic-hero-socials', { y: 18, opacity: 0, duration: .6, stagger: .12 }, '-=.4')
        .from('.comic-portrait', { x: 32, opacity: 0, rotation: 6, duration: 1 }, '-=.7');
    }, main);
    const revealed = new WeakSet<Element>();
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).map(entry => entry.target);
      visible.forEach(el => { observer.unobserve(el); revealed.add(el); });
      if (visible.length) ctx.add(() => { gsap.fromTo(visible, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .075, ease: 'power2.out', clearProps: 'opacity,transform' }); });
    }, { threshold: .12, rootMargin: '0px 0px -25px 0px' });
    const observe = () => main.querySelectorAll('.comic-stat, .comic-principle, .comic-project, #stack .miles-card, .writing-story, .comic-section-heading, .graph-heading').forEach(el => { if (!revealed.has(el)) observer.observe(el); });
    observe();
    const mutations = new MutationObserver(observe);
    mutations.observe(main, { childList: true, subtree: true });
    const hero = main.querySelector<HTMLElement>('.comic-hero-grid');
    const portrait = main.querySelector<HTMLElement>('.comic-portrait');
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let move: ((event: PointerEvent) => void) | undefined;
    let leave: (() => void) | undefined;
    if (hero && portrait && fine) ctx.add(() => {
      const x = gsap.quickTo(portrait, 'x', { duration: .7, ease: 'power2.out' });
      const y = gsap.quickTo(portrait, 'y', { duration: .7, ease: 'power2.out' });
      move = event => { const rect = hero.getBoundingClientRect(); x(((event.clientX - rect.left) / rect.width - .5) * 16); y(((event.clientY - rect.top) / rect.height - .5) * 12); };
      leave = () => { x(0); y(0); };
      hero.addEventListener('pointermove', move);
      hero.addEventListener('pointerleave', leave);
    });
    return () => { observer.disconnect(); mutations.disconnect(); if (move) hero?.removeEventListener('pointermove', move); if (leave) hero?.removeEventListener('pointerleave', leave); ctx.revert(); };
  }, [ref, enabled]);
}
