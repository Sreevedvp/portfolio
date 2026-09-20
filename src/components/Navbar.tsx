import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Command, Github, Linkedin, Menu, Moon, Pause, Play, Sun, X } from 'lucide-react';
import { HERO_DATA } from '../data/portfolioData';
import { toggleTheme } from '../theme';

interface NavbarProps {
  motionEnabled: boolean;
  reducedMotion: boolean;
  onToggleMotion: () => void;
  onOpenContact: () => void;
  activeSection: string;
  onOpenPalette: () => void;
}
const links = [
  { name: 'A little introduction', href: '#hero', label: 'Hello, there.' },
  { name: 'About me', href: '#about', label: 'The person.' },
  { name: 'Selected work', href: '#work', label: 'The work.' },
  { name: 'Skills & tools', href: '#stack', label: 'The toolkit.' },
  { name: 'Connected ideas', href: '#visualizer', label: 'Connections.' },
  { name: 'Experience', href: '#experience', label: 'The journey.' },
  { name: 'Writing', href: '#writing', label: 'Field notes.' },
];

export const Navbar: React.FC<NavbarProps> = ({ motionEnabled, reducedMotion, onToggleMotion, onOpenContact, activeSection, onOpenPalette }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.dataset.theme === 'dark');
  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.dataset.theme === 'dark');
    window.addEventListener('portfolio-theme-change', sync);
    return () => window.removeEventListener('portfolio-theme-change', sync);
  }, []);
  return <>
    <nav id="main-navigation" className="portfolio-sidebar" aria-label="Main navigation">
      <a href="#hero" className="portfolio-brand" onClick={() => setMenuOpen(false)}>
        <strong>Sreeved V P</strong>
      </a>
      <button className="portfolio-menu-toggle" aria-label="Toggle menu" aria-expanded={menuOpen} aria-controls="portfolio-navigation-links" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      <div className={`portfolio-nav-content ${menuOpen ? 'is-open' : ''}`} id="portfolio-navigation-links">
        <button className="portfolio-search" onClick={() => { setMenuOpen(false); onOpenPalette(); }}><Command size={15} /><span>Find something</span><kbd>⌘K</kbd></button>
        <p className="portfolio-nav-eyebrow">MAKE YOURSELF AT HOME</p>
        <div className="portfolio-nav-links">{links.map((link, index) => <a key={link.href} href={link.href} aria-current={activeSection === link.href.slice(1) ? 'location' : undefined} onClick={() => setMenuOpen(false)}><span className="portfolio-nav-number">0{index + 1}</span>{link.name}<ArrowUpRight size={13} /></a>)}</div>
        <button className="portfolio-contact" onClick={() => { setMenuOpen(false); onOpenContact(); }}>Let’s talk <ArrowUpRight size={16} /></button>
        <div className="portfolio-nav-tools">
          <a href={HERO_DATA.socials.github} target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={17} /></a>
          <a href={HERO_DATA.socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={17} /></a>
          <button onClick={toggleTheme} aria-label="Toggle theme">{isDark ? <Sun size={17} /> : <Moon size={17} />}</button>
          <button onClick={onToggleMotion} disabled={reducedMotion} aria-label={reducedMotion ? 'System reduced motion enabled' : motionEnabled ? 'Pause animations' : 'Enable animations'} aria-pressed={motionEnabled}>{motionEnabled ? <Pause size={17} /> : <Play size={17} />}</button>
        </div>
      </div>
    </nav>
    <aside className="portfolio-section-rail" aria-hidden="true"><span>{links.find(link => link.href === `#${activeSection}`)?.label ?? 'Hello, there.'}</span><small>ENGINEER / MAKER / CURIOUS HUMAN</small></aside>
  </>;
};
