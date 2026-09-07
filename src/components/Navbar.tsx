import { toggleTheme } from '../theme';
import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Command } from 'lucide-react';

interface NavbarProps {
  onOpenContact: () => void;
  activeSection: string;
  onOpenPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenContact, activeSection, onOpenPalette }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute('data-theme') !== 'light'
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const winH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(winH > 0 ? (window.scrollY / winH) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.dataset.theme !== 'light');
    window.addEventListener('portfolio-theme-change', sync);
    return () => window.removeEventListener('portfolio-theme-change', sync);
  }, []);

  const navLinks = [
    { name: 'Work', href: '#work' },
    { name: 'About', href: '#about' },
    { name: 'Stack', href: '#stack' },
    { name: 'Experience', href: '#experience' },
    { name: 'Visualizer', href: '#visualizer' },
    { name: 'Writing', href: '#writing' },
  ];

  return (
    <>
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} role="progressbar" aria-valuenow={Math.round(scrollProgress)} aria-valuemin={0} aria-valuemax={100} aria-label="Page scroll progress" />

      <nav
        id="main-navigation"
        aria-label="Main Navigation"
        className="fixed top-0 w-full z-50 transition-all duration-300 py-2"
        style={{
          backgroundColor: 'var(--nav-bg)',
          backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
          borderBottom: '2px solid var(--accent-primary)',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 flex justify-between items-center h-14">
          <a href="#hero" className="flex items-center gap-2 group" style={{ color: 'var(--accent-primary)' }}>
            <span className="w-2.5 h-2.5 rounded-none transition-all duration-200 group-hover:scale-125 group-hover:shadow-[0_0_12px_var(--accent-primary)]" style={{ backgroundColor: 'var(--accent-primary)' }} />
            <span className="font-heading text-xl font-bold tracking-tight chromatic">SREEVED V P<span className="comic-nav-subtitle">FRONTEND / SYSTEMS / CREATIVE CODE</span></span>
          </a>

          <div className="hidden xl:flex items-center gap-4">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <a key={link.name} href={link.href} className="text-xs font-mono uppercase font-medium transition-all duration-200 relative py-2"
                  style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: isActive ? 700 : 500 }}>
                  {link.name}
                  {isActive && <span className="absolute bottom-0 left-0 w-full h-[2px] rounded-none animate-fade-in" style={{ backgroundColor: 'var(--accent-primary)', boxShadow: '0 0 8px var(--glow-primary)' }} />}
                </a>
              );
            })}
          </div>

          <div className="hidden xl:flex items-center gap-2">
            <button onClick={onOpenPalette} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-none text-xs font-medium transition-all border" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }} title="Search (⌘K)" aria-label="Search portfolio">
              <Command className="w-3.5 h-3.5" /><span>⌘K</span>
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-none transition-all" style={{ color: 'var(--text-muted)' }} aria-label="Toggle theme">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button id="nav-contact-btn" onClick={onOpenContact} className="px-5 py-2 rounded-none text-sm font-bold transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center gap-1.5"
              style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--button-text)', boxShadow: '0 0 15px var(--glow-primary)' }}>
              Contact
            </button>
          </div>

          <div className="flex xl:hidden items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-none" style={{ color: 'var(--text-muted)' }} aria-label="Toggle theme">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={onOpenContact} className="px-4 py-1.5 rounded-none text-xs font-bold" style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--button-text)' }}>Contact</button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu" aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" className="p-2 rounded-none" style={{ color: 'var(--accent-primary)' }}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-navigation" className="xl:hidden px-6 py-4 space-y-3 shadow-lg" style={{ backgroundColor: 'var(--nav-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-color)' }}>
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-medium" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>{link.name}</a>
            ))}
          </div>
        )}
      </nav>
    </>
  );
};
