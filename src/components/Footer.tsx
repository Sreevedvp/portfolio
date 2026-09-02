import React, { useState } from 'react';
import { HERO_DATA } from '../data/portfolioData';
import { Mail, ArrowRight, Check, Copy, Sparkles, MessageSquare } from 'lucide-react';

interface FooterProps {
  onOpenContact: () => void;
  onOpenResume: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact, onOpenResume }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(HERO_DATA.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <footer className="w-full mt-24 bg-[#f4fbf4] border-t border-[#004c22]/15">
      {/* Get in Touch CTA Banner */}
      <div className="max-w-[900px] mx-auto px-6 md:px-12 pt-16 pb-12">
        <div className="emerald-card rounded-2xl p-8 md:p-10 bg-gradient-to-br from-white via-[#f4fbf4] to-[#eef5ee] border border-[#004c22]/15 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#004c22]/10 text-[#004c22] text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Let's Build Together</span>
            </div>
            <h3 className="font-serif text-3xl font-medium text-[#004c22]">
              Interested in collaborating or discussing architecture?
            </h3>
            <p className="text-sm text-[#404940] leading-relaxed">
              Whether you have a complex frontend challenge, system architecture inquiry, or hiring opportunity—feel free to reach out.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={onOpenContact}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#004c22] text-white text-sm font-medium hover:bg-[#166534] transition-all flex items-center justify-center gap-2 shadow-xs group"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Get in Touch</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleCopyEmail}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white text-[#004c22] text-sm font-medium border border-[#004c22]/15 hover:bg-[#f4fbf4] transition-all flex items-center justify-center gap-2 shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Email' : 'Copy Email'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="border-t border-[#004c22]/10 py-8">
        <div className="max-w-[900px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left text-sm text-[#404940]">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-0.5">
            <a href="#" className="font-serif text-xl font-medium text-[#004c22] hover:text-[#064e3b] transition-colors">
              {HERO_DATA.name}
            </a>
            <span className="text-[11px] font-mono text-[#707a6f] tracking-wider uppercase">
              Frontend Engineering · {HERO_DATA.location}
            </span>
          </div>

          {/* Copyright notice */}
          <div className="text-xs text-[#707a6f]">
            © {new Date().getFullYear()} Sreeved V P. All rights reserved.
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs">
            <a
              href={HERO_DATA.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#004c22] transition-colors font-medium"
            >
              LinkedIn
            </a>
            <a
              href={HERO_DATA.socials.github}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#004c22] transition-colors font-medium"
            >
              GitHub
            </a>
            <button
              onClick={onOpenResume}
              className="hover:text-[#004c22] transition-colors font-medium"
            >
              ReadCV
            </button>
            <button
              onClick={onOpenContact}
              className="hover:text-[#004c22] transition-colors font-semibold text-[#004c22]"
            >
              Email Direct
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
