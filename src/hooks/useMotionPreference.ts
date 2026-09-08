import { useEffect, useState } from 'react';
export function useMotionPreference() {
  const [paused, setPaused] = useState(() => { try { return localStorage.getItem('portfolio-motion') === 'paused'; } catch { return false; } });
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  const enabled = !paused && !reduced;
  useEffect(() => {
    document.documentElement.dataset.motion = enabled ? 'on' : 'off';
    window.dispatchEvent(new CustomEvent('portfolio-motion-change', { detail: enabled }));
  }, [enabled]);
  const toggle = () => setPaused(value => {
    try { localStorage.setItem('portfolio-motion', !value ? 'paused' : 'on'); } catch { /* Session preference remains available. */ }
    return !value;
  });
  return { enabled, reduced, toggle };
}
