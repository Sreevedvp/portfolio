import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { EmeraldGem } from './EmeraldGem';
import { HERO_DATA } from '../data/portfolioData';
import { FileText, Mail, ArrowDown, Sparkles, Check, Copy } from 'lucide-react';

interface HeroProps {
  onOpenResume: () => void;
  onOpenContact: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenResume, onOpenContact }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const textGroupRef = useRef<HTMLDivElement>(null);
  const [copiedEmail, setCopiedEmail] = React.useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // GSAP Entrance timeline for text content
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.hero-title',
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, delay: 0.1 }
      )
      .fromTo(
        '.hero-subtitle',
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9 },
        "-=0.7"
      )
      .fromTo(
        '.hero-actions',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.6"
      )
      .fromTo(
        '.hero-pills',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        "-=0.5"
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(HERO_DATA.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2400);
  };

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-[580px] md:min-h-[640px] flex flex-col justify-center pt-8 md:pt-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
        {/* Left Column: Hero Text */}
        <div ref={textGroupRef} className="lg:col-span-7 z-20 space-y-6">
          {/* Subtle status tag */}
          <div className="hero-pills inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eef5ee] border border-[#004c22]/10 text-xs font-medium text-[#004c22]">
            <span className="w-2 h-2 rounded-full bg-[#166534] animate-pulse" />
            <span>Available for high-impact engineering & architecture</span>
          </div>

          <h1 className="hero-title font-serif text-4xl sm:text-5xl md:text-[54px] font-medium text-[#004c22] leading-[1.1] tracking-tight">
            {HERO_DATA.name}
          </h1>

          <p className="hero-subtitle text-lg sm:text-[19px] text-[#404940] max-w-lg leading-relaxed">
            {HERO_DATA.shortBio}
          </p>

          {/* Action CTA Buttons matching exact screenshot */}
          <div className="hero-actions flex flex-wrap items-center gap-3.5 pt-2">
            <button
              id="hero-view-resume-btn"
              onClick={onOpenResume}
              className="bg-[#004c22] text-[#ffffff] px-6 py-3 rounded-md text-sm font-medium hover:bg-[#166534] hover:shadow-md hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-[#86efac]" />
              <span>View Resume</span>
            </button>

            <button
              id="hero-email-me-btn"
              onClick={onOpenContact}
              className="bg-transparent border border-[#bfc9bd]/70 text-[#004c22] px-6 py-3 rounded-md text-sm font-medium hover:bg-[#eef5ee] hover:border-[#004c22]/30 active:scale-[0.98] transition-all duration-200 flex items-center gap-2 group"
            >
              <Mail className="w-4 h-4 text-[#004c22] group-hover:scale-110 transition-transform" />
              <span>Email Me</span>
            </button>

            {/* Quick copy email tool */}
            <button
              onClick={handleCopyEmail}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs text-[#404940] hover:text-[#004c22] hover:bg-[#eef5ee] rounded transition-colors"
              title="Copy email to clipboard"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{HERO_DATA.email}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: 3D Floating Emerald Gemstone */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end relative min-h-[340px] md:min-h-[420px]">
          <EmeraldGem className="w-full max-w-[420px]" />
        </div>
      </div>

      {/* Subtle bottom scroll hint */}
      <div className="hidden md:flex justify-center pt-12 pb-2">
        <a
          href="#about"
          className="flex items-center gap-1.5 text-xs text-[#707a6f] hover:text-[#004c22] transition-colors py-1 px-3 rounded-full hover:bg-[#eef5ee]"
        >
          <span>Explore Architecture & Craft</span>
          <ArrowDown className="w-3 h-3 animate-bounce" />
        </a>
      </div>
    </section>
  );
};
