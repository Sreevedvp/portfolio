import React from 'react';
import { HERO_DATA } from '../data/portfolioData';

interface FooterProps {
  onOpenContact: () => void;
  onOpenResume: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact, onOpenResume }) => {
  return (
    <footer className="w-full py-16 mt-28 bg-[#f4fbf4] border-t border-[#004c22]/15">
      <div className="max-w-[900px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <a href="#" className="font-serif text-2xl font-medium text-[#004c22] hover:text-[#064e3b] transition-colors">
            Portfolio
          </a>
          <span className="text-[11px] font-mono text-[#707a6f] tracking-wider uppercase">
            Engineering as Craft
          </span>
        </div>

        {/* Copyright notice */}
        <div className="text-sm text-[#404940]">
          © 2024 Engineering Craft. Built with precision.
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#404940]">
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#004c22] transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#004c22] transition-colors"
          >
            GitHub
          </a>
          <button
            onClick={onOpenResume}
            className="hover:text-[#004c22] transition-colors"
          >
            ReadCV
          </button>
          <button
            onClick={onOpenContact}
            className="hover:text-[#004c22] transition-colors font-medium text-[#004c22]"
          >
            Email
          </button>
        </div>
      </div>
    </footer>
  );
};
