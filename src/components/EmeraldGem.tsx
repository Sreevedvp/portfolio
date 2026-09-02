import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { Sparkles, RefreshCw, Wand2 } from 'lucide-react';

interface EmeraldGemProps {
  className?: string;
}

export const EmeraldGem: React.FC<EmeraldGemProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gemWrapperRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [clickCount, setClickCount] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Primary image source from user specification with fallback mirror
  const primaryImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuD8noGAmBwQb9aoBz7DzSFyc8Jb4dettLn35JsL-NL50WqdSu7Faxxz9iri0FliwCsd9Ao_qvWY0f_NqDBXsXs0zTZSSCOmo2xb82PcgmXF5qH9N1J5jBkkCoXfluFPe5IgT5TOR9qwwW3oLvUECeSSwptFrR6D_s-idkrK6FtbTImnjAQV9AfvlwXsHnWn92Qiiy11YNaxBtJbcQXvzmZpfdhJZqpXVhLXfZuNyhnKnrk4RT-8AY7o";

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Entrance timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        gemWrapperRef.current,
        {
          opacity: 0,
          scale: 0.7,
          y: 40,
          rotationY: -35,
          rotationZ: -10,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotationY: 0,
          rotationZ: 0,
          duration: 1.4,
          delay: 0.1,
        }
      )
      .fromTo(
        shadowRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 0.4, scale: 1, duration: 1.2 },
        "-=1.0"
      )
      .fromTo(
        glowRef.current,
        { opacity: 0, scale: 0.6 },
        { opacity: 0.65, scale: 1, duration: 1.4 },
        "-=1.2"
      );

      // 2. Continuous Organic Float Animation
      gsap.to(gemWrapperRef.current, {
        y: -16,
        rotationZ: 2.5,
        rotationX: 3,
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      // Shadow breathes inversely
      gsap.to(shadowRef.current, {
        scale: 0.85,
        opacity: 0.22,
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      // Caustic ambient light pulse
      gsap.to(glowRef.current, {
        scale: 1.12,
        opacity: 0.8,
        duration: 2.6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // 3. 3D Mouse Parallax Tilt Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !gemWrapperRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = -(y / rect.height) * 28;
    const rotY = (x / rect.width) * 28;
    const moveX = (x / rect.width) * 16;
    const moveY = (y / rect.height) * 16;

    gsap.to(gemWrapperRef.current, {
      rotationX: rotX,
      rotationY: rotY,
      x: moveX,
      y: moveY - 8,
      duration: 0.5,
      ease: 'power2.out',
      transformPerspective: 1000,
    });

    if (shadowRef.current) {
      gsap.to(shadowRef.current, {
        x: moveX * 0.5,
        duration: 0.5,
        ease: 'power2.out',
      });
    }

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        x: moveX * 0.35,
        y: moveY * 0.35,
        duration: 0.7,
        ease: 'power2.out',
      });
    }
  };

  const handleMouseLeave = () => {
    if (!gemWrapperRef.current) return;
    gsap.to(gemWrapperRef.current, {
      rotationX: 0,
      rotationY: 0,
      x: 0,
      y: 0,
      duration: 1.1,
      ease: 'elastic.out(1, 0.45)',
    });
    if (shadowRef.current) {
      gsap.to(shadowRef.current, { x: 0, duration: 0.9 });
    }
    if (glowRef.current) {
      gsap.to(glowRef.current, { x: 0, y: 0, duration: 0.9 });
    }
  };

  // 4. Click Interaction: 360 Spin + Confetti Sparkles
  const handleGemClick = (e: React.MouseEvent) => {
    setClickCount(prev => prev + 1);

    if (gemWrapperRef.current) {
      gsap.fromTo(
        gemWrapperRef.current,
        { scale: 0.92, rotationY: 0 },
        {
          scale: 1.08,
          rotationY: 360,
          duration: 1.1,
          ease: 'back.out(1.6)',
          onComplete: () => {
            gsap.to(gemWrapperRef.current, { scale: 1, duration: 0.3 });
          }
        }
      );
    }

    if (glowRef.current) {
      gsap.fromTo(
        glowRef.current,
        { scale: 1.5, opacity: 1 },
        { scale: 1, opacity: 0.65, duration: 1.1, ease: 'power2.out' }
      );
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const originX = (rect.left + rect.width / 2) / window.innerWidth;
      const originY = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 26,
        spread: 65,
        origin: { x: originX, y: originY },
        colors: ['#86efac', '#166534', '#a6f4b5', '#004c22', '#eef5ee'],
        disableForReducedMotion: true,
        scalar: 0.8,
        ticks: 100,
        shapes: ['circle', 'square'],
      });
    }
  };

  const trigger360Orbit = () => {
    if (!gemWrapperRef.current) return;
    gsap.to(gemWrapperRef.current, {
      rotationY: "+=360",
      duration: 1.6,
      ease: 'power3.inOut',
    });
  };

  return (
    <div
      ref={containerRef}
      id="emerald-gem-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative flex items-center justify-center select-none cursor-pointer group ${className}`}
      style={{ perspective: 1200 }}
    >
      {/* Background Soft Emerald Caustics & Glow */}
      <div
        ref={glowRef}
        id="emerald-ambient-glow"
        className="absolute w-[260px] h-[260px] md:w-[360px] md:h-[360px] rounded-full bg-radial from-[#86efac]/40 via-[#166534]/15 to-transparent blur-3xl pointer-events-none transform -translate-y-4 transition-opacity duration-500"
      />

      {/* Decorative Emerald Geometry Rings */}
      <div className="absolute w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-full border border-[#004c22]/10 border-dashed pointer-events-none opacity-40 animate-spin" style={{ animationDuration: '60s' }} />
      <div className="absolute w-[220px] h-[220px] md:w-[300px] md:h-[300px] rounded-full border border-[#86efac]/20 pointer-events-none opacity-30 animate-spin" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />

      {/* Main 3D Gemstone Asset Wrapper */}
      <div
        ref={gemWrapperRef}
        onClick={handleGemClick}
        className="relative z-10 p-2 transform-gpu transition-all duration-300 flex items-center justify-center"
        title="Click to interact with the Emerald Gemstone"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {!imageError ? (
          <img
            id="emerald-3d-jewel"
            src={primaryImageUrl}
            alt="Emerald 3D Faceted Dodecahedron Gemstone"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className="w-[260px] h-[260px] md:w-[360px] md:h-[360px] object-contain drop-shadow-[0_20px_30px_rgba(0,76,34,0.28)] transition-filter duration-300"
            loading="eager"
          />
        ) : null}

        {/* High-Fidelity 3D Faceted Vector Emerald Fallback if network blocks external URL */}
        {(imageError || !imageLoaded) && (
          <div className={`${!imageError && imageLoaded ? 'hidden' : 'block'} w-[260px] h-[260px] md:w-[360px] md:h-[360px] flex items-center justify-center drop-shadow-[0_25px_35px_rgba(0,76,34,0.3)]`}>
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="facetTop" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a7f3d0" />
                  <stop offset="50%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="facetFront" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="facetLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#064e3b" />
                </linearGradient>
                <linearGradient id="facetRight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#047857" />
                  <stop offset="100%" stopColor="#022c22" />
                </linearGradient>
                <linearGradient id="facetBottom" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#065f46" />
                  <stop offset="100%" stopColor="#01241a" />
                </linearGradient>
                <linearGradient id="specularGlint" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Faceted Dodecahedron Geometry */}
              {/* Back facets */}
              <polygon points="200,40 290,105 320,200 200,200" fill="#047857" opacity="0.8" />
              <polygon points="200,40 110,105 80,200 200,200" fill="#065f46" opacity="0.8" />

              {/* Lower Facets */}
              <polygon points="80,200 110,295 200,360 200,200" fill="url(#facetLeft)" />
              <polygon points="320,200 290,295 200,360 200,200" fill="url(#facetRight)" />
              <polygon points="110,295 200,360 290,295 200,280" fill="url(#facetBottom)" />

              {/* Upper Main Facets */}
              <polygon points="200,40 290,105 200,160 110,105" fill="url(#facetTop)" />
              <polygon points="110,105 200,160 200,280 80,200" fill="url(#facetFront)" />
              <polygon points="290,105 320,200 200,280 200,160" fill="url(#facetRight)" />

              {/* Center Diamond Table Facet */}
              <polygon points="200,100 250,160 200,220 150,160" fill="url(#facetTop)" opacity="0.9" />

              {/* Specular Highlight Reflections */}
              <polygon points="200,40 240,75 200,100 160,75" fill="url(#specularGlint)" opacity="0.7" />
              <line x1="200" y1="40" x2="200" y2="160" stroke="#d1fae5" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <line x1="110" y1="105" x2="200" y2="160" stroke="#d1fae5" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              <line x1="290" y1="105" x2="200" y2="160" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              <line x1="200" y1="160" x2="200" y2="280" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

              {/* Ambient Glow Center Star */}
              <circle cx="200" cy="160" r="18" fill="#ecfdf5" opacity="0.4" filter="blur(4px)" />
            </svg>
          </div>
        )}

        {/* Floating Refraction Sparkle Badge on Hover */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-[#004c22]/15 shadow-sm flex items-center gap-1.5 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-[#004c22] animate-pulse" />
          <span className="text-[11px] font-medium text-[#004c22] tracking-wide">Interactive 3D</span>
        </div>
      </div>

      {/* Dynamic Ground Ambient Drop Shadow */}
      <div
        ref={shadowRef}
        id="emerald-ground-shadow"
        className="absolute bottom-4 md:bottom-2 w-[160px] md:w-[240px] h-[26px] rounded-[100%] bg-[#064e3b]/30 blur-md pointer-events-none transform translate-y-6"
      />

      {/* Micro-interaction control bar underneath on hover/focus */}
      <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#004c22]/10 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
        <button
          onClick={(e) => { e.stopPropagation(); trigger360Orbit(); }}
          className="flex items-center gap-1 text-[11px] font-medium text-[#004c22] hover:text-[#166534] px-2 py-0.5 rounded hover:bg-[#eef5ee] transition-colors"
          title="Rotate 360"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Spin</span>
        </button>
        <span className="text-[#004c22]/20">•</span>
        <button
          onClick={(e) => { e.stopPropagation(); handleGemClick(e); }}
          className="flex items-center gap-1 text-[11px] font-medium text-[#004c22] hover:text-[#166534] px-2 py-0.5 rounded hover:bg-[#eef5ee] transition-colors"
          title="Sparkle Refraction"
        >
          <Wand2 className="w-3 h-3" />
          <span>Sparkle {clickCount > 0 && `(${clickCount})`}</span>
        </button>
      </div>
    </div>
  );
};
