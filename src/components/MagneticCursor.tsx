import React, { useEffect, useRef } from 'react';

/**
 * Interactive magnetic cursor ring that follows the pointer with inertia.
 * Only visible on desktop devices with fine pointer (mouse/trackpad).
 */
export const MagneticCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Only enable on desktop with fine pointer
    const hasFineMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!hasFineMouse) return;

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    document.body.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };

      // Instantly move the dot
      dot.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;

      // Show cursors
      cursor.classList.add('visible');
      dot.classList.add('visible');

      // Check if hovering interactive elements
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('a, button, [role="button"], input, textarea, select, .emerald-card, .tilt-card, .three-canvas-container');

      if (isInteractive) {
        cursor.classList.add('hovering');
      } else {
        cursor.classList.remove('hovering');
      }
    };

    const handleMouseLeave = () => {
      cursor.classList.remove('visible');
      dot.classList.remove('visible');
    };

    // Smooth animation loop for the ring
    let animId: number;
    const animateCursor = () => {
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.12;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.12;

      const isHovering = cursor.classList.contains('hovering');
      const offset = isHovering ? 28 : 16;

      cursor.style.transform = `translate(${posRef.current.x - offset}px, ${posRef.current.y - offset}px)`;

      animId = requestAnimationFrame(animateCursor);
    };

    animateCursor();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.body.classList.remove('custom-cursor-active');
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="magnetic-cursor" aria-hidden="true" />
      <div ref={dotRef} className="magnetic-cursor-dot" aria-hidden="true" />
    </>
  );
};
