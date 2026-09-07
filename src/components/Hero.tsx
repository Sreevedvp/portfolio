import React from 'react';
import { HERO_DATA, PROJECT_SECTIONS } from '../data/portfolioData';
import { ArrowDown, ArrowUpRight, FileText, Github, Linkedin, Zap } from 'lucide-react';

interface HeroProps { onOpenResume: () => void; onOpenContact: () => void; }
export const Hero: React.FC<HeroProps> = ({ onOpenResume, onOpenContact }) => (
  <section id="hero" className="comic-hero">
    <div className="comic-status-line"><span><i /> ONLINE: BUILDING THINGS FOR THE WEB</span><span>HYDERABAD, INDIA // PORTFOLIO 2026</span></div>
    <div className="comic-hero-grid">
      <div className="comic-hero-copy">
        <div className="comic-eyebrow"><span className="comic-label">HELLO, WORLD ↗</span><span className="comic-label yellow">SREEVED V P</span><span className="comic-issue">// VOL. 01</span></div>
        <h1 className="comic-hero-title">FRONTEND <em>ENGINEER.</em><br />SYSTEMS THINKER.<br /><span>CREATIVE BUILDER.</span></h1>
        <p className="comic-intro">{HERO_DATA.shortBio} From expressive interfaces to real-time experiences, I make complex things feel simple.</p>
        <div className="comic-hero-actions"><a href="#work" className="primary-button"><Zap size={16} />Explore the work <ArrowUpRight size={16} /></a><button onClick={onOpenContact} className="secondary-button">Have an idea? Let's talk <ArrowUpRight size={16} /></button></div>
        <div className="comic-hero-socials"><span className="comic-availability"><i />AVAILABLE FOR OPPORTUNITIES</span><a href={HERO_DATA.socials.github} target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={17} /></a><a href={HERO_DATA.socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={17} /></a><button onClick={onOpenResume}><FileText size={15} />Résumé</button></div>
      </div>
      <figure className="comic-portrait"><div className="comic-portrait-top"><span>CREATIVE ENERGY / ALWAYS ON</span><span>FIG. 01</span></div><img src={`${import.meta.env.BASE_URL}assets/comic/studio.jpg`} alt="Comic-book illustration of a creative working in a neon-filled studio" width="640" height="640" fetchPriority="high" /><figcaption><span>CODE. CREATE. REPEAT.</span><Zap size={16} /><span>NO ORDINARY WORKDAY</span></figcaption></figure>
    </div>
    <div className="comic-stats">{[['3.5+', 'Years of experience', 'FRONTEND & BEYOND'], [String(PROJECT_SECTIONS.flatMap(s => s.items).length).padStart(2, '0'), 'Selected projects', 'BUILT FOR THE REAL WORLD'], ['60 FPS', 'Rendering focus', 'SMOOTH UNDER PRESSURE'], ['06', 'Core disciplines', 'ONE CONNECTED TOOLKIT']].map(([value,label,note],index) => <div key={label} className={`comic-stat accent-${index}`}><p>{label}</p><strong>{value}</strong><span>{note}</span><div className="comic-meter" aria-hidden="true" /></div>)}</div>
    <a href="#about" className="comic-scroll">KEEP EXPLORING <ArrowDown size={13} /></a>
  </section>
);
