import React from 'react';
import { HERO_DATA, PROJECT_SECTIONS } from '../data/portfolioData';
import { ArrowDown, ArrowUpRight, FileText } from 'lucide-react';
interface HeroProps { onOpenResume: () => void; onOpenContact: () => void; }
export const Hero: React.FC<HeroProps> = ({ onOpenResume, onOpenContact }) => (
  <section id="hero" className="portfolio-hero">
    <div className="portfolio-hello"><span>INDEPENDENT MIND. CONNECTED IDEAS.</span><span>{HERO_DATA.location} ↗</span></div>
    <div className="portfolio-hero-main">
      <p className="comic-eyebrow">HELLO, I’M SREEVED <span aria-hidden="true">✳</span></p>
      <h1 className="comic-hero-title">Making complex<br />things feel <em>simple.</em></h1>
      <p className="comic-intro">Frontend engineer. Systems thinker. Curious builder.<br />I craft thoughtful interfaces and the systems behind them.</p>
      <div className="comic-hero-actions"><a href="#work" className="primary-button">Explore my work <ArrowUpRight size={17} /></a><button onClick={onOpenContact} className="secondary-button">Have an idea? Let’s talk <ArrowUpRight size={16} /></button></div>
      <div className="comic-hero-socials"><span className="portfolio-availability"><i />Open to new opportunities</span><button onClick={onOpenResume}><FileText size={15} />View résumé</button></div>
    </div>
    <div className="portfolio-intro-strip"><p>A little craft.<br /><em>A lot of curiosity.</em></p><span>From expressive interfaces to real-time experiences, I build software that works beautifully — inside and out.</span><a href="#about" aria-label="More about me"><ArrowDown size={26} /></a></div>
    <div className="comic-stats">{[['3.5+', 'Years of experience'], [String(PROJECT_SECTIONS.flatMap(s => s.items).length).padStart(2, '0'), 'Selected projects'], ['60 FPS', 'Rendering focus'], ['06', 'Connected disciplines']].map(([value,label],index) => <div key={label} className={`comic-stat accent-${index}`}><strong>{value}</strong><p>{label}</p></div>)}</div>
  </section>
);
