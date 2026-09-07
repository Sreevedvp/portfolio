import React from 'react';
import { HERO_DATA } from '../data/portfolioData';
import { ArrowUpRight, ArrowUp } from 'lucide-react';
interface FooterProps { onOpenContact: () => void; onOpenResume: () => void; }
export const Footer: React.FC<FooterProps> = ({ onOpenContact, onOpenResume }) => (
  <footer className="relative z-10 mt-16 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
    <div className="max-w-[1180px] mx-auto px-6 md:px-12">
      <div className="py-16 md:py-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div><p className="hero-kicker mb-5">Next chapter</p><h2 className="text-5xl md:text-7xl leading-none">Let's make<br /><span className="text-[var(--accent-primary)]">something matter.</span></h2><p className="text-base text-[var(--text-secondary)] max-w-md mt-5">Have a frontend challenge, a project idea, or an engineering opportunity? I'd love to hear about it.</p></div>
        <div><button className="primary-button" onClick={onOpenContact}>Start a conversation <ArrowUpRight size={18} /></button><a href={`mailto:${HERO_DATA.email}`} className="block text-sm text-[var(--text-muted)] mt-5">{HERO_DATA.email}</a></div>
      </div>
      <div className="border-t border-[var(--border-color)] py-7 flex flex-wrap justify-between items-center gap-6 text-xs text-[var(--text-muted)]">
        <span>© {new Date().getFullYear()} {HERO_DATA.name} · {HERO_DATA.location}</span>
        <div className="flex gap-5 items-center"><a href={HERO_DATA.socials.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={HERO_DATA.socials.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><button onClick={onOpenResume}>Résumé</button><a href="#hero" aria-label="Back to top" className="p-2 border border-[var(--border-color)] rounded-full"><ArrowUp size={15} /></a></div>
      </div>
    </div>
  </footer>
);
