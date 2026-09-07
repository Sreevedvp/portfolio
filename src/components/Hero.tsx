import React from 'react';
import { BioElectricSphere } from './BioElectricSphere';
import { HERO_DATA, PROJECT_SECTIONS } from '../data/portfolioData';
import { ArrowDown, ArrowUpRight, FileText, Github, Linkedin } from 'lucide-react';

interface HeroProps { onOpenResume: () => void; onOpenContact: () => void; }

export const Hero: React.FC<HeroProps> = ({ onOpenResume, onOpenContact }) => (
  <section id="hero" className="relative pt-8 md:pt-16">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
      <div className="relative z-10">
        <div className="hero-kicker flex items-center gap-3 mb-7">
          <span className="w-2 h-2 rounded-full bg-[var(--neon-green)]" />
          Available for opportunities
        </div>
        <h1 className="hero-title">SREEVED<br /><span>V P.</span></h1>
        <p className="mt-7 text-xl md:text-2xl font-medium tracking-tight">Frontend craft.<br />Systems thinking.</p>
        <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--text-secondary)]">{HERO_DATA.shortBio}</p>
        <div className="flex flex-wrap gap-3 mt-7">
          <a href="#work" className="primary-button">Explore my work <ArrowUpRight size={17} /></a>
          <button onClick={onOpenResume} className="secondary-button"><FileText size={16} /> View résumé</button>
        </div>
        <div className="flex flex-wrap items-center gap-5 mt-7 text-sm text-[var(--text-muted)]">
          <a href={HERO_DATA.socials.github} target="_blank" rel="noreferrer" aria-label="GitHub profile"><Github size={18} /></a>
          <a href={HERO_DATA.socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn profile"><Linkedin size={18} /></a>
          <span className="h-4 border-l border-[var(--border-color)]" />
          <button onClick={onOpenContact} className="hover:text-[var(--accent-primary)]">Let's talk <span aria-hidden="true">↗</span></button>
        </div>
      </div>
      <div className="hero-stage h-[390px] lg:h-[490px]">
        <div className="hero-stage-label"><span>EXPERIMENT 001</span><span>WEBGL / THREE.JS</span></div>
        <BioElectricSphere className="w-full h-full" />
      </div>
    </div>
    <div className="mt-14 md:mt-20 grid grid-cols-2 md:grid-cols-4 border-y border-[var(--border-color)]">
      {[['3.5+', 'Years of experience'], [String(PROJECT_SECTIONS.flatMap(s => s.items).length).padStart(2, '0'), 'Selected projects'], ['60 FPS', 'Rendering focus'], ['06', 'Core disciplines']].map(([value, label]) => (
        <div className="stat-card" key={label}><div className="stat-number">{value}</div><div className="stat-label">{label}</div></div>
      ))}
    </div>
    <div className="flex justify-between items-center mt-6 hero-kicker !tracking-normal">
      <span>{HERO_DATA.location}</span><a href="#work" className="flex items-center gap-2">Scroll to explore <ArrowDown size={14} /></a>
    </div>
  </section>
);
