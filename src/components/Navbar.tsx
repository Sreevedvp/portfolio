import React, { useState, useEffect } from 'react';
import { Compass, Menu, X, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  onOpenContact: () => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenContact, activeSection }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <nav
      id="main-navigation"
      aria-label="Main Navigation"
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#f4fbf4]/90 backdrop-blur-md shadow-sm border-b border-[#004c22]/10 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-[900px] mx-auto px-6 md:px-12 flex justify-between items-center h-14">
        {/* Brand / Logo */}
        <a
          href="#"
          className="flex items-center gap-2 text-[#004c22] group"
          title="Sreeved V P - Portfolio"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#004c22] group-hover:bg-[#006d3e] group-hover:scale-125 transition-all duration-200" />
          <span className="font-serif text-2xl font-medium tracking-tight group-hover:text-[#064e3b] transition-colors">
            Portfolio
          </span>
        </a>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace('#', '');
            return (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-all duration-200 relative py-1 ${
                  isActive
                    ? 'text-[#004c22] font-semibold'
                    : 'text-[#404940] hover:text-[#004c22]'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#004c22] rounded-full animate-fade-in" />
                )}
              </a>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-3">
          <button
            id="nav-contact-btn"
            onClick={onOpenContact}
            className="bg-[#004c22] text-[#ffffff] px-5 py-2 rounded-full text-sm font-medium hover:bg-[#166534] hover:shadow-md hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 flex items-center gap-1.5"
          >
            <span>Contact</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenContact}
            className="bg-[#004c22] text-[#ffffff] px-4 py-1.5 rounded-full text-xs font-medium"
          >
            Contact
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 text-[#004c22] hover:bg-[#e9f0e9] rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#f4fbf4]/98 border-b border-[#004c22]/10 px-6 py-4 space-y-3 shadow-lg backdrop-blur-xl">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-[#161d19] hover:text-[#004c22] border-b border-[#004c22]/5"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContact();
              }}
              className="w-full bg-[#004c22] text-white py-2.5 rounded-lg text-sm font-medium"
            >
              Get in Touch
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
